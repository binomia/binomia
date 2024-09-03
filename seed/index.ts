import { TransactionsModel } from '@/models';
import { faker } from '@faker-js/faker';
import short from 'short-uuid';


const createTransactions = async () => {
    for (let i = 0; i < 10; i++) {
        const amount = faker.number.int({ min: 1, max: 1000 })
        await TransactionsModel.create({
            amount,
            deliveredAmount: amount,
            balanceAfterTransaction: amount,
            balanceBeforeTransaction: amount,
            voidedAmount: 0,
            refundedAmount: 0,
            transactionType: 'debit',
            currency: 'USD',
            description: faker.lorem.sentence(),
            status: 'success',
            location: {
                latitude: faker.location.latitude(),
                longitude: faker.location.longitude()
            },
            signature: faker.database.mongodbObjectId(),
            senderId: faker.number.int({ min: 1, max: 2 }),
            receiverId: faker.number.int({ min: 1, max: 2 }),
        })
    }
}


// 9Gud3MqryACQ3mD4pKyStB9Gud3MqryACQ3mD4pKyStB


export const seedDatabase = async () => {
    await createTransactions()
}