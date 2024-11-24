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
