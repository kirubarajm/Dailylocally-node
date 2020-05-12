"use strict";

var Razorpay = require("../../model/webhooks/razorpayModel.js");

exports.webhooks = function(req, res) {
  Razorpay.webhooks(req.body, function(err, result) {
        if (err) res.send(err);
        res.json(result);
      });
    
};