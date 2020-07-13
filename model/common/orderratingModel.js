"user strict";
var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Orderrating = function(orderrating) {
  this.rating_product = orderrating.rating_product;
  this.rating_delivery = orderrating.rating_delivery;
  this.order_package = orderrating.order_package;
  this.product_received = orderrating.product_received ||'';
  this.doid = orderrating.doid;
  this.vpid = orderrating.vpid;
  this.comments = orderrating.comments;
  this.package_sealed=orderrating.package_sealed;
};

Orderrating.createOrderrating = function createOrderrating(Order_rating,new_vpid,result) {
  sql.query(
    "Select * from day_order_rating where doid = '" + Order_rating.doid + "'",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length === 0) {

          for (let i = 0; i < new_vpid.length; i++) {

            var new_rating = new Orderrating(Order_rating);
            new_rating.vpid=new_vpid[i];
    
            sql.query("INSERT INTO day_order_rating set ?", new_rating, function(err,res) {
              if (err) {
                result(err, null);
              } else {

          
                let resobj = {
                  success: true,
                  status: true,
                  message: "Thanks for your Order Rating"
                };
                result(null, resobj);
              }
            });
            
          }
         
        } else {
          let resobj = {
            success: true,
            status: false,
            message:  "Already order rating completed",
            result: res
          };
          result(null, resobj);
        }
      }
    }
  );
};


Orderrating.day_order_rating_check =async function day_order_rating_check(Order_rating,result) {

 get_day_details = await query("select * from Dayorder WHERE userid='"+Order_rating.userid +"'  and dayorderstatus=0 order by id desc limit 1");

if (get_day_details.length !==0) {

  get_day_details[0].rating_skip_available = 2;
  res = await query("Select * from day_order_rating where doid = '" + get_day_details[0].id + "'");

  if (res.length == 0) {      
        
    let resobj = {
      success: true,
      status: false,
      rating_status:true,
      message:  "Please completed rating",
      title : 'How was the rating?',
      result: get_day_details
    };
    result(null, resobj);
   
  } else {

    let resobj = {
      success: true,
      status: true,
      rating_status: false,
      message:  "Already order rating completed",
      title : 'how was the rating?',
      result: get_day_details
    };
    result(null, resobj);
  }
} else {
  let resobj = {
    success: true,
    status: false,
    message:  "day orders not found",
   
  };
  result(null, resobj);
}
  
  
};

module.exports = Orderrating;
