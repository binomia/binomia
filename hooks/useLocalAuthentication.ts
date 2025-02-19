import { useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export const useLocalAuthentication = () => {

    const doesDeviceSupportLocalAuthentication = useCallback(async () => {
        const hasHardwareAsync = await LocalAuthentication.hasHardwareAsync();
        const isEnrolledAsync = await LocalAuthentication.isEnrolledAsync();

        if (!hasHardwareAsync && !isEnrolledAsync)
            throw new Error('Local authentication is not available');

    }, []);

    // const authenticate = useCallback(async () => {
    //     try {
    //         await doesDeviceSupportLocalAuthentication()

    //         return await LocalAuthentication.authenticateAsync({
    //             promptMessage: 'Ingresa pin de tu dispositivo para poder enviar la transacción',
    //             requireConfirmation: true,                
    //             biometricsSecurityLevel: "strong"
    //         });

    //     } catch (err) {
    //         throw err
    //     }

    // }, []);

    const authenticate = useCallback(async () => {
        try {
            await doesDeviceSupportLocalAuthentication();

            const biometricResult = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Ingresa tu PIN o usa biometría para continuar',
                requireConfirmation: true,
                biometricsSecurityLevel: "strong",
                fallbackLabel: 'Usar PIN en su lugar'
                
            });

            if (biometricResult.success) {
                return biometricResult;
            }

            // If biometric authentication fails, fallback to device PIN
            return await LocalAuthentication.authenticateAsync({
                promptMessage: 'Ingresa el PIN para continuar',
                fallbackLabel: 'Usar PIN en su lugar'
            });

        } catch (err) {
            throw err;
        }
    }, []);

    return {
        authenticate
    };
};
