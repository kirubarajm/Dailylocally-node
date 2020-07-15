"use strict";

var Moveituser = require("../../model/moveit/moveitUserModel.js");
var MoveitRatingForMakeit = require("../../model/moveit/moveitRatingForMakeitModel");
var MoveitFireBase =require("../../push/Moveit_SendNotification")

exports.list_all_user = function(req, res) {
  Moveituser.getAllUser(function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.create_a_user = function(req, res) {
  var newdocument = {};
  var new_user = new Moveituser(req.body);
  // newdocument.driver_lic = req.body.driver_lic;
  // newdocument.vech_insurance = req.body.vech_insurance;
  // newdocument.vech_rcbook = req.body.vech_rcbook;
  // newdocument.photo = req.body.photo;
  // newdocument.legal_document = req.body.legal_document;

  //handles null error
  if (!new_user.name) {
    res.status(400).send({ error: true, message: "Please provide name " });
  } else if (!new_user.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else if (!new_user.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else {
    Moveituser.createUser(new_user, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.checklogin = function(req, res) {

  Moveituser.checkLogin(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.Moveituser_logout = function(req, res) {
  //var new_user = new Eatuser(req.body);
  //handles null error
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Moveituser.Moveituser_logout(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};
exports.read_a_user = function(req, res) {
  Moveituser.getUserById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_a_user = function(req, res) {
  Moveituser.updateById(req.params.userid, new Moveituser(req.body), function(
    err,
    user
  ) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.delete_a_user = function(req, res) {
  Moveituser.remove(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json({ message: "Moveituser successfully deleted" });
  });
};



exports.moveitSearch = function(req, res) {
  Moveituser.getAllmoveitSearch(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.moveit_live_status = function(req, res) {
  if (!req.body.userid) {
    res.status(400).send({ error: true,status:false, message: "Please provide userid" });
  } else {
  Moveituser.update_online_status(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
  }
};

exports.moveit_kitchen_qualitycheck = function(req, res) {
  var kitchenquality = new MoveitRatingForMakeit(req.body);
  var kitchenqualitylist = req.body.qualitychecklist;

  if (!kitchenqualitylist) {
    res
      .status(400)
      .send({ error: true, message: "Please provide kitchenqualitylist" });
  } else {
    MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck(
      kitchenquality,
      kitchenqualitylist,
      function(err, result) {
        if (err) res.send(err);
        res.json(result);
      }
    );
  }
};

exports.moveit_kitchen_rating = function(req, res) {
  MoveitRatingForMakeit.MoveitRatingForMakeit(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_read_a_user = function(req, res) {
  Moveituser.admin_getUserById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.moveit_quality_checklist = function(req, res) {
  MoveitRatingForMakeit.get_moveit_quality_checklist(req.body, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_hub_details = function(req, res) {
  Moveituser.get_a_hub_navigation(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.setGeoLocation = function(req, res) {
  MoveitFireBase.geoFireInsert(req.body.id,req.body.geoLocation,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.getGeoLocation = function(req, res) {
  MoveitFireBase.geoFireGetKeyByGeo(req.body.geoLocation,6,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.getNearByMoveit = function(req, res) {
  Moveituser.get_a_nearby_moveit_V2(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.admin_moveit_current_location = function(req, res) {
  Moveituser.admin_moveit_current_location(req.body, function(err, ordercancel) {
    if (err) res.send(err);
    res.send(ordercancel);
  });
};

exports.edit_moveit_user_byid = function(req, res) {
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, message: "Please provide moveit userid" });
  } else {
    Moveituser.edit_moveit_user(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.add_a_pushid = function(req, res) {
  Moveituser.update_pushid(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.admin_phoneno_verified = function(req, res) {
  Moveituser.admin_send_otp(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};



exports.Moveituser_send_otp_byphone = function(req, res) {
  if (
    !req.body.phoneno 
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide phoneno"
      });
  } else {
    Moveituser.Moveituser_send_otp_byphone(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.Moveituserotpverification = function(req, res) {
  
  if (!req.body.oid) {
    res.status(400).send({ error: true,status:false, message: "Please provide oid " });
  } else if (!req.body.otp) {
    res.status(400).send({ error: true,status:false, message: "Please provide otp" });
  } else {
    Moveituser.Moveituser_otp_verification(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};


exports.moveit_app_version_check_vid = function(req, res) {
  
  Moveituser.moveit_app_version_check_vid(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};

exports.admin_force_Moveituser_logout = function(req, res) {
  //var new_user = new Eatuser(req.body);
  //handles null error
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Moveituser.admin_force_Moveituser_logout(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.moveit_online_status = function(req, res) {
  Moveituser.moveit_online_status_byid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Moveit Customer Support
exports.moveit_customer_support = function(req, res) {
  Moveituser.moveit_app_customer_support(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.getNearByMoveit_auto_assign = function(req, res) {
  Moveituser.getNearByMoveit_auto_assign_moveit_V2(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////////////Get Working Dates
exports.getworking_dates = function(req, res) {
  Moveituser.getworking_dates(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////////////Day Wise Moveit History
exports.daywise_moveit_records = function(req, res) {
  Moveituser.daywise_moveit_records(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////////////First Mile User Wise Moveit Report
exports.firstmile_userwise_moveitreport = function(req, res) {
  Moveituser.firstmile_userwise_moveitreport(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////////////First Mile Orders Wise Moveit Report
exports.firstmile_orderwise_moveitreport = function(req, res) {
  Moveituser.firstmile_orderwise_moveitreport(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////////////Orders Wise Moveit Report
exports.orderwise_moveitreport = function(req, res) {
  Moveituser.orderwise_moveitreport(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//moveit zone details

exports.moveit_zone_data = function(req, res) {
  if (!req.body.userid) {
    res.status(400).send({ error: true,status:false, message: "Please provide userid" });
  } else {
  Moveituser.moveit_zone_data(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
  }
};

////Zone Wise Free Moveit List///////////
exports.zone_free_moveitlist = function(req, res) {
  Moveituser.zone_free_moveitlist(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Zone Wise yesterday Orders List/////////
exports.zonewise_yesterday_orderslist = function(req, res) {
  Moveituser.zonewise_yesterday_orderslist(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Assign Moveit to Orders/////////
exports.assign_moveitto_orders = function(req, res) {
  Moveituser.assign_moveitto_orders(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Admin Moveit Trip List/////////
exports.admin_moveit_trip_list = function(req, res) {
  Moveituser.admin_moveit_trip_list(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip List/////////
exports.moveit_trip_list = function(req, res) {
  Moveituser.moveit_trip_list(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip Details/////////
exports.moveit_trip_details = function(req, res) {
  Moveituser.moveit_trip_details(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Order Details/////////
exports.moveit_order_details = function(req, res) {
  Moveituser.moveit_order_details(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip Start/////////
exports.moveit_trip_start = function(req, res) {
  Moveituser.moveit_trip_start(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip End/////////
exports.moveit_trip_end = function(req, res) {
  Moveituser.moveit_trip_end(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Update Order Pickup Image/////////
exports.update_orderpickup_img = function(req, res) {
  Moveituser.update_orderpickup_img(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Re-Assign Moveit to Orders/////////
exports.reassign_moveitto_orders = function(req, res) {
  Moveituser.reassign_moveitto_orders(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Remove Orders From Trip/////////
exports.remove_orders_trip = function(req, res) {
  Moveituser.remove_orders_trip(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Unlive Moveit/////////
exports.moveit_unlive = function(req, res) {
  Moveituser.moveit_unlive(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip History/////////
exports.moveit_trip_history = function(req, res) {
  Moveituser.moveit_trip_history(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip Detail/////////
exports.moveit_trip_detail = function(req, res) {
  Moveituser.moveit_trip_detail(req.params,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Add New Order Into old Trip/////////
exports.admin_addorder_trip = function(req, res) {
  Moveituser.admin_addorder_trip(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.push_notification = function(req, res) {
  Moveituser.push_notification(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.order_assign_to_dunzo = function(req, res) {
  Moveituser.order_assign_to_dunzo(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Moveit Trip Detail/////////
exports.order_delivery_time_update = function(req, res) {
  Moveituser.order_delivery_time_update(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

///////Order Pickup to Accept////////
exports.pickup_to_accept_order = function(req, res) {
  Moveituser.pickup_to_accept_order(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.check_latlng_boundaries = function(req, res) {
  Moveituser.check_latlng_boundaries(req.body,function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};