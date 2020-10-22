"use strict";

var Dluser = require("../../model/dluser/DlUserModel");
var constant = require("../../model/constant.js");
var Community = require("../../model/common/CommunityModel");



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

    Dluser.edit_user(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  
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

exports.check_device = function(req, res) {
  Dluser.check_device(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.zendesk_requestcreate = function(req, res) {
  if (req.headers) {
    req.body.app_type = parseInt(req.headers.apptype);
  }

  if (req.body.orderid) {
    req.body.orderid = parseInt(req.body.orderid);
  }


  if (req.body.userid) {
    req.body.userid = parseInt(req.body.userid);
  }
  Dluser.zendesk_request_create(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

///Click to call api////
exports.request_zendesk_ticket = function(req, res) {
  //console.log("moveitdaywisecyclereport");
  Dluser.request_zendesk_ticket(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

exports.faq_by_type = function(req, res) {
  Dluser.faq_by_type(req.params.id, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};

exports.about_us= function(req, res) {
  Dluser.about_us(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};

exports.dl_User_list = function(req, res) {

  Dluser.dl_User_list(req.body, function(err, user) {
    if (err) res.send(err);  
    res.send(user);
  });

};



exports.community_dl_User_list = function(req, res) {
  Dluser.community_dl_User_list(req.body, function(err, user) {
    if (err) res.send(err);  
    res.send(user);
  });

};
exports.dl_user_send_message = function(req, res) {

  Dluser.dl_user_send_message(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};

exports.zendesk_ticket_create = function(req, res) {

  Dluser.zendesk_ticket_check(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });

};



exports.community_search = function(req, res) {
  Community.community_search(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.community_list = function(req, res) {
   if (!req.body.userid) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide userid"
      });
  }else if(!req.body.lat || !req.body.lon){
    res
    .status(400)
    .send({
      error: true,
      status: false,
      message: "Please provide lat/long"
    });
  } else {
  Community.community_list(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
}
};

exports.join_new_community = function(req, res) {
  console.log("1");
  Community.join_new_community(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.join_new_community_v2 = function(req, res) {
  console.log("2");
  req.body.change_address = req.body.change_address || false;

  if (!req.body.comid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide comid" });
  } else if (!req.body.lat) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide lat"
      });
  }else if (!req.body.lon) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide lon"
      });
  } else {
  Community.join_new_community_v2(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
}
};
exports.join_new_community_approval= function(req, res) {
  Community.join_new_community_approval(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.new_community_registration= function(req, res) {
  var new_community = new Community(req.body);
   new_community.request_type= req.body.request_type || 1;
  if (!new_community.requested_userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide requested_userid" });
  } else if (!new_community.communityname) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide communityname"
      });
  } else {
    
    Community.new_community_registration(new_community, function(err, user) {
      if (err) res.send(err);
      res.send(user);
    });
  }
  
};


exports.new_community_registration_v2= function(req, res) {
  // var new_community = new Community(req.body);
  //  new_community.request_type= req.body.request_type || 1;
  //  new_community.change_address= req.body.change_address;
  if (!req.body.requested_userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide requested_userid" });
  } else if (!req.body.communityname) {
    res
      .status(400)
      .send({
        error: true,
        status: false,
        message: "Please provide communityname"
      });
  } else {
    
    Community.new_community_registration_v2(req.body, function(err, user) {
      if (err) res.send(err);
      res.send(user);
    });
  }
  
};

exports.communityuserdetails = function(req, res) {
  Community.get_community_userdetails(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.homepage = function(req, res) {
  Community.get_homepage(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.wapscreen = function(req, res) {
  Community.get_wapscreen(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.admin_community_list = function(req, res) {
 Community.admin_community_list(req.body, function(err, user) {
   if (err) res.send(err);
   res.send(user);
 });

};


exports.community_edit = function(req, res) {
  Community.admin_edit_community(req.body, function(err, user) {
    if (err) res.send(err);  
    res.send(user);
  });

};
exports.user_based_notification = function(req, res) {
  Dluser.user_based_notification(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};