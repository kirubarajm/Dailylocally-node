"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

  var Ordersqueue = function(ordersqueue) {
    this.orderid = ordersqueue.orderid;
    this.hubid = ordersqueue.hubid;
    this.status = ordersqueue.status;
    this.zoneid = ordersqueue.zoneid;
    this.dunzo_req_count=ordersqueue.dunzo_req_count ||0;
  };

  Ordersqueue.createOrdersqueue=async function createOrdersqueue(Ordersqueue, result) {

    var orderdetails = await query("select * from Orders_queue where orderid = '"+Ordersqueue.orderid+"'");
    
    if (orderdetails.length ==0) {
      sql.query("INSERT INTO Orders_queue set ?", Ordersqueue, function(err, res) {
        if (err) {
          res(err, null);
        } else {
          //var Ordersqueueid = result.insertId;
       
          let resobj = {
            success: true,
            status : true,
            message: "Orders queue Created successfully",
      
          };
          result(null, resobj);
        }
      });
    }else{
      let resobj = {
        success: true,
        status : true,
        message: "Already exitst",
  
      };
      result(null, resobj);
    }
    
  };

  module.exports = Ordersqueue;