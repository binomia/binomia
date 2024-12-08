import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { globalActions } from '@/redux/slices/globalSlice';
import { useDispatch } from 'react-redux';


export const useLocation = () => {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const dispatch = useDispatch();

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


    const getLocationAddress = async ({ latitude, longitude }: { latitude: number, longitude: number }) => {
        try {
            const { data } = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            return data.address
        } catch (error) {
            console.error(error);
        }
    }

    const watchPositionAsync = async () => {
        await Location.watchPositionAsync({ accuracy: Location.Accuracy.Highest }, async (location) => {
            const address = await getLocationAddress({ latitude: location.coords.latitude, longitude: location.coords.longitude })
            await dispatch(globalActions.setLocation({
                ...address,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }));
        });
    }
    
    const getLocation = async () => {
        try {
            await requestPermissions();
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest
            });

            const address = await getLocationAddress({ latitude: location.coords.latitude, longitude: location.coords.longitude })
            setLocation(Object.assign({}, location, address));

            return {
                ...address,
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
        // getLocation();
        watchPositionAsync();
    }, []);


    return {
        location,
        getLocation
    }
}

