import { z } from 'zod'


export class EmailJoiSchema {
    static sendEmail = z.object({
        subject: z.string(),
        message: z.string(),
        html: z.string().optional()
    })
}
