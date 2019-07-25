'use strict'

const connection = require('../database/connect')
const moment = require('moment');
const {createTicket} = require("./createTicket");

exports.chackingTransaction = (id_transaction, status) =>{
    let sql = `UPDATE transaction SET status='${status}' WHERE (id_transaction='${id_transaction}') LIMIT 1`
    connection.query(sql, function (error,transaction ) {
        if(error){
            return false;
        }else{
            if (transaction.changedRows>0){
                let sql2 = 'SELECT * FROM transaction where id_transaction = "'+id_transaction+'"';
                connection.query(sql2,function (err, dataTransaction) {
                    if (err){
                        return false;
                    }else {
                        if (dataTransaction.length>0){
                            let id_user = dataTransaction[0].id_user;
                            let id_tour = dataTransaction[0].id_tour;
                            let name_booking = dataTransaction[0].name;
                            let booking_date = moment(dataTransaction[0].booking_date).utc().format("YYYY-MM-DD HH:mm:ss");
                            let expaired_date = moment(booking_date).add(7,'days').utc().format("YYYY-MM-DD HH:mm:ss");
                            let ticket_amount = dataTransaction[0].ticket_amount;
                            createTicket(id_user,id_tour,id_transaction,name_booking,booking_date,expaired_date,ticket_amount);
                        }else {
                            return false;
                        }
                    }
                });
            }else {
                return false;
            }
        }
    })
};