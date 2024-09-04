import { db } from "@/config";
import { STRING, FLOAT } from "sequelize";
import short from 'short-uuid';


const AccountModel = db.define('accounts', {
    balance: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: "active"
    },
    sentAmount: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    sendLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    receiveLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    receivedAmount: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    withdrawAmount: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 0.0
    },
    withdrawLimit: {
        type: FLOAT,
        allowNull: false,
        defaultValue: 50e3
    },
    hash: {
        type: STRING,
        allowNull: false,
        defaultValue: () => short.generate()
    },
    currency: {
        type: STRING,
        allowNull: false,
        defaultValue: "DOP"
    }
})

export default AccountModel
