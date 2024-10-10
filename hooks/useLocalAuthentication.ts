import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useLocalAuthentication = () => {

    const authenticate = useCallback(async () => {
        try {
            const hasHardwareAsync = await LocalAuthentication.hasHardwareAsync();
            const isEnrolledAsync = await LocalAuthentication.isEnrolledAsync();

            if (hasHardwareAsync && isEnrolledAsync) {
                return await LocalAuthentication.authenticateAsync({
                    promptMessage: 'Authenticate',
                    fallbackLabel: 'Use passcode',
                });
            }

        } catch (err) {
            console.error(err, "authenticate error");
        }

    }, []);

    return {
        authenticate
    };
};
