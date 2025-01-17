import { apolloClient } from "@/apollo";
import { TopUpApolloQueries } from "@/apollo/query";
import { TransactionApolloQueries } from "@/apollo/query/transactionQuery"
import { createAsyncThunk } from "@reduxjs/toolkit"


export const fetchRecentTransactions = createAsyncThunk('fetchRecentTransactions', async () => {
    try {
        const { data } = await apolloClient.query({ query: TransactionApolloQueries.accountTransactions(), variables: { page: 1, pageSize: 5 } });
        return data.accountTransactions

    } catch (error) {
        console.error({ fetchRecentTransactions: error });
    }
})

export const fetchRecentTopUps = createAsyncThunk('fetchRecentTopUps', async () => {
    try {
        const { data } = await apolloClient.query({ query: TopUpApolloQueries.recentTopUps(), variables: { page: 1, pageSize: 5 } });        
        return data.recentTopUps

    } catch (error) {
        console.error({ fetchRecentTopUps: error });
    }
})