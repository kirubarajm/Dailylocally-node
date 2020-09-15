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

  Order.order_skip_count(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

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


exports.orderlist_by_moveit_userid = function(req, res) {
  console.log("V1--> 1.0.0");
  Order.orderlistbymoveituserid(req.params.moveit_user_id, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

//moveit order accept
exports.moveit_order_accept = function(req, res) {
  if (!req.body.trip_id) {
   res 
     .status(400)
     .send({ error: true, status: false, message: "Please provide tripid" });
 }
  else {
   Order.moveit_order_accept(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};

exports.order_pickup_status = function(req, res) {
  // var kitchenqualitylist = req.body.qualitychecklist;

  Order.order_pickup_status_by_moveituser(req.body,function(err, result) {
      if (err) res.send(err);
      res.json(result);
    }
  );
  // }
};

exports.moveit_kitchen_reached = function(req, res) {
  Order.moveit_kitchen_reached_status(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};


exports.moveit_customer_location_reached = function(req, res) {
  Order.moveit_customer_location_reached_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.order_payment_status = function(req, res) {
  Order.order_payment_status_by_moveituser(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.order_delivery_status = function(req, res) {
 
    Order.order_delivery_status_by_moveituser(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
 
};

exports.moveit_notification_time = function(req, res) {
  
  Order.moveit_notification_time_orderid(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};



exports.moveit_delivery_cash_received_by_today = function(req, res) {
  // console.log(req.body);
  Order.moveit_delivery_cash_received_by_today_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};