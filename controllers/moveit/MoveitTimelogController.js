"use strict";

var MoveitTimelog = require("../../model/moveit/moveitTimeModel");


exports.list_all_MoveitTimelog = function(req, res) {
    MoveitTimelog.getAllMoveitTimelog(function(err, user) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", user);
    res.send(user);
  });
};

exports.createMoveitTimelog_by_id = function(req, res) {
 
  var new_MoveitTimelog = new MoveitTimelog(req.body);

  if (!new_MoveitTimelog.moveit_userid) {
    res.status(400).send({ error: true,status:false, message: "Please provide moveit_userid " });
  } else if (!new_MoveitTimelog.lat) {
    res.status(400).send({ error: true, status:false, message: "Please provide lat" });
  } else if (!new_MoveitTimelog.lon) {
    res.status(400).send({ error: true, status:false, message: "Please provide lon" });
  } else {
    MoveitTimelog.createMoveitTimelog(new_MoveitTimelog, function(err, new_MoveitTimelog) {
      if (err) res.send(err);
      res.json(new_MoveitTimelog);
    });
  }
};

