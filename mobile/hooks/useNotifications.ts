import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { PushNotificationType } from '@/types';

export const useNotifications = (): PushNotificationType => {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,

        }),
    });


    const [expoPushToken, setExpoPushToken] = useState<string>();
    const [notification, setNotification] = useState<Notifications.Notification>();

    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    const registerForPushNotificationsAsync = async () => {
        let token;

        if (Device.isDevice) {
            console.log('Platform.OS', Platform.OS);

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('myNotificationChannel', {
                    name: 'A channel is needed for the permissions prompt to appear',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#FF231F7C',
                    sound: "money.wav"
                });
            }

            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Failed to get push token for push notification!');
                return;
            }

            try {
                const projectId =
                    Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
                if (!projectId) {
                    throw new Error('Project ID not found');
                }
                token = (await Notifications.getExpoPushTokenAsync({
                    projectId,
                })).data

                setExpoPushToken(token)
            } catch (e) {
                token = `${e}`;
            }

        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    }

    useEffect(() => {

        if (Device.isDevice && Platform.OS !== 'android') {
            registerForPushNotificationsAsync()
            notificationListener.current = Notifications.addNotificationReceivedListener(async notification => {
                setNotification(notification);
            });

            responseListener.current = Notifications.addNotificationResponseReceivedListener(async (_) => {
            });

            return () => {
                if (notificationListener.current && responseListener.current) {
                    Notifications.removeNotificationSubscription(notificationListener.current);
                    Notifications.removeNotificationSubscription(responseListener.current);
                }
            }
        }

    }, [])

    return {
        notification,
        expoPushToken,
        registerForPushNotificationsAsync
    }
}