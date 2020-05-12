"use strict";

var Salesuser = require("../../model/sales/salesUserModel.js");
var Makeitrating = require("../../model/makeit/makeitRatingModel.js");
var Makeitapproved = require("../../model/makeit/makeitApprovedModel.js");

exports.list_all_user = function(req, res) {
  Salesuser.getAllUser(function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.create_a_user = function(req, res) {
  var new_user = new Salesuser(req.body);
  //handles null error
  if (!new_user.name) {
    res.status(400).send({ error: true, message: "Please provide name " });
  } else if (!new_user.phoneno) {
    res.status(400).send({ error: true, message: "Please provide phoneno" });
  } else if (!new_user.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else {
    Salesuser.createUser(new_user, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.read_a_user = function(req, res) {
  Salesuser.getUserById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_a_user = function(req, res) {
  Salesuser.updateById(req.params.userid, new Salesuser(req.body), function(
    err,
    user
  ) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.delete_a_user = function(req, res) {
  Salesuser.remove(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json({ message: "Salesuser successfully deleted" });
  });
};

exports.checklogin = function(req, res) {
  var new_user = new Salesuser(req.body);
  Salesuser.checkLogin(new_user, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.create_a_rating = function(req, res) {
  var new_rating = new Makeitrating(req.body);
  //handles null error
  if (
    !new_rating.makeit_userid ||
    !new_rating.rating ||
    !new_rating.sales_emp_id
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide makeit_userid/rating/sales_emp_id"
      });
  } else {
    Makeitrating.createRating(new_rating, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.makeit_approved = function(req, res) {
  var approvedState = new Makeitapproved(req.body);
  if (
    !approvedState.makeit_userid ||
    !approvedState.sales_emp_id
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide makeit_userid/sales_emp_id"
      });
  } else {
    Makeitapproved.makeitApprovedUpdate(approvedState, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.admin_makeit_approved = function(req, res) {
  if (
    !req.body.makeit_userid ||
    !req.body.admin_id
  ) {
    res
      .status(400)
      .send({
        error: true,
        message: "Please provide makeit_userid/admin_id"
      });
  } else {
    Makeitapproved.admin_makeitApprovedUpdate(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.get_makeit_kitchen_info = function(req, res) {
  Salesuser.getMakeitkitchenInfo(req.params.makeit_userid, function(err, kitcheninfo) {
    if (err) res.send(err);
    res.json(kitcheninfo);
  });
};

exports.get_makeit_user_document = function(req, res) {
  Salesuser.getMakeitUserDocument(req.params.makeit_userid, function(err, kitcheninfo) {
    if (err) res.send(err);
    res.json(kitcheninfo);
  });
};

exports.get_makeit_kitchen_document = function(req, res) {
  Salesuser.getMakeitKitchenDocument(req.params.makeit_userid, function(err, kitcheninfo) {
    if (err) res.send(err);
    res.json(kitcheninfo);
  });
};

exports.get_sales_makeit_rating = function(req, res) {
  Makeitrating.getSalesMakeitRating(req.params.makeit_userid, function(err, kitcheninfo) {
    if (err) res.send(err);
    res.json(kitcheninfo);
  });
};

exports.get_kitchen_info = function(req, res) {
  Salesuser.getkitchenInfo(req.params.makeit_userid, function(err, kitcheninfo) {
    if (err) res.send(err);
    res.json(kitcheninfo);
  });
};

exports.salesSearch = function(req, res) {
  console.log("salesSearch_V1");
  Salesuser.getAllsalesSearch(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.salesSearch_V2 = function(req, res) {
  console.log("salesSearch_V2");
  Salesuser.getAllsalesSearch(req.body, function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.edit_a_user = function(req, res) {
  //handles null error
  if (!req.body.id) {
    res.status(400).send({ error: true, message: "Please provide sales id" });
  } else {
    Salesuser.edit_sales_users(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};


exports.add_a_pushid = function(req, res) {
  Salesuser.update_pushid(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};


exports.Salesuser_send_otp_byphone = function(req, res) {
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
    Salesuser.Salesuser_send_otp_byphone(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};

exports.sales_user_otp_verification = function(req, res) {
  if (!req.body.oid) {
    res.status(400).send({ error: true,status:false, message: "Please provide oid " });
  } else if (!req.body.otp) {
    res.status(400).send({ error: true,status:false, message: "Please provide otp" });
  } else {
    Salesuser.sales_user_otpverification(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
  }
};


exports.sales_app_version_check_vid = function(req, res) {
  
  Salesuser.sales_app_version_check_vid(req.body, function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });

};

exports.Salesuser_logout = function(req, res) {
  //var new_user = new Eatuser(req.body);
  //handles null error
  if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    Salesuser.Salesuser_logout(req.body, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

//Sales Customer Support
exports.sales_customer_support = function(req, res) {
  Salesuser.sales_app_customer_support(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};