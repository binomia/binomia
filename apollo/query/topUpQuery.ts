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

    static recentTopUps = () => {
        return gql`
            query RecentTopUps($page: Int!, $pageSize: Int!) {
                recentTopUps(page: $page, pageSize: $pageSize) {
                    id
                    status
                    amount
                    referenceId
                    createdAt
                    phone {
                        fullName
                        phone
                    }
                    user {
                        fullName
                    }
                    company {
                        logo
                    }
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
            mutation CreateTopUp($data: TopUpInput!, $recurrence: TopUpRecurrenceInput!) {
                createTopUp(data: $data, recurrence: $recurrence) {
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