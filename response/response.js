'use strict'

exports.success = (value,res) => {
      const data = {
          status :"success",
          data : value
      };
      res.status(200);
      res.json(data);
      res.end();
};

exports.error = (data, res, code=400) => {
    const value= {
        status : "failed",
        data : data
    };

    res.status(code);
    res.json(value);
    res.end();
};

exports.notif = (device_id,id_user, message) => {
    const fetch = require('node-fetch');
    const connection = require('../database/connect');
    let jsonBody =
        {
            app_id: "85aa6769-11fa-48f8-ac83-bbe3cc4a1889",
            include_player_ids: [device_id],
            headings :
                {
                    en: "E-Tiket"
                },
            contents :{
                en: message
            }
        };
    fetch('https://onesignal.com/api/v1/notifications',{
        method: "POST",
        headers: {
            'Authorization':'Basic YTk2ZTQ0N2MtOWU3ZS00NzE5LTk4YjctMjc1ZDRlNDIzZDdm',
            'Content-Type':'application/json',
            'Access-Control-Allow-Headers': 'SDK-Version',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(jsonBody),
    }).then(data=>{
        let sql = `INSERT INTO ekarcis.notification (device_id, id_user, message) VALUES ('${device_id}', '${id_user}', '${message}')`;
        connection.query(sql).then(data =>{
            return true;
        }).catch(e=>{
            return false;
        });
    }
    ).catch(e=>{
        return false;
    });

};