'use strict'
const connection =  require('../database/connect');
const response = require('../response/response');
exports.getReview = (req, res) =>{

    let id_tour = req.params.id_tour;

    let sql1 = `SELECT SUM(review.rating) / COUNT(review.rating) as total FROM users LEFT JOIN review ON users.id_user = review.id_user WHERE review.id_tour = '${id_tour}'`
    let sql2 = `SELECT review.id_user, users.name, users.photo, review.description, review.id_tour `+
        `FROM users `+
        `RIGHT JOIN review ON users.id_user = review.id_user ` +
        `WHERE review.id_tour = '${id_tour}'`;
    connection.query(sql1, function (error, count) {
        if (error){
            response.error("count review failed ", res);
        }else {
            connection.query(sql2,function (error,review) {
                if (error){
                    response.error("get data review failed", res);
                }else {
                    let total = count[0].total;
                    response.success({total, review}, res);
                }
            })
        }
    })
};

exports.postReview = (req, res) =>{
    let id_user = req.body.id_user;
    let description = req.body.description;
    let id_tour = req.body.id_tour;
    let rating = req.body.rating;

    let sql = `INSERT INTO ekarcis.review (id_user, description, id_tour, rating) VALUES ('${id_user}', '${description}','${id_tour}', '${rating}')`;
    connection.query(sql, function (error, field) {
        if (error){
            response.error("add review failed", res);
        }else {
            response.success("add review success", res);
        }
    })
};