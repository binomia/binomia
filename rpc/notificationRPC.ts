import { JSONRPCClient, JSONRPCParams } from "json-rpc-2.0";
import axios from "axios";
import { NOTIFICATION_SERVER_URL } from "@/constants";



// const client = new JSONRPCClient(async (jsonRPCRequest) => {
//     if (NOTIFICATION_SERVER_URL === undefined) {
//         throw new Error("AUTH_SERVER_URL is not defined");
//     }

//     const response = await fetch(NOTIFICATION_SERVER_URL, {
//         method: "POST",
//         headers: {
//             "content-type": "application/json",
//         },
//         body: JSON.stringify(jsonRPCRequest),
//     })

//     return response.json();
// })


const client = new JSONRPCClient(async (jsonRPCRequest) => {
    if (NOTIFICATION_SERVER_URL === undefined) {
        throw new Error("AUTH_SERVER_URL is not defined");
    }

    return axios.post(NOTIFICATION_SERVER_URL, jsonRPCRequest).then((response) => {
        if (response.status === 200) {
            client.receive(response.data);

        } else if (jsonRPCRequest.id !== undefined) {
            return Promise.reject(new Error(response.statusText));
        }
    }).catch((error) => {
        console.error(error);
    })
})

export const notificationServer = async (method: string, params: JSONRPCParams) => {
    try {
        const response = await client.request(method, params);
        return response

    } catch (error: any) {
        throw new Error(error);
    }
}
