import { gql } from "@apollo/client"

export class AccountApolloQueries {
    static updateAccountPermissions = () => {
        return gql`
            mutation UpdateAccountPermissions($data: AccountPermissionsInput) {
                updateAccountPermissions(data: $data) {
                    id
                    balance
                    sentAmount
                    receivedAmount
                    withdrawAmount
                    allowReceive
                    allowWithdraw
                    allowSend
                    allowAsk
                    status
                    sendLimit
                    receiveLimit
                    withdrawLimit
                    hash
                    currency
                    createdAt
                    updatedAt
                }
            }
        `
    }
}