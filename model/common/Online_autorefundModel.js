"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var Onlineautorefund = function(onlineautorefund) {
  this.orderid    = onlineautorefund.orderid || 0;
  this.paymentid  = onlineautorefund.paymentid;
};

Onlineautorefund.create_Onlineautorefund = async function create_Onlineautorefund(new_Onlineautorefund) {
  sql.query("INSERT INTO Online_autorefund  set ?", new_Onlineautorefund, function(err, res) {
    if (err) {
      console.log("error: ", err);
      return err;
    } else {        
      let resobj = {
        success: true,
        status : true,
        message: "Online auto refund created successfully"
      };  
      
      return resobj;
     // result(null, resobj);
    }
  });
};

module.exports = Onlineautorefund;