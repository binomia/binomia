import { DATE, STRING, JSONB, TEXT, BOOLEAN } from "sequelize"
import { db } from "@/config"
import { verify } from "jsonwebtoken"


const SessionModel = db.define('sessions', {
	verified: {
		type: BOOLEAN,
		defaultValue: false
	},
	sid: TEXT,
	deviceId: TEXT,
	jwt: TEXT,
	expires: DATE,
	data: JSONB
})



export default SessionModel
