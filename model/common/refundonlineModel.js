"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
const { json } = require("body-parser");
var RefundOnline = function(refund) {
  this.orderid = refund.orderid;
  this.original_amt = refund.original_amt;
  this.refund_amt = refund.refund_amt ;
  this.active_status = refund.active_status ||0;
  this.userid =refund.userid;
  this.payment_id =refund.payment_id;
  this.refund_image=refund.refund_image;
  this.refund_reason=refund.refund_reason;
  this.refunded_by= refund.refunded_by;
  this.doid=refund.doid;
  this.refund_delivery_charge=refund.refund_delivery_charge 

};

RefundOnline.createRefund = async function createRefund(req, result) {

  const orderrefunddetails = await query("select * from Refund_Online where orderid ='" + req.orderid + "' and active_status=0 order by rs_id desc  limit 1");

  if (orderrefunddetails.length ==0) {
    sql.query("INSERT INTO Refund_Online set ?",req,async function(err, res1) {
      if (err) result(true, null);
      else {

      // let response = {
      //     success: true,
      //     status: true,
      //     message : "refund online created successfully"
      // };
      
      // result(null, response);
      }
  });
  
}else{

  var update_query = "Update Refund_Online set refund_amt='"+ req.refund_amt+"',refunded_by='"+req.refunded_by+"',doid='"+req.doid+"',refund_delivery_charge='"+req.refund_delivery_charge+"' where orderid ='" + req.orderid + "' "
  
  var update = await query(update_query);
 
}
};





RefundOnline.get_all_refunds = function get_all_refunds(req, result) {

  var pagelimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * pagelimit;
  var where = "";
  if(req.starting_date && req.end_date){
    var end_date = moment(req.end_date).add(1, "days").format("YYYY-MM-DD");
    where = where+" and  (rf.created_at BETWEEN '"+req.starting_date +"' AND '"+end_date+"')";

}

// if(Dayorder.slot==1){
//   where = where+" and HOUR(time(drs.order_place_time))<=19 ";
// }else if(Dayorder.slot==2){
// where = where+" and HOUR(time(drs.order_place_time))>=19 ";
// } 


    if(req.doid){
      where = where+" and rf.doid="+req.doid;
    }

    if(req.userid){
    where = where+" and rf.userid="+req.userid;
    }

    if (req.search) {

      where = where+" and (us.phoneno like '%"+req.search+"%' or us.userid like '%"+req.search+"%' or us.name like '%"+req.search+"%') ";
    }

  where= where+ "  group by rf.orderid order by active_status=0 DESC,created_at DESC limit " +startlimit +"," +pagelimit +" " 

  var refund_list = "select rf.*,ors.userid,ors.created_at as order_created_time,au.name as adminname,us.name,us.phoneno,us.email,if(rf.active_status=0,'Waiting for refund',if(rf.active_status=1,'Refunded','Rejected')) as status_message,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'refund_status',orp.refund_status,'refund_status_msg',if(orp.refund_status=0,'Not refunded',if(orp.refund_status=1,'Refund requested','Refunded')))) AS products   from Refund_Online rf left join Orders as ors on ors.orderid = rf.orderid  left join Admin_users au on au.admin_userid=rf.refunded_by  left join User as us on us.userid=ors.userid join Dayorder_products orp on orp.orderid=rf.orderid where ors.zoneid="+req.zoneid+" and orp.refund_status !=0 "+where+"  "

  sql.query(refund_list,async function(err, res) {
    if (err) result(err, null);
    else {
      for (let i = 0; i < res.length; i++) {
        res[i].products = JSON.parse(res[i].products);
        
      }

      const listcount = await query("select rf.*,ors.userid,au.name as adminname,if(rf.active_status=0,'Waiting for refund',if(rf.active_status=1,'Refunded','Rejected')) as status_message,us.name,us.phoneno,us.email from Refund_Online rf left join Orders as ors on ors.orderid = rf.orderid  left join Admin_users au on au.admin_userid=rf.refunded_by left join User as us on us.userid=ors.orderid  order by active_status DESC,created_at DESC ")
      let response = {
        success: true,
        status: true,
        pagelimit:pagelimit,
        totalcount : listcount.length,
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