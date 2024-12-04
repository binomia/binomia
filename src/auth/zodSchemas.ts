import { generate } from "short-uuid";
import { z } from "zod";


const sendEmail = z.object({
    jsonrpc: z.literal("2.0"),
    method: z.string(),
    params: z.object({
        to: z.string(),
        code: z.string(),
        subject: z.string(),
        text: z.string(),
        html: z.string()
    })
});


const echo = z.object({
    jsonrpc: z.literal("2.0"),
    method: z.string()
});


export const validateSchema = async (data: any) => {
    try {
        if (data.method === "echo") {
            const response = echo.strict().parse(data);
            return Object.assign({}, response, {
                id: `${generate()}${generate()}`,
                params: {}
            });

        } else if (data.method === "sendEmail") {
            const response = await sendEmail.strict().parseAsync(data);
            return Object.assign({}, response, {
                id: `${generate()}${generate()}`,
            });

        } else {
            throw {
                message: `'${data.method}' is not a valid method`,
            };
        }

    } catch (error) {
        throw error
    }
}

