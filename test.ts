import { nextTuesday } from "date-fns";
import moment from "moment";

const date = new Date().setHours(0, 1, 1, 1);
const nextDate = nextTuesday(date)


console.log(moment(nextDate).format("llll"));
