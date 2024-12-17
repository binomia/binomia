import { evironmentVariables } from '@/constants';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo({
    accessToken: evironmentVariables.EXPO_ACCESS_TOKEN,
    useFcmV1: true,
});

export const sendNotification = async (tokens: string[]) => {
    try {
        const messages: ExpoPushMessage[] = [];        
        tokens.forEach(token => {
            if (Expo.isExpoPushToken(token)) {
                messages.push({
                    to: token,
                    sound: 'assets/audio/money.wav',
                    body: 'This is a test notification',
                    data: { withSome: 'data' },
                })
            }
        })

        const tickets = await expo.sendPushNotificationsAsync(messages);
        console.log('Tickets: ', tickets);

    } catch (error) {
        console.log(error);

    }
}