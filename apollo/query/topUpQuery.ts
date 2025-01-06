import { gql } from "@apollo/client"

export class TopUpApolloQueries {
    static userTopUps = () => {
        return gql`
            query UserTopUps($page: Int!, $pageSize: Int!) {
                userTopUps(page: $page, pageSize: $pageSize) {
                    id
                    fullName
                    phone
                    status
                    amount
                    referenceId
                    createdAt
                    updatedAt
                    company {
                        id
                        uuid
                        status
                        name
                        logo
                        createdAt
                        updatedAt
                    }
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
                    phone
                    status
                    amount
                    createdAt
                    updatedAt
                    company {
                        id
                        uuid
                        status
                        name
                        logo
                        createdAt
                        updatedAt
                    }
                }
            }
        `
    }

    static createTopUp = () => {
        return gql`
            mutation CreateTopUp($data: TopUpInput!) {
                createTopUp(data: $data) {
                    id
                    fullName
                    amount
                    referenceId
                    phone
                    createdAt
                    updatedAt,
                    company {
                        id
                        uuid
                        status
                        name
                        logo
                        createdAt
                        updatedAt
                    }
                }
            }
        `
    }

    static topUpCompanies = () => {
        return gql`
            query TopUpCompanies {
                topUpCompanies {
                    id
                    uuid
                    status
                    name
                    logo
                    createdAt
                    updatedAt
                }
            }
        `
    }
}