import { db } from "@/config";
import { STRING, DECIMAL } from "sequelize";
import short from 'short-uuid';


const AccountModel = db.define('accounts', {
    balance: {
        type: DECIMAL,
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: STRING,
        allowNull: false,
        defaultValue: "active"
    },
    sendLimit: {
        type: DECIMAL,
        allowNull: false,
        defaultValue: 50e3
    },
    receiveLimit: {
        type: DECIMAL,
        allowNull: false,
        defaultValue: 50e3
    },
    withdrawLimit: {
        type: DECIMAL,
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
