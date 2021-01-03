import history from "./history";

import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  InMemoryCacheConfig,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GetIdTokenClaimsOptions, IdToken } from "@auth0/auth0-react";

function createApolloClient(
  getIdTokenClaims:
    | ((options?: GetIdTokenClaimsOptions | undefined) => Promise<IdToken>)
    | null
) {
  console.log(process.env, process.env.REACT_APP_AUTH0_DOMAIN)
  const GRAPHQL_ENDPOINT = process.env.REACT_APP_DGRAPH_BACKEND;

  const inMemoryCacheConfig: InMemoryCacheConfig = {
    typePolicies: {
      User: {
        keyFields: ["username"],
      },
      Project: {
        keyFields: ["projID"],
      },
      Column: {
        keyFields: ["colID"],
      },
    },
  };

  if (getIdTokenClaims == null) {
    return new ApolloClient({
      uri: GRAPHQL_ENDPOINT,
      cache: new InMemoryCache(inMemoryCacheConfig),
    });
  }

  const httpLink = createHttpLink({
    uri: GRAPHQL_ENDPOINT,
  });

  const authLink = setContext(async (request, { headers }) => {
    const idTokenClaims = await getIdTokenClaims();
    return {
      headers: {
        ...headers,
        token: idTokenClaims.__raw,
      },
    };
  });

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(inMemoryCacheConfig),
  });
}

export default createApolloClient;
export function onRedirectCallback(appState: any) {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
}