'use strict'

const response = require('../response/response');
const connection = require('../database/connect');
const moment = require('moment');
exports.getTicket = (req, res) => {
    const query = req.query;
    let idTransaction = query.id_transaction;
    if (idTransaction) {
        let sql = `SELECT * FROM data_ticket WHERE id_transaction = '${idTransaction}' LIMIT 1`;
        console.log(sql)
        connection.query(sql, function (error, data_ticket) {
            if (error) {
                response.error("data ticket not found", res);
            } else {
                let sql2 = `SELECT ticket.booking_date, ticket.expaired_date, ticket.ticket, ticket.status FROM ticket WHERE ticket.id_transaction = '${idTransaction}'`;
                connection.query(sql2, function (error, ticket) {
                    response.success({data_ticket, ticket}, res);
                })
            }
        });
    } else {
        response.error("ID transaction required", res);
    }
};

exports.createTicket = async (req, res) => {
    let id_user = req.body.id_user;
    let id_tour = req.body.id_tour;
    let id_transaction = req.body.id_transaction;
    let name_booking = req.body.name_booking;
    let name_tour = req.body.name_tour;
    let booking_date = req.body.booking_date;
    let expaired_date = req.body.expaired_date;
    let amount = req.body.amount;

    let sql = `INSERT INTO ekarcis.data_ticket (id_user, id_tour, id_transaction, name_booking,name_tour) VALUES ('${id_user}', '${id_tour}', '${id_transaction}', '${name_booking}', '${name_tour}')`;
    connection.query(sql, function (error, field) {
        for (let i = 0; i < amount; i++) {
            let ticket = `E-KARCIS-TIKET-${id_user}-${id_tour}-${moment(new Date()).format('MM')}-${new Date().getTime()}-${i + 1}`;
            let sql = `INSERT INTO ekarcis.ticket (id_transaction, ticket, status, booking_date, expaired_date) VALUES ('${id_transaction}', '${ticket}', '0', '${booking_date}', '${expaired_date}' )`;
            connection.query(sql, function (error, field) {

            })
        }
    })


    response.success(amount, res);

};

exports.checkIn = (req, res) => {
    let ticket = req.query.ticket;
    if (ticket) {
        let sql1 = `SELECT * FROM ticket WHERE ticket='${ticket}' AND status='0'`;
        connection.query(sql1, function (error, field) {
            if (error) {
                response.error("Search ticket error", res)
            } else {
                if (field.length>0){
                    let sql = `UPDATE ticket SET status='1' WHERE (ticket='${ticket}')`;
                    connection.query(sql, function (error, field) {
                        if (error){
                            response.error("checkin failed", res)
                        }else{
                            if (field.affectedRows>0){

                                response.success("checkin success", res)
                            }else {
                                response.error("ticket not found", res)
                            }
                        }
                    });
                }else{
                    response.error("Ticket not found or has been used", res)
                }

            }
        })
    } else {
        response.error("Ticket required", res)
    }
}
