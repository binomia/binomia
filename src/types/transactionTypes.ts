export type TransactionModelType = {
    id: number
    senderId: number
    recipientId: number
    deliveredAmount: number
    balanceAfterTransaction: number
    balanceBeforeTransaction: number
    voidedAmount: number
    refundedAmount: number
    transactionType: string
    currency: string
    description: string
    status: string
    location: {
        lat: number
        lng: number
    }
    signature: string
    createdAt: string
    updatedAt: string
}