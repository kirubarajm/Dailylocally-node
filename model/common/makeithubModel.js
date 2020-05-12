"user strict";
var sql = require("../db.js");
var constant = require("../constant.js");

var MakeitHub = function(hub) {
  this.makeithub_name = hub.makeithub_name;
};

MakeitHub.getAllMakeitHub = function getAllMakeitHub(result) {
  sql.query("Select * from Makeit_hubs", function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status:true,
        hub_radius:constant.hub_radius,
        result: res
      };
      result(null, resobj);
    }
  });
};

module.exports = MakeitHub;
