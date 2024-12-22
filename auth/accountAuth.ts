import { z } from 'zod'

export class AccountAuthSchema {
    static account = z.object({
        id: z.number().nullish().transform((v) => v ?? 0),
        balance: z.number().nullish().transform((v) => v ?? 0),
        status: z.string().nullish().transform((v) => v ?? ""),
        sendLimit: z.number().nullish().transform((v) => v ?? 0),
        receiveLimit: z.number().nullish().transform((v) => v ?? 0),
        withdrawLimit: z.number().nullish().transform((v) => v ?? 0),
        depositLimit: z.number().nullish().transform((v) => v ?? 0),
        hash: z.string().nullish().transform((v) => v ?? ""),
        currency: z.string().nullish().transform((v) => v ?? ""),
        createdAt: z.string().nullish().transform((v) => v ?? ""),
        updatedAt: z.string().nullish().transform((v) => v ?? ""),
        allowWithdraw: z.boolean().nullable().transform(v => v ?? false),
        allowSend: z.boolean().nullable().transform(v => v ?? false),
        allowReceive: z.boolean().nullable().transform(v => v ?? false),
        allowRequestMe: z.boolean().nullable().transform(v => v ?? false),
        allowDeposit: z.boolean().nullable().transform(v => v ?? false),
    })

    static jwtDecoded = z.object({
        sid: z.string(),
        iat: z.number().nullish().transform((v) => v ?? 0),
        exp: z.number().nullish().transform((v) => v ?? 0),
        username: z.string()
    })

    static accountLimits = z.object({
        receivedAmount: z.number().nullable().transform((v) => v ?? 0),
        sentAmount: z.number().nullable().transform((v) => v ?? 0),
        depositAmount: z.number().nullable().transform((v) => v ?? 0),
        withdrawAmount: z.number().nullable().transform((v) => v ?? 0),
    })

    static accountPermissions = z.object({
        allowWithdraw: z.boolean().nullable().transform(v => v ?? true),
        allowSend: z.boolean().nullable().transform(v => v ?? true),
        allowReceive: z.boolean().nullable().transform(v => v ?? true),
        allowRequestMe: z.boolean().nullable().transform(v => v ?? true),
        allowDeposit: z.boolean().nullable().transform(v => v ?? true),
    }).default({ allowWithdraw: true, allowSend: true, allowReceive: true, allowDeposit: true, allowRequestMe: true })
}
