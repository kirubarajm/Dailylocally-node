"use strict";
module.exports = function(app) {
    var routesVersioning = require('express-routes-versioning')();
    var DunzoController = require("../controllers/webhooks/dunzoController.js");
    var RazorpayController = require("../controllers/webhooks/razorpayController");
    var ZendeskController = require("../controllers/webhooks/zendeskController");

    var middleware = require('../model/middleware.js');

    app.route("/webhooks/dunzo").post(routesVersioning({"1.0.0": DunzoController.dunzo_nex_state_update}));
    app.route("/webhooks/dunzo/nextstate").post(routesVersioning({"1.0.0": DunzoController.dunzo_nex_state_update}));
    app.route("/webhooks/dunzptaskcreate").post(routesVersioning({"1.0.0":DunzoController.dunzo_task_create}));
    app.route("/webhooks/dunzptaskcancel").post(routesVersioning({"1.0.0":DunzoController.dunzo_task_cancel}));
    app.route("/webhooks/dunzptaskstatus").post(routesVersioning({"1.0.0":DunzoController.dunzo_track_status}));


    /////////////Razorpay Webhooks///////////////
    app.route("/webhooks/razorpay").post(routesVersioning({"1.0.0":RazorpayController.webhooks}));


    //////////zen-desk///////
    app.route("/webhooks/zendesk").post(routesVersioning({"1.0.0":ZendeskController.ZendeskController_webhooks_tickets}));

    app.route("/webhooks/zendesk/ticket_update").post(routesVersioning({"1.0.0":ZendeskController.ZendeskController_webhooks_tickets}));

}