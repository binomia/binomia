import { DATE, STRING, JSONB } from "sequelize"
import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import { db } from "../config"


const SessionModel = db.define('sessions', {
	sid: {
		type: STRING,
		primaryKey: true
	},
	jwtToken: STRING,
	expires: DATE,
	data: JSONB
})


AccountModel.belongsTo(UsersModel)
UsersModel.hasMany(AccountModel)

SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

export {
	UsersModel,
	SessionModel,
	AccountModel
}