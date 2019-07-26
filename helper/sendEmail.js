'use-strict'

const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const env = require('../config')

exports.sendEmail = async (email,subject, message) => {

    const oauth2Client = new OAuth2(
        process.env.OAUTH_CLIENT_ID,
        process.env.OAUTH_CLIENT_SECRET,
        "https://developers.google.com/oauthplayground/"
    )

    oauth2Client.setCredentials({
        refresh_token: process.env.OAUTH_REFRESH_TOKEN
    });
    const tokens = await oauth2Client.refreshAccessToken()
    const acessToken = tokens.credentials.access_token

    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            type: "OAuth2",
            user: process.env.SENDER_EMAIL,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN,
            accessToken: acessToken
        }
    });

    const mailOptions = {
        from: env.SENDER_EMAIL,
        to: email,
        subject: subject,
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