"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var orderactionlog = function(log) {
  this.orderid = log.orderid;
  this.userid = log.userid;
  this.action = log.action ;
  this.app_type = log.app_type;
};

orderactionlog.createOrderActionLog = async function createOrderActionLog(req, result) {
  console.log("req-->",req);
 
    sql.query("INSERT INTO Orders_action_log  set ?", req, function(err, res) {
        if (err) {
          result(err, null);
          console.log("req err-->",err);
        } else {
          let resobj = {
            success: true,
            status : true,
            message: "Action Record added"
          };
          console.log("resobj-->",resobj);
          result(null, resobj);
        }
      });
};


module.exports = orderactionlog;
