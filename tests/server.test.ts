import "dotenv/config";
import { app } from "..";
import supertest from 'supertest';

describe('Seerver Test:', () => {
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
