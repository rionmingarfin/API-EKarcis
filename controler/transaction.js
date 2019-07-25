'use strict'

const response = require('../response/response')
const connection = require('../database/connect')
const isEmpty = require('lodash.isempty');
const FormData = require('form-data');
const http = require('http');
const moment = require('moment');
const axios = require('axios');
const {chackingTransaction} = require("../helper/checkingTransaction");
const {notifTransactionTranfer, notifTransactionSuccess} = require('../helper/notifTransaction');

exports.postTransaction = async (req, res) => {
    let id_user = req.body.id_user;
    let name = req.body.name;
    let id_tour = req.body.id_tour;
    let ticket_amount = req.body.ticket_amount;
    let booking_date = moment(req.body.booking_date).utc().format("YYYY-MM-DD HH:mm:ss");
    let coin = req.body.coins_bonus;
    let date = Date.now();
    let total_price = req.body.total_price;
    let payment_method = req.body.payment_method;
    let numberId = `E-KARCIS-${moment(new Date()).format('MM')}-${new Date().getTime()}`;
    let paymentGateway = 'https://my.ipaymu.com/api/getbniva';
    let va = '';
    let displayName = '';
    let payment_id = '';
    await axios.post(paymentGateway, {
        key: process.env.IPAYMUapi_key,
        price: total_price,
        uniqid: numberId,
        notify_url: 'http://52.27.82.154:7000/callback_payment'
    })
        .then(response => {
            payment_id = response.data.id;
            va = response.data.va;
            displayName = response.data.displayName;
        })
        .catch(error => {
            response.error("GET VA failed", res)
        });

    let sql = `INSERT INTO ekarcis.transaction (id_transaction, id_user,name, id_tour, ticket_amount, coins_bonus, booking_date, deadline, payment_method,total_price,payment_id, va, payment_display_name, status) 
    VALUES ('${numberId}', '${id_user}','${name}', '${id_tour}', '${ticket_amount}', '${coin}', '${booking_date}', '${moment(date).add(2, 'days').utc().format("YYYY-MM-DD HH:mm:ss")}','${payment_method}','${total_price}','${payment_id}','${va}','${displayName}', 'unpaid')`;
    connection.query(sql, function (error, field) {
        if (error) {
            response.error("send transaction failed", res)
        } else {
            let sql3 = `SELECT *, transaction.id_user FROM ekarcis.transaction LEFT JOIN tour on transaction.id_tour = tour.id_tour LEFT JOIN photo ON tour.id_tour = photo.id_tour WHERE id_transaction = '${numberId}'`
            console.log(sql3);
            connection.query(sql3, function (error, field) {
                if (error){
                    response.error("save transaction failed", res)
                } else {
                    notifTransactionTranfer(id_user,numberId, total_price,payment_method,va,displayName);
                    response.success(field, res);
                }
            })
        }
    });
};

exports.getTransaction = (req, res, next) => {
    let id_user = req.body.id_user;
    let id_tour = req.body.id_tour;

    let sql = "select * from users where id_user = " + id_user;
    connection.query(sql, function (error, users) {
        if (error) {
            response.error("data user not found", res)
        } else {
            let sql2= `SELECT * FROM tour
            LEFT JOIN photo ON tour.id_tour = photo.id_tour
            WHERE tour.id_tour = ${id_tour}`;
            connection.query(sql2, function (error, tour) {
                {
                    if (error) {
                        response.error("data tour not found", res)
                    } else {
                        response.success({
                            user: users,
                            tour: tour
                        }, res);
                    }
                }
            })
        }
    })

};

exports.getDataTransaction = (req,res)=>{
    const query = req.query;
    let sql = ['SELECT  *, transaction.id_user '];
    sql.push(' FROM transaction LEFT JOIN tour on transaction.id_tour = tour.id_tour  LEFT JOIN photo ON tour.id_tour = photo.id_tour ');
    let idUser = query.id_user || '';
    let idTour = query.id_tour || '';
    let idTransaction = query.id_transaction || '';
    let status = query.status || '';
    let sort = query.sort;

        (idUser || idTour||idTransaction || status) && sql.push(" WHERE");

    (idTransaction) && sql.push(" transaction.id_transaction = '"+idTransaction+"'");
        (idTransaction && idUser) && sql.push(" AND");
    (idUser) && sql.push(" transaction.id_user = "+idUser);
        (idUser && status) && sql.push(" AND");
    (status) && sql.push(" transaction.status = '"+status+"'");
         (idTour && status) && sql.push(" AND");
    (idTour) && sql.push(" transaction.id_tour = "+idTour);

    sql.push(` ORDER BY transaction.booking_date ${sort||'ASC'}`);
    let sqlNew = sql.join('');
    console.log(sqlNew);
    connection.query(sqlNew, function (error, field) {
        if (error){
            response.error("Transaction not found", res);
        }else {
            if (field.length>0){
               response.success(field, res)
            }else {
                response.error("Get Transaction not found", res);    
            }
        }
    })
};

exports.callbackPayment = (req, res)=>{
    console.log("Calback Payyment : ", req);

    let trx_id = req.body.trx_id;
    let status_code = req.body.status;
    let via = req.body.via;
    let id_transaction = req.body.sid;
    let va = req.body.va;
    if (status_code == 'berhasil'){
        chackingTransaction(id_transaction, 'paid');
    }

    response.success("ok", res)
};


