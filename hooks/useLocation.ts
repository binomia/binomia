import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import * as Location from 'expo-location';


export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    const requestPermissions = async () => {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus === 'granted') {
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

            if (backgroundStatus === 'granted') {


            } else {
                console.log('Permission to access background location was denied');
                await Location.requestBackgroundPermissionsAsync();
            }
            
        }
        await Location.requestBackgroundPermissionsAsync();
    };


    const getLocation = async () => {
        try {
            await requestPermissions();
            const location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            return {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }

        } catch (error) {
            console.error("Error getting location:", error);
        }
    }



    useEffect(() => {
        getLocation();
    }, []);


    return {
        location,
        getLocation
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    paragraph: {
        fontSize: 18,
        textAlign: 'center',
    },
});
