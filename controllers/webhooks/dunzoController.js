"use strict";

var Dunzo = require("../../model/webhooks/dunzoModel.js");

exports.testapi = function(req, res) {
    Dunzo.testingapi(req.body, function(err, dunzo) {
        if (err) res.send(err);
        res.json(dunzo);
      });
    
};

//next state update by moveit
exports.dunzo_nex_state_update = function(req, res) {
  Dunzo.dunzo_nex_state_update_by_taskid(req.body, function(err, dunzo) {
      if (err) res.send(err);
      res.json(dunzo);
    });
  
};

/////dunzo order create
exports.dunzo_task_create= function(req, res) {
  Dunzo.dunzo_task_create(req.body.orderid, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////dunzo order create
exports.dunzo_task_cancel= function(req, res) {
  Dunzo.dunzo_task_cancel(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};

/////dunzo task cancel
exports.dunzo_track_status= function(req, res) {
  Dunzo.dunzo_track_status(req.body, function(err, result) {
    if (err) res.send(err);
    res.json(result);
  });
};