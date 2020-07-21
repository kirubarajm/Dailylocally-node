"use strict";

var UserAddress = require("../../model/dluser/DlUserAddressModel.js");

exports.list_all_address = function(req, res) {
  UserAddress.getAllAddress(function(err, user) {
  if (err) res.send(err);
  res.send(user);
  });
};

exports.create_a_address = function(req, res) {
  var new_address = new UserAddress(req.body);
  //handles null error
  if (!new_address.lat || !new_address.lon) {
    res.status(400).send({ error: true, message: "Please provide lat/lon" });
  } else {
    UserAddress.createUserAddress(new_address, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

exports.read_a_user_address_userid = function(req, res) {
  UserAddress.getaddressById(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.read_a_user_address_aid = function(req, res) {
  UserAddress.getaddressByaid(req.params.aid, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.update_a_user_address = function(req, res) {

  if (!req.body.lat || !req.body.lon) {
    res.status(400).send({ error: true, message: "Please provide lat/lon" });
  } else {
  UserAddress.updateById(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
}
};


exports.checkaddress = function(req, res) {
  if (!req.body.lat || !req.body.lon) {
    res.status(400).send({ error: true, message: "Please provide lat/lon" });
  } else {
  UserAddress.check_address(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
}
};


exports.delete_a_user_address = function(req, res) {
  UserAddress.remove(req.params.userid, function(err, user) {
    if (err) res.send(err);
    res.json({ message: "Eatuser successfully deleted" });
  });
};

exports.update_delete_status = function(req, res) {
  UserAddress.update_delete_status(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.get_a_admin_address = function(req, res) {
  UserAddress.getaddressByadmin(req.params, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.user_default_address_update = function(req, res) {
  if (!req.body.aid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide aid" });
  } else if (!req.body.userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide userid" });
  } else {
    UserAddress.user_default_address_update_aid(req.body, function(
      err,
      user
    ) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};

