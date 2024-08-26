import { DATE, STRING } from "sequelize";
import { db } from "../config";


const UsersModel = db.define('users', {
    full_name: {
        type: STRING,
        allowNull: false
    },
    username: {
        type: STRING,
        allowNull: false
    },
    email: {
        type: STRING,
        allowNull: false
    },
    dni: {
        type: STRING,
        allowNull: false
    },
    sex: {
        type: STRING,
        allowNull: false
    },
    address: {
        type: STRING,
        allowNull: false
    },
    dob: {
        type: DATE,
        allowNull: false
    },
    dni_expire_date: {
        type: DATE,
        allowNull: false
    }

}, { timestamps: true, underscored: true })



export default UsersModel