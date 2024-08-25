import express, { Express } from "express"
import { ip } from "address"

export const app: Express = express()


app.get("/", (req, res) => {
    res.send("Hello World!")
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    // console.log(`Server is running locally on http://localhost:${PORT}`);
    // console.log(`Server is alse running on http://${ip()}:3000`);
})