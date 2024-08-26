import "dotenv/config";
import { app } from "../src/app";
import supertest from 'supertest';

describe('Seerver Test:', () => {
    beforeAll(async () => {
        // await app.s
    });

    afterAll(async () => {
        // await server.stop();  // Cleanly stop the server
    });

    test('is running on port 3000', () => {
        const PORT = process.env.PORT;
        expect(Number(PORT)).toBe(3000);
    });

    test('app.get("/") returns 200 status code', async () => {
        const query = `
            query {
                hello
            }
        `;
        const response = await supertest(app).post('/').send({ query });
        expect(response.status).toBe(200);
    });
})
