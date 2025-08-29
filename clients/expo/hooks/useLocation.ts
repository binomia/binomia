import * as Location from 'expo-location';
import axios from 'axios';
import { useEffect } from 'react';
import { globalActions } from '@/redux/slices/globalSlice';
import { useDispatch } from 'react-redux';
import { Client } from "@googlemaps/google-maps-services-js";
import { GOOGLE_MAPS_API_KEY } from '@/constants';
// import { router } from 'expo-router';

export const useLocation = () => {
    const dispatch = useDispatch();
    const client = new Client();

    const requestPermissions = async () => {
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus === 'granted') {
            const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();

            if (backgroundStatus !== 'granted') {
                console.log('Permission to access background location was denied');
                await Location.requestBackgroundPermissionsAsync();
            }
        }
        await Location.requestBackgroundPermissionsAsync();
    };


    const fetchGeoLocation = async ({ latitude, longitude }: { latitude: number, longitude: number }) => {
        try {
            const response = await client.reverseGeocode({
                adapter: 'fetch',
                httpAgent: axios.defaults.httpAgent,
                params: {
                    latlng: [latitude, longitude],
                    key: GOOGLE_MAPS_API_KEY
                }
            });

            const results = response.data.results;
            const found = results.reduce<any>((acc, result) => {
                if (acc) return acc;

                const sublocalityComp = result.address_components.find((comp) => comp.types.includes("sublocality" as any));
                const neighborhoodComp = result.address_components.find((comp) => comp.types.includes("neighborhood" as any));
                const admAreaLevel2Comp = result.address_components.find((comp) => comp.types.includes("administrative_area_level_2" as any));

                if (sublocalityComp && neighborhoodComp && admAreaLevel2Comp)
                    return {
                        neighbourhood: neighborhoodComp.long_name,
                        sublocality: sublocalityComp.long_name,
                        municipality: admAreaLevel2Comp.long_name,
                        fullArea: `${neighborhoodComp.long_name}, ${sublocalityComp.long_name}, ${admAreaLevel2Comp.long_name}`,
                    }

                return acc;

            }, null);

            const address = {
                ...found,
                latitude,
                longitude
            }

            await dispatch(globalActions.setGeoLocation(address));

            return address

        } catch (error: any) {
            console.error("Reverse geocoding error:", error);
            return {}
        }
    }

    const watchPositionAsync = async () => {
        await Location.watchPositionAsync({ accuracy: Location.Accuracy.Highest }, async (location) => {
            await dispatch(globalActions.setLocation({
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

            const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }

            await dispatch(globalActions.setLocation(newLocation));

            return newLocation

        } catch (error) {
            console.error("Error getting location:", error);
            // router.navigate("/location")
            throw error
        }
    }


    useEffect(() => {
        watchPositionAsync();
    }, []);


    return {
        fetchGeoLocation,
        getLocation
    }
}

