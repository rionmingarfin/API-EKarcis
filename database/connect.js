const mysql =require('mysql')
const env =require('../config')

const conn = mysql.createConnection({
    host: env.HOST,
    user: env.USER,
    password: env.PASSWORD,
    database: env.DATABASE
})

conn.connect(function(err) {
    if (err) {
        console.log(err)
    }else{
        console.log('connect succesfully')
    }
})

module.exports = conn;