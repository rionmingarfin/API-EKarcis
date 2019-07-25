'use strict';
const connection = require('../database/connect');
const moment = require('moment');

exports.createTicket = (id_user, id_tour, id_transaction, name_booking, booking_date, expaired_date, amount) => {
    let sql = `INSERT INTO ekarcis.data_ticket (id_user, id_tour, id_transaction, name_booking) VALUES ('${id_user}', '${id_tour}', '${id_transaction}', '${name_booking}')`;
    console.log(sql)
    connection.query(sql, function (error, field) {
        if (error) {
            return false;
        } else {
            if (field.length > 0) {
                for (let i = 0; i < amount; i++) {
                    let ticket = `E-KARCIS-TIKET-${id_user}-${id_tour}-${moment(new Date()).format('MM')}-${new Date().getTime()}-${i + 1}`;
                    let sql = `INSERT INTO ekarcis.ticket (id_transaction, ticket, status, booking_date, expaired_date) VALUES ('${id_transaction}', '${ticket}', '0', '${booking_date}', '${expaired_date}' )`;
                    connection.query(sql, function (error, field) {

                    })
                }
            } else {
                return false;
            }
        }
    })
};

