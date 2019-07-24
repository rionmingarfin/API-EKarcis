'use strict'
const response = require('../response/response')
const connection = require('../database/connect')
const isEmpty = require('lodash.isempty');
const FormData = require('form-data');
const http = require('http');
const moment = require('moment');
const axios = require('axios');

exports.postTransaction = async (req, res) => {
    let id_user = req.body.id_user;
    let name = req.body.name;
    let id_tour = req.body.id_tour;
    let ticket_amount = req.body.ticket_amount;
    let booking_date = req.body.booking_date;
    let coin = req.body.coin;
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
        price: 200,
        uniqid: numberId,
        notify_url: 'http://websiteanda.com/notify.php'
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
            connection.query("SELECT * FROM ekarcis.transaction WHERE id_transaction = ? ", [numberId], function (error, field) {
                if (error){
                    response.error("save transaction failed", res)
                } else {
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
            let sql2 = "select * from tour where id_tour = " + id_tour;
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

}

