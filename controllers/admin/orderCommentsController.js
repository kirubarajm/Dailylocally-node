"use strict";

var OrderComments = require("../../model/admin/orderCommentsModel");

exports.create_OrderComments = function(req, res) {
  var mew_comments  =  new OrderComments(req.body);
  var email_list = req.body.email_list;
    OrderComments.create_OrderComments(mew_comments,email_list,function(err, OrderComments) {
    if (err) res.send(err);
    res.send(OrderComments);
  });
};

exports.day_order_log_list = function(req, res) {
  OrderComments.day_order_log_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};