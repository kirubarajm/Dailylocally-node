"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Promotion = function(promotion) {
  this.coupon_name = promotion.coupon_name;
  this.active_status = promotion.active_status;
}
//For Admin
Promotion.createPromotion = function createPromotion(req, result) {
 //need to add item missing contion
  req.active_status=0;
      sql.query("INSERT INTO Promotion set ?", req, function(err, res) {
          if (err) {
            result(err, null);
          } else {
            let resobj = {
              success: true,
              status:true,
              message: "Coupon created successfully"
            };
            result(null, resobj);
          }
        });
      
};

//For Admin
Promotion.getAllPromotion_by_activstatus = function getAllPromotion_by_activstatus(active_status,result) {
  sql.query("Select * from Promotion where active_status=?",[active_status], function(err, res) {
    if (err) {
      result(err, null);
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


Promotion.getAllPromotion_by_user = function getAllPromotion_by_user(userid,result) {
    sql.query("Select * from Promotion where active_status=?",[userid], function(err, res) {
      if (err) {
        result(err, null);
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


Promotion.get_Promotion_by_userid = function get_Promotion_by_userid(req,result) {

    sql.query("Select * from Promotion where active_status= 1 and expiry_date > NOW() order by pid desc limit 1", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

      
          if (res.length !== 0 ) {

             // var kitchens =   await Coupon.getcouponlist(res,req)
             res[0].show_status = true;
            res[0].full_screen = false

            let resobj = {
              success: true,
              status:true,
              result: res
            };
            result(null, resobj);
      
          }else{

            let resobj = {
              success: true,
              status:false,
              message: "Sorry there is no coupon",
              result: res
            };
            result(null, resobj);
          }  
      }
    });
};


Promotion.get_Promotion_by_userid_new = function get_Promotion_by_userid_new(eatuserid,result) {

    sql.query("Select * from Promotion where active_status= 1 and expiry_date > NOW() ", async function(err, res) {
      if (err) {
        result(err, null);
      } else {

          var req = {};

          req.eatuserid = eatuserid;

          if (res.length !== 0 ) {

              var kitchens =   await Coupon.getcouponlist(res,req)


            let resobj = {
              success: true,
              status:true,
              result: res
            };
            result(null, resobj);
      
          }else{

            let resobj = {
              success: true,
              status:false,
              message: "Sorry there is no coupon"
            };
            result(null, resobj);
          }  
      }
    });
};




module.exports = Promotion;
