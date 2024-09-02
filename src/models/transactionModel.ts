import { STRING, JSONB, DECIMAL } from "sequelize"
import { db } from "@/config"



const TransactionsModel = db.define('transactions', {
	deliveredAmount: {
		type: DECIMAL,
		allowNull: false
	},
	balanceAfterTransaction: {
		type: DECIMAL,
		allowNull: false
	},
	balanceBeforeTransaction: {
		type: DECIMAL,
		allowNull: false
	},
	voidedAmount: {
		type: DECIMAL,
		allowNull: false
	},
	refundedAmount: {
		type: DECIMAL,
		allowNull: false
	},
	transactionType: {
		type: STRING,
		allowNull: false
	},
	currency: {
		type: STRING,
		allowNull: false
	},
	description: {
		type: STRING,
		allowNull: false
	},
	status: {
		type: STRING,
		allowNull: false
	},
	location: {
		type: JSONB,
		allowNull: false
	},
	signature: {
		type: STRING,
		allowNull: false
	}
})



export default TransactionsModel
