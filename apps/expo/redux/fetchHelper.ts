import { apolloClient } from "@/apollo";
import { AccountApolloQueries, TopUpApolloQueries } from "@/apollo/query";
import { TransactionApolloQueries } from "@/apollo/query/transactionQuery"
import { AccountAuthSchema } from "@/auth/accountAuth";
import { createAsyncThunk } from "@reduxjs/toolkit"
import moment from "moment";


export const fetchAccountLimit = createAsyncThunk('fetchAccountLimit', async (): Promise<any> => {
    try {
        const { data } = await apolloClient.query({ query: AccountApolloQueries.accountLimit() });
        const limitData = await AccountAuthSchema.accountLimits.parseAsync(data.accountLimit)
        return limitData

    } catch (error) {
        console.log(error);
    }
})

export const fetchRecentTransactions = createAsyncThunk('fetchRecentTransactions', async () => {
    try {
        const { data: recentTransactions } = await apolloClient.query({ query: TransactionApolloQueries.accountTransactions(), variables: { page: 1, pageSize: 5 } });
        const { data: recentTopUps } = await apolloClient.query({ query: TopUpApolloQueries.recentTopUps(), variables: { page: 1, pageSize: 5 } });

        const topupsMapped: any[] = recentTopUps.recentTopUps?.map((topup: any) => {
            const date = Number(topup.createdAt);
            return {
                type: "topup",
                timestamp: isNaN(date) ? moment(topup.createdAt).valueOf() : date,
                data: topup
            }
        })

        const transactionsMapped: any[] = recentTransactions.accountTransactions?.map((transaction: any) => {
            const date = Number(transaction.createdAt);
            return {
                type: "transaction",
                timestamp: isNaN(date) ? moment(transaction.createdAt).valueOf() : date,
                data: transaction
            }
        })

        const combinedTransactions = [...transactionsMapped, ...topupsMapped].sort((a: any, b: any) => {
            return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
        });

        return combinedTransactions

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

export const fetchAllTransactions = createAsyncThunk('fetchAllTransactions', async ({ page, pageSize }: { page: number, pageSize: number }): Promise<any> => {
    try {
        const { data: { recentTopUps } } = await apolloClient.query({ query: TopUpApolloQueries.recentTopUps(), variables: { page, pageSize } });
        const { data: { accountTransactions } } = await apolloClient.query({ query: TransactionApolloQueries.accountTransactions(), variables: { page, pageSize } });

        const topupsMapped = recentTopUps?.map((topup: any) => {
            const date = Number(topup.createdAt);
            return {
                type: "topup",
                timestamp: isNaN(date) ? moment(topup.createdAt).valueOf() : date,
                data: topup
            }
        })

        const transactionsMapped = accountTransactions?.map((transaction: any) => {
            const date = Number(transaction.createdAt);
            return {
                type: "transaction",
                timestamp: isNaN(date) ? moment(transaction.createdAt).valueOf() : date,
                data: transaction
            }
        })

        if (transactionsMapped?.length > 0 || topupsMapped?.length > 0) {
            const combinedTransactions = [...transactionsMapped, ...topupsMapped].sort((a: any, b: any) => {
                return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
            });

            return combinedTransactions
        }

        return []

    } catch (error) {
        console.error({ fetchAllTransactions: error });
    }
})

export const searchAccountTransactions = createAsyncThunk('searchAccountTransactions', async ({ page, pageSize, search }: { page: number, pageSize: number, search: string }): Promise<any> => {
    try {
        const { data: transactionsData } = await apolloClient.query({ query: TransactionApolloQueries.searchAccountTransactions(), variables: { page, pageSize, fullName: search } })
        const { data: topUpsData } = await apolloClient.query({ query: TopUpApolloQueries.searchTopUps(), variables: { page, pageSize, search } })

        const transactionsMapped = transactionsData.searchAccountTransactions?.map((transaction: any) => {
            return {
                type: "transaction",
                timestamp: transaction.createdAt,
                data: transaction
            }
        })

        const combinedTransactions = [...transactionsMapped, ...topUpsData.searchTopUps].sort((a: any, b: any) => {
            return new Date(Number(b.timestamp)).getTime() - new Date(Number(a.timestamp)).getTime()
        });

        return combinedTransactions

    } catch (error) {
        console.log(error)
    }
})

export const fetchAccountBankingTransactions = createAsyncThunk('fetchAccountBankingTransactions', async ({ page = 1, pageSize = 10 }: { page: number, pageSize: number }) => {
    try {
        const { data } = await apolloClient.query({ query: TransactionApolloQueries.accountBankingTransactions(), variables: { page, pageSize } })
        return data.accountBankingTransactions

    } catch (error) {
        console.error({ accountBankingTransactions: error });
    }
})


