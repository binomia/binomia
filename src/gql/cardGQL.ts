import { CardsController } from '@/controllers'


const type = () => {
    return `
        input CardInput {
            cardNumber: String
            cvv: String
            expirationDate: String
            cardHolderName: String
        }

        type CardType {
            id: Int
            cardNumber: String
            cvv: String
            expirationDate: String
            cardHolderName: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }

        type OnlyCardType {
            id: Int
            cardNumber: String
            cvv: String
            expirationDate: String
            cardHolderName: String
            createdAt: String
            updatedAt: String
        }
    `
}


const query = () => {
    return `
    `
}

const mutation = () => {
    return `  
        createCard(data: CardInput!): CardType          
    `
}

const subscription = () => {
    return ``
}

const { createCard } = CardsController
const resolvers = {
    query: {
        // 
    },
    mutation: {
        createCard
    },
    subscription: {
        // 
    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}