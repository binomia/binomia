import { STRING, JSONB, TEXT, INTEGER } from "sequelize"
import { db } from "@/config"

const QueueTransactionsModel = db.define('queue_transactions', {
	jobId: {
		type: STRING
	},
	repeatJobKey: {
		type: STRING
	},
	jobName: {
		type: STRING
	},
	jobTime: {
		type: STRING
	},
	amount: {
		type: INTEGER,
		allowNull: false
	},
	status: {
		type: STRING,
		allowNull: false,
		defaultValue: "created"
	},
	repeatedCount: {
		type: INTEGER,
		allowNull: false
	},
	data: {
		type: TEXT,
		allowNull: false
	},
	signature: {
		type: TEXT,
		allowNull: false
	}
})



export default QueueTransactionsModel
