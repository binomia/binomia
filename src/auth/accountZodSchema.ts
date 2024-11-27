import { z } from 'zod'


export class AccountZodSchema {
    static updateAccountPermissions = z.object({
        allowReceive: z.boolean().nullish().optional(),
        allowWithdraw: z.boolean().nullish().optional(),
        allowSend: z.boolean().nullish().optional(),
        allowAsk: z.boolean().nullish().optional()
    })

    static accountLimits = z.object({
        receivedAmount: z.number().nullable().default(0).transform((v) => v ?? 0),
        sentAmount: z.number().nullable().default(0).transform((v) => v ?? 0),
        depositAmount: z.number().nullable().default(0).transform((v) => v ?? 0),
        withdrawAmount: z.number().nullable().default(0).transform((v) => v ?? 0),
    })
}
