require('./config')
const express = require('express')
const app = express()
const bodyParser =require('body-parser')
const xssFilter = require('x-xss-protection')
const helmet = require('helmet')
// const port =process.env.PORT || 5000
const Routes = require('./routes/routes')
const cors =require('cors')
const dateFormat = require('dateformat');
const logger =  require('morgan');
app.use(cors(), logger('dev'));

app.use(
    bodyParser.urlencoded({
        extended : true
    }),
    function (req, res, next) {
        console.log("[LOG]");
        console.log(`\nTIME : ${dateFormat(new Date(), "yyyy-mm-dd h:MM:ss")} \nHOST : ${req.headers.host} \nURL : ${req.url} \nMETHOD : ${req.method} \nUser Agent : ${req.headers["useragent"]} \n`);
        console.log("BODY : ",  req.body);
        console.log("QUERY : ", req.query);
        next();
    },
)
app.use(bodyParser.json())
app.use(xssFilter())
app.use(helmet.xssFilter())
Routes(app) 
app.listen(process.env.PORT)
console.log(`hello word${process.env.PORT}`)

