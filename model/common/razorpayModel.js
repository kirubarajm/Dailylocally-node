"user strict";
var sql = require("../db.js");
const util = require("util");
const Rpay = require("razorpay");
var constant = require("../constant.js");
var moment = require("moment");
var OrderComments = require("../../model/admin/orderCommentsModel");
var PushConstant = require("../../push/PushConstant.js");
var Notification = require("../../model/common/notificationModel.js");
// var instance = new Rpay({
//     key_id: "rzp_test_3cduMl5T89iR9G",
//     key_secret: "BSdpKV1M07sH9cucL5uzVnol"
//   });

// var instance = new Rpay({
//   key_id: 'rzp_live_BLJVf00DRLWexs',
//   key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
// })

var instance = new Rpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})
  const query = util.promisify(sql.query).bind(sql);


  var Razorpay = function(razorpay) {
    this.orderid = refund.orderid;
    this.original_amt = refund.original_amt;
    this.refund_amt = refund.refund_amt ;
    this.active_status = refund.active_status;
    this.userid =refund.userid;
    this.payment_id =refund.payment_id;
  };
  
// customer id generation

Razorpay.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userinfo) {
    var name = userinfo[0].name;
    var email = userinfo[0].email;
    var contact = userinfo[0].phoneno;
    var notes = "eatuser";
    var cuId = false;
  
    return await instance.customers
      .create({ name, email, contact, notes })
      .then(data => {
        cuId = data.id;
        //  const updateforrazer_customerid = await query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ");
  
        sql.query(
          "UPDATE User SET razer_customerid ='" +
            data.id +
            "'  where userid = " +
            userinfo[0].userid +
            " ",
          function(err, customerupdate) {
            if (err) {
              console.log("error: ", err);
              //  return false;
            }
          }
        );
        console.log("cuId:----- ", cuId);
        return cuId;
      })
      .catch(error => {
        console.log("error: ", error);
        return false;
      });
  };

  // Partial refund for a payment
  Razorpay.razorpay_refund_payment_by_paymentid = async function razorpay_refund_payment_by_paymentid(req,result) {
    
    const onlinerefunddetails = await query("select * from Refund_Online where  rs_id ="+req.rs_id+"");
    const Orderproductsdetails = await query("select * from Orderproducts where  orderid ="+onlinerefunddetails[0].orderid+"");
    const servicecharge = constant.servicecharge;
    if (req.active_status == 1) {
      if (onlinerefunddetails[0].active_status == 0 ) {
      
        //  if (req.amount > servicecharge) {
             
        //   /cancel by ===1 is eat user cancel amount detect
        // if (req.cancel_by && req.cancel_by === 1) {
        //     amount= req.amount - servicecharge;
        // }else{
        //     amount= req.amount;
        // }
        // instance.payments. refund(req.paymentid, {
        // amount: 10,
        //  amount values convert to paisa
        var time = moment().format("YYYY-MM-DD HH:mm:ss");
        var amount= onlinerefunddetails[0].original_amt;
        var refund_amt = onlinerefunddetails[0].original_amt
        instance.payments.refund(req.paymentid,{amount: amount * 100,notes: {note1: 'Refund amount'}}).then((data) => {
       
        // success
        var refunded_by=req.done_by ||0;
        updatequery = "update Refund_Online set active_status= 1,refunded_time='"+time+"',refund_amt = '"+refund_amt+"',payment_id='"+data.id+"',refunded_by = '"+refunded_by+"',cancellation_charges='"+servicecharge+"' where rs_id ='" + req.rs_id + "'"
        
        sql.query(updatequery, async function (err, res) {
            if(err) {
                console.log("error: ", err);
                result(err, null);
               }
             else{  
                
              
          var refund_comments = 'Refunded has been done'
          var New_comments  ={};
          New_comments.doid=Orderproductsdetails[0].doid;
          New_comments.comments=refund_comments
          New_comments.done_by=req.done_by
          New_comments.type=2
          New_comments.done_type=1
          OrderComments.create_OrderComments_crm(New_comments)
    
              
          var orders = await query("select rf.*,us.userid,us.pushid_ios,us.pushid_android from Refund_Online rf left join Orders as ors on ors.orderid=rf.orderid left join User us on us.userid=ors.userid where  rf.rs_id ="+req.rs_id+" " );

          PushConstant.Pageid_dl_refund_create = 10;
          await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_refund_create);

                  var  message = "Amount refunded successfully"
                  let sucobj=true;
                  let resobj = {  
                    success: sucobj,
                    status:true,
                    message:message,
                    result:data,
                    }; 
                 result(null, resobj);
                  }
        }); 
    
      }).catch((error) => {
        console.log("error: ", error);
        let resobj = {
            success: true,
            status: false,
            message:error.error.description//"Sorry! Payment not captured."
        };
        result(null,resobj);
        // error
      })
        }else if (onlinerefunddetails[0].active_status==1) {
        
        var  message = "Sorry your refund amount has been already refunded!"
              
    
                  let resobj = {  
                    success: true,
                    status:false,
                    message:message,
                    result:onlinerefunddetails,
                    }; 
      
                 result(null, resobj);
        }else if (onlinerefunddetails[0].active_status==2) {
        
        var  message = "Sorry your refund Rejected!"
              
                  let resobj = {  
                    success: true,
                    status:false,
                    message:message,
                    result:onlinerefunddetails,
                    }; 
      
                 result(null, resobj);
      }
    } else {
      

      var time = moment().format("YYYY-MM-DD HH:mm:ss");
        var amount= req.amount;
        var refund_amt = req.amount
        // instance.payments.refund(req.paymentid,{amount: amount * 100,notes: {note1: 'Refund amount'}}).then((data) => {
       
        // success
        var refunded_by=req.done_by ||0;
        updatequery = "update Refund_Online set active_status= 2,rejected_time='"+time+"',refunded_by = '"+refunded_by+"'  where rs_id ='" + req.rs_id + "'"
        
        sql.query(updatequery, async function (err, res) {
            if(err) {
                console.log("error: ", err);
                result(err, null);
               }
             else{  
                
              
                    var refund_comments = 'refund rejected'
                    var New_comments  ={};
                    New_comments.doid=Orderproductsdetails[0].doid;
                    New_comments.comments=refund_comments
                    New_comments.done_by=req.done_by
                    New_comments.type=2
                    New_comments.done_type=1
                    OrderComments.create_OrderComments_crm(New_comments)
    
                    var orders = await query("select rf.*,us.userid,us.pushid_ios,us.pushid_android from Refund_Online rf left join Orders as ors on ors.orderid=rf.orderid left join User us on us.userid=ors.userid where  rf.rs_id ="+req.rs_id+" " );
            
                    PushConstant.Pageid_dl_Refund_unapproved_notification = 16;
                    await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_Refund_unapproved_notification);
    
                  var  message = "refund rejected successfully"
            
                  let resobj = {  
                    success: true,
                    status:true,
                    message:message
                    }; 
                 result(null, resobj);
             }
        }); 

     
    }
   
};


//Razorpay Capture Fuction  /**Praveen*/
Razorpay.razorpaycapture = async function razorpaycapture(req, result) {
  /* 
  var payment_id = "pay_DRvQzTw3y9Xeuq";
  var amount   = parseInt(1 * 100);
  instance.payments.capture(payment_id, parseInt(amount))
  */
  var data = JSON.stringify(req);
  console.log(JSON.stringify(req.orderlist[0]));
  console.log(data);
  var insertquery= "insert into Orders_webhook JSONDoc(cancel_reason) values("+JSON.stringify(req.orderlist[0])+")";
  console.log(insertquery);
  const insertwebhooks = await query(insertquery);
  //console.log(insertwebhooks);
  result(null, insertwebhooks);
  /*var orderid = 433;
 const getprice = await query("select price from Orders where orderid ='" +orderid+"'");
 console.log(getprice[0].price);
 */

};

module.exports = Razorpay;