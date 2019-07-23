'use strict'

module.exports = function (app) {

	const controller = require('../controler/category')
	const auth = require('../controler/auth')

    const controller = require('../controler/category')   
    const controllerTour =require('../controler/tour')
    const response = require('../response/response');
    const controllerNotif =  require('../controler/notif');
    const controllerProvince =require('../controler/province')
    const multer = require('multer');
    const upload = multer();
    

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
=======
    //tour
    
    app.get('/tour',controllerTour.getTour)
    app.get('/tour/:id',controllerTour.getTourId)
    app.get('/tour/province/:id',controllerTour.getTourIdProvince)
    app.post('/tour',upload.any(),controllerTour.insert)
    app.patch('/tour/:id',controllerTour.update)
    app.delete('/tour/:id',controllerTour.delete)


    //delete notif
    app.delete('/notif/:id', controllerNotif.deleteNotif);

    //province
    app.get('/province',controllerProvince.getAllProvince)

    // Photo
    app.delete('/tour/deletephoto/:id', controllerTour.deletFoto);

}