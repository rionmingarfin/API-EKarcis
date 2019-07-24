'use strich'

module.exports = function (app) {
    const controller = require('../controler/category');
    const controllerTour =require('../controler/tour');
    const response = require('../response/response');
    const controllerNotif =  require('../controler/notif');
    const controllerProvince =require('../controler/province');
    const controllerTransaction =require('../controler/transaction');
    const controllerTicket =require('../controler/ticket');


    //welocome
    app.get('/',controller.welcome)

    //category
    app.get('/category',controller.getAllCategory)
    app.post('/category',controller.insert)
    app.patch('/category/:id',controller.update)
    app.delete('/category/:id',controller.delete)

    //tour
    app.get('/tour',controllerTour.getTour)
    app.get('/tour/:id',controllerTour.getTourId)
    app.get('/tour/province/:id',controllerTour.getTourIdProvince)
    app.post('/tour',controllerTour.insert)
    app.patch('/tour/:id',controllerTour.update)
    app.delete('/tour/:id',controllerTour.delete)

    //delete notif
    app.delete('/notif/:id', controllerNotif.deleteNotif);

    //province
    app.get('/province',controllerProvince.getAllProvince)

    //Photo
    const multer = require('multer');
    const upload = multer();
    app.post('/tour/uploadphoto/:id_tour',upload.any(), controllerTour.uploadFoto);
    app.delete('/tour/deletephoto/:id', controllerTour.deletFoto);

    //Transaction
    app.post('/transaction', controllerTransaction.postTransaction);
    app.post('/gettransaction', controllerTransaction.getTransaction);

    //Ticket
    app.get('/ticket', controllerTicket.getTicket);
};