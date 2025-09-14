import { ZERO_ENCRYPTION_KEY } from "@/constants";
import { triggerDefinition, ServerTypes } from "cromio";
import { HASH } from "cryptografia";
import jwt from 'jsonwebtoken';
import Email from "@/email";
import { sendNotification } from "@/expo";


const globalTriggers = triggerDefinition()
globalTriggers.onTrigger("sendEmail", async ({ body }: ServerTypes.OnTriggerType) => {
    try {
        const { to, code, subject, text, html } = body;

        const hash = await HASH.sha256Async(code.toString());
        const token = jwt.sign({ exp: 10 * 1000 * 60, data: hash }, ZERO_ENCRYPTION_KEY);

        await Email.send({ to, subject, text, html })

        return {
            token,
        }

    } catch (error) {
        console.log({ sendEmailError: error });
    }
})


globalTriggers.onTrigger("sendVerificationCode", async ({ body }: ServerTypes.OnTriggerType) => {
    try {
        const { email, code } = body;
        const sentMessageInfo = await Email.sendVerificationCode(email, code);

        return sentMessageInfo

    } catch (error) {
        console.log({ sendVerificationCodeError: error });
    }
})


globalTriggers.onTrigger("newTransactionNotification", async ({ body }: ServerTypes.OnTriggerType) => {
    try {
        const { data } = body
        await sendNotification(data)
        return true

    } catch (error) {
        console.log({ newTransactionNotificationError: error });
    }
});



export {
    globalTriggers
}