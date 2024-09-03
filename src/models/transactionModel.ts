import { STRING, JSONB, DECIMAL } from "sequelize"
import { db } from "@/config"
import short from "short-uuid"


const TransactionsModel = db.define('transactions', {
	transactionId: {
		type: STRING,
		defaultValue: () => `${short.generate()}${short.generate()}`
	},
	amount: {
		type: DECIMAL,
		allowNull: false
	},
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
