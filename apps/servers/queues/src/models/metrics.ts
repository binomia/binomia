import { DATE, STRING, JSONB, TEXT, BOOLEAN } from "sequelize"
import { db } from "@/config"


const MetricsModel = db.define('metrics', {
	verified: {
		type: BOOLEAN,
		defaultValue: false
	},
	sid: TEXT,
	deviceId: TEXT,
	expoNotificationToken: STRING,
	jwt: TEXT,
	expires: DATE,
	data: JSONB
})



export default MetricsModel
