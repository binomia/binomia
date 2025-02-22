import { TransactionJoiSchema } from "@/auth/transactionJoiSchema";
import TransactionController from "@/controllers/transactionController";
import { transactionsQueue } from "@/queues";
import { CreateTransactionRPCParamsType } from "@/types";
import { JSONRPCServer } from "json-rpc-2.0";
import { z } from "zod";


export const transactionMethods = (server: JSONRPCServer) => {
    server.addMethod("createTransaction", async (data: CreateTransactionRPCParamsType) => {
        try {
            const jobId = `queueTransaction@${data.transactionId}`
            const job = await transactionsQueue.queue.add(jobId, data, {
                jobId,
                removeOnComplete: {
                    age: 20 // 30 minutes
                },
                removeOnFail: {
                    age: 60 * 30 // 24 hours
                }
            })

            return job.asJSON()

        } catch (error) {
            console.log({ createTransaction: error });
            throw error
        }
    });

    server.addMethod("createRequestTransaction", async (data: CreateTransactionRPCParamsType) => {
        try {
            const jobId = `queueRequestTransaction@${data.transactionId}`
            const job = await transactionsQueue.queue.add(jobId, data, {
                jobId,
                removeOnComplete: {
                    age: 1000 * 60 * 30 // 30 minutes
                },
                removeOnFail: {
                    age: 1000 * 60 * 60 * 24 // 24 hours
                }
            })

            return job.asJSON()

        } catch (error) {
            console.log({ createTransaction: error });
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