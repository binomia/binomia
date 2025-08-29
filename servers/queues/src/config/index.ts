import { Sequelize } from "sequelize";


export const db = new Sequelize({
    dialect: "postgres",
    database: "postgres",
    host: "postgres",
    port: 5432,
    username: "postgres",
    password: "postgres",
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