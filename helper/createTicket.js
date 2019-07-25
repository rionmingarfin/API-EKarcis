'use strict';
const connection = require('../database/connect');
const moment = require('moment');

exports.createTicket = (id_user, id_tour, id_transaction, name_booking, booking_date, expaired_date, amount) => {
    let sql = `INSERT INTO ekarcis.data_ticket (id_user, id_tour, id_transaction, name_booking) VALUES ('${id_user}', '${id_tour}', '${id_transaction}', '${name_booking}')`;
    connection.query(sql, function (error, field) {
        if (error) {
            return false;
        } else {
            console.log("1")
            if (field.affectedRows > 0) {
                console.log("2")
                console.log("jumlah tiket : ",amount);
                for (let i = 0; i < amount; i++) {
                    let ticket = `E-KARCIS-TIKET-${id_user}-${id_tour}-${moment(new Date()).format('MM')}-${new Date().getTime()}-${i + 1}`;
                    let sqlTicket = `INSERT INTO ekarcis.ticket (id_transaction, ticket, status, booking_date, expaired_date) VALUES ('${id_transaction}', '${ticket}', '0', '${booking_date}', '${expaired_date}' )`;
                    console.log("sqlTicket : ",sqlTicket);
                    connection.query(sqlTicket, function (error, field) {

                    })
                }
            } else {
                console.log("3")
                return false;
            }
        }
    })
};

