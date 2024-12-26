import { gql } from "@apollo/client"

export class TopUpApolloQueries {
    static userTopUps = () => {
        return gql`
            query UserTopUps($page: Int!, $pageSize: Int!) {
                userTopUps(page: $page, pageSize: $pageSize) {
                    id
                    fullName
                    amount
                    phone
                    status
                    provider
                    providerLogo
                    externalId
                    createdAt
                    updatedAt
                }
            }
        `
    }
    static phoneTopUps = () => {
        return gql`
            query PhoneTopUps($phone: String!, $page: Int!, $pageSize: Int!) {
                phoneTopUps(phone: $phone, page: $page, pageSize: $pageSize) {
                    id
                    fullName
                    status
                    phone
                    amount
                    provider
                    providerLogo
                    externalId
                    createdAt
                    updatedAt
                }
            }
        `
    }
}