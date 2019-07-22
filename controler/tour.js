'use strict'
const Response = require('../response/response')
const connection = require('../database/connect')
const isEmpty = require('lodash.isempty')
exports.welcome = (req, res) => {
    Response.ok('welcome', res)
}

exports.getTour = (req, res) => {
    connection.query(
        `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name_category FROM tour JOIN category ON tour.id_category=category.id JOIN province ON tour.id_province = province.id`,
        function (error, rows, field) {
            if (error) {
                throw error
            } else {
                res.json(rows)
            }
        }
    )
}
exports.getTourId = (req, res) => {
    let id = req.params.id;
    if (id === 0 || id === '') {
        Response.error(404, 'error', res)
    } else {
        connection.query(
            `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name FROM tour JOIN category ON tour.id_category=category.id JOIN province ON tour.id_province = province.id WHERE tour.id_tour=?`,
            [id],
            function (error, rows, field) {
                if (error) {
                    res.status(400).json('eror')
                } else {
                    if (rows.length === 0 || rows.length === '') {
                            Response.error(404, 'data not found', res);
                        } else {
                            res.status(200).json(rows);
                    }
                }
            }
        )
    }
}