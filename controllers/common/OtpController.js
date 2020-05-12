"use strict";

var OTP = require("../../model/common/otpModel");

exports.send_otp_byphone = function(req, res) {
    OTP.send_otp_byphone(req.body,function(err, razorpay) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", razorpay);
    res.send(razorpay);
  });
};
