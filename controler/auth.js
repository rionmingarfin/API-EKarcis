'use strict'

const response = require('../response/response')
const connection = require('../database/connect')
const jwt = require('jsonwebtoken');
const md5 = require('md5')
const AWS = require('aws-sdk');

// Login Function
exports.login = function (req, res) {
	let email = req.body.email
	let password = req.body.password

	if (email === '' && password === '') {
		response.error('Data body cannot be Empty', res)
	} else {
		connection.query(
			`SELECT COUNT(email) AS total FROM users WHERE email=?`,
			[email],
			function (err, rows) {
				if (err) {
					response.error('Error Occured', res)
				} else {
					let total = Math.ceil(rows[0].total);
					if (total === 0) {
						response.error('Email not Found', res)
					} else {
						connection.query(
							`SELECT id_user, password FROM users WHERE email=?`,
							[email],
							function (err, rows) {
								if (err) {
									response.error('Error Occured', res)
								} else if (md5(password) !== rows[0].password) {
									response.error('Password incorrect', res)
								} else {
									let id_user = rows[0].id_user
									jwt.sign({ id_user }, 'secretKey', (err, token) => {
										if (err) {
											response.error('Error Occured', res)
										} else {
											connection.query(
												`UPDATE users SET json_access=? WHERE id_user=?`,
												[token, id_user], function (err) { if (err) { response.error('Error Occured', res) } }
											)

											res.json({
												error: false,
												message: 'Login Success',
												result: [{
													id_user: rows[0].id_user,
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
	let gender = req.body.gender

	if (name == '' && email == '' && password == '' && gender == '') {
		response.error('Data body cannot be Empty', res)
	} else {
		connection.query(
			`SELECT COUNT(email) AS total FROM users WHERE email=?`,
			[email],
			function (err, rows, field) {
				if (err) {
					response.error('Error Occured', res)
				} else {
					let total = Math.ceil(rows[0].total);
					if (total > 0) {
						response.error('Email has been Used', res)
					} else {
						let hash = md5(password)
						connection.query(
							'INSERT INTO users SET email=?, password=?, name=?, phone="0", address="", birthday="1970-01-01", gender=?, work="", photo="", points="0", token="0", json_access=""',
							[email, hash, name, gender],
							function (err, rows, field) {
								if (err) {
									response.error('Error Occured', res)
								} else {
									res.json({
										status: 202,
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
exports.update = (req, res) => {
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
	let id = req.params.id
	let name = req.body.name
	let phone = req.body.phone
	let address = req.body.address
	let gender = req.body.gender
	let birthday = req.body.birthday
	let work = req.body.work
	s3.upload(params, function (err, data) {
		if (err) {
			Response.error('upload photo failed')
		} else {
            
			if (name == '' && phone == '' && address == '' && birthday == '' && gender == '' && work == '') {
				Response.error('Data body cannot be Empty', res)
			} else {
				connection.query(
					`UPDATE users SET name=?,phone=?,address=?,birthday=?,gender=?,work=?,photo='${data.Location}' WHERE id_user=?`,
					[name, phone, address, birthday, gender, work,id],
					function (error,rows,field){
						if (error) {
							response.error('not found',res,202)
						}else{
							let data = {
								status : 202,
								message : 'data sucefully update',
								result : {
									id : parseInt(id),
									name : name,
									phone : phone,
									address : address,
									gender: gender,
									birthday :birthday,
									work : work
								}
							}
							return res.status(202).json(data).end();
						}
					}
				)
			}
		}
	})
} 