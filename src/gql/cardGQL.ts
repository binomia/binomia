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
            id:  Int
            cardNumber: String
            cvv: String
            expirationDate: String
            cardHolderName: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }

        type CardTypeResponse {
            id:  Int
            data: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }

        type OnlyCardType {
            id:  Int
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
        card: CardType
    `
}

const mutation = () => {
    return `  
        createCard(data: CardInput!): CardTypeResponse       
        updateCard(data: CardInput!): CardTypeResponse       
    `
}

const subscription = () => {
    return ``
}

const { createCard, updateCard, card } = CardsController
const resolvers = {
    query: {
        card
    },
    mutation: {
        createCard,
        updateCard
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