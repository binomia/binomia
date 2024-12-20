import { GOOGLE_MAPS_API_KEY } from "@/constants";
import { WeeklyQueueTitleType } from "@/types";
import { nextFriday, nextMonday, nextSaturday, nextSunday, nextDay, nextThursday, nextTuesday, nextWednesday } from "date-fns";


export const FORMAT_PHONE_NUMBER = (value: string) => {
    value = value.replaceAll(/[^0-9]/g, '');

    if (value.length >= 6) {
        const formattedValue = `(${value.slice(0, 3)}) ` + value.slice(3, 6) + "-" + value.slice(6);
        return formattedValue
    }

    else if (value.length >= 3) {
        const formattedValue = `(${value.slice(0, 3)}) ` + value.slice(3)
        return formattedValue
    }

    return value
}


export const VALIDATE_EMAIL = (email: string) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};


export const GENERATE_SIX_DIGIT_TOKEN = (): string => {
    const token = Math.floor(100000 + Math.random() * 900000);
    return token.toString();
}


export const FORMAT_CEDULA = (value: string) => {
    if (value.length <= 3 && value !== "") {
        return value.replaceAll("-", "")
    }
    else if (value.length > 3 && value.length <= 10) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3)
        return formattedValue
    }
    else if (value.length > 10 && value.length <= 11) {
        const formattedValue = value.slice(0, 3) + "-" + value.slice(3, 10) + "-" + value.slice(10, 11);
        return formattedValue
    }
    return value
}


export const FORMAT_TIME_PLAYED = (value: number) => { // "00:00:00"
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value - (hours * 3600)) / 60);
    const seconds = Math.floor(value - (hours * 3600) - (minutes * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}


export const FORMAT_DATE = (value: string) => {
    if (!value) return null;

    const months: any = {
        "enero": "01",
        "febrero": "02",
        "marzo": "03",
        "abril": "04",
        "mayo": "05",
        "junio": "06",
        "julio": "07",
        "agosto": "08",
        "septiembre": "09",
        "octubre": "10",
        "noviembre": "11",
        "diciembre": "12"
    }

    const [day, month, year] = value.split(" ");
    const date = `${year}-${months[month]}-${day}`
    return date
}


export const FORMAT_CURRENCY = (value: number) => {
    if (isNaN(value))
        return "$0.00";

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
}

export const GENERATE_RAMDOM_COLOR_BASE_ON_TEXT = (test: string): string => {
    // Create a hash from the name
    let hash: number = 0;
    for (let i = 0; i < test.length; i++) {
        hash = test.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert the hash to a hex color with a restriction on lightness
    let color: string = '#';
    for (let i = 0; i < 3; i++) {
        let value: number = (hash >> (i * 8)) & 0xFF;

        // Ensure the value is not too light (e.g., restrict values to a range like 50-200)
        value = Math.max(50, Math.min(200, value));

        color += ('00' + value.toString(16)).slice(-2);
    }

    return color;
}

export const MAKE_FULL_NAME_SHORTEN = (fullName: string) => {
    const nameParts = fullName.trim().split(" ");

    if (nameParts.length === 1) {
        return fullName; // Return full name if there's only one part
    }

    const firstName = nameParts[0];
    const middleNameInitial = nameParts.length > 2 ? nameParts[1].charAt(0).toUpperCase() + '.' : '';
    const lastNameInitial = nameParts[nameParts.length - 1];

    return middleNameInitial
        ? `${firstName} ${middleNameInitial} ${lastNameInitial}`
        : `${firstName} ${lastNameInitial}`;
}

export const CAPITALIZE_WORDS = (text: string) => {
    return text
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}


export const FORMAT_LIMIT = (amount: number, limit: number) => {
    if (amount === 0)
        return String(0)

    return parseFloat(String((amount / limit) * 100)).toFixed(0)
}

export const FORMAT_FULL_NAME = (fullName: string, length: number = 15) => {
    return fullName.length > length ? fullName.slice(0, length - 3) + "..." : fullName
}

export const getMapLocationImage = ({ latitude, longitude }: { latitude: number, longitude: number }) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=500x500&map_id=${"d5db1229935ffa0d"}&key=${GOOGLE_MAPS_API_KEY}`

}


export const getNextDay = (targetDay: WeeklyQueueTitleType): number => {
    switch (targetDay) {
        case "everySunday":
            return nextSunday(new Date()).getTime()

        case "everyMonday":
            return nextMonday(new Date()).getTime()

        case "everyTuesday":
            return nextTuesday(new Date()).getTime()

        case "everyWednesday":
            return nextWednesday(new Date()).getTime()

        case "everyThursday":
            return nextThursday(new Date()).getTime()

        case "everyFriday":
            return nextFriday(new Date()).getTime()

        case "everySaturday":
            return nextSaturday(new Date()).getTime()

        default:
            return 0
    }
}


export const getSpecificDayOfMonth = (dayString: string) => {
    console.log({ dayString });
    
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
        return ""
    }
}
