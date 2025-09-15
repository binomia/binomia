import { Server, LANGUAGES, ServerTypes } from "cromio";
import { PORT, ZERO_ENCRYPTION_KEY } from "../constants";


const clients: ServerTypes.ClientType[] = [
    {
        ip: "*",
        language: LANGUAGES.NODEJS,
        secretKey: ZERO_ENCRYPTION_KEY
    }
]


export const server = new Server({
    port: PORT,
    clients
})
