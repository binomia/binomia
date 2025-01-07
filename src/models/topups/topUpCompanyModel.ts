import { STRING } from "sequelize"
import { db } from "@/config"
import short from "short-uuid"


const TopUpCompanyModel = db.define('toptups-company', {
    uuid: {
        type: STRING,
        defaultValue: () => `${short.generate()}${short.generate()}`
    },
    name: STRING,
    logo: STRING,
    status: STRING
})

export default TopUpCompanyModel
