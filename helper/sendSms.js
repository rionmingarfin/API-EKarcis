'use strict';

exports.sendSms = (numberPhone, message) => {
    console.log(numberPhone);
    const accountSid = process.env.TWILOaccountSid;
    const authToken = process.env.TWILOauthToken;
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: message,
            messagingServiceSid: process.env.TWILOmessagingServiceSid,
            to: numberPhone
        })
        .then(message =>
        {
            console.log(message)
            return true;
        })
        .catch(e => {
            console.log(e)
            return false;
        })
        .done();

};
