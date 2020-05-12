"use strict";

var zendeskWebhook = require("../../model/webhooks/zendeskModel");

exports.ZendeskController_webhooks = function(req, res) {
    zendeskWebhook.zendeskWebhookSendNotification(req.body, function(err, result) {
        if (err) res.send(err);
        res.json(result);
      });
    
};



exports.ZendeskController_webhooks_tickets = function(req, res) {
  zendeskWebhook.ZendeskController_webhooks_tickets(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
};