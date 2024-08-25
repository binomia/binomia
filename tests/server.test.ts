import "dotenv/config";
import { app } from "../src/app";
import supertest from 'supertest';

describe('Seerver Test:', () => {
    test('is running on port 3000', () => {
        const PORT = process.env.PORT ;
        expect(Number(PORT)).toBe(3000);
    });

    test('app.get("/") returns 200 status code', async () => {
        const response = await supertest(app).get('/');
        expect(response.status).toBe(200);
    });
})
