"user strict";

var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var constant = require("../constant.js");

var RefundCoupon = function(refund_coupon) {
  this.orderid = refund_coupon.orderid;
  this.refund_used_orderid = refund_coupon.refund_used_orderid;
  this.rcoupon =refund_coupon.rcoupon;
  this.refundamount =refund_coupon.refundamount;
  this.active_status =refund_coupon.active_status;
  this.userid =refund_coupon.userid;
  this.refund_balance =refund_coupon.refund_balance;
  this.refund_used_date_time =refund_coupon.refund_used_date_time;
};

//For Admin
RefundCoupon.createRefundCoupon = async function createRefundCoupon(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status=1");
  console.log(orderrefunddetails.length);
  if (orderrefunddetails.length === 0) {
   
  sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
     
      var price = res[0].price;
      var refundamount = res[0].refund_amount;
      
      req.active_status = 1;
      req.userid = res[0].userid;

      if (res[0].payment_status === 1) {
        req.refund_balance = price + refundamount;
        req.refundamount = price + refundamount;
      }else{
         req.refund_balance = refundamount;
        req.refundamount = refundamount;
      }
     
      
     
     // refund coupon
      req.rcoupon ="Refund"+req.refundamount;
    
      console.log(req.rcoupon);
  
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      
      };
    });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};

//For user
RefundCoupon.createRefundCoupon_by_id = async function createRefundCoupon_by_id(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status=1");
  console.log(orderrefunddetails.length);
  if (orderrefunddetails.length === 0) {
   
  sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid],async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
     
      var price = res[0].price;
      var refundamount = res[0].refund_amount;
      
      req.active_status = 1;
      req.userid = res[0].userid;

      if (res[0].payment_status === 1) {
        req.refund_balance = price + refundamount;
        req.refundamount = price + refundamount;
      }else{
         req.refund_balance = refundamount;
        req.refundamount = refundamount;
      }
     
      
      if (res[0].refund_amount < constant.servicecharge) {
        
        updatequery = await query("update Orders set cancel_charge = "+res[0].refund_amount+" where orderid ="+req.orderid+" ");

        let resobj = {
          success: true,
          status:true,
          message: "RefundCoupon created successfully"
        };
        result(null, resobj);

      }else if(res[0].refund_amount > constant.servicecharge) {

        req.refund_balance =  req.refund_balance - constant.servicecharge;
        req.refundamount =  req.refundamount - constant.servicecharge;

        updatequery = await query("update Orders set cancel_charge = "+constant.servicecharge+" where orderid ="+req.orderid+" ");

      

     // refund coupon
      req.rcoupon ="Refund"+req.refundamount;
    
      console.log(req.rcoupon);
  
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      }
      };
    });
  
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};

RefundCoupon.createRefundCoupon_admin = async function createRefundCoupon_admin(req, result) {

  console.log("ddd:"+req.orderid);

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status = 1");
  console.log(orderrefunddetails.length);
  if (orderrefunddetails.length === 0) {
   
  sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
     
      var price = res[0].price;
      var refundamount = res[0].refund_amount;
      
      req.active_status = 1;
      req.userid = res[0].userid;

      if (res[0].payment_status === 1) {
        req.refund_balance = price + refundamount;
        req.refundamount = price + refundamount;
      }else{
         req.refund_balance = refundamount;
        req.refundamount = refundamount;
      }
     
     // refund coupon
      req.rcoupon ="Refund"+req.refundamount;
    

  
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      
      };
    });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};
//online user paid and used refund coupon amount so after he cancel order . so create refund again
RefundCoupon.create_Refund_Coupon_online_orders = async function create_Refund_Coupon_online_orders(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status = 1");
 
  if (orderrefunddetails.length === 0) {
   
  sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      
      req.active_status = 1;
      req.refund_balance = res[0].refund_amount;
      req.refundamount = res[0].refund_amount;
      
     
     // refund coupon
      req.rcoupon ="Refund"+req.refundamount;
    
      console.log(req);
  
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      
      };
    });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};


//online user paid and used refund coupon amount so after he cancel order . so detect the serivice charge
RefundCoupon.create_Refund_Coupon_online_orders_servicecharge = async function create_Refund_Coupon_online_orders_servicecharge(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status = 1");
 
  if (orderrefunddetails.length === 0) {
   
  sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      
      res[0].refund_amount = res[0].refund_amount - constant.servicecharge; 
      req.active_status = 1;
      req.refund_balance = res[0].refund_amount;
      req.refundamount = res[0].refund_amount;
     // req.cancel_charge = constant.servicecharge
      
     
     // refund coupon
      req.rcoupon ="Refund"+req.refundamount;
    
      sql.query("INSERT INTO Refund_Coupon set ?", req,async function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
         

            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      
      };
    });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};


RefundCoupon.create_Refund_Coupon_online_orders_common = async function create_Refund_Coupon_online_orders_common(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status = 1");
 
  if (orderrefunddetails.length === 0) {
 
      req.active_status = 1;
   
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      
    
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};


//online order paid and used refund amount . and total amount was too low comparing serivce charge so summ of price and refundamount and defetect service charge
RefundCoupon.create_Refund_Coupon_by_totalamount_servicecharge = async function create_Refund_Coupon_by_totalamount_servicecharge(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status=1");
  console.log(orderrefunddetails.length);
  if (orderrefunddetails.length === 0) {
   
  sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
     
      var price = res[0].price;
      var refundamount = res[0].refund_amount;
      
      req.active_status = 1;
      req.userid = res[0].userid;

      if (res[0].payment_status === 1) {
        req.refund_balance = price + refundamount;
        req.refundamount = price + refundamount;
      }else{
         req.refund_balance = refundamount;
        req.refundamount = refundamount;
      }
     
      req.refundamount = req.refundamount - constant.servicecharge;
     // refund coupon
      req.rcoupon ="Refund"+req.refundamount;
    
      console.log(req.rcoupon);
  
      sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
           
            let resobj = {
              success: true,
              status:true,
              message: "RefundCoupon created successfully"
            };
            result(null, resobj);
          }
        });
      
      };
    });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};



//For Admin
RefundCoupon.getAllrefundcoupon_by_activstatus = function getAllrefundcoupon_by_activstatus(active_status,result) {
  sql.query("Select * from Refund_Coupon where active_status=?",[active_status], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
 
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

//For EAT user to show in Order page
RefundCoupon.getarefundcoupon_by_userid = function getarefundcoupon_by_userid(userid,result) {
  console.log("userid: ", userid);
  sql.query("Select * from Refund_Coupon where userid=? and active_status=1 ORDER BY created_at DESC ",[userid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
     
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};


//Once Eatuser use this RefundCoupon - Internal function
RefundCoupon.updateByRefundCouponId = async function(rcid,refund_balance,refund_used_orderid,result) {
  //active_status = 0;
  //useddate = current date
  var useddate=new Date();
  console.log(rcid);

  return await query(
    "UPDATE Refund_Coupon SET active_status=0,refund_used_date_time=?, refund_used_orderid=?, refund_balance=? WHERE rcid = ?",
    [useddate,refund_used_orderid,refund_balance,rcid]);
  // sql.query(
  //   "UPDATE Refund_Coupon SET active_status=0,refund_used_date_time=?, refund_used_orderid=?, refund_balance=? WHERE rcid = ?",
  //   [useddate,refund_used_orderid,refund_balance,rcid],
  //   function(err, res) {
  //     if (err) {
  //       console.log("error: ", err);
        
  //     } else {
  //       let resobj = {
  //         success: true,
  //         result: res
  //       };
  //       result(null, resobj);
  //     }
  //   }
  // );
};


//Admin can remove refund coupon for userid if it only open
RefundCoupon.remove = function(rcid, result) {
  sql.query("DELETE FROM Refund_Coupon WHERE rcid = ? and active_status=1", [rcid], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};


RefundCoupon.createRefundCoupon_by_tunnel_user = async function createRefundCoupon_by_tunnel_user(req, result) {

  const orderrefunddetails = await query("select * from Refund_Coupon where orderid =" + req.orderid + " and active_status=1");
  console.log(orderrefunddetails.length);
  if (orderrefunddetails.length === 0) {
     // refund coupon
     req.rcoupon ="Refund"+req.refundamount;
     req.active_status = 1;
     console.log(req);
 
     sql.query("INSERT INTO Refund_Coupon set ?", req, function(err, res) {
         if (err) {
           result(err, null);
         } else {
          
           let resobj = {
             success: true,
             status:true,
             message: "RefundCoupon created successfully"
           };
           result(null, resobj);
         }
       });
  // sql.query("Select userid,price,refund_amount,payment_status,orderstatus,lock_status from Orders where orderid=? ",[req.orderid], function(err, res) {
  //   if (err) {
  //     console.log("error: ", err);
  //     result(null, err);
  //   } else {
     
  //     var price = res[0].price;
  //     var refundamount = res[0].refund_amount;
      
  //     req.active_status = 1;


  //     // if (res[0].payment_status === 1) {
  //     //   req.refund_balance = price + refundamount;
  //     //   req.refundamount = price + refundamount;
  //     // }else{
  //     //    req.refund_balance = refundamount;
  //     //   req.refundamount = refundamount;
  //     // }
     
      
     
    
      
  //     };
  //   });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry RefundCoupon Already exist for following order! Please check once again"
    };
    result(null, resobj);
  }

};

module.exports = RefundCoupon;
