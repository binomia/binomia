import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import SessionModel from "./sessionModel"
import CardsModel from "./cardsModel"
import TransactionsModel from "./transactionModel"


AccountModel.belongsTo(UsersModel)
UsersModel.hasMany(AccountModel)

SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

CardsModel.belongsTo(UsersModel)
UsersModel.hasMany(CardsModel)

TransactionsModel.belongsTo(UsersModel, { foreignKey: 'senderId', targetKey: 'id', as: 'sender' })
TransactionsModel.belongsTo(UsersModel, { foreignKey: 'receiverId', targetKey: 'id', as: 'receiver' })
UsersModel.hasMany(TransactionsModel, { foreignKey: 'receiverId', sourceKey: 'id', as: 'incomingTransactions' })
UsersModel.hasMany(TransactionsModel, { foreignKey: 'senderId', sourceKey: 'id', as: 'outgoingTransactions' })

export {
	UsersModel,
	SessionModel,
	TransactionsModel,
	AccountModel,
	CardsModel
}