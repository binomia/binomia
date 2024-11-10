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
}