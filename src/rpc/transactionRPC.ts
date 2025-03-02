import TransactionController from "@/controllers/transactionController";
import { CreateTransactionRPCParamsType } from "@/types";
import { JSONRPCServer } from "json-rpc-2.0";


export const transactionMethods = (server: JSONRPCServer) => {
    server.addMethod("createTransaction", async (data: CreateTransactionRPCParamsType) => {
        try {
            const transaction = await TransactionController.createQueuedTransaction(data)
            return transaction

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });

    server.addMethod("createRequestTransaction", async (data: CreateTransactionRPCParamsType) => {
        try {
            const transaction = await TransactionController.createRequestQueueedTransaction(data)
            return transaction

        } catch (error) {
            console.log({ createRequestTransaction: error });
            throw error
        }
    });

    server.addMethod("cancelRequestedTransaction", async ({ transactionId, fromAccount, senderUsername }: { transactionId: string, fromAccount: number, senderUsername: string }) => {
        try {
            const transaction = await TransactionController.cancelRequestedTransaction({ transactionId, fromAccount, senderUsername })
            return transaction

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });

    server.addMethod("payRequestTransaction", async ({ transactionId, toAccount, paymentApproved }: { transactionId: string, toAccount: number, paymentApproved: boolean }) => {
        try {
            const transaction = await TransactionController.payRequestTransaction({ transactionId, toAccount, paymentApproved })
            return transaction

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });

    server.addMethod("createBankingTransaction", async ({ cardId, accountId, userId, data }: { cardId: number, accountId: number, userId: number, data: any }) => {
        try {
            const transaction = await TransactionController.createBankingTransaction({ cardId, accountId, userId, data })
            return transaction

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });
}