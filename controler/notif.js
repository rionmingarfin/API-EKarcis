'use strict'
const connection = require('../database/connect');
const response = require('../response/response');
exports.deleteNotif = (req, res) => {
    const id = req.params.id;
    connection.query(`DELETE FROM notification WHERE notification.id = ${id}`, (error, rows, field)=>{
        if (rows.affectedRows>=1){
            response.success("Delete notification success", res);
        }else{
            response.error("Delete notification failed", res);
        }
    })

};