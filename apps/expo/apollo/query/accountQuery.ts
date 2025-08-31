import { gql } from "@apollo/client"

export class AccountApolloQueries {
    static accountPermissions = () => {
        return gql`
            query AccountPermissions {
                accountPermissions {
                    allowReceive
                    allowWithdraw
                    allowSend
                    allowRequestMe
                    allowDeposit
                    allowEmailNotification
                    allowPushNotification
                    allowSmsNotification
                    allowWhatsappNotification
                }
            }
        `
    }

    static updateAccountPermissions = () => {
        return gql`
            mutation UpdateAccountPermissions($data: AccountPermissionsInput) {
                updateAccountPermissions(data: $data) {
                    id
                    balance
                    allowReceive
                    allowWithdraw
                    allowSend
                    allowRequestMe    
                    allowDeposit
                    allowEmailNotification
                    allowPushNotification
                    allowSmsNotification
                    allowWhatsappNotification
                    status
                    sendLimit
                    receiveLimit
                    withdrawLimit
                    depositLimit
                    hash
                    currency
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static account = () => {
        return gql`
            query Account {
                account {
                    id
                    balance
                    allowReceive
                    allowWithdraw
                    allowSend
                    allowRequestMe    
                    allowDeposit
                    allowEmailNotification
                    allowPushNotification
                    allowSmsNotification
                    allowWhatsappNotification
                    status
                    sendLimit
                    receiveLimit
                    withdrawLimit
                    depositLimit
                    hash
                    currency
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static accountStatus = () => {
        return gql`
            query Account {
                account {                   
                    status                    
                }
            }
        `
    }

    static accountLimit = () => {
        return gql`
            query AccountLimit {
                accountLimit {
                    sentAmount
                    receivedAmount
                    depositAmount
                    withdrawAmount
                }
            }
        `
    }
}