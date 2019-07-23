'use strict'
const Response = require('../response/response')
const connection =require('../database/connect')
const isEmpty =require ('lodash.isempty')
exports.welcome = (req,res) =>{
    Response.ok('welcome',res)
}

exports.getAllProvince = (req,res)=> {
    connection.query(
        'SELECT * FROM province',
        function(error,rows,field){
            if (error) {
                throw error
            }else{
                res.json(rows)
            }
        }
    )
}