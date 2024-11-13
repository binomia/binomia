import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useLocalAuthentication = () => {

    const doesDeviceSupportLocalAuthentication = useCallback(async () => {
        const hasHardwareAsync = await LocalAuthentication.hasHardwareAsync();
        const isEnrolledAsync = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardwareAsync && !isEnrolledAsync)
            throw new Error('Local authentication is not available');

    }, []);

    const authenticate = useCallback(async () => {
        try {
            await doesDeviceSupportLocalAuthentication()

            return await LocalAuthentication.authenticateAsync({
                promptMessage: 'Ingresa pin de tu dispositivo para poder enviar la transacción',
                requireConfirmation: true,
                biometricsSecurityLevel: "strong"
            });

        } catch (err) {
            throw err
        }

    }, []);

    return {
        authenticate
    };
};
