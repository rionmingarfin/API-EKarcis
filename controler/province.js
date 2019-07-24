'use strict'
const Response = require('../response/response')
const connection =require('../database/connect')
const isEmpty =require ('lodash.isempty')
const redis = require('redis');
const client = redis.createClient();

client.on('connect', function() {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
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