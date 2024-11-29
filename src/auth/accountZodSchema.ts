import { z } from 'zod'


export class AccountZodSchema {
    static updateAccountPermissions = z.object({
        allowReceive: z.boolean().nullish().transform((v) => v ?? false),
        allowWithdraw: z.boolean().nullish().transform((v) => v ?? false),
        allowDeposit: z.boolean().nullish().transform((v) => v ?? false),
        allowSend: z.boolean().nullish().transform((v) => v ?? false),
        allowRequestMe: z.boolean().nullish().transform((v) => v ?? false)
    })

    static accountLimits = z.object({
        receivedAmount: z.number().nullable().transform((v) => v ?? 0),
        sentAmount: z.number().nullable().transform((v) => v ?? 0),
        depositAmount: z.number().nullable().transform((v) => v ?? 0),
        withdrawAmount: z.number().nullable().transform((v) => v ?? 0),
    })
}
