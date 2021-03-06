'use strict'

const response = require('../response/response')
const connection = require('../database/connect')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const env = require('../config')
const digit = Math.floor(100000 + Math.random() * 900000);
const AWS = require('aws-sdk');
const { sendEmail } = require('../helper/sendEmail')
const moment = require('moment');

// Get Users
exports.getUserData = function (req, res) {
	let id_user = req.params.id
	let validate = req.validate

	// if (validate === 0) {
	// 	res.status(200).json({ status: false})
	// } else {
		connection.query(
			`SELECT email, name, phone, address, birthday, gender, work, photo, points FROM users WHERE id_user=?`,
			[id_user], function (err, rows) {
				if (err) {
					res.status(200).json({ status: false })
				} else {
					res.json({
						status: true,
						result: rows
					})
				}
			}
		)
	}
// }

// Login Function
exports.login = function (req, res) {
    let email = req.body.email;
    let password = req.body.password;
    let deviceId = req.body.device_id;

    if (email == '' && password == '') {
        res.status(200).json({status: false})
    } else {
        connection.query(
        	`SELECT COUNT(email) AS total FROM users WHERE email=?`,
            [email],
            function (err, rows) {
                if (err) {
                    res.status(200).json({status: false})
                } else {
                    let total = Math.ceil(rows[0].total);
                    if (total === 0) {
                        res.status(200).json({status: false})
                    } else {
                        connection.query(
                            `SELECT id_user, role, password FROM users WHERE email=?`,
                            [email],
                            function (err, rows) {
                                if (err) {
                                    res.status(200).json({status: false})
                                } else if (md5(password) !== rows[0].password) {
                                    res.status(200).json({status: false})
                                } else {
                                    let id_user = rows[0].id_user
                                    let role = rows[0].role
                                    jwt.sign({id_user}, 'secretKey', (err, token) => {
                                        if (err) {
                                            res.status(200)
                                            res.json({status: false})
                                        } else {
                                            let sql = `UPDATE users SET json_access='${token}', device_id='${deviceId}' WHERE id_user='${id_user}'`;
                                            console.log(sql);
                                            connection.query(sql,function (err) {
                                                    if (err) {
                                                        res.status(200).json({status: false})
                                                    }
                                                }
                                            );

                                            res.json({
                                                status: true,
                                                message: 'Login Success',
                                                result: [{
                                                    id_user: id_user,
                                                    role: role,
                                                    token: token

                                                }]
                                            })
                                        }
                                    })
                                }
                            }
                        )
                    }
                }
            }
        )
    }
}

// Register Function
exports.register = (req, res) => {
    let name = req.body.name
    let email = req.body.email
    let password = req.body.password
    let phone = req.body.phone
    let gender = req.body.gender

    if (name == '' && email == '' && password == '' && gender == '' && phone == '' ) {
        res.status(200);
        res.json({status: false})
    } else {
        connection.query(
            `SELECT COUNT(email) AS total FROM users WHERE email=?`,
            [email],
            function (err, rows, field) {
                if (err) {
                    res.status(200);
                    res.json({status: false})
                } else {
                    let total = Math.ceil(rows[0].total);
                    if (total > 0) {
                        res.status(200);
                        res.json({status: false})
                    } else {
                        let hash = md5(password)
                        let sql2= `INSERT INTO ekarcis.users (email, password, role, name, phone, gender) `+
                            `VALUES ('${email}', '${hash}', '0', '${name}', '${phone}','${gender}')`;

                        connection.query(sql2, function (err, rows, field) {
                                if (err) {
                                    res.status(200);
                                    res.json({status: false})
                                } else {
                                    res.json({
                                        status: true,
                                        message: 'Regsiter Successfuly'
                                    })
                                }
                            }
                        )
                    }
                }
            }
        )
    }
}

// Forgot Password Function
exports.forgot = (req, res) => {
    const fs = require('fs');
	//let message = 'JANGAN MEMBERITAHUKAN KODE RAHASIA INI KE SIAPAPUN .<br>WASPADA TERHADAP KASUS PENIPUAN! KODE RAHASIA untuk melanjutkan Ganti Password: <b><i>' + digit + '</i></b>'
    let receiver = req.body.receiver;
    if (receiver === '') {
        res.status(200)
        res.json({status: false})
    } else {
        let check = /@/.test(receiver)

        if (check === true) {
            connection.query(
                `SELECT COUNT(email) AS total FROM users WHERE email=?`,
                [receiver],
                function (err, rows) {
                    if (err) {
                        res.status(200)
                        res.json({status: false})
                    } else {
                        let total = Math.ceil(rows[0].total);
                        if (total === 0) {
                            res.status(200)
                            res.json({status: false})
                        } else {
                            fs.readFile(__dirname + '../../helper/forget_password.html', 'utf-8', (err, data) => {
                                if (err) console.log(err);

                                data = data.replace('[TOKEN]',digit);
                                sendEmail(receiver, '6 Digit kode rahasia untuk Ganti Password', data)
                                    .then(data => {
                                        console.log('email success');
                                    }).catch(e => {
                                        console.log('email error');
                                })
                            });

                            connection.query(
                                `UPDATE users SET token=? WHERE email=?`,
                                [digit, receiver],
                                function (err) {
                                    if (err) {
                                        res.status(200)
                                        res.json({status: false})
                                    } else {
                                        connection.query(
                                            `SELECT id_user FROM users WHERE email=?`,
                                            [receiver],
                                            function (err, result) {
                                                if (err) {
                                                    res.status(200)
                                                    res.json({status: false})
                                                } else {
                                                    res.json({
                                                        status: true,
                                                        message: 'Send 6 Digit Successfuly',
                                                        result: result
                                                    });
                                                }
                                            }
                                        )
                                    }
                                }
                            )
                        }
                    }
                }
            )
        } else {
            res.json({status: true, message: 'Phone Number'})
        }
    }
}

// Check Token Function
exports.tokenCheck = (req, res) => {
    let id_user = req.params.id
    let token = req.body.token

    if (token === '' || token === undefined) {
        res.status(200)
        res.json({status: false})
    } else {
        connection.query(
            `SELECT COUNT(token) AS total FROM users WHERE id_user=? AND token=?`,
            [id_user, token],
            function (err, rows) {
                if (err) {
                    res.status(200)
                    res.json({status: false})
                } else {
                    let total = Math.ceil(rows[0].total);
                    if (total === 0) {
                        res.status(200)
                        res.json({status: false})
                    } else {
                        connection.query(
                            `UPDATE users SET token=0 WHERE id_user=?`,
                            [id_user],
                            function (err) {
                                if (err) {
                                    res.status(200)
                                    res.json({status: false})
                                } else {
                                    res.json({
                                        status: true,
                                        message: 'Authentication Code Valid',
                                        result: [{
                                            id_user: id_user
                                        }]
                                    })
                                }
                            }
                        )
                    }
                }
            }
        )
    }
}

// Change Password
exports.password = (req, res) => {
    let id_user = req.params.id
    let password = req.body.password

    if (password === '') {
        res.status(200)
        res.json({status: false})
    } else {
        let hash = md5(password)
        connection.query(
            `UPDATE users SET password=? WHERE id_user=?`,
            [hash, id_user],
            function (err, rows, field) {
                if (err) {
                    res.status(200);
                    res.json({status: false})
                } else {
                    res.json({
                        status: true,
                        message: 'Password Updated'
                    })
                }
            }
        )
    }
}

// Update Profile
exports.update = (req, res) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.AWSAccessKeyId,
        secretAccessKey: process.env.AWSSecretKey
    })

    let file = req.files[0];
    let id = req.params.id
    let name = req.body.name
    let phone = req.body.phone
    let address = req.body.address
    let gender = req.body.gender
    let birthday = moment(req.body.birthday).utc().format("YYYY-MM-DD HH:mm:ss");
    let work = req.body.work

    if (file){
        console.log(file.originalname);
        const params = {
            Bucket: 'e-tiketing',
            Key: `${new Date().getTime()}-${file.originalname}`,
            Body: file.buffer,
            ACL: 'public-read',
            ContentType:  file.mimetype
        };
        s3.upload(params, function (err, data) {
            if (err) {
                Response.error('upload photo failed')
            } else {

                if (name == '' && phone == '' && address == '' && birthday == '' && gender == '' && work == '') {
                    Response.error('Data body cannot be Empty', res)
                } else {
                    let sqlUpdate = `UPDATE users SET name='${name}',phone='${phone}',address='${address}',birthday='${birthday}',gender='${gender}',work='${work}',photo='${data.Location}' WHERE id_user='${id}'`;
                    connection.query(sqlUpdate,
                        function (error, rows, field) {
                            if (error) {
                                response.error('not found', res, 202)
                            } else {
                                let data = {
                                    status: 202,
                                    message: 'data sucefully update',
                                    result: {
                                        id: parseInt(id),
                                        name: name,
                                        phone: phone,
                                        address: address,
                                        gender: gender,
                                        birthday: birthday,
                                        work: work
                                    }
                                }
                                return res.status(202).json(data).end();
                            }
                        }
                    )
                }
            }
        })
    }else {
        if (name == '' && phone == '' && address == '' && birthday == '' && gender == '' && work == '') {
            Response.error('Data body cannot be Empty', res)
        } else {
            let sqlUpdate = `UPDATE users SET name='${name}',phone='${phone}',address='${address}',birthday='${birthday}',gender='${gender}',work='${work}' WHERE id_user='${id}'`;
            connection.query(sqlUpdate,
                function (error, rows, field) {
                    if (error) {
                        response.error('not found', res, 202)
                    } else {
                        let data = {
                            status: 202,
                            message: 'data sucefully update',
                            result: {
                                id: parseInt(id),
                                name: name,
                                phone: phone,
                                address: address,
                                gender: gender,
                                birthday: birthday,
                                work: work
                            }
                        }
                        return res.status(202).json(data).end();
                    }
                }
            )
        }
    }
} 
