const express = require("express");
const app = express()
const PORT = 5000;
const cors = require("cors");
const http = require("http");
const server = http.createServer(app)
const {Server} = require("socket.io");
const Connect = require("./MongoDB/Connect.js");
const io = new Server(server, {
    cors:{
        origin:"*"
    }
})
Connect();
app.use(cors({
    origin: "*"
}))
app.use(express.json())
app.use("/", require("./routes/blog.js"))
app.use("/", require("./routes/User.js"))
server.listen(PORT, ()=>{
    console.log("listening")
})