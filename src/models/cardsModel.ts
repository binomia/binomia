import { STRING, TEXT } from "sequelize"
import { db } from "@/config"


const CardsModel = db.define('cards', {
    sid: {
        type: STRING,
        primaryKey: true
    },
    data: TEXT
})



export default CardsModel
