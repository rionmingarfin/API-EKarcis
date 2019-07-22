'use strich'

module.exports = function (app) {
    const controller = require('../controler/category')   
    const controllerTour =require('../controler/tour')
    const controllerProvince =require('../controler/province')
    
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

    //province
    app.get('/province',controllerProvince.getAllProvince)
}