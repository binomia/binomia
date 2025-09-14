import { NOTIFICATION_SERVER_URL, ZERO_ENCRYPTION_KEY } from "@/constants";
import { Client, LOAD_BALANCER } from "cromio"

const client = new Client({
    loadBalancerStrategy: LOAD_BALANCER.BEST_BIASED,
    servers: [
        {
            url: NOTIFICATION_SERVER_URL,
            secretKey: ZERO_ENCRYPTION_KEY,
        }
    ]
});

// const notificationClient = new JSONRPCClient(async (jsonRPCRequest) => {
//     if (NOTIFICATION_SERVER_URL === undefined) {
//         throw new Error("NOTIFICATION_SERVER_URL is not defined");
//     }

//     return axios.post(NOTIFICATION_SERVER_URL, jsonRPCRequest).then((response: any) => {
//         if (response.status === 200) {
//             notificationClient.receive(response.data);

//         } else if (jsonRPCRequest.id !== undefined) {
//             return Promise.reject(new Error(response.statusText));
//         }
//     })
// })

export const notificationServer = async (trigger: string, params: any) => {
    try {
        const response = await client.trigger(trigger, params);
        return response

    } catch (error: any) {
        throw new Error(error);
    }
}
