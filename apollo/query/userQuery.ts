import { gql } from "@apollo/client"

export class UserApolloQueries {
    static userByEmail = () => {
        return gql`
            query UserByEmail($email: String!) {
                userByEmail(email: $email)
            }
        `
    }

    static updateUserPassword = () => {
        return gql`
            mutation UpdateUserPassword($email: String!, $password: String!, $data: TokenAngSignInput!) {
                updateUserPassword(email: $email, password: $password, data: $data) {
                    id
                    fullName
                    username
                    imageUrl
                    email
                    dni
                    sex
                    address
                    dob
                    dniExpiration
                    createdAt
                    updatedAt
                }
            }
        `
    }

    static createUser = () => {
        return gql`
            mutation CreateUser($data: UserInput!) {
                createUser(data: $data) {                    
                    token
                }
            }
        `
    }
}