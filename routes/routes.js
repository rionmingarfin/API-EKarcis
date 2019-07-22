'use strich'

module.exports = function (app) {
    const controller = require('../controler/category')   
    
    //welocome
    app.get('/',controller.welcome)

    //category
    app.get('/category',controller.getAllCategory)
    app.post('/category',controller.insert)
    app.patch('/category/:id',controller.update)
    app.delete('/category/:id',controller.delete)
}