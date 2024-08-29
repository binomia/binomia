import "dotenv/config";
import { app } from "../src/app";
import supertest from 'supertest';

describe('Users Test:', () => {
    test('query all users via graphql query', () => {
        const query = `
            query {
                users(page: 1, pageSize: 10) {
                    id
                }
            }
        `;

        return supertest(app).post('/').send({ query }).expect(200)
    })

    test('query single user via graphql query', () => {
        const query = `
            query {
                user(uuid: "1") {
                    id
                }
            }
        `;

        return supertest(app).post('/').send({ query }).expect(200)
    })

    test('createUser via graphql mutation', async () => {
        const query = `
            mutation {createUser(data: {full_name: "test", username: "test", email: "test", dni: "001-1947002-6", sex: "test", address: "test", dob: "test", dni_expire_date: "test"}) {
                    id
                }
            }
        `
        // const response = await supertest(app).post('/').send({ query })     
        // expect(response.body.data.createUser).not.toBeNull()
        // return supertest(app).post('/').send({ query }).expect(200)
    })
})