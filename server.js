const express = require('express')
const app = express()
const bodyParser =require('body-parser')
// const port =process.env.PORT || 5000
const Routes = require('./routes/routes')
const cors =require('cors')
const env =require('./config')
app.use(cors());

app.use(
    bodyParser.urlencoded({
        extended : true
    })
)
Routes(app)
app.use(bodyParser.json())

app.listen(env.PORT)
console.log(`hello word${env.PORT}`)

