import { gql } from "@apollo/client"

export class AccountApolloQueries {
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