import { TransactionsModel, UsersModel } from '@/models';
import { faker } from '@faker-js/faker';
import short from 'short-uuid';

const createUsers = async () => {
    for (let i = 0; i < 10; i++) {
        await UsersModel.create({
            fullName: faker.person.fullName(),
            username: faker.internet.userName(),
            password: faker.internet.password(),
            imageUrl: faker.image.avatar(),
            email: faker.internet.email(),
            dni: faker.database.mongodbObjectId(),
            sex: faker.person.sex(),
            address: faker.location.streetAddress(),
            dob: faker.date.birthdate(),
            dniExpiration: faker.date.future()
        })
    }
}


const createTransactions = async () => {
    for (let i = 0; i < 1; i++) {
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
            senderId: 1,
            receiverId: 2
        })
    }
}


// 9Gud3MqryACQ3mD4pKyStB9Gud3MqryACQ3mD4pKyStB


export const seedDatabase = async () => {
    // await createUsers()
    await createTransactions()
}