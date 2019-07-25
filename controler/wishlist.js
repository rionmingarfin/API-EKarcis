const connection = require('../database/connect')
const isEmpty = require('lodash.isempty')
const Response = require('../response/response')

exports.wishlist = (req, res) => {
    const id_user = req.query.id_user;
    const id_tour = req.query.id_tour;

    if (!id_user) {
        res.status(400).send('Id User is require');
    } else if (!id_tour) {
        res.status(400).send('Id Product is require');
    } else {
        connection.query(
            `SELECT * FROM wishlist WHERE id_user=${id_user} AND id_tour=${id_tour} Limit 1`,
            function (error, rows, field) {
                if (error) {
                    console.log(error)
                } else {
                    if (rows == '') {
                        connection.query(
                            `INSERT INTO wishlist set id_tour=${id_tour}, id_user=${id_user}`,
                            function (error, rows, field) {
                                if (error) {
                                    console.log(error)
                                } else {
                                    connection.query(
                                        `select * from wishlist WHERE id_user=${id_user} ORDER BY id DESC LIMIT 1`,
                                        function (error, rowss, field) {
                                            if (error) {
                                                console.log(error)
                                            } else {
                                                return res.send({
                                                    data: rowss
                                                })

                                            }
                                        }
                                    )
                                }
                            }
                        )
                    } else {
                        connection.query(
                            `Delete from wishlist where id_user=? And id_tour=? Limit 1`,
                            [id_user, id_tour],
                            function (error, rows, field) {
                                if (error) {
                                    res.json({
                                        status: 200,
                                        data: []
                                    })
                                } else {
                                    if (rows.affectedRows != "") {
                                        return res.send({
                                            message: 'Data has been delete',
                                            data: { id_user, id_tour }
                                        })
                                    } else {
                                        return res.status(400).send({
                                            message: "Id not valid.",
                                        })
                                    }
                                }
                            }
                        )
                    }
                }
            }
        )
    }
}

exports.getIdUser = (req, res) => {
    let id = req.params.id;
    if (id === 0 || id === '') {
        Response.error('error', res, 404)
    } else {
        connection.query(
            `SELECT * FROM wishlist WHERE wishlist.id_user=?`,
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