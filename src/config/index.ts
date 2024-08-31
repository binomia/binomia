import { Sequelize } from "sequelize";


export const db = new Sequelize({
    dialect: "postgres",
    database: "postgres",
    username: "brayhandeaza",
    password: "postgres",
    logging: false
})



export const dbConnection = async () => {
    try {
        db.authenticate()
        db.sync()
        // console.log('\nDatabase connection has been established successfully.');
    } catch (error) {
        console.log('\nUnable to connect to the database:', error);
    }
}