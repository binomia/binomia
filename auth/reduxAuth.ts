import { z } from 'zod'


class ReduxAuth {
    static globalReduxState = z.object({
        haveAccountChanged: z.boolean().nullish().transform((v) => v ?? false),
        appInBackgroundTime: z.number().nullish().transform((v) => v ?? 0),
        account: z.any().nullish().transform((v) => v ?? {}),
        card: z.any().nullish().transform((v) => v ?? {}),
        cards: z.array(z.any()).nullish().transform((v) => v ?? []),
        kyc: z.any().nullish().transform((v) => v ?? {}),
        user: z.any().nullish().transform((v) => v ?? {}),
        applicationId: z.string().nullish().transform((v) => v ?? ""),
        expoNotificationToken: z.string().nullish().transform((v) => v ?? ""),
        jwt: z.string().nullish().transform((v) => v ?? ""),
        allowFaceId: z.boolean().nullish().transform((v) => v ?? true),
        whatsappNotifications: z.boolean().nullish().transform((v) => v ?? true),
        emailNotifications: z.boolean().nullish().transform((v) => v ?? true),
        smsNotifications: z.boolean().nullish().transform((v) => v ?? true),
        pushNotifications: z.boolean().nullish().transform((v) => v ?? true),
        network: z.object({
            isConnected: z.boolean().nullish().transform((v) => v ?? false),
            type: z.string().nullish().transform((v) => v ?? "unknown"),
            isInternetReachable: z.boolean().nullish().transform((v) => v ?? false),
            ip: z.string().nullish().transform((v) => v ?? "")
        }),
        location: z.any().nullish().transform((v) => v ?? {}),
        device: z.object({
            isDevice: z.boolean().nullish().transform((v) => v ?? false),
            deviceBrand: z.string().nullish().transform((v) => v ?? ""),
            deviceName: z.string().nullish().transform((v) => v ?? ""),
            deviceModelName: z.string().nullish().transform((v) => v ?? ""),
            deviceOsName: z.string().nullish().transform((v) => v ?? ""),
            deviceOsVersion: z.string().nullish().transform((v) => v ?? ""),
        })
    })
}
