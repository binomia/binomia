import { DATE, INTEGER, STRING, TEXT } from "sequelize";
import AccountModel from "./accountModel";
import UsersModel from "./userModel";
import { db } from "../config";


AccountModel.belongsTo(UsersModel, { foreignKey: 'userId' })
UsersModel.hasMany(AccountModel)



// Define the Session model
const SessionModel = db.define('Session', {
    sid: {
      type: STRING,
      primaryKey: true,
    },
    userId: INTEGER,
    jwtToken: TEXT, // Field to store the JWT
    expires: DATE,
    data: TEXT,
});


export {
    UsersModel,
    SessionModel,
    AccountModel
}