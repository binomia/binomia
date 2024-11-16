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
