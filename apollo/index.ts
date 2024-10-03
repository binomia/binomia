import { MAIN_SERVER_URL } from '@/constants';
import useAsyncStorage from '@/hooks/useAsyncStorage';
import { ApolloClient, from, createHttpLink, InMemoryCache, DefaultOptions } from '@apollo/client';
import { setContext } from "@apollo/client/link/context";
import { useSelector } from 'react-redux';



const httpLink = createHttpLink({
    uri: MAIN_SERVER_URL,
    credentials: "include",
    preserveHeaderCase: true,
});



const setAuthorizationLink = setContext(async (_, previousContext) => {
    return {
        headers: {
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
    link: from([setAuthorizationLink, httpLink]),
    defaultOptions: defaultOptions,
    cache: new InMemoryCache({
        resultCaching: false,
    })
});