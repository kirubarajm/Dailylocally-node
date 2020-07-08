"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var RefundOnline = function(refund) {
  this.orderid = refund.orderid;
  this.original_amt = refund.original_amt;
  this.refund_amt = refund.refund_amt ;
  this.active_status = refund.active_status;
  this.userid =refund.userid;
  this.payment_id =refund.payment_id;

};

RefundOnline.createRefund = async function createRefund(req, result) {

  const orderrefunddetails = await query("select * from Refund_Online where doid ='" + req.doid + "' and active_status=0");

  if (orderrefunddetails.length===0) {
    sql.query("INSERT INTO Refund_Online set ?",req,async function(err, res1) {
      if (err) result(true, null);
      else {

      let response = {
          success: true,
          status: true,
          message : "refund online created successfully"
      };
      
      result(null, response);
      }
  });
  
}else{
  let resobj = {
    success: true,
    status:false,
    message: "Sorry Refund online Already exist for following order! Please check once again"
  };
  result(resobj,null);
}
};





RefundOnline.get_all_refunds = function get_all_refunds(req, result) {
  sql.query("select rf.*,ors.userid,au.name as adminname from Refund_Online rf left join Dayorder as ors on ors.id = rf.doid  left join Admin_users au on au.admin_userid=rf.refunded_by  order by active_status DESC,created_at DESC", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

RefundOnline.get_unsuccess_refunds = function get_unsuccess_refunds(req,result) {
  sql.query("select * from Refund_Online Where status = 0", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

RefundOnline.get_success_refunds = function get_success_refunds(req, result) {
  sql.query("select * from Refund_Online Where status = 1", function(err, res) {
    if (err) result(err, null);
    else {
      let response = {
        success: true,
        status: true,
        result: res
      };
      result(null, response);
    }
  });
};

module.exports = RefundOnline;