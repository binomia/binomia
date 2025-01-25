import { evironmentVariables } from '@/constants';
import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk';

const expo = new Expo({
    accessToken: evironmentVariables.EXPO_ACCESS_TOKEN,
    useFcmV1: true,
});

export const sendNotification = async (tokens: ExpoPushToken[]) => {
    try {
        const messages: ExpoPushMessage[] = tokens.map(token => {
            return {
                to: token,
                sound: 'assets/audio/money.wav',
                body: 'This is a test notification',
                data: {
                    withSome: 'data'
                }
            }
        });

        await expo.sendPushNotificationsAsync(messages);

    } catch (error) {
        console.log(error);
    }
}