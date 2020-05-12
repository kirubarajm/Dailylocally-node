"use strict";

var RefundCoupon = require("../../model/common/refundCouponModel");

exports.list_all_refund_coupon_by_activestatus = function(req, res) {
  RefundCoupon.getAllrefundcoupon_by_activstatus(req.params.activestatus,function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.createRefundCoupon = function(req, res) {
  //get userid and orderid and make logic accordingly
  var rc =new RefundCoupon(req.body);
  
  //rc.refund_used_date_time =req.refund_used_date_time;

  //var refundc = new RefundCoupon(rc);
  //handles null error
  RefundCoupon.createRefundCoupon(rc, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_refundcoupon_by_userid = function(req, res) {
  RefundCoupon.getarefundcoupon_by_userid(req.params.userid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.updateByRefundCouponId = function(req, res) {
  RefundCoupon.updateByRefundCouponId(req.body.rcid,req.body.refund_balance,req.body.refund_used_orderid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};


exports.delete_a_RefundCoupon = function(req, res) {
  RefundCoupon.remove(req.params.rcid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};