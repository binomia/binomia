import { evironmentVariables } from '@/constants';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo({
    accessToken: evironmentVariables.EXPO_ACCESS_TOKEN,
    useFcmV1: true,
});

export const sendNotification = async (tokens: { token: string, message: string }[]) => {
    try {
        const messages: ExpoPushMessage[] = tokens.map(({ token, message }) => {
            return {
                to: token,
                sound: 'money.wav',
                body: message,
                data: {
                    withSome: 'data',
                }
            }
        });

        await expo.sendPushNotificationsAsync(messages);

    } catch (error) {
        console.log(error);
    }
}