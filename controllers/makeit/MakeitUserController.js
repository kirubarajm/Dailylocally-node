"use strict";

var Makeituser = require("../../model/makeit/makeitUserModel.js");
var Allocation = require("../../model/sales/allocationModel");

exports.list_all_user = function(req, res) {
  Makeituser.getAllUser(function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.createnewUser_Admin = function(req, res) {
  var isAdmin=true;
  var new_user = new Makeituser(req.body);
  new_user.ka_status =1;
  //handles null error
  if (!new_user.name) {
    res.status(400).send({ error: true, message: "Please provide name " });
  } else if (!new_user.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else if (!new_user.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else {
    Makeituser.createUser(new_user, isAdmin,function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
}

exports.create_a_user = function(req, res) {
  var isAdmin=false;
  var new_user = new Makeituser(req.body);

  //handles null error
  if (!new_user.name) {
    res.status(400).send({ error: true, message: "Please provide name " });
  } else if (!new_user.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else if (!new_user.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else {
    Makeituser.createUser(new_user,isAdmin, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

// exports.creat_a_appointment = function(req, res) {
// /*  var new_user = new Makeituser(req.body);
//    if(!new_user.name || !new_user.phoneno){
//             res.status(400).send({ error:true, message: 'Please provide name/phoneno' });
//     }
//   else{*/
//     if(!req.body.makeit_userid || !req.body.date_time){
//       res.status(400).send({ error:true, message: 'Please makeit_userid/date_time' });
// }else{
//   Makeituser.createAppointment(req.body, function(err, user) {
//     if (err)
//       res.send(err);
//     res.json(user);
//   });
// }
// };

exports.creat_a_appointment = function(req, res) {
  var new_allocation = new Allocation(req.body);
  /*  var new_user = new Makeituser(req.body);
     if(!new_user.name || !new_user.phoneno){
              res.status(400).send({ error:true, message: 'Please provide name/phoneno' });
      }
    else{*/
  if (!req.body.makeit_userid) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please makeit_userid/date_time" });
  } else {
    Allocation.createAllocation(new_allocation, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.list_all_appointment = function(req, res) {
  Makeituser.getAllUserByAppointment(function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.read_a_user = function(req, res) {
  Makeituser.getUserById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.checklogin = function(req, res) {
  var new_user = new Makeituser(req.body);
  Makeituser.checkLogin(new_user, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_a_user = function(req, res) {
  console.log(req);
  Makeituser.updateById(req.params.userid, new Makeituser(req.body), function(
    err,
    user
  ) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_payment_registration = function(req, res) {

  Makeituser.update_makeit_users_bankaccount(req.body,
    function(err, user) {
      if (err) res.send(err);
      res.json(user);
    }
  );
};

exports.delete_a_user = function(req, res) {
  Makeituser.remove(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json({ message: "Makeituser successfully deleted" });
  });
};

exports.orderview = function(req, res) {
  Makeituser.orderviewbymakeituser(req.params, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderlist = function(req, res) {
  console.log(req.params);
  Makeituser.orderlistbyuserid(req.params.id, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderhistory = function(req, res) {
  console.log(req.params);
  console.log("V1--> 1.0.0");
  Makeituser.orderhistorybyuserid(req.params.id, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderhistory_V2 = function(req, res) {
  console.log("V2--> 2.0.0");
  Makeituser.orderhistorybyuserid(req.params.id, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.all_order_list = function(req, res) {
  Makeituser.all_order_list(function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.appointment_info = function(req, res) {
  Makeituser.appointment_info(req.params.makeit_userid,function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.all_order_list_bydate = function(req, res) {
  // console.log(req.body);
  Makeituser.all_order_list_bydate(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.orderstatus = function(req, res) {
  Makeituser.orderstatusbyorderid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_list_all_makeitusers = function(req, res) {
  console.log(req.body);
  Makeituser.get_admin_list_all_makeitusers(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_list_all_badges = function(req, res) {

  Makeituser.admin_list_all_badges(req.params, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.admin_makeit_unapproved_list = function(req, res) {
  console.log(req.body);
  Makeituser.admin_get_unapproved_makeitlist(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.read_a_cartdetails = function(req, res) {
  var orderitems = req.body.orderitems;
  if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  }else if (!req.body.lat) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide lat" });
  } else if (!req.body.lon) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide lan" });
  }else {
    Makeituser.read_a_cartdetails_makeitid(req.body, orderitems, true,function(err,user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.admin_check_cartdetails = function(req, res) {
  var orderitems = req.body.orderitems;
  if (!req.body.makeit_user_id) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide makeit_user_id"
      });
  } else {
    Makeituser.admin_check_cartdetails(req.body, orderitems, function(
      err,
      user
    ) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.edit_makeit_user_byid = function(req, res) {
  var isAdmin=false;
  var cuisines = req.body.cuisines;
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, message: "Please provide makeit userid" });
  } else {
    Makeituser.edit_makeit_users(req.body, cuisines, isAdmin,function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.edit_makeit_user_byid_Admin = function(req, res) {
  var isAdmin=true;
  var cuisines = req.body.cuisines;
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, message: "Please provide makeit userid" });
  } else {
    Makeituser.edit_makeit_users(req.body, cuisines, isAdmin,function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.make_user_referral = function(req, res) {
  Makeituser.makeituser_user_referral_code(req.params,req.headers, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.makeit_user_send_otp = function(req, res) {
  if (!req.body.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else {
    Makeituser.makeit_user_send_otp_byphone(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.makeit_otp_verification = function(req, res) {
  if (!req.body.oid) {
    res.status(400).send({ error: true,status:false, message: "Please provide oid" });
  } else if (!req.body.phoneno) {
    res
      .status(400)
      .send({ error: true, status:false,message: "Please provide phone_number" });
  } else {
    Makeituser.makeit_user_otpverification(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.makeituser_logout = function(req, res) {
  //var new_user = new Eatuser(req.body);
  //handles null error
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Makeituser.makeituser_logout(req.body,req.headers, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};
exports.makeit_user_forgot_password_update = function(req, res) {
  if (!req.body.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else if (!req.body.userid) {
    res.status(400).send({ error: true, message: "Please provide userid" });
  } else {
    Makeituser.makeit_user_forgot_password_update(req.body, function(
      err,
      user
    ) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.makeit_user_forgot_send_otp_by_phone = function(req, res) {
  if (!req.body.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else {
    Makeituser.makeit_user_forgot_password_send_otp(req.body, function(
      err,
      user
    ) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.makeit_earnings = function(req, res) {
  console.log(req.params);
  Makeituser.sum_total_earnings_makeit(req.params.makeit_userid, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.makeit_earnings_day = function(req, res) {
  console.log(req.params);
  Makeituser.sum_total_earnings_makeit(req.params.makeit_userid, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};


exports.makeit_document_store = function(req, res) {
  console.log(req.body);
  Makeituser.makeit_document_store_by_userid(req.body, function(
    err,
    result
  ) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.add_a_pushid = function(req, res) {
  Makeituser.update_pushid(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.edit_makeit_brand_identity = function(req, res) {
  var cuisines = req.body.cuisines;
  if (!req.body.makeit_userid) {
    res
      .status(400)
      .send({ error: true, message: "Please provide makeit userid" });
  } else {
    Makeituser.edit_makeit_brand_identity_by_sales(req.body, cuisines, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.makeit_app_version_check_vid = function(req, res) {
  
  Makeituser.makeit_app_version_check_vid(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};

exports.admin_makeit_serviceable_status = function(req, res) {
  Makeituser.admin_makeit_serviceable_status(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.makeituser_online_status = function(req, res) {
  console.log(req.body);
  Makeituser.makeit_online_status_byid(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.makeituser_appointments_rescheduled= function(req, res) {
  if (!req.body.aid) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide aid" });
  }else if(!req.body.booking_date_time) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide booking_date_time" });
  } else {
  Makeituser.makeituser_appointments_rescheduled(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}
};



exports.makeituser_appointments_cancel= function(req, res) {
  if (!req.body.aid) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide aid" });
  }else {
  Makeituser.makeituser_appointments_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
}
}

exports.makeit_customer_support = function(req, res) {
  Makeituser.makeit_app_customer_support(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//Get Live Product Status
exports.makeit_liveproduct_status = function(req, res) {
  Makeituser.makeit_liveproduct_status(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

//Get Live Product Status Based on the Kitchen
exports.kitchen_liveproduct_status = function(req, res) {
  Makeituser.kitchen_liveproduct_status(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

//Makeit List with  Live Product Status Based on the Kitchen
exports.admin_list_all_makeitusers_percentage = function(req, res) {
  Makeituser.get_admin_list_all_makeitusers_percentage(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Report For Makeit List with  Live Product Status Based on the Kitchen
exports.admin_list_all_makeitusers_percentage_report = function(req, res) {
  Makeituser.get_admin_list_all_makeitusers_percentage_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

//Report For Get Live Product Status Based on the Kitchen
exports.kitchen_liveproduct_status_report = function(req, res) {
  Makeituser.kitchen_liveproduct_status_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

////Weekly Makeit Earnings/////////////
exports.makeit_weekly_earnings = function(req, res) {
  Makeituser.makeit_weekly_earnings(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Daywise Makeit Earnings/////////////
exports.makeit_daywise_earnings = function(req, res) {
  Makeituser.makeit_daywise_earnings(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Get First Order/////////////
exports.makeit_get_firstorder = function(req, res) {
  Makeituser.makeit_get_firstorder(req.params, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Zone id update/////////////
exports.makeit_zoneid_update = function(req, res) {
  Makeituser.makeit_zoneid_update(req.params, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Home Successtion rate KPI Dashboard////
exports.homesuccesstionrate_report = function(req, res) {
  Makeituser.homesuccesstionrate_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////Moveit Avg First and Last Miles KPI Dashboard////
exports.moveitavgfirstandlastmile_report = function(req, res) {
  Makeituser.moveitavgfirstandlastmile_report(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

////Get Package Makeit User/////////////
exports.get_makeit_package_user = function(req, res) {
  Makeituser.get_makeit_package_user(req.params, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Get Package Makeit User/////////////
exports.makeit_delete = function(req, res) {
  Makeituser.makeit_delete(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};



////Makeit Earnings report/////////////
exports.makeit_earnings_report = function(req, res) {
  Makeituser.makeit_earnings_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit Cancellations report/////////////
exports.makeit_cancellation_report = function(req, res) {
  Makeituser.makeit_cancellation_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit Cancellations report/////////////
exports.makeit_avg_preparation_report = function(req, res) {
  Makeituser.makeit_avg_preparation_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit lost revenue by day wise/////////////
exports.total_lost_revenue = function(req, res) {
  Makeituser.total_lost_revenue(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit Succession rate wise/////////////
exports.total_makesuccessionrate = function(req, res) {
  Makeituser.total_makesuccessionrate(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit Makeit Finance Display/////////////
exports.total_makefinancedisplay = function(req, res) {
  Makeituser.total_makefinancedisplay(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit Cancellations report/////////////
exports.makeit_session_wise_activity_report = function(req, res) {
  Makeituser.makeit_session_wise_activity_report(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Weekly Makeit incentives/////////////
exports.makeit_incentives = function(req, res) {
  Makeituser.makeit_incentives(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

//makeit_order_cancellist
exports.makeit_order_cancellist = function(req, res) {
  Makeituser.makeit_order_cancellist(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

////Makeit Live Session/////////////
exports.makeit_live_session = function(req, res) {
  Makeituser.makeit_live_session(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};