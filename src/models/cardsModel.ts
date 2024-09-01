import { INTEGER, STRING, TEXT, DataType, DataTypes } from "sequelize"
import { db } from "@/config"


const CardsModel = db.define('cards', {
    
    data: TEXT,
    userId: {
        type: INTEGER,
        key: 'userId',
        unique: true,
        references: {
            model: 'users',
            key: 'id'
        }
    }
})



export default CardsModel
