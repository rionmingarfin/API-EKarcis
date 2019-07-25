'use strict'

module.exports = function (app) {
    const controllerTransaction =require('../controler/transaction');
    const controllerTicket =require('../controler/ticket');
    const auth = require('../controler/auth')
    const controller = require('../controler/category')   
    const controllerTour =require('../controler/tour')
    const controllerNotif =  require('../controler/notif');
    const controllerProvince =require('../controler/province')
    const controlerWishlist = require('../controler/wishlist')
    const multer = require('multer');
    const upload = multer();

    //welocome
    app.get('/',controllerTour.welcome)

    //category
    app.get('/category',controller.getAllCategory)
    app.post('/category',controller.insert)
    app.patch('/category/:id',controller.update)
    app.delete('/category/:id',controller.delete)
  
    // Auth
    app.get('/user/:id', auth.getUserData)
    app.post('/auth_login', auth.login)
    app.post('/auth_register', auth.register)
    app.post('/auth_forgot', auth.forgot)
    app.post('/auth_token_check/:id', auth.tokenCheck)
    app.post('/auth_password/:id', auth.password)
    app.patch('/auth_register/:id',upload.any(), auth.update)
    
    //tour
    app.get('/tour',controllerTour.getTour)
    app.get('/tour/:id',controllerTour.getTourId)
    app.get('/tour/province/:id',controllerTour.getTourIdProvince)
    app.get('/tour/category/:id',controllerTour.getTourIdCategory)
    app.get('/tour/admin/:id',controllerTour.getTourIdadmin)
    app.post('/tour',upload.any(),controllerTour.insert)
    app.patch('/tour/:id',controllerTour.update)
    app.delete('/tour/:id',controllerTour.delete)

    //delete notif
    app.delete('/notif/:id', controllerNotif.deleteNotif);

    //province
    app.get('/province',controllerProvince.getAllProvince)

    // Photo
    app.delete('/tour/deletephoto/:id', controllerTour.deletFoto);

    //Transaction
    app.post('/transaction', controllerTransaction.postTransaction);
    app.post('/gettransaction', controllerTransaction.getTransaction);
    app.get('/get_data_transaction', controllerTransaction.getDataTransaction);
    app.all('/callback_payment', controllerTransaction.callbackPayment);

    //Ticket
    app.get('/ticket', controllerTicket.getTicket);
    app.post('/ticket', controllerTicket.createTicket);
    app.get('/checkin', controllerTicket.checkIn);
  
    //wisihlist
    app.post('/wishlist',controlerWishlist.wishlist)
    app.get('/wishlist',controlerWishlist.getWishlist)
    app.get('/wishlist/:id',controlerWishlist.getIdUser)

};
