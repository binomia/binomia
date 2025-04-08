import { gql } from "@apollo/client"

export class TopUpApolloQueries {
    static topUp = () => {
        return gql`
            query TopUp($referenceId: String!) {
                topUp(referenceId: $referenceId) {
                    id
                    status
                    amount
                    referenceId
                    createdAt
                    updatedAt
                    location {
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
                    }
                }
            }
        `
    }

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
            mutation CreateTopUp($message: String!) {
                createTopUp(message: $message) {
                    id
                    status
                    amount
                    referenceId
                    createdAt
                    updatedAt
                    phone {
                        id
                        fullName
                        phone
                        createdAt
                        updatedAt
                    }
                    user {
                        id
                        fullName
                        username
                        phone
                        email
                        dniNumber
                        password
                        profileImageUrl
                        userAgreementSigned
                        idFrontUrl
                        status
                        idBackUrl
                        faceVideoUrl
                        address
                        createdAt
                        updatedAt
                    }
                    company {
                        id
                        uuid
                        status
                        name
                        logo
                        createdAt
                        updatedAt
                    }
                    location {
                        latitude
                        longitude
                        neighbourhood
                        sublocality
                        municipality
                        fullArea
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

    static searchTopUps = () => {
        return gql`
            query SearchTopUps($page: Int!, $pageSize: Int!, $search: String!) {
                searchTopUps(page: $page, pageSize: $pageSize, search: $search) {
                    type
                    timestamp
                    data {
                        id
                        status
                        amount
                        referenceId
                        createdAt
                        updatedAt
                        phone {
                            fullName    
                            phone    
                        }
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
            }
        `
    }
}