import express from "express"
import dotenv from "dotenv"
import bodyParser from "body-parser"
import Cadastro from "./models/Cadastro"
import DispositivoFactory from "./models/DispositivoFactory"

dotenv.config()
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
const port = Number(process.env.PORT) || 3001
const nomeDev = process.env.NAME || "Dev"
const idade = process.env.AGE || "0"

app.get("/", (req, res) => {
    res.send(`...`)
})

const server = app.listen(port, () => {
    console.log(`Servidor funcionando em http://localhost:${port}`)
})

server.close(() => {
    console.log("Servidor encerrado.")
})

export default server