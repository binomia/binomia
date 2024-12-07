import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import CardsModel from "./cardsModel"
import TransactionsModel from "./transactionModel"
import BankingTransactionsModel from "./bankingTransactionModel"
import QueueTransactionsModel from "./queueTransactionModel"

AccountModel.belongsTo(UsersModel, { foreignKey: 'username', targetKey: 'username', as: 'user' });
UsersModel.hasOne(AccountModel, { foreignKey: 'username', sourceKey: 'username', as: 'account' });


CardsModel.belongsTo(UsersModel)
UsersModel.hasMany(CardsModel)

TransactionsModel.belongsTo(AccountModel, { foreignKey: 'fromAccount', targetKey: 'id', as: 'from' })
TransactionsModel.belongsTo(AccountModel, { foreignKey: 'toAccount', targetKey: 'id', as: 'to' })

QueueTransactionsModel.belongsTo(AccountModel, { foreignKey: 'senderId', targetKey: 'id', as: 'sender' })
QueueTransactionsModel.belongsTo(AccountModel, { foreignKey: 'receiverId', targetKey: 'id', as: 'receiver' })

AccountModel.hasMany(TransactionsModel, { foreignKey: 'fromAccount', sourceKey: 'id', as: 'incomingTransactions' })
AccountModel.hasMany(TransactionsModel, { foreignKey: 'toAccount', sourceKey: 'id', as: 'outgoingTransactions' })

BankingTransactionsModel.belongsTo(CardsModel)
CardsModel.hasMany(BankingTransactionsModel)

BankingTransactionsModel.belongsTo(AccountModel)
AccountModel.hasMany(BankingTransactionsModel)

export {
	UsersModel,
	QueueTransactionsModel,
	BankingTransactionsModel,
	TransactionsModel,
	AccountModel,
	CardsModel,
}