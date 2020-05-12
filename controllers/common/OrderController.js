"use strict";

var Order = require("../../model/common/orderModel.js");

exports.list_all_product = function(req, res) {
  Order.getAllProduct(function(err, product) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", product);
    res.send(product);
  });
};

exports.eatuser_order_create = function(req, res) {
  var order_item = req.body.orderitems;
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
  } else if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Order.createOrder(req.body, order_item, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.read_a_product = function(req, res) {
  Order.getProductById(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.update_a_product = function(req, res) {
  Order.updateById(req.params.id, new Product(req.body), function(
    err,
    product
  ) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.delete_a_product = function(req, res) {
  Order.remove(req.params.id, function(err, product) {
    if (err) res.send(err);
    res.json({ message: "Product successfully deleted" });
  });
};

exports.list_all_orders = function(req, res) {
  Order.get_all_orders(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.list_today_virtual_makeit_orders = function(req, res) {
  Order.get_today_vorders(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.list_all_virtual_makeit_orders = function(req, res) {
  Order.get_all_vorders(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.order_view = function(req, res) {
  Order.orderviewbyadmin(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.order_status_update = function(req, res) {
  Order.updateOrderStatus(req.body, function(err, order) {
    if (err) res.send(err);
    res.send(order);
  });
};

exports.order_view_eatuser = function(req, res) {
  if (!req.params.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else{
  Order.orderviewbyeatuser(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
};

exports.order_list_eatuser = function(req, res) {
 
  // if (!req.params.userid) {
  //   res.status(400).send({ error: true,status:false, message: "Please provide userid" });
  // }else{
  Order.orderlistbyeatuser(req.params, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
//}
};

exports.order_assign = function(req, res) {
 
  Order.order_assign(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.un_assign_orders = function(req, res) {
  Order.getUnassignorders(req.params,function(err, result) {
    if (err) res.send(err);
    res.json(result);
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

exports.orderlist_by_moveit_userid_V2 = function(req, res) {
  console.log("V2--> 2.0.0");
  Order.orderlistbymoveituserid(req.params.moveit_user_id, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderview = function(req, res) {
  Order.orderviewbymoveituser(req.params.orderid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.order_pickup_status = function(req, res) {
  var kitchenqualitylist = req.body.qualitychecklist;

  Order.order_pickup_status_by_moveituser(
    req.body,
    kitchenqualitylist,
    function(err, result) {
      if (err) res.send(err);
      res.json(result);
    }
  );
  // }
};

exports.admin_order_cancel = function(req, res) {
  Order.admin_order_cancel(req.body, function(err, ordercancel) {
    if (err) res.send(err);
    res.send(ordercancel);
  });
};

exports.order_delivery_status = function(req, res) {
  if (req.body.orderstatus === 6 || req.body.orderstatus === "6") {
    Order.order_delivery_status_by_moveituser(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  } else {
    res.status(400).send({ error: true,status:false, message: "Invalid Delivery status" });
  }
};

exports.moveit_kitchen_reached = function(req, res) {
  Order.moveit_kitchen_reached_status(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.moveit_kitchen_qualitycheck = function(req, res) {
  var kitchenquality = new Order(req.body);

  //handles null error
  if (
    !kitchenquality.moveit_userid ||
    !kitchenquality.orderid ||
    !kitchenquality.makeit_user_id ||
    !kitchenquality.enabled
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide moveit_userid/orderid/makeit_user_id/enabled"
      });
  } else {
    Order.create_moveit_kitchen_qualitycheck(kitchenquality, function(
      err,
      result
    ) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.order_payment_status = function(req, res) {
  Order.order_payment_status_by_moveituser(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderhistory_by_moveit_userid = function(req, res) {
  Order.orderhistorybymoveituserid(req.params.moveit_user_id, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.online_order_place_conformation = function(req, res) {
  // var order_place = new Order(req.body);
  console.log(req.body);
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

exports.live_order_list_byeatuser = function(req, res) {
  Order.live_order_list_byeatuserid(req.params, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.testPush = function(req, res) {
  console.log(req.body);
  Order.test_push(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_proceed_to_pay = function(req, res) {
  if (req.headers.apptype !== undefined) {
    req.body.app_type = parseInt(req.headers.apptype);
  }else{
    req.body.app_type = 3;//admin
  }
 
  var orderitems = req.body.orderitems;
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
  } else if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Order.read_a_proceed_to_pay(req.body, orderitems, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.eat_order_cancel = function(req, res) {
  if (!req.body.orderid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide orderid" });
  }
   else {
    Order.eat_order_cancel(req.body, function(err, ordercancel) {
      if (err) res.send(err);
      res.send(ordercancel);
    });
  }
};

exports.makeit_order_cancel = function(req, res) {
   if (!req.body.orderid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide orderid" });
  }
   else {
    Order.makeit_order_cancel(req.body, function(err, ordercancel) {
      if (err) res.send(err);
      res.send(ordercancel);
    });
  }
};


//Makeit order accept
exports.makeit_order_accept = function(req, res) {
  if (!req.body.orderid) {
   res 
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
   Order.makeit_order_accept(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};


//moveit order accept
exports.moveit_order_accept = function(req, res) {
  if (!req.body.orderid) {
   res 
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
   Order.moveit_order_accept(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};
//refund creation
exports.eat_order_item_missing = function(req, res) {
  
  if (!req.body.orderid) {
   res 
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
   // console.log(req.body);
   Order.eat_order_item_missing_byuserid(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};


exports.makeit_order_missing = function(req, res) {
  if (!req.body.orderid) {
   res
     .status(400)
     .send({ error: true, status: false, message: "Please provide orderid" });
 }
  else {
   Order.order_missing_by_makeit(req.body, function(err, ordercancel) {
     if (err) res.send(err);
     res.send(ordercancel);
   });
 }
};


exports.order_waiting_list_by_admin = function(req, res) {
  Order.get_order_waiting_list(req.params, function(err, waitinglist) {
    if (err) res.send(err);
    res.send(waitinglist);
  });
};


exports.moveit_delivery_cash_received_by_today = function(req, res) {
  console.log(req.body);
  Order.moveit_delivery_cash_received_by_today_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.getTotalAmountofOrders = function(req, res) {
  Order.get_orders_cash_online_amount(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};


exports.eat_order_skip_count = function(req, res) {
  if (!req.body.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else{
  Order.eat_order_skip_count_by_uid(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
};

exports.eat_get_delivery_time= function(req, res) {
  if (!req.body.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else{
  Order.eat_get_delivery_time_by_moveit_id(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
};

exports.get_sales_products_count= function(req, res) {
  Order.get_sales_product_count(req.body, function(err, orders) {
    if (err) res.send(err);
    res.send(orders);
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

exports.eat_order_distance_calculation= function(req, res) {
  if (!req.body.orderid) {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }else{
  Order.eat_order_distance_calculation(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
};

exports.reassign_orders = function(req, res) {
  Order.reassign_orders_by_id(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.moveit_customer_location_reached = function(req, res) {
  console.log(req.body);
  Order.moveit_customer_location_reached_by_userid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.moveit_unaccept_orders = function(req, res) {
  console.log(req.body);
  Order.moveit_unaccept_orders_byid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_order_delivery= function(req, res) {
  if (req.body.orderid) {
    Order.order_delivery_status_by_admin(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  } else {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }
};

exports.admin_order_payment_status = function(req, res) {
  Order.admin_order_payment_status_by_moveituser(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_order_order_count_by_moveit = function(req, res) {
  Order.admin_orders_count_by_moveit(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_moveit_no_orders= function(req, res) {
    Order.moveit_no_of_orders(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
};

exports.admin_order_turnaround_time_makeit= function(req, res) {
  Order.order_turnaround_time_makeit(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_order_turnaround_time_moveit= function(req, res) {
  Order.order_turnaround_time_moveit(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_order_canceled= function(req, res) {
  Order.orders_canceled(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_order_cost= function(req, res) {
  Order.orders_cost(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_via_order_delivey= function(req, res) {
  Order.admin_via_order_delivey(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//New Users List
exports.new_users= function(req, res) {
  Order.new_users(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//No of orders per user 
exports.user_orders_history= function(req, res) {
  Order.user_orders_history(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Date Wise Sales Report 
exports.datewise_sales= function(req, res) {
  Order.datewise_sales(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Canceled orders between date
exports.cancel_orders= function(req, res) {
  Order.cancel_orders(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Total delivered orders between date


//between dates and hub

//Total new user orders
exports.new_users_orders= function(req, res) {
  Order.new_users_orders(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Total Retained Customer Report
exports.retained_customer= function(req, res) {
  Order.retained_customer(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Driver wise COD Settlement 
exports.driverwise_cod= function(req, res) {
  Order.driverwise_cod(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Total delivered orders between date  and hub
exports.hub_total_delivery= function(req, res) {
  Order.hub_total_delivery(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Product wise report
exports.product_wise= function(req, res) {
  Order.product_wise(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Orders report
exports.orders_report= function(req, res) {
  Order.orders_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Orders Rating
exports.orders_rating= function(req, res) {
  Order.orders_rating(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

exports.create_tunnel_order = function(req, res) {
  if (req.headers.apptype !== undefined) {
    req.body.app_type = parseInt(req.headers.apptype);
  }else{
    req.body.app_type = 3;//admin
  }
 
  var orderitems = req.body.orderitems;
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
  } else if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Order.create_tunnel_order_new_user(req.body, orderitems, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

//Kitchen Wise report
exports.kitchenwise_report= function(req, res) {
  Order.kitchenwise_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Product wise Virual Kitchen report
exports.product_wise_virtual= function(req, res) {
  Order.product_wise_virtual(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Product wise Real Kitchen report
exports.product_wise_real= function(req, res) {
  Order.product_wise_real(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Virtual Kitchen Orders report
exports.virtual_orders_report= function(req, res) {
  Order.virtual_orders_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Real Kitchen Orders report
exports.real_orders_report= function(req, res) {
  Order.real_orders_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Daywise Virtual Makeit Earnings report
exports.virtual_makeit_earnings= function(req, res) {
  Order.virtual_makeit_earnings(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Daywise Real Makeit Earnings report
exports.real_makeit_earnings= function(req, res) {
  Order.real_makeit_earnings(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

exports.admin_order_pickup_cancel = function(req, res) {
  Order.admin_order_pickup_cancel(req.body, function(err, ordercancel) {
    if (err) res.send(err);
    res.send(ordercancel);
  });
};

exports.admin_order_prepared_cancel = function(req, res) {
  Order.admin_order_prepared_cancel(req.body, function(err, ordercancel) {
    if (err) res.send(err);
    res.send(ordercancel);
  });
};



//Makeit Earnings Virtual Kitchen Prepare After Cancel Report
exports.virtual_after_cancel= function(req, res) {
  Order.virtual_after_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Makeit Earnings Real Kitchen Prepare After Cancel Report
exports.real_after_cancel= function(req, res) {
  Order.real_after_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Makeit Earnings Virtual Kitchen Prepare Before Cancel Report
exports.virtual_before_cancel= function(req, res) {
  Order.virtual_before_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

//Makeit Earnings Real Kitchen Prepare Before Cancel Report
exports.real_before_cancel= function(req, res) {
  Order.real_before_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}

////Virtual Cancel Orders
exports.virtual_order_canceled= function(req, res) {
  Order.virtual_order_canceled(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////Real Cancel Orders
exports.real_order_canceled= function(req, res) {
  Order.real_order_canceled(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////getXfactors
exports.getXfactors_by_userid = function(req, res) {
  if (req.headers.apptype !== undefined) {
    req.body.app_type = parseInt(req.headers.apptype);
  }else{
    req.body.app_type = 3;//admin
  }
  var orderitems = req.body.orderitems;
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
  } else if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Order.getXfactors(req.body, orderitems, function(err, Xfactors) {
      if (err) res.send(err);
      res.json(Xfactors);
    });
  }
};

////order_move_to_queue
exports.order_move_to_queue = function(req, res) {
  Order.order_move_to_queue_by_admin(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////Lost customers list
exports.lostcustomerlist_report= function(req, res) {
  Order.lostcustomerlist_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////Virtual orders purchased report
exports.virtualorderpurchased_report= function(req, res) {
  Order.virtualorderpurchased_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////funnel orders report
exports.funnelorders_report= function(req, res) {
  Order.funnelorders_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////X-Factor orders report
exports.xfactororders_report= function(req, res) {
  Order.xfactororders_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Item Missing OR Funnel Refunded coupon list
exports.funnelrefunded_couponreport = function(req, res) {
  Order.funnelrefunded_couponreport(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//Item Missing OR Online Refunded coupon list
exports.onlinerefunded_couponreport = function(req, res) {
  Order.onlinerefunded_couponreport(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//order_report
exports.order_report = function(req, res) {
  Order.order_report_byadmin(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//order_report
exports.Item_wise_report = function(req, res) {
  Order.Item_wise_report_byadmin(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//moveit master report
exports.moveit_master_report = function(req, res) {
  Order.moveit_master_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//makeit master report
exports.makeit_master_report = function(req, res) {
  Order.makeit_master_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

///User Exp report///
exports.userexperience_report = function(req, res) {
  Order.userexperience_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Virtual Total completed orders revenu////
exports.virtualorder_completedrevenu_report = function(req, res) {
  Order.virtualorder_completedrevenu_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Real Total completed orders revenu////
exports.realorder_completedrevenu_report = function(req, res) {
  Order.realorder_completedrevenu_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Virtual Total cancelled orders revenu////
exports.virtualorder_cancelledrevenu_report = function(req, res) {
  Order.virtualorder_cancelledrevenu_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Real Total cancelled orders revenu////
exports.realorder_cancelledrevenu_report = function(req, res) {
  Order.realorder_cancelledrevenu_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Virtual Abandoned Cart orders revenu////
exports.virtual_abandonedcartrevenu_report = function(req, res) {
  Order.virtual_abandonedcartrevenu_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Real Abandoned Cart orders revenu////
exports.real_abandonedcartrevenu_report = function(req, res) {
  Order.real_abandonedcartrevenu_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};


//Dunzo zone cod orders
exports.list_dunzo_zone_cod_orders = function(req, res) {
  Order.list_dunzo_zone_cod_orders_by_admin(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

//dunzo order assign

exports.dunzo_order_assign = function(req, res) {
  Order.dunzo_order_assign(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};


//dunzo order delivery
exports.dunzo_order_delivery= function(req, res) {
  if (req.body.orderid) {
    Order.dunzo_order_delivery_by_admin(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  } else {
    res.status(400).send({ error: true,status:false, message: "Please provide orderid" });
  }
};

//Dunzo zone cod orders
exports.list_dunzo_zone_cod_orders_list = function(req, res) {
  Order.list_dunzo_zone_cod_orders_list_by_admin(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
}
///////KPI Dashboard Reports Live Kitchen count////
exports.livekitchenavgcount_report = function(req, res) {
  Order.livekitchenavgcount_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///////Log KPI Dashboard Reports Live Kitchen count////
exports.log_livekitchenavgcount_report = function(req, res) {
  Order.log_livekitchenavgcount_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///////Log HUB KPI Dashboard Reports Live Kitchen count////
exports.log_hub_livekitchenavgcount_report = function(req, res) {
  Order.log_hub_livekitchenavgcount_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};
////Avg Order Value KPI Dashboard////
exports.averageordervalue_report = function(req, res) {
  Order.averageordervalue_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//cancel orders follow up report
exports.cancelled_report_follow_up = function(req, res) {
  Order.cancelled_report_follow_up(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//unclosed orders report
exports.unclosed_orders = function(req, res) {
  Order.unclosed_orders(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//unclosed orders report
exports.customerexperience = function(req, res) {
  Order.customerexperience(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//xfactor order count reports
exports.xfactor_order_count = function(req, res) {
  Order.xfactor_order_count(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

///Moveit Succession Report////
exports.moveit_daywise_cycle_report = function(req, res) {
  console.log("moveitdaywisecyclereport");
  Order.moveit_daywise_cycle_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///makeit_shutdown_report////
exports.makeit_shutdown_report = function(req, res) {
  //console.log("moveitdaywisecyclereport");
  Order.makeit_shutdown_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////Moveit Driver Utilization  Report///
exports.moveit_utilization_report = function(req, res) {
  //console.log("moveit_utilisation_report");
  Order.moveit_utilization_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////OPE METRICS Report///
exports.ope_metrics_report = function(req, res) {
  Order.ope_metrics_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////OPE METRICS Report table fromatted///
exports.ope_metrics_report_format = function(req, res) {
  Order.ope_metrics_report_format(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////OPE METRICS Report for order value///
exports.ope_metrics_growth = function(req, res) {
  Order.ope_metrics_growth(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////SALES METRICS Report///
exports.sales_metrics_report = function(req, res) {
  Order.sales_metrics_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////LOGS METRICS Report///
exports.logs_metrics_report = function(req, res) {
  Order.logs_metrics_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///Show Makeit Incentive Report////
exports.show_makeit_incentive_report = function(req, res) {
  //console.log("moveitdaywisecyclereport");
  Order.show_makeit_incentive_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///Eat users orders list////
exports.eat_user_order_list = function(req, res) {
  Order.eat_user_order_list(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///Admin Raw Data Report -> liveproducthistory_rawreport////
exports.liveproducthistory_rawreport = function(req, res) {
  Order.liveproducthistory_rawreport(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///Admin Raw Data Report -> makeitlog_rawreport////
exports.makeitlog_rawreport = function(req, res) {
  Order.makeitlog_rawreport(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

///Admin Raw Data Report -> moveitlog_rawreport////
exports.moveitlog_rawreport = function(req, res) {
  Order.moveitlog_rawreport(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//////Zone Level Performance/////
exports.zone_level_performance_report = function(req, res) {
  Order.zone_level_performance_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};