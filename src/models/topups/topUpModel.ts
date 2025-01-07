import { DECIMAL, STRING } from "sequelize"
import { db } from "@/config"

const TopUpsModel = db.define('toptups', {
    amount: DECIMAL,
    referenceId: STRING,
    status: STRING,
})

export default TopUpsModel
