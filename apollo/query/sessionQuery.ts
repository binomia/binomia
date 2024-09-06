import { gql } from "@apollo/client"

export class SessionApolloQueries {
    static login = () => {
        return gql`
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password)
            }
        `
    }
}