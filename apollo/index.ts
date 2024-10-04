import { MAIN_SERVER_URL } from '@/constants';
import useAsyncStorage from '@/hooks/useAsyncStorage';
import { ApolloClient, from, createHttpLink, InMemoryCache, DefaultOptions } from '@apollo/client';
import { setContext } from "@apollo/client/link/context";
import { useSelector } from 'react-redux';
import { onError } from "@apollo/client/link/error";
import * as SecureStore from 'expo-secure-store';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';




const httpLink = createHttpLink({
    uri: MAIN_SERVER_URL,
    credentials: "include",
    preserveHeaderCase: true,
});


const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors)
        graphQLErrors.forEach(async (error) => {
            const { message } = error;

            if (message.includes("INVALID_SESSION")) {
                await SecureStore.deleteItemAsync("jwt").then(async () => {
                    Alert.alert("Your session has expired. Please login again.");
                    await Updates.reloadAsync();
                });
            }
        });
});



const setAuthorizationLink = setContext(async (_, previousContext) => {
    const jwt = await useAsyncStorage().getItem("jwt");
    const applicationId = await useAsyncStorage().getItem("applicationId");
    return {
        headers: {
            "session-auth-identifier": applicationId,
            "authorization": `Bearer ${jwt}`,
            ...previousContext.headers
        },
    };
});

const defaultOptions: DefaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}


export const apolloClient = new ApolloClient({
    link: from([setAuthorizationLink, errorLink, httpLink]),
    defaultOptions: defaultOptions,
    cache: new InMemoryCache({
        resultCaching: false,
    })
});