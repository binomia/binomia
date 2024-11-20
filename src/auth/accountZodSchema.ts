import { z } from 'zod'


export class AccountZodSchema {
    static updateAccountPermissions = z.object({
        allowReceive: z.boolean().nullish().optional(),
        allowWithdraw: z.boolean().nullish().optional(),
        allowSend: z.boolean().nullish().optional(),
        allowAsk: z.boolean().nullish().optional()
    })
}
