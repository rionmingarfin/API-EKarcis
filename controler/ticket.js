'use strict'

const response = require('../response/response');
const connection = require('../database/connect');

exports.getTicket = (req, res) =>{
    const query = req.query;
    let sql = ['SELECT * FROM ticket'];
    let id = query.id;
    let idUser = query.id_user;
    let idTour = query.id_tour;
    let idTransaction = query.id_transaction;
    let sort = query.sort;
        (id || idUser || idTour||idTransaction ) && sql.push(" WHERE");
    (id) && sql.push(" id = "+id);
        (id && idUser) && sql.push(" AND");
    (idUser) && sql.push(" id_user = "+idUser);
        (idUser && idTour) && sql.push(" AND");
    (idTour) && sql.push(" id_tour = "+idTour);
        (idTour && idTransaction) && sql.push(" AND");
    (idTransaction) && sql.push(" id_transaction = "+idTransaction);

    sql.push(` ORDER BY ticket.booking_date ${sort||'ASC'}`);
    connection.query(sql.join(''),function (error,field) {
        if (error){
            response.error("ticket not found", res);
        }else {
            response.success(field, res);
        }
    });
};