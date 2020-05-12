"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var OrderDeliveryTime = function(orderdeliverytime) {
  this.deliverytime = orderdeliverytime.deliverytime;
  this.duration = orderdeliverytime.duration;
  this.distance = orderdeliverytime.distance ;
  this.orderid = orderdeliverytime.orderid;
};

OrderDeliveryTime.createOrderDeliveryTime = async function createOrderDeliveryTime(req, result) {

    sql.query("INSERT INTO Order_deliverytime  set ?", req, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
        
          let resobj = {
            success: true,
            status : true,
            message: "Deliverytime created successfully"
          };
    
          result(null, resobj);
        }
      });
  
};







module.exports = OrderDeliveryTime;
