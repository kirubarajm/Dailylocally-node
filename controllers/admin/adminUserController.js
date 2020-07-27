"use strict";

var adminUser = require("../../model/admin/adminUserModel.js");

exports.getAllUser = function(req, res) {
    adminUser.getAllUser(req.body,function(err, user) {
    if (err) res.send(err);
    res.send(user);
  });
};

exports.create_a_user = function(req, res) {
  var new_user = new adminUser(req.body);
  //handles null error
  if (!new_user.name) {
    res.status(400).send({ error: true, message: "Please provide name" });
  } else if (!new_user.password) {
    res.status(400).send({ error: true, message: "Please provide password" });
  } else {
    adminUser.createUser(new_user, function(err, user) {
      if (err) res.send(err);
      res.json(user);
    });
  }
};



exports.login = function(req, res) {
    adminUser.login(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.user_details = function(req, res) {
  adminUser.user_details(req.body, function(err, user) {
  if (err) res.send(err);
  res.json(user);
});
};
exports.logout = function(req, res) {
    adminUser.logout(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

exports.updatePushToken = function(req, res) {
    adminUser.updatePushidByToken(req.body, function(err, user) {
    if (err) res.send(err);
    res.json(user);
  });
};

