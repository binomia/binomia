import { evironmentVariables } from '@/constants';
import { Expo } from 'expo-server-sdk';

const expo = new Expo({
    accessToken: evironmentVariables.EXPO_ACCESS_TOKEN,
    useFcmV1: true,
});

const messages = {
    to: "ExponentPushToken[zpUdwBOYtiLQPmv3TpdSGd]",
    sound: 'default',
    body: 'This is a test notification',
    data: { withSome: 'data' },
}


export const sendNotification = async () => {
    try {
        const tickets = await expo.sendPushNotificationsAsync([messages]);
        console.log('Tickets: ', tickets);

    } catch (error) {
        console.log(error);

    }
}