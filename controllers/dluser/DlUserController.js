"use strict";

var Dluser = require("../../model/dluser/DlUserModel");
var constant = require("../../model/constant.js");




exports.user_app_version_check_vid = function(req, res) {

  Dluser.user_app_version_check_vid(req.body,req.headers, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};


exports.dl_user_send_otp = function(req, res) {
  var new_user = new Dluser(req.body);
  //handles null error
  if (!new_user.phoneno) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide phoneno" });
  } else {
    Dluser.dl_user_send_otp(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.user_otp_verification = function(req, res) {
 
  if (!req.body.oid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide oid" });
  } else if (!req.body.phoneno) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide phone_number"
      });
  } else {
    Dluser.user_otp_verification(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.user_logout = function(req, res) {
  //var new_user = new Eatuser(req.body);
  //handles null error
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Dluser.user_logout(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.edit_user = function(req, res) {
  if (!req.body.name) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide name" });
  } else if (!req.body.gender) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide phone_number"
      });
  } else {
    Dluser.edit_user(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.user_referral = function(req, res) {
  Dluser.user_referral_code(req.params,req.headers, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};



exports.add_a_pushid = function(req, res) {
  Dluser.update_pushid(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};



exports.customer_support = function(req, res) {
  Dluser.app_customer_support(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

// exports.list_all_eatuser = function(req, res) {
//   Eatuser.getAllUser(function(err, user) {
//     console.log("controller");
//     if (err) res.send(err);
//     console.log("res", user);
//     res.send(user);
//   });
// };

// exports.create_a_eatuser = function(req, res) {
//   var new_user = new Eatuser(req.body);
//   //handles null error
//   if (!new_user.name) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide name " });
//   } else if (!new_user.phoneno) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide phoneno" });
//   } else if (!new_user.password) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide password" });
//   } else {
//     Eatuser.createUser(new_user, function(err, user) {
//       if (err) res.send(err);
//       res.json(user);
//     });
//   }
// };

// exports.read_a_user = function(req, res) {
//   Eatuser.getUserById(req.params.userid, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// exports.update_a_user = function(req, res) {
//   Eatuser.updateById(req.params.userid, new Eatuser(req.body), function(
//     err,
//     user
//   ) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// exports.delete_a_user = function(req, res) {
//   Eatuser.remove(req.params.userid, function(err, user) {
//     if (err) res.send(err);
//     res.json({ message: "Eatuser successfully deleted" });
//   });
// };

// exports.list_all_virtual_eatuser = function(req, res) {
//   Eatuser.getAllVirtualUser(req.body, function(err, user) {
//     console.log("controller");
//     if (err) res.send(err);
//     console.log("res", user);
//     res.send(user);
//   });
// };

// exports.virtual_eatusersearch = function(req, res) {
//   // console.log(req.params.phoneno);
//   Eatuser.virtual_eatusersearch(req.params.search, function(err, user) {
//     console.log("controller");
//     if (err) res.send(err);
//     console.log("res", user);
//     res.send(user);
//   });
// };

// exports.eat_dish_list = function(req, res) {
//   Eatuser.get_eat_dish_list(req.body, function(err, user) {
//     console.log("controller");
//     if (err) res.send(err);
//     console.log("res", user);
//     res.send(user);
//   });
// };

// exports.eat_makeit_list = function(req, res) {
//   Eatuser.get_eat_makeit_list(req.body, function(err, user) {
//     console.log("controller");
//     if (err) res.send(err);
//     console.log("res", user);
//     res.send(user);
//   });
// };

// exports.eat_makeit_product_list = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }else if (!req.body.vegtype) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide vegtype" });
//   } else {
//     Eatuser.get_eat_makeit_product_list(req.body, function(err, user) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   }
// };

// ///version 2
// exports.get_eat_makeit_product_list_v_2 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }else if (!req.body.vegtype) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide vegtype" });
//   } else {
//     Eatuser.get_eat_makeit_product_list_v_2(req.body, function(err, user) {
//       console.log("controller makeit product list v_2");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   }
// };

// ///version 2.1
// exports.get_eat_makeit_product_list_v_2_1 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }else if (!req.body.vegtype) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide vegtype" });
//   } else {
//     Eatuser.get_eat_makeit_product_list_v_2_1(req.body, function(err, user) {
//       console.log("Zone controller");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   }
// };


// ///version 2.2 https://tovologies.atlassian.net/browse/ES-48

// exports.get_eat_makeit_product_list_v_2_2 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }else if (!req.body.vegtype) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide vegtype" });
//   } else {
//     Eatuser.get_eat_makeit_product_list_v_2_2(req.body, function(err, user) {
//       console.log("Zone controller");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   }
// };

// exports.eat_dish_sort_filter = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   } else {
//     Eatuser.get_eat_dish_list_sort_filter(req.body, function(err, user) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   }
// };

// exports.eat_kitchen_sort_filter = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   } else {
//     Eatuser.get_eat_kitchen_list_sort_filter(req.body, function(err, user) {
//       console.log("controller kitchen list sort filter");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   }
// };


// exports.eat_kitchen_sort_filter_v2 = function(req, res) {
  
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   } else {
//     Eatuser.get_eat_kitchen_list_sort_filter_v2(req.body, function(err, user) {
//       console.log("Controler kitchen list sort filter v2");
//       if (err) res.send(err);
//       console.log("res", user);
//       res.send(user);
//     });
//   } 
// };
// // exports.eat_user_referral = function(req, res) {
// //   console.log("headers"+req.params);
// //   Eatuser.eat_user_referral_code(req.params,req.headers, function(err, user) {
// //     console.log("controller");
// //     if (err) res.send(err);
// //     console.log("res", user);
// //     res.send(user);
// //   });
// // };
// exports.eat_kitchen_sort_filter_v_2_1 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   } else {
//     Eatuser.get_eat_kitchen_list_sort_filter_v_2_1(req.body, function(err, user) {
//       //console.log("Kitchen List Sort Filter v_2_1 controller");
//       if (err) res.send(err);
//       //console.log("res", user);
//       res.send(user);
//     });
//   }
// };


// exports.eat_kitchen_sort_filter_v_2_2 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   } else {
//     Eatuser.get_eat_kitchen_list_sort_filter_v_2_2(req.body, function(err, user) {
//       //console.log("Kitchen List Sort Filter v_2_2 controller");
//       if (err) res.send(err);
//       //console.log("res", user);
//       res.send(user);
//     });
//   }
// };



// exports.checklogin = function(req, res) {
//   var new_user = new Eatuser(req.body);
//   Eatuser.checkLogin(new_user, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// exports.eat_user_post_registration = function(req, res) {
//   if (!req.body.email) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide email" });
//   }
//   //commanded 04-07-2019
//   //  else if (!req.body.password) {
//   //   res
//   //     .status(400)
//   //     .send({ error: true, status: false, message: "Please provide password" });
//   // }
//    else {
//     Eatuser.eat_user_post_registration(req.body, function(err, user) {
//       if (err) res.send(err);
//       res.json(user);
//     });
//   }
// };

// exports.eat_user_forgot_password = function(req, res) {
//   if (!req.body.phoneno) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide phoneno" });
//   } else {
//     Eatuser.eat_user_forgot_password_byuserid(req.body, function(err, user) {
//       if (err) res.send(err);
//       res.json(user);
//     });
//   }
// };

// exports.eat_user_forgot_password_update = function(req, res) {
//   if (!req.body.password) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide password" });
//   } else if (!req.body.userid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide userid" });
//   } else {
//     Eatuser.eat_user_forgot_password_update(req.body, function(err, user) {
//       if (err) res.send(err);
//       res.json(user);
//     });
//   }
// };

// exports.create_customerid_by_razorpay = function(req, res) {
//   Eatuser.create_customerid_by_razorpay(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// exports.eat_region_list_sort_filter = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }
//    else {
//     Eatuser.get_eat_region_makeit_list(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };



// exports.eat_region_list = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }else {
//     Eatuser.get_eat_region_makeit_list_by_eatuserid(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };

// exports.eat_region_list2 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   } else {
//     Eatuser.get_eat_region_makeit_list_by_eatuserid(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }  
// };

// exports.eat_region_kitchen_showmore = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }
//    else {
//     Eatuser.get_eat_region_kitchen_list_show_more(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };

// exports.eat_region_kitchen_showmore_v2 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }else {
//     Eatuser.get_eat_region_kitchen_list_show_more_v2(req.body, function(err, region) {
//       console.log("controller 2.0.0");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };



// exports.eat_explore_dish = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }
//    else {
//     Eatuser.eat_explore_kitchen_dish(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };

// exports.eat_explore_dish_v2 = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }
//    else {
//     Eatuser.eat_explore_kitchen_dish_v2(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };

// exports.eat_order_cancel = function(req, res) {
//   if (!req.body.lat) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lat" });
//   } else if (!req.body.lon) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide lan" });
//   }else if (!req.body.eatuserid) {
//     res
//       .status(400)
//       .send({ error: true, status: false, message: "Please provide eatuserid" });
//   }
//    else {
//     Eatuser.eat_explore_kitchen_dish(req.body, function(err, region) {
//       console.log("controller");
//       if (err) res.send(err);
//       console.log("res", region);
//       res.send(region);
//     });
//   }
// };



// exports.update_tunnel_byid = function(req, res) {
//   Eatuser.update_tunnel_byid(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// exports.get_otp_phone_number = function(req, res) {
//   Eatuser.get_otp(req.params, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// /////Eat Users History
// exports.user_history = function(req, res) {
//   Eatuser.user_history(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// /////Eat Payment Retry
// exports.payment_retry = function(req, res) {
//   //console.log("controller==========>");
//   Eatuser.payment_retry(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// /////hub based userlist
// exports.hub_based_userlist = function(req, res) {
//   Eatuser.hub_based_userlist(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// /////user based notification
// exports.user_based_notification = function(req, res) {
//   Eatuser.user_based_notification(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// /////user based growth report
// exports.user_growth_order_report = function(req, res) {
//   Eatuser.user_growth_order_report(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// /////promotion_homescreen
// exports.promotion_homescreen = function(req, res) {
//   Eatuser.promotion_homescreen(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// exports.zendesk_requestcreate = function(req, res) {
//   if (req.headers) {
//     req.body.app_type = parseInt(req.headers.apptype);
//   }

//   if (req.body.orderid) {
//     req.body.orderid = parseInt(req.body.orderid);
//   }


//   if (req.body.userid) {
//     req.body.userid = parseInt(req.body.userid);
//   }
//   Eatuser.zendesk_request_create(req.body, function(err, user) {
//     if (err) res.send(err);
//     res.json(user);
//   });
// };

// ///Click to call api////
// exports.request_zendesk_ticket = function(req, res) {
//   //console.log("moveitdaywisecyclereport");
//   Eatuser.request_zendesk_ticket(req.body, function(err, result) {
//     if (err) res.send(err);
//     res.json(result);
//   });
// };
