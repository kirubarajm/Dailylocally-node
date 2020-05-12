"user strict";
var sql = require("../db.js");

//Task object constructor
var Forcedeliverylogs = function(forcedeliverylogs) {
  this.orderid = forcedeliverylogs.orderid;
  this.moveit_userid=forcedeliverylogs.moveit_userid;
  this.admin_id=forcedeliverylogs.admin_id;
  this.reason=forcedeliverylogs.reason;
};

Forcedeliverylogs.createForcedeliverylogs = function createForcedeliverylogs(req, result) {
  sql.query("INSERT INTO Force_delivery_logs  set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      
      let resobj = {
        success: true,
        status : true,
        message: "Force_delivery_logs created successfully"
        
      };

      result(null, resobj);
    }
  });
};



module.exports = Forcedeliverylogs;
