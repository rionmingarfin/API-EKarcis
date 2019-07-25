'use-strict'

const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const env = require('../config')

exports.sendEmail = async (email, message) => {
    console.log(email);
    const oauth2Client = new OAuth2(
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
        html: message
    }

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            res.status(200);
            res.json({status: false})
        }
    });
};