import { DATE, STRING } from "sequelize";
import { db } from "@/config";

const UsersModel = db.define('users', {
    fullName: {
        type: STRING,
        allowNull: false
    },
    username: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    imageUrl: {
        type: STRING,
        allowNull: true
    },
    email: {
        type: STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: STRING,
        allowNull: false
    },
    dni: {
        type: STRING,
        allowNull: false,
        unique: true
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
    dniExpiration: {
        type: DATE,
        allowNull: false
    }
})



export default UsersModel