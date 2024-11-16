import { nextSaturday, nextDa } from "date-fns";

const now = new Date();
const saturday = nextDay(new Date());
console.log(saturday);