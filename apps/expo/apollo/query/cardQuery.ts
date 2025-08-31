import { gql } from "@apollo/client"

export class CardApolloQueries {
    static createCard = () => {
        return gql`
            mutation CreateCard($data: CardInput!) {
                createCard(data: $data) {
                    id
                    hash
                    data
                    createdAt
                    updatedAt
                    isPrimary
                    last4Number
                    brand
                    alias
                }
            }
        `
    }

    static cards = () => {
        return gql`
            query Cards {
                cards {
                    id
                    last4Number
                    hash
                    isPrimary
                    brand
                    alias
                    data                    
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static card = () => {
        return gql`
            query Card($cardId: Int!) {
                card(cardId: $cardId) {
                    isPrimary
                    cardNumber
                    cvv
                    alias
                    expirationDate
                    cardHolderName
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static updateCard = () => {
        return gql`
            mutation UpdateCard($data: CardInput!, $cardId: Int!) {
                updateCard(cardId: $cardId, data: $data) {
                    id
                    last4Number
                    hash
                    isPrimary
                    brand
                    alias
                    data
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static deleteCard = () => {
        return gql`
            mutation DeleteCard($hash: String!) {
                deleteCard(hash: $hash) {
                    id
                    last4Number
                    hash
                    isPrimary
                    brand
                    alias
                    data                    
                    createdAt
                    updatedAt
                }
            }
        `
    }
}