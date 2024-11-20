import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import SessionModel from "./sessionModel"
import CardsModel from "./cardsModel"
import TransactionsModel from "./transactionModel"
import kycModel from "./kycModel"
import BankingTransactionsModel from "./bankingTransactionModel"
import RecurrenceTransactionsModel from "./recurrenceTransactionModel"


UsersModel.hasOne(kycModel)
kycModel.belongsTo(UsersModel)

AccountModel.belongsTo(UsersModel, { foreignKey: 'username', targetKey: 'username', as: 'user' });
UsersModel.hasOne(AccountModel, { foreignKey: 'username', sourceKey: 'username', as: 'account' });


SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

CardsModel.belongsTo(UsersModel)
UsersModel.hasMany(CardsModel)

TransactionsModel.belongsTo(AccountModel, { foreignKey: 'fromAccount', targetKey: 'id', as: 'from' })
TransactionsModel.belongsTo(AccountModel, { foreignKey: 'toAccount', targetKey: 'id', as: 'to' })

RecurrenceTransactionsModel.belongsTo(AccountModel)
AccountModel.hasMany(RecurrenceTransactionsModel)

AccountModel.hasMany(TransactionsModel, { foreignKey: 'fromAccount', sourceKey: 'id', as: 'incomingTransactions' })
AccountModel.hasMany(TransactionsModel, { foreignKey: 'toAccount', sourceKey: 'id', as: 'outgoingTransactions' })

BankingTransactionsModel.belongsTo(CardsModel)
CardsModel.hasMany(BankingTransactionsModel)

BankingTransactionsModel.belongsTo(AccountModel)
AccountModel.hasMany(BankingTransactionsModel)

export {
	UsersModel,
	BankingTransactionsModel,
	SessionModel,
	TransactionsModel,
	AccountModel,
	CardsModel,
	kycModel
}