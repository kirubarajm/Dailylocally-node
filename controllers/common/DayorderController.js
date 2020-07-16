"use strict";

var Dayorder = require("../../model/common/dayorderModel");

///// Day Order List ///////////
exports.day_order_list = function(req, res) {
  Dayorder.day_order_list(req.body, function(err, user) {
    //console.log("day_order_list controller");
    if (err) res.send(err);
    //console.log("res", ress);
    res.send(user);
  });
};

///// Day Order View ///////////
exports.day_order_view = function(req, res) {
  Dayorder.day_order_view(req.body, function(err, user) {
    //console.log("day_order_view controller");
    if (err) res.send(err);
    //console.log("res", ress);
    res.send(user);
  });
};

exports.quality_day_order_list = function(req, res) {
  Dayorder.quality_day_order_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.quality_day_order_view = function(req, res) {
  Dayorder.quality_day_order_view(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.day_order_product_cancel = function(req, res) {
  Dayorder.day_order_product_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};
 

exports.crm_day_order_list = function(req, res) {
  Dayorder.crm_day_order_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.user_crm_day_order_list = function(req, res) {
  Dayorder.user_crm_day_order_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};



exports.crm_day_order_view = function(req, res) {
  Dayorder.crm_day_order_view(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};


exports.admin_day_order_product_cancel = function(req, res) {
  var id = req.body.id;
  Dayorder.admin_day_order_product_cancel(req.body,id, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_day_order_book_return = function(req, res) {
  Dayorder.admin_day_order_book_return(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.day_order_book_return_by_moveit = function(req, res) {
  Dayorder.day_order_book_return_by_moveit(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};
 

exports.reorder_order_create = function(req, res) {
  var order_item = req.body.orderitems;
  if (!req.body.orderitems) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide orderitems"
      });
  }else if (!req.body.date) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide date"
      });
  }else if (!req.body.userid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide userid"
      });
  } else {
    Dayorder.reorder_order_create(req.body, order_item, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.reorder_reasonlist = function(req, res) {
  Dayorder.reorder_reasonlist(req.params, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.cancel_reasonlist = function(req, res) {
  Dayorder.cancel_reasonlist(req.params, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.bookreturn_reasonlist = function(req, res) {
  Dayorder.bookreturn_reasonlist(req.params, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};



exports.refund_reasonlist = function(req, res) {
  Dayorder.refund_reasonlist(req.params, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};



exports.refund_create= function(req, res) {
  Dayorder.refund_create(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

