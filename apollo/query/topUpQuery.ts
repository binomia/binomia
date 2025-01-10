import { gql } from "@apollo/client"

export class TopUpApolloQueries {
    static topUps = () => {
        return gql`
            query UserTopUps($page: Int!, $pageSize: Int!, $phoneId: Int!) {
                topUps(page: $page, pageSize: $pageSize, phoneId: $phoneId) {
                    id
                    status
                    amount
                    referenceId
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static topUpPhones = () => {
        return gql`
            query TopUpPhones($page: Int!, $pageSize: Int!) {
                topUpPhones(page: $page, pageSize: $pageSize) {
                    id
                    fullName
                    phone                   
                    company {
                        id
                        uuid
                        name
                        logo                        
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

    static topUpCompanies = () => {
        return gql`
            query TopUpCompanies {
                topUpCompanies {
                    id
                    uuid
                    status
                    name
                    logo                    
                }
            }
        `
    }
}