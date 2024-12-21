import { Request, Response } from 'express';
import { nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday } from "date-fns";
import { WeeklyQueueTitleType } from '@/types';

export const unAuthorizedResponse = (req: Request, res: Response) => {
    res.status(401).json({
        jsonrpc: "2.0",
        error: {
            code: 401,
            message: "Unauthorized",
        }
    });
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