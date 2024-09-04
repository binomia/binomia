import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import SessionModel from "./sessionModel"
import CardsModel from "./cardsModel"
import TransactionsModel from "./transactionModel"


AccountModel.belongsTo(UsersModel)
UsersModel.hasOne(AccountModel)

SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

CardsModel.belongsTo(UsersModel)
UsersModel.hasOne(CardsModel)

TransactionsModel.belongsTo(AccountModel, { foreignKey: 'senderId', targetKey: 'id', as: 'sender' })
TransactionsModel.belongsTo(AccountModel, { foreignKey: 'receiverId', targetKey: 'id', as: 'receiver' })

AccountModel.hasMany(TransactionsModel, { foreignKey: 'receiverId', sourceKey: 'id', as: 'incomingTransactions' })
AccountModel.hasMany(TransactionsModel, { foreignKey: 'senderId', sourceKey: 'id', as: 'outgoingTransactions' })

export {
	UsersModel,
	SessionModel,
	TransactionsModel,
	AccountModel,
	CardsModel
}