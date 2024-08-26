import { Sequelize } from "sequelize";

export const db = new Sequelize({
    dialect: "sqlite",
    storage: "db.sqlite",
    logging: false
})



export const dbConnection = async () => {
    try {
        db.authenticate()
        db.sync()
        console.log('\nDatabase connection has been established successfully.');
    } catch (error) {
        console.log('\nUnable to connect to the database:', error);
    }
}