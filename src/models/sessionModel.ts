import { DATE, STRING, JSONB } from "sequelize"
import { db } from "../config"


const SessionModel = db.define('sessions', {
	sid: {
		type: STRING,
		primaryKey: true
	},
	jwt: STRING,
	expires: DATE,
	data: JSONB
})



export default SessionModel
