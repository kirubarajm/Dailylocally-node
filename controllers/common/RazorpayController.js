"use strict";

var Razorpay = require("../../model/common/razorpayModel");

exports.razorpay_refund_payment = function(req, res) {
  if (!req.body.paymentid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide payment id"
      });
  }else {
    Razorpay.razorpay_refund_payment_by_paymentid(req.body, function(err,razorpay) {
   if (err) res.send(err);
      res.send(razorpay);
    });
  }
};

//Razorpay Capture
exports.razorpaycapture = function(req, res) {
  Razorpay.razorpaycapture(req.body,function(err, result) {
      if (err) res.send(err);
      res.send(result);
  }); 
};