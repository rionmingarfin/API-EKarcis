'use strict'
const Response = require('../response/response')
const connection =require('../database/connect')
const isEmpty =require ('lodash.isempty')
// const redis =require('redis')
// const request =require('superagent')
// const client =redis.createClient()

exports.getAllCategory = (req,res)=> {
    connection.query(
        'SELECT * FROM category',
        function(error,rows,field){
            if (error) {
                throw error
            }else{
                res.json(rows)
            }
        }
    )
}

exports.insert = (req,res) => {
    const name = req.body.name
    if (isEmpty(req.body.name)) {
        Response.error(404,'data cannot body be empty',res)
    }else{
        connection.query(
            'INSERT INTO category set name=?',
            [name],
            function(error,rows,field){
                if(error){
                    throw error
                }else{
                    let insertId =rows.insertId
                    let data = {
                        status : 202,
                        message : 'data insert succesfully',
                        result  : {
                              id : insertId,
                              name : name
                        }
                    }
                   return res.status(202).json(data).end()
                }
            }
        )

    }
}

exports.update = (req,res) => {
    const id =req.params.id
    const name =req.body.name
    connection.query(
        'UPDATE category SET name=? WHERE id=?',
        [name,id],
        function(error,rows,field){
            if (error) {
                throw error
            }else{
                let data = {
                    status :202,
                    message :'data update sucefully',
                    result : {
                        id : parseInt(id),
                        name : name
                    }
                }
                return res.status(202).json(data).end()
            }
        }
    )
}

exports.delete = (req,res) => {
    const id =req.params.id
    if (id === 0 || id === '') {
        Response.error(404,'error',res)
    }else{
        connection.query(
            'DELETE FROM category WHERE id=?',
            [id],
            function(error,rows,field){
                if (error) {
                    throw error
                }else{
                    if (rows.affectedRows === 0 || rows.affectedRows ==='') {
                        Response.error(404,'data not found',rows)
                    }else{
                        let idResult = id
                        let data = {
                            status :202,
                            message :'delete data succeesfully',
                            result : {
                                id :parseInt(idResult),
                            }
                        }
                        return res.status(202).json(data).end()
                    }
                    res.json(rows)
                }
            }
        )
    }
}