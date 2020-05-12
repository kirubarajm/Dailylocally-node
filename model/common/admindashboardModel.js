"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var admindashboardModel = function() {
};

admindashboardModel.get_all_dashboard_count_by_admin = async function get_all_dashboard_count_by_admin(result) {
  
  try {
      var countlist = {};
        //makeit allocated count
        // Select alc.*,mu.address,mu.brandname,mu.email,mu.flatno,mu.appointment_status,mu.name,mu.phoneno,mu.pincode,mu.userid from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid where mu.appointment_status = 1
       // var new_sales_appointment_count = await query("Select count(aid) as count  From Allocation where DATE(booking_date_time) = CURDATE() and status =1"); 
        var new_sales_appointment_count = await query("Select count(aid) as count from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid where mu.appointment_status = 1 and alc.status<6"); 
        countlist.new_sales_appointment_count  = new_sales_appointment_count[0].count;
        //new product count
        var product_approved_count = await query("Select count(productid) as count from Product  where delete_status !=1  and approved_status != 2  and approved_status != 3 "); 
        countlist.product_approved_count  = product_approved_count[0].count;
        //new  new queries
        var  new_queries_count = await query("Select count(qid) as count from Query_questions where admin_read = 0 "); 
        countlist.new_queries_count  = new_queries_count[0].count;
          //new_replies_count
        var  new_replies_count = await query("Select count(aid) as count from Query_answers where admin_read=0"); 
        countlist.new_replies_count  = new_replies_count[0].count;
        //new order count
        var  new_order_count = await query("Select count(orderid) as count from Orders where moveit_user_id = 0 and orderstatus = 1 and cancel_by = 0 and lock_status = 0 and DATE(created_at) = CURDATE() and payment_status!=2"); 
        countlist.new_order_count  = new_order_count[0].count;
        //new order not Accepted count
        var  new_order_kitchen_un_accepted_count = await query("Select count(orderid) as count from Orders where moveit_user_id = 0 and orderstatus = 0 and cancel_by = 0 and lock_status = 0 and DATE(created_at) = CURDATE() and payment_status!=2"); 
        countlist.new_order_kitchen_un_accepted_count  = new_order_kitchen_un_accepted_count[0].count;
        //makeit order count
        var  new_makeit_cancel_order_count = await query("Select count(orderid) as count from Orders where moveit_user_id = 0 and orderstatus = 7 and cancel_by = 2 and DATE(created_at) = CURDATE()"); 
        countlist.order_cancel_count  = new_makeit_cancel_order_count[0].count;
        //unapproved kitchen list
        var  admin_unapproved_kitchen_count = await query("Select count(userid) as count from MakeitUser where ka_status = 1 and virtualkey=0");
        countlist.admin_unapproved_kitchen_count  = admin_unapproved_kitchen_count[0].count;

         //kitchen virtual order count
        var  kitchen_virtual_order_count = await query("Select count(orderid) as count from Orders ors left join MakeitUser mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and ors.orderstatus = 0 and ors.cancel_by = 0 and DATE(ors.created_at) = CURDATE() and mk.virtualkey=1");
        countlist.virtual_kitchen_order_count  = kitchen_virtual_order_count[0].count;

        var  refund_user_count = await query("Select count(rs_id) as count from Refund_Online where active_status=1");
        countlist.refund_user_count  = refund_user_count[0].count;

        let resobj = {  
            success: true,
            status:true,
            result: countlist
          };
          result(null, resobj);
        } catch (error) {
          let resobj = {  
            success: true,
            status:false,
            error: error
          };
          result(null, resobj);
        }
};




module.exports = admindashboardModel;
