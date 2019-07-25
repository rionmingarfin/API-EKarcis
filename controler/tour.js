'use strict'

const Response = require('../response/response')
const connection = require('../database/connect')
const isEmpty = require('lodash.isempty')
const AWS = require('aws-sdk');
const response = require("../response/response");
const redis = require('redis');
const client = redis.createClient();

client.on('connect', function () {
    console.log('Redis client connected');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});
exports.welcome = (req, res) => {
    Response.ok('welcome', res)
}

exports.getTour = (req, res) => {
    var sql = `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.districts AS districts,tour.description AS description,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name_category,photo.link AS photo
    FROM tour 
    LEFT JOIN category ON tour.id_category=category.id 
    LEFT JOIN province ON tour.id_province = province.id
    LEFT JOIN photo ON tour.id_tour = photo.id_tour`;
    var qountsql = `SELECT COUNT(*) AS totalCount 
    FROM tour 
    LEFT JOIN category ON tour.id_category=category.id 
    LEFT JOIN province ON tour.id_province = province.id
    LEFT JOIN photo ON tour.id_tour = photo.id_tour`
     
    let search = req.query.search
    if (!isEmpty(search)) {
        let search = req.query.search;
        sql += ` WHERE tour LIKE '%${search}%'`;
        qountsql += ` WHERE tour LIKE '%${search}%'`;
    }
    let sort =req.query.sort
    if (!isEmpty(sort)) {
        let sort = req.query.sort;
        sql += ` ORDER BY tour ${sort}`;
    }

    var start, limit;
    (isEmpty(req.query.page) || req.query.page == '') ? start = 1 : start = parseInt(req.query.page);
    (isEmpty(req.query.limit) || req.query.limit == '') ? limit = 10 : limit = parseInt(req.query.limit);

    var startpage = (start - 1) * limit
    sql += ` LIMIT ${limit} OFFSET ${startpage}`;

    var totalCount;
    var totalPage;

    let regisKey = `paket:rows:${sort}:${search}:${start}:${limit}:${startpage}`
    return client.get(regisKey, (err, rows) => {
        if (rows) {
            res.send({
                data: JSON.parse(rows)
            })
            console.log('data', rows)
            // client.del(regisKey)
        } else {
            connection.query(qountsql, function (error, rows, field) {
                if (error) {
                    res.json({
                        status: 200,
                        data: []
                    })
                } else {
                    totalCount = rows[0].totalCount;
                    totalPage = Math.ceil(totalCount / limit);
                    connection.query(sql, function (error, rows, field) {
                        if (error) {
                            res.json({
                                status: 200,
                                data: []
                            })
                        } else {
                            if (rows.length === 0 || rows.length === '') {
                                res.json({
                                    status: 200,
                                    data: []
                                })
                            } else {
                                let data = client.setex(regisKey, 3600, JSON.stringify(rows))
                                console.log('setex', data)
                                res.json({
                                    totalData: totalCount,
                                    totalPage: totalPage,
                                    limit: limit,
                                    page: start,
                                    status: 200,
                                    data: rows
                                })
                            }
                        }
                    })
                }
            }
            )
        }
    })
    
}

exports.getTourId = (req, res) => {
    let id = req.params.id;
    if (id === 0 || id === '') {
        Response.error('error', res, 404)
    } else {
        connection.query(
            `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.districts AS districts,tour.description AS description,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name_category,photo.link AS photo
            FROM tour 
            LEFT JOIN category ON tour.id_category=category.id 
            LEFT JOIN province ON tour.id_province = province.id
            LEFT JOIN photo ON tour.id_tour = photo.id_tour
            WHERE tour.id_tour=?`,
            [id],
            function (error, rows, field) {
                if (error) {
                    res.status(400).json('eror')
                } else {
                    if (rows.length === 0 || rows.length === '') {
                        Response.error('data not found', res, 404);
                    } else {
                        res.status(200).json(rows);
                    }
                }
            }
        )
    }
}

exports.insert = (req, res) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyId,
        secretAccessKey: process.env.AWSSecretKey
    })
    let file = req.files[0];
    const params = {
        Bucket: 'e-tiketing',
        Key: `${new Date().getTime()}-${file.originalname}`,
        Body: req.files[0].buffer,
        ACL: 'public-read',
        ContentType: file.mimetype
    };
    let id_admin = req.body.id_admin
    let tour = req.body.tour;
    let addres = req.body.addres;
    let districts = req.body.districts;
    let description = req.body.description;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let cost = req.body.cost;
    let id_province = req.body.id_province;
    let id_category = req.body.id_category;

    connection.query(
        'INSERT INTO tour SET id_admin=?,tour=?,addres=?,districts=?,description=?,latitude=?,longitude=?,cost=?,id_province=?,id_category=?',
        [id_admin, tour, addres, districts,description, latitude, longitude, cost, id_province, id_category],
        function (error, rows, field) {
            if (error) {
                res.status(400).json('eror')
            } else {
                s3.upload(params, function (err, data) {
                    if (err) {
                        response.error("Upload photo failed", res);
                    }
                    let idInsert = rows.insertId
                    let sql = `INSERT INTO ekarcis.photo (id_tour,id_user, link) VALUES ('${idInsert}','','${data.Location}')`;
                    console.log(sql)
                    connection.query(
                        sql,
                        function (error, rows, field) {
                            console.log(rows)
                            if (error) {
                                response.error("gagal kampret", res);
                            } else {
                                connection.query(
                                    'SELECT province.province FROM province WHERE province.id=?',
                                    [id_province],
                                    function (error, rowsProvince, field) {
                                        if (error) {
                                            res.status(400).json('eror')
                                        } else {
                                            connection.query(
                                                'SELECT category.name FROM category WHERE category.id=?',
                                                [id_category],
                                                function (error, rowsCategory, field) {
                                                    if (error) {
                                                        res.status(404).json('error')
                                                    } else {
                                                        client.del('paket:rows')
                                                        let category = rowsCategory
                                                        let province = rowsProvince
                                                        let data = {
                                                            status: 201,
                                                            message: "data sucesfully",
                                                            result: {
                                                                id: idInsert,
                                                                id_admin: id_admin,
                                                                tour: tour,
                                                                addres: addres,
                                                                districts :districts,
                                                                description: description,
                                                                latitude: latitude,
                                                                longitude: longitude,
                                                                cost: cost,
                                                                id_province: id_province,
                                                                id_category: id_category,
                                                                category_name: category[0].name,
                                                                province: province[0].province
                                                            }
                                                        }
                                                        return res.status(202).json(data).end();
                                                    }
                                                }
                                            )
                                        }
                                    }
                                )
                            }
                        });
                })
            }
        }
    )
}

exports.update = (req, res) => {
    let id = req.params.id;
    let tour = req.body.tour;
    let id_admin = req.body.id_admin
    let addres = req.body.addres;
    let districts = req.body.districts;
    let description = req.body.description;
    let latitude = req.body.latitude;
    let longitude = req.body.longitude;
    let cost = req.body.cost;
    let id_province = req.body.id_province;
    let id_category = req.body.id_category;

    connection.query(
        `UPDATE tour SET id_admin=?,tour=?,addres=?,districts=?,description=?,latitude=?,longitude=?,cost=?,id_province=?,id_category=? WHERE id_tour=?`,
        [id_admin, tour, addres,districts, description, latitude, longitude, cost, id_province, id_category, id],
        function (error, rows, field) {
            if (error) {
                res.status(400).json('eror pokonya')
            } else {
                connection.query(
                    'SELECT province.province FROM province WHERE province.id=?',
                    [id_province],
                    function (error, rowsProvince, field) {
                        if (error) {
                            res.status(400).json('eror')
                        } else {
                            connection.query(
                                'SELECT category.name FROM category WHERE category.id=?',
                                [id_category],
                                function (error, rowsCategory, field) {
                                    if (error) {
                                        res.status(404).json('error')
                                    } else {
                                        client.del('paket:rows')
                                        let category = rowsCategory
                                        let province = rowsProvince
                                        let data = {
                                            status: 201,
                                            message: "data sucesfully update",
                                            result: {
                                                id: parseInt(id),
                                                id_admin: id_admin,
                                                tour: tour,
                                                addres: addres,
                                                districts :districts,
                                                description: description,
                                                latitude: latitude,
                                                longitude: longitude,
                                                cost: cost,
                                                id_province: id_province,
                                                id_category: id_category,
                                                category_name: category[0].name,
                                                province: province[0].province
                                            }
                                        }
                                        return res.status(202).json(data).end();
                                    }
                                }
                            )
                        }
                    }
                )
            }
        }
    )
}

exports.delete = (req, res) => {
    let id = req.params.id
    if (id === 0 || id === '') {
        Response.error(404, 'error', res)
    } else {
        connection.query(
            'DELETE FROM tour WHERE id_tour=?',
            [id],
            function (error, rows, field) {
                if (error) {
                    res.status(404).json('eror pokoknya')
                } else {
                    if (rows.affectedRows === 0 || rows.affectedRows === '') {
                        Response.error('error', res, 404)
                    } else {
                        let idResult = id
                        let data = {
                            status: 202,
                            message: 'data succesfully delete',
                            result: {
                                id: parseInt(idResult)
                            }
                        }
                        return res.status(202).json(data).end()
                    }
                }
            }
        )
    }
}

exports.getTourIdProvince = (req, res) => {
    let id = req.params.id;
    if (id === 0 || id === '') {
        Response.error('error', res, 404)
    } else {
        connection.query(
            `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.districts AS districts,tour.description AS description,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name_category,photo.link AS photo
            FROM tour 
            LEFT JOIN category ON tour.id_category=category.id 
            LEFT JOIN province ON tour.id_province = province.id
            LEFT JOIN photo ON tour.id_tour = photo.id_tour 
            WHERE tour.id_province=?`,
            [id],
            function (error, rows, field) {
                if (error) {
                    res.status(400).json('eror')
                } else {
                    if (rows.length === 0 || rows.length === '') {
                        Response.error('data not found', res, 404);
                    } else {
                        res.status(200).json(rows);
                    }
                }
            }
        )
    }
}
exports.getTourIdCategory = (req, res) => {
    let id = req.params.id;
    if (id === 0 || id === '') {
        Response.error('error', res, 404)
    } else {
        connection.query(
            `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.districts AS districts,tour.description AS description,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name_category,photo.link AS photo
            FROM tour 
            LEFT JOIN category ON tour.id_category=category.id 
            LEFT JOIN province ON tour.id_province = province.id
            LEFT JOIN photo ON tour.id_tour = photo.id_tour 
            WHERE tour.id_category=?`,
            [id],
            function (error, rows, field) {
                if (error) {
                    res.json({
                        status: 200,
                        data: []
                    })
                } else {
                    if (rows.length === 0 || rows.length === '') {
                        res.json({
                            status: 200,
                            data: []
                        })
                    } else {
                        res.status(200).json(rows);
                    }
                }
            }
        )
    }
}
exports.getTourIdadmin = (req, res) => {
    let id = req.params.id;
    if (id === 0 || id === '') {
        Response.error('error', res, 404)
    } else {
        connection.query(
            `SELECT tour.id_tour AS id_tour,tour.tour AS tour,tour.addres AS addres,tour.districts AS districts,tour.description AS description,tour.latitude AS latitude,tour.longitude AS longitude,tour.cost AS cost, province.province AS province, tour.id_province AS id_province,category.id AS id_category,category.name AS name_category,photo.link AS photo
            FROM tour 
            LEFT JOIN category ON tour.id_category=category.id 
            LEFT JOIN province ON tour.id_province = province.id
            LEFT JOIN photo ON tour.id_tour = photo.id_tour 
            WHERE tour.id_admin=?`,
            [id],
            function (error, rows, field) {
                if (error) {
                    res.status(400).json('eror')
                } else {
                    if (rows.length === 0 || rows.length === '') {
                        res.json({
                            status: 200,
                            data: []
                        })
                    } else {
                        res.status(200).json(rows);
                    }
                }
            }
        )
    }
}

exports.deletFoto = (req, res) => {
    let sql = `DELETE FROM photo WHERE id=${req.params.id}`;

    connection.query(sql, function (error, rows, field) {
        if (rows.affectedRows >= 1) {
            response.success("Delete photo success", res);
        } else {
            response.error("Delete photo failed", res, 404);
        }
    })
}
