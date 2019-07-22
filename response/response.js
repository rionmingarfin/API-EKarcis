'use strict'


exports.ok = (value,res) => {
      const data = {
          status :200,
          value : value
      }
      res.json(data)
      res.end()
}
exports.error = (stts,msg,res,rows) => {
    const data = {
        error : false,
        status : stts,
        message : msg,
        data : rows
    }
    res.status(stts)
    res.json(data)
    res.end()
}