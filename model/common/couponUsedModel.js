"user strict";

var sql = require("../db.js");

var CouponUsed = function(couponused) {
  this.cid = couponused.cid;
  this.order_cost =couponused.order_cost;
  this.after_discount_cost =couponused.after_discount_cost;
  this.orderid =couponused.orderid;
  this.userid =couponused.userid;
  this.active_status = couponused.active_status || 1;
}


CouponUsed.createCouponUsed= function createCouponUsed(req, result) {
  //need to add item missing contion
       sql.query("INSERT INTO CouponsUsed set ?", req, function(err, res) {
           if (err) {
             result(err, null);
           } else {
            var cuid = res.insertId;
             let resobj = {
               success: true,
               status:true,
               cuid: cuid
             };
             result(null, resobj);
           }
         });
       
 };
 

CouponUsed.CheckCoupon = function CheckCoupon(cid,userid,orderCost) {
    var discount_cost=0;
    if(cid==1) 
    {
        discount_cost = firstOrderCoupon(orderCost,userid,cid);
    }     
};
  
//cid=1
CouponUsed.firstOrderCoupon = function firstOrderCoupon(orderCost,userid,cid) {
    //Number of coupons- 5 per user
    //Max discount - 100 inr
    //10 percent per order

    var NumberOfTimes=5;
    var MaxDiscount=100;
    var Percent=10/100;
    var discountCost=0;
    sql.query("select COUNT(*) as cnt from CouponUsed where userid=? and cid=? ",[userid,cid], req, function(err, res) {
        if (err) {
          result(err, null);
        } else {
            if(res[0].cnt<NumberOfTimes)
            {
                if((orderCost * Percent)>=MaxDiscount)
                discountCost = orderCost -  MaxDiscount;
                else
                discountCost = orderCost -  (orderCost * Percent);
            }
            else
            {
            
            let resobj = {
              success: true,
              status:false,
              message: "Already Coupons used at maximum number of times"
            };
            result(null, resobj);
            }
        }
      });
};
  


//Admin can remove coupon
CouponUsed.remove_coupon_by_userid = function remove_coupon_by_userid(req, result) {
 // var deletequery = "delete from CouponsUsed where cid = "+req.cid+" and userid = "+req.userid+" and orderid ="+req.orderid+"  order by cuid desc limit 1";
 var updatequery = "update CouponsUsed set active_status = 2 where cid = "+req.cid+" and userid = "+req.userid+" and orderid ="+req.orderid+" ";

  sql.query(updatequery, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Coupons remove_coupon_by_userid"
      };
      result(null, resobj);
    }
  });
};
  module.exports = CouponUsed;