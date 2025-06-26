import AccountModel from "./accountModel"
import UsersModel from "./userModel"
import CardsModel from "./cardsModel"
import TransactionsModel from "./transactionModel"
import BankingTransactionsModel from "./bankingTransactionModel"
import QueuesModel from "./queuesModel"
import SessionModel from "./sessionModel"
import TopUpPhonesModel from "./topups/topUpPhonesModel"
import TopUpCompanyModel from "./topups/topUpCompanyModel"
import TopUpsModel from "./topups/topUpModel"


TopUpsModel.belongsTo(TopUpPhonesModel, { foreignKey: 'phoneId', targetKey: 'id', as: 'phone' })
TopUpPhonesModel.hasMany(TopUpsModel, { as: 'topups', foreignKey: 'phoneId' })

TopUpPhonesModel.belongsTo(TopUpCompanyModel, { as: 'company', foreignKey: 'companyId' })
TopUpCompanyModel.hasMany(TopUpPhonesModel, { as: 'phones', foreignKey: 'companyId' })

TopUpPhonesModel.belongsTo(UsersModel)
UsersModel.hasMany(TopUpPhonesModel, { as: 'phones' })

TopUpsModel.belongsTo(UsersModel)
UsersModel.hasMany(TopUpsModel)

TopUpsModel.belongsTo(TopUpCompanyModel, { foreignKey: 'companyId', targetKey: 'id', as: 'company' })
TopUpCompanyModel.hasMany(TopUpsModel, { as: 'topups', foreignKey: 'companyId' })


AccountModel.belongsTo(UsersModel, { foreignKey: 'username', targetKey: 'username', as: 'user' });
UsersModel.hasOne(AccountModel, { foreignKey: 'username', sourceKey: 'username', as: 'account' });


CardsModel.belongsTo(UsersModel)
UsersModel.hasMany(CardsModel)

TransactionsModel.belongsTo(AccountModel, { foreignKey: 'fromAccount', targetKey: 'id', as: 'from' })
TransactionsModel.belongsTo(AccountModel, { foreignKey: 'toAccount', targetKey: 'id', as: 'to' })

QueuesModel.belongsTo(UsersModel)
UsersModel.hasMany(QueuesModel)

SessionModel.belongsTo(UsersModel)
UsersModel.hasMany(SessionModel)

AccountModel.hasMany(TransactionsModel, { foreignKey: 'fromAccount', sourceKey: 'id', as: 'incomingTransactions' })
AccountModel.hasMany(TransactionsModel, { foreignKey: 'toAccount', sourceKey: 'id', as: 'outgoingTransactions' })

BankingTransactionsModel.belongsTo(CardsModel)
CardsModel.hasMany(BankingTransactionsModel)

BankingTransactionsModel.belongsTo(UsersModel)
UsersModel.hasMany(BankingTransactionsModel)

BankingTransactionsModel.belongsTo(AccountModel)
AccountModel.hasMany(BankingTransactionsModel)

export {
	TopUpsModel,
	UsersModel,
	QueuesModel,
	BankingTransactionsModel,
	TransactionsModel,
	AccountModel,
	CardsModel,
	SessionModel,
	TopUpPhonesModel,
	TopUpCompanyModel
}