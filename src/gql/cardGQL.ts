import { CardsController } from '@/controllers'


const type = () => {
    return `
        input CardInput {
            isPrimary: Boolean
            cardNumber: String
            cvv: String
            alias: String
            expirationDate: String
            cardHolderName: String
        }

        
        type CardType {
            id:  Int
            last4Number: String
            hash: String
            isPrimary: Boolean
            brand: String
            alias: String
            data: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }
      
        type OnlyCardType {
            id:  Int
            last4Number: String
            isPrimary: Boolean
            hash: String
            brand: String
            alias: String
            data: String
            user: OnlyUserType
            createdAt: String
            updatedAt: String
        }
    `
}


const query = () => {
    return `
        card: CardType
        cards: [CardType]
    `
}

const mutation = () => {
    return `  
        createCard(data: CardInput!): CardType       
        updateCard(data: CardInput!): CardType       
        deleteCard(hash: String!): CardType       
    `
}

const subscription = () => {
    return ``
}

const { createCard, deleteCard, updateCard, card, cards } = CardsController
const resolvers = {
    query: {
        card,
        cards
    },
    mutation: {
        createCard,
        updateCard,
        deleteCard
    },
    subscription: {

    }
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}