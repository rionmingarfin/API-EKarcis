'use strict'

module.exports = function (app) {
	const controller = require('../controler/category')
	const auth = require('../controler/auth')

    //welocome
    app.get('/',controller.welcome)

    //category
    app.get('/category',controller.getAllCategory)
    app.post('/category',controller.insert)
    app.patch('/category/:id',controller.update)
    app.delete('/category/:id',controller.delete)

    // Auth
    app.post('/auth_login', auth.login)
    app.post('/auth_register', auth.register)
}