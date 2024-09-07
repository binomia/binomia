import { ApolloClient, InMemoryCache } from '@apollo/client';


export const apolloClient = new ApolloClient({
    uri: 'http://192.168.1.97:3000/',
    cache: new InMemoryCache(),
});