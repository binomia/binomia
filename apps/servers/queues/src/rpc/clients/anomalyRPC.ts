import axios from "axios";
import shortUUID from "short-uuid";
import { ANOMALY_SERVER_URL } from "@/constants";



export const anomalyRpcClient = async (method: string, params: any) => {
    try {
        console.log({ ANOMALY_SERVER_URL });

        const { data } = await axios.post(ANOMALY_SERVER_URL, {
            id: shortUUID.generate(),
            jsonrpc: "2.0",
            method,
            params
        });

        return data.result

    } catch (error: any) {
        throw new Error(error);
    }
}
