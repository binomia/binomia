import { STRING } from "sequelize"
import { db } from "@/config"

const TopUpPhonesModel = db.define('toptups-phones', {
    fullName: STRING,
    phone: STRING
})



export default TopUpPhonesModel
