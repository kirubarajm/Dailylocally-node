"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var Customeridresponse = function(customeridresponse) {
  this.userid = customeridresponse.userid || 0;
  this.razorpay_response=customeridresponse.razorpay_response || 0;
  this.statuscode=customeridresponse.statuscode || 0;
};

Customeridresponse.create_Customeridresponse = async function create_Customeridresponse(Customeridresponse, result) {

    sql.query("INSERT INTO Razorpay_customerid_response  set ?", Customeridresponse, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
        
          let resobj = {
            success: true,
            status : true,
            message: "Customerid response created successfully"
          };
    
          result(null, resobj);
        }
      });
  
};







module.exports = Customeridresponse;
