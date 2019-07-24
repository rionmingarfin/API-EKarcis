'use strict'

const response = require('../response/response')
const connection = require('../database/connect')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const md5 = require('md5')
const env = require('../config')

const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2

const digit = Math.floor(100000 + Math.random() * 900000);

// Login Function
exports.login = function (req, res) {
	let email = req.body.email
	let password = req.body.password

	if (email == '' && password == '') {
		res.status(200)
		res.json({ status: false })
	} else {
		connection.query(
			`SELECT COUNT(email) AS total FROM users WHERE email=?`,
			[email],
			function (err, rows) {
				if (err) {
					res.status(200)
					res.json({ status: false })
				} else {
					let total = Math.ceil(rows[0].total);
					if (total === 0) {
						res.status(200)
						res.json({ status: false })
					} else {
						connection.query(
							`SELECT id_user, role, password FROM users WHERE email=?`,
							[email],
							function (err, rows) {
								if (err) {
									res.status(200)
									res.json({ status: false })
								} else if (md5(password) !== rows[0].password) {
									res.status(200)
									res.json({ status: false })
								} else {
									let id_user = rows[0].id_user
									let role = rows[0].role
									jwt.sign({id_user}, 'secretKey', (err, token) => {
										if (err) {
											res.status(200)
											res.json({ status: false })
										} else {
											connection.query(
												`UPDATE users SET json_access=? WHERE id_user=?`,
												[token, id_user], function (err) { if (err) { res.status(200); res.json({ status: false }) } }
											)

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
	let gender = req.body.gender

	if ( name == '' && email == '' && password == '' && gender == '') {
		res.status(200);
		res.json({ status: false })
	} else {
		connection.query(
			`SELECT COUNT(email) AS total FROM users WHERE email=?`,
			[email],
			function (err, rows, field) {
				if (err) {
					res.status(200);
					res.json({ status: false })
				} else {
					let total = Math.ceil(rows[0].total);
					if (total > 0) {
						res.status(200);
						res.json({ status: false })
					} else {
						let hash = md5(password)
						connection.query(
							'INSERT INTO users SET email=?, password=?, name=?, role="1", phone="0", address="", birthday="1970-01-01", gender=?, work="", photo="", points="0", token="0", json_access=""',
							[email, hash, name, gender],
							function (err, rows, field) {
								if (err) {
									res.status(200);
									res.json({ status: false })
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

// Send 6 Digit via Email
async function sendEmail(email) {
	const oauth2Client = new OAuth2 (
		env.OAUTH_CLIENT_ID,
		env.OAUTH_CLIENT_SECRET,
		"https://developers.google.com/oauthplayground"
	)

	oauth2Client.setCredentials({
		refresh_token: env.OAUTH_REFRESH_TOKEN
	});
	const tokens = await oauth2Client.refreshAccessToken()
	const acessToken = tokens.credentials.access_token

	const transporter = nodemailer.createTransport({
		service: 'Gmail',
		auth: {
			type: "OAuth2",
			user: env.SENDER_EMAIL,
			clientId: env.OAUTH_CLIENT_ID,
			clientSecret: env.OAUTH_CLIENT_SECRET,
			refreshToken: env.OAUTH_REFRESH_TOKEN,
			accessToken: acessToken
		}
	});

	const mailOptions = {
		from: env.SENDER_EMAIL,
		to: email,
		subject: '6 Digit kode rahasia untuk Ganti Password',
		generateTextFromHTML: true,
		html: 'JANGAN MEMBERITAHUKAN KODE RAHASIA INI KE SIAPAPUN .<br>WASPADA TERHADAP KASUS PENIPUAN! KODE RAHASIA untuk melanjutkan Ganti Password: <b><i>' + digit + '</i></b>'
	}

	transporter.sendMail(mailOptions, function(err, info){ if (err) { res.status(200); res.json({ status: false }) } });
}

// Forgot Password Function
exports.forgot = (req, res) => {
	let receiver = req.body.receiver

	if (receiver === '') {
		res.status(200)
		res.json({ status: false })
	} else {
		let check = /@/.test(receiver)

		if (check === true) {
			connection.query(
				`SELECT COUNT(email) AS total FROM users WHERE email=?`,
				[receiver],
				function (err, rows) {
					if (err) {
						res.status(200)
						res.json({ status: false })
					} else {
						let total = Math.ceil(rows[0].total);
						if (total === 0) {
							res.status(200)
							res.json({ status: false })
						} else {
							sendEmail(receiver);
							connection.query(
								`UPDATE users SET token=? WHERE email=?`,
								[digit, receiver],
								function (err) {
									if (err) {
										res.status(200)
										res.json({ status: false })
									} else {
										connection.query(
											`SELECT id_user FROM users WHERE email=?`,
											[receiver],
											function (err, result) {
												if (err) {
													res.status(200)
													res.json({ status: false })
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
			res.json({ status: true, message: 'Phone Number' })
		}
	}
}

// Check Token Function
exports.tokenCheck = (req, res) => {
	let id_user = req.params.id
	let token = req.body.token

	if (token === '' || token === undefined) {
		res.status(200)
		res.json({ status: false })
	} else {
		connection.query(
			`SELECT COUNT(token) AS total FROM users WHERE id_user=? AND token=?`,
			[id_user, token],
			function (err, rows) {
				if (err) {
					res.status(200)
					res.json({ status: false })
				} else {
					let total = Math.ceil(rows[0].total);
					if (total === 0) {
						res.status(200)
						res.json({ status: false })
					} else {
						connection.query(
							`UPDATE users SET token=0 WHERE id_user=?`,
							[id_user],
							function (err) { 
								if (err) { 
									res.status(200)
									res.json({ status: false })
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
		res.json({ status: false })
	} else {
		let hash = md5(password)
		connection.query(
			`UPDATE users SET password=? WHERE id_user=?`,
			[hash, id_user],
			function (err, rows, field) {
				if (err) {
					res.status(200);
					res.json({ status: false })
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