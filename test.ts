import { z } from "zod"





(async () => {
    const deviceSchema = z.object({
        isDevice: z.boolean().nullish().transform((v) => v ?? false),
        deviceBrand: z.string().nullish().transform((v) => v ?? ""),
        deviceName: z.string().nullish().transform((v) => v ?? ""),
        deviceModelName: z.string().nullish().transform((v) => v ?? ""),
        deviceOsName: z.string().nullish().transform((v) => v ?? ""),
        deviceOsVersion: z.string().nullish().transform((v) => v ?? ""),
    })

    const device = await deviceSchema.parseAsync({})

    console.log(device);


})()