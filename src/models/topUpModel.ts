import { DECIMAL, STRING } from "sequelize"
import { db } from "@/config"

const TopUpsModel = db.define('toptups', {
    fullName: STRING,
    phone: STRING,
    amount: DECIMAL,
    referenceId: STRING,
    status: STRING,
})



export default TopUpsModel
