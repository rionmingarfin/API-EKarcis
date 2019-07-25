'use strict'
const connection = require('../database/connect');
const {splitNoPhone} = require("./helper");
const {sendSms} = require("./sendSms");

exports.notifTransactionTranfer = (idUser, idTransaction, total_price, payment_method, va, displayName) => {
    let sql = 'SELECT * FROM users where id_user = '+idUser;

    connection.query(sql, function (error, field) {
        if (error){
            return false;
        }else {
            if (field.length>0){
                let email = field[0].email;
                let phone = splitNoPhone(field[0].phone);
                let messageSms = `[${idTransaction}][EXTick]\n اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَا تُهُ. \nEXTick friend, Please transfer IDR. ${total_price} to the ${payment_method.toUpperCase()} Virtual Account ${va} as. ${displayName}   for a maximum period of 1 day.\nThank you`;
                sendSms(phone,messageSms);
                return true;
            }else {
                return false;
            }
        }
    })
};

exports.notifTransactionSuccess = (idTransaction) => {
    let sql = 'SELECT * FROM transaction where id_transaction = "'+idTransaction+'"';
    connection.query(sql,function (err, transaction) {
        if (err){
            return false;
        }else {
            if (transaction.length>0){
                let sql2 = `SELECT * FROM users WHERE id_user = '${transaction[0].id_user}'`;
                connection.query(sql2, function (error, users) {
                    if (error){
                        return false;
                    }else{
                        if (users.length>0){
                            let phone = splitNoPhone(users[0].phone);
                            let email = users[0].email;
                            let total_price = transaction[0].total_price;
                            let messageSms = `[${idTransaction}][EXTick] \n َلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَا تُهُ. \nEXTick friend, Your transaction is IDR. ${total_price} successful.\nthank you`
                            sendSms(phone,messageSms);
                            return true;
                        }else {
                            return false;
                        }
                    }
                })
            }else {
                return false;
            }
        }
    });
};