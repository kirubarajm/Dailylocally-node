"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Coupon = function(coupon) {
  this.coupon_name = coupon.coupon_name;
  this.active_status = coupon.active_status;
}
//For Admin
Coupon.createCoupon = function createCoupon(req, result) {
 //need to add item missing contion
  req.active_status=0;
      sql.query("INSERT INTO Coupon set ?", req, function(err, res) {
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
Coupon.getAllcoupon_by_activstatus = function getAllcoupon_by_activstatus(active_status,result) {
  sql.query("Select * from Coupon where active_status=?",[active_status], function(err, res) {
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

//Coupon enable/disable - Internal function
Coupon.updateByCouponId = function(cid,active_status) {
  //active_status = 0;
  //useddate = current date
  sql.query(
    "UPDATE Coupon SET active_status=? WHERE cid = ?",
    [active_status, cid],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};


//Admin can remove coupon
Coupon.remove = function(cid, result) {
  sql.query("DELETE FROM Coupon WHERE cid = ? and active_status=1", [cid], function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Coupon.getAllcoupon_by_user = function getAllcoupon_by_user(userid,result) {
    sql.query("Select * from Coupon where active_status=?",[userid], function(err, res) {
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


  Coupon.get_coupons_by_userid =async function get_coupons_by_userid(req,result) {

    var userdetails       = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");

    if (userdetails.length !==0) {
      
      var coupon1tomany   = await query("Select co.*,1 as type from Coupon as co left join Cluster_Coupon_mapping as ccm  on ccm.cid=co.cid where co.active_status= 1 and co.expiry_date > NOW() and ccm.active_status= 1  and ccm.cluid='"+userdetails[0].cluid+"' ");
      var coupon1to1      = await query("Select co.*,2 as type from Coupon as co left join User_coupon_mapping as ccm  on ccm.cid=co.cid where co.active_status= 1 and co.expiry_date > NOW() and ccm.active_status= 1 and ccm.cluid='"+userdetails[0].cluid+"' ");

      coupon1tomany = coupon1tomany.concat(coupon1to1);
   
      if (coupon1tomany.length !== 0 ) {
  
        console.log(coupon1tomany.length);
        var kitchens = await Coupon.getcouponlist(coupon1tomany,req)


      let resobj = {
        success: true,
        status:true,
        result: coupon1tomany
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

    } else {
      let resobj = {
        success: true,
        status:false,
        message: "User Not Found"
      };
      result(null, resobj);
    }
    
  };

  Coupon.get_coupons_by_userid_new =async function get_coupons_by_userid_new(userid,result) {

    var userdetails       = await query("select * from User as us left join Cluster_user_table as uc on uc.userid=us.userid where us.userid = "+req.userid+" ");

    sql.query("Select * from Coupon where active_status= 1 and expiry_date > NOW() ", async function(err, res) {
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


  Coupon.getcouponlist = async function(res,req){

    console.log(res);
    for (let i = 0; i < res.length; i++) {
      req.cid = res[i].cid;
      req.coupon_name = res[i].coupon_name;
      req.numberoftimes = res[i].numberoftimes;
      req.coupon_type = res[i].type;

      var couponinfo = await query("select COUNT(*) as cnt from CouponsUsed where userid=? and cid=? and active_status=1 and coupon_type=?",[req.eatuserid,req.cid,req.coupon_type]);

      if(couponinfo[0].cnt < req.numberoftimes){
       res[i].couponstatus = true;
      }else{
       res[i].couponstatus = false;
      // delete res[i];
     // res.splice(i);
      }

    }
  
  return res
  }
  


  Coupon.coupons_validate_by_userid = async function coupons_validate_by_userid(req,result) {

    sql.query("Select * from Coupon where active_status= 1 and coupon_name = '"+req.coupon_name+"' and expiry_date > NOW() limit 1", async function(err, res) {
      if (err) {
        result(err, null);
      } else {
          if (res.length !== 0 ) {
            sql.query("select COUNT(*) as cnt from CouponsUsed where userid=? and cid=? and active_status=1  ",[req.userid,res[0].cid], function(err, couponinfo) {
              if (err) {
                result(err, null);
              } else {
                  if(couponinfo[0].cnt<res[0].numberoftimes){
                    let resobj = {
                      success: true,
                      status: true,
                      result: res
                    };
                    result(null, resobj);
                  }else{
                  let resobj = {
                    success:true,
                    status: false,
                    result: res,
                    message: "Already Coupons used at maximum number of times"
                  };
                  result(null, resobj);
                  }
              }
            });
            
          }else{

            let resobj = {
              success: true,
              status:false,
              message: "Sorry coupon is not Valid !"
            };
            result(null, resobj);
          }  
      }
    });
  };

module.exports = Coupon;
