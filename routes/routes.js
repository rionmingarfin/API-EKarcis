'use strich'

module.exports = function (app) {
    const controller = require('../controler/category')   
    const controllerTour =require('../controler/tour')
    const response = require('../response/response');
    const controllerNotif =  require('../controler/notif');

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

    //Notif
    app.get('/notif', function (req,res) {
      response.notif("9a673309-2a53-4972-8194-03038cd82bb4","111",'ok jadi');
    })

    app.delete('/notif/:id', controllerNotif.deleteNotif);
}