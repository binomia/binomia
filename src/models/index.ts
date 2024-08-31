import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import SessionModel from "./sessionModel"
import CardsModel from "./cardsModel"


AccountModel.belongsTo(UsersModel)
UsersModel.hasMany(AccountModel)

SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

CardsModel.belongsTo(UsersModel)
UsersModel.hasMany(CardsModel)


export {
	UsersModel,
	SessionModel,
	AccountModel,
	CardsModel
}