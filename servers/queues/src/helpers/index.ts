import { Request, Response } from 'express';
import { nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday } from "date-fns";
import { WeeklyQueueTitleType } from '@/types';
import { Client } from '@googlemaps/google-maps-services-js';
import axios from 'axios';
import { GOOGLE_MAPS_API_KEY } from '@/constants';
import * as zlib from 'zlib';


export function compressData(data: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.gzip(data, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}

export function decompressData(data: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        zlib.gunzip(data, (err, result) => {
            if (err) reject(err);
            else resolve(result.toString());
        });
    });
}

export const unAuthorizedResponse = (req: Request, res: Response) => {
    res.status(401).json({
        jsonrpc: "2.0",
        error: {
            code: 401,
            message: "Unauthorized",
        }
    });
}

export const MAKE_FULL_NAME_SHORTEN = (fullName: string) => {
    const nameParts = fullName.trim().split(/\s+/);

    if (nameParts.length === 1) {
        return fullName; // Return full name if there's only one part
    }

    const firstName = nameParts[0];
    let middleNameInitial = '';
    let lastName = '';

    if (nameParts.length === 2) {
        // If only two parts, assume it's "First Last"
        lastName = nameParts[1];
    } else {
        // Identify the position of the last name dynamically
        let lastNameIndex = 1; // Default: last name is the last word

        for (let i = nameParts.length - 2; i > 0; i--) {
            // If we detect a lowercase or very short word (≤3 letters), we assume it's part of the last name
            if (nameParts[i].length <= 3 || /^[a-z]/.test(nameParts[i])) {
                lastNameIndex = i;
            } else {
                break; // Stop when we find a non-compound part
            }
        }

        // Middle name initial (if any)
        if (lastNameIndex > 1) {
            middleNameInitial = nameParts[1].charAt(0).toUpperCase() + '.';
        }

        // Extract last name correctly
        lastName = nameParts.slice(lastNameIndex).join(" ")

        if (lastName.split(" ").length > 2)
            lastName = lastName.split(" ").slice(0, -1).join(" ")
    }

    return middleNameInitial
        ? `${firstName} ${middleNameInitial} ${lastName}`
        : `${firstName} ${lastName}`;
};


export const FORMAT_CURRENCY = (value: number) => {
    if (isNaN(value))
        return "$0.00";

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export const getNextDay = (targetDay: WeeklyQueueTitleType): number => {
    switch (targetDay) {
        case "everySunday": return nextSunday(new Date().setHours(0, 1, 1, 1)).getTime()
        case "everyMonday": return nextMonday(new Date().setHours(0, 1, 1, 1)).getTime()
        case "everyTuesday": return nextTuesday(new Date().setHours(0, 1, 1, 1)).getTime()
        case "everyWednesday": return nextWednesday(new Date().setHours(0, 1, 1, 1)).getTime()
        case "everyThursday": return nextThursday(new Date().setHours(0, 1, 1, 1)).getTime()
        case "everyFriday": return nextFriday(new Date().setHours(0, 0, 0, 1)).getTime()
        case "everySaturday": return nextSaturday(new Date().setHours(0, 0, 0, 1)).getTime()
        default: return 0
    }
}


export const getSpecificDayOfMonth = (dayString: string): Date => {
    // Get the current date
    const today = new Date();

    // Mapping of day strings to the actual day of the month
    const dayMap: { [key: string]: number } = {
        'everyFirst': 1,
        'everySecond': 2,
        'everyThird': 3,
        'everyFourth': 4,
        'everyFifth': 5,
        'everySixth': 6,
        'everySeventh': 7,
        'everyEighth': 8,
        'everyNinth': 9,
        'everyTenth': 10,
        'everyEleventh': 11,
        'everyTwelfth': 12,
        'everyThirteenth': 13,
        'everyFourteenth': 14,
        'everyFifteenth': 15,
        'everySixteenth': 16,
        'everySeventeenth': 17,
        'everyEighteenth': 18,
        'everyNineteenth': 19,
        'everyTwentieth': 20,
        'everyTwentyFirst': 21,
        'everyTwentySecond': 22,
        'everyTwentyThird': 23,
        'everyTwentyFourth': 24,
        'everyTwentyFifth': 25,
        'everyTwentySixth': 26,
        'everyTwentySeventh': 27,
        'everyTwentyEighth': 28,
        'everyTwentyNinth': 29,
        'everyThirtieth': 30,
        'everyThirtyFirst': 31
    };

    // Check if the provided dayString exists in the map
    if (dayString in dayMap) {
        const targetDay = dayMap[dayString];
        // Get the current date

        // Clone the current date for modification
        let nextMonth = new Date();

        // If today is past the target day, move to the next month
        if (today.getDate() > targetDay) {
            // Set the date to the next month's target day
            nextMonth.setMonth(today.getMonth() + 1);
        }

        // Set the date to the target day
        nextMonth.setDate(targetDay);

        return nextMonth;
    } else {
        throw new Error('Invalid day string. Please provide a valid option.');
    }
}

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const toRadians = (degree: number) => (degree * Math.PI) / 180;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return +Number(R * c).toFixed(2);
}

export const calcularTime = (velocidad: number, distancia: number): number => {
    if (velocidad === 0 || distancia === 0)
        return 0

    return +Number(distancia / velocidad).toFixed(3);
}

export const calculateSpeed = (distanceKm: number, timeDiffMs: number): number => {
    const timeDiffHours = timeDiffMs / (1000 * 60 * 60); // Convert milliseconds to hours
    return +Number(timeDiffHours > 0 ? distanceKm / timeDiffHours : 0).toFixed(2);
}

export const fetchGeoLocation = async ({ latitude, longitude }: { latitude: number, longitude: number }) => {
    try {
        const client = new Client();

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

        return address

    } catch (error: any) {
        console.error("Reverse geocoding error:", error);
        return {}
    }
}


