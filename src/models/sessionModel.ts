import { DATE, STRING, JSONB, TEXT } from "sequelize"
import { db } from "@/config"


const SessionModel = db.define('sessions', {
	sid: TEXT,
	deviceId: TEXT,
	jwt: TEXT,
	expires: DATE,
	data: JSONB
})



export default SessionModel
