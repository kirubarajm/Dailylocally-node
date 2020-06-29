"use strict";

var Order = require("../../model/common/orderModel.js");


exports.read_a_proceed_to_pay = function(req, res) {
  if (req.headers.apptype !== undefined) {
    req.body.app_type = parseInt(req.headers.apptype);
  }else{
    req.body.app_type = 3;//admin
  }
 
  var orderitems = req.body.orderitems;
  var subscription = req.body.subscription;
  if (!req.body.aid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide Address Id"
      });
  } else if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Order.read_a_proceed_to_pay(req.body, orderitems,subscription, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.online_order_place_conformation = function(req, res) {
  // var order_place = new Order(req.body);

  if (!req.body.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else if (!req.body.payment_status) {
    res.status(400).send({ error: true,status:false, message: "Please provide payment_status" });
  }else if (!req.body.transactionid) {
    res.status(400).send({ error: true,status:false, message: "Please provide transactionid" });
  } else {
    Order.online_order_place_conformation(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};


exports.live_order_list_byuserid = function(req, res) {
  Order.live_order_list_byuserid(req.params, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};


exports.day_order_skip_count = function(req, res) {
  if (!req.body.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else{
  Order.order_skip_count(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
};



exports.day_order_view_user = function(req, res) {

  Order.day_order_view_by_user(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};


exports.order_list = function(req, res) {
 
  Order.day_orderlist_user(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};

exports.order_list_calendar  = function(req, res) {
 
  Order.order_list_calendar_by_month_wise(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
//}
};



exports.order_list_calendar_day  = function(req, res) {
 
  Order.order_list_calendar_by_day_wise(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
//}
};

exports.transaction_list = function(req, res) {
  Order.order_transaction_order_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};

exports.day_order_transaction_view_by_user = function(req, res) {
  Order.day_order_transaction_view_by_user(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};

exports.payment_check = function(req, res) {

  Order.payment_check(req.params.orderid, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};