import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import SessionModel from "./sessionModel"



AccountModel.belongsTo(UsersModel)
UsersModel.hasMany(AccountModel)

SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

export {
	UsersModel,
	SessionModel,
	AccountModel
}