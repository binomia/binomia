import { Client, ClientTypes } from "cromio"
import http from "http"


const client = new Client({
    servers: [{
        url: "http://localhost:3000",
        secretKey: "secret",
    }]
})
// [8.01, 152.93, 68732.58, 4, 1, 370.04] valid
// [19.52, 33473.8, 6173446.72, 4, 1, 1490.12] fraud

http.createServer(async (_: any, res: any) => {
    const result = await client.trigger("predictTransaction", [80.01, 152.93, 68732.58, 4, 1, 370.04])
    console.log(result.data);

    res.end(JSON.stringify(result))
}).listen(4000, () => {
    console.log("server started http://localhost:4000")
})