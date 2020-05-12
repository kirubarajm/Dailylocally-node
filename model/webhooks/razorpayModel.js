'user strict';
var sql = require('../db.js');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var razorpayconst = require('../razorpay_constant');
var constant = require('../constant');
var Notification = require('../common/notificationModel');
var PushConstant = require("../../push/PushConstant.js");
var Razorpay = require("razorpay");
var Onlineautorefund = require('../common/Online_autorefundModel.js');
//Task object constructor
var RazorpayWebhook = function(razorpay){
    this.payment_id = razorpay.payment_id || 0;
    this.orderid = razorpay.orderid || 0;
    this.razorpay_response = razorpay.razorpay_response;
    this.amount = razorpay.amount || 0;
    this.payment_type = razorpay.payment_type || 0;
};

var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})

RazorpayWebhook.create_Razorpayresponse = async function create_Razorpayresponse(New_Razorpay) {
  console.log("=============================================> Razorpay Response Insert");
    sql.query("INSERT INTO Razorpay_response  set ?", New_Razorpay, function(err, res) {
        if (err) {
          console.log("error: ", err);
          return(err, null);
        } else {        
          let resobj = {
            success: true,
            status : true,
            message: "Razorpay_response created successfully"
          };    
          return(null, resobj);
        }
    });
};

RazorpayWebhook.order_success_update = async function order_success_update(New_Razorpay) {
  var orderid = New_Razorpay.orderid;
  var selectquery = "select * from  Orders where orderid="+orderid;
  sql.query(selectquery,function(err, res){
    if (err) {
      console.log("error: ", err);
      return(err, null);
    } else { 
      if(res.length >=1){
        if(res && res[0].orderstatus==0 && res[0].payment_type==1 && res[0].payment_status==0 && res[0].transactionid==null && res[0].transaction_status ==null){
          console.log("=============================================> Razorpay Captured");
          var paymentid  = New_Razorpay.payment_id;
          var amount     = New_Razorpay.amount;
          instance.payments.capture(paymentid, parseInt(amount));
          var updatesuccessquery = "update Orders set captured_status=1,payment_status=1,lock_status=0,transactionid='"+New_Razorpay.payment_id+"',transaction_status='success' where orderid="+orderid;
          sql.query(updatesuccessquery,function(err, res1){
            if (err) {
              console.log("error: ", err);
              return(err, null);
            }else{
              Notification.orderEatPushNotification(orderid,null,PushConstant.pageid_eat_razorpay_payment_success);
              let resobj = {
                success: true,
                status : true,
                message: "Order Updated successfully"
              };    
              return(null, resobj);
            }
          });
        }else if((res[0].payment_type ==1 && res[0].payment_status ==1) || (res[0].payment_type ==1 && res[0].payment_status ==2) || res[0].orderstatus==7){
          var paymentid  = New_Razorpay.payment_id;
          var amount     = New_Razorpay.amount;
          instance.payments.capture(paymentid, parseInt(amount)).then((data) => {
            console.log("==================================>refund Init");
            instance.payments.refund(paymentid, {amount: amount, notes: {note1: 'OrderID: '+orderid}}).then((data) =>{
              console.log("====>Refund Date===========>",data);
              var New_OnlineRefund =  {};
              New_OnlineRefund.orderid = orderid;
              New_OnlineRefund.paymentid = data.id;
              Onlineautorefund.create_Onlineautorefund(New_OnlineRefund);
            });
          });
        }else{
          let resobj = {
            success: true,
            status : false,
            message: "Order Already Updated"
          };    
          return(null, resobj);
        } 
      }else{   }          
    }
  });
};

RazorpayWebhook.order_failed_update = async function order_failed_update(New_Razorpay) {
  var orderid = New_Razorpay.orderid;
  var selectquery = "select * from  Orders where orderid="+orderid;
  sql.query(selectquery,function(err, res){
    if (err) {
      console.log("error: ", err);
      return(err, null);
    } else { 
      if(res.length>=1){
        if(res && res[0].orderstatus==0 && res[0].payment_type==1 && res[0].payment_status==0 && res[0].transactionid==null && res[0].transaction_status ==null){
          var updatefailedquery = "update Orders set payment_status=2,transactionid='Canceled',transaction_status='failed' where orderid="+orderid;
          sql.query(updatefailedquery,function(err, res1){
            if (err) {
              console.log("error: ", err);
              return(err, null);
            }else{
              let resobj = {
                success: true,
                status : true,
                message: "Order Updated successfully"
              };    
              return(null, resobj);
            }
          });
        }else{
          let resobj = {
            success: true,
            status : false,
            message: "Order Already Updated"
          };    
          return(null, resobj);
        }
      } else{   }   
    }
  });
};

RazorpayWebhook.webhooks = function webhooks(req, result) {
  console.log("request ------>",req.payload.payment.entity.status);
    switch(req.payload.payment.entity.status){
      case razorpayconst.payment_authorized:
        console.log("=============================================> authorized");
        var New_Razorpay =  {};
        New_Razorpay.payment_id = req.payload.payment.entity.id;
        var stringorderid       = req.payload.payment.entity.description;
        //New_Razorpay.orderid    = stringorderid.slice(9);
        var stringorderidarray  = stringorderid.match(/(\d+)/);
        New_Razorpay.orderid    = stringorderidarray[0];
        New_Razorpay.amount     = req.payload.payment.entity.amount;
        New_Razorpay.razorpay_response = JSON.stringify(req);
        New_Razorpay.payment_type = 1;
        RazorpayWebhook.create_Razorpayresponse(New_Razorpay);
        RazorpayWebhook.order_success_update(New_Razorpay);
        break;
      case razorpayconst.payment_captured:
        console.log("=============================================> captured");
        break;
      case razorpayconst.payment_failed:
        console.log("=============================================> failed");
        var New_Razorpay =  {};
        New_Razorpay.payment_id = req.payload.payment.entity.id;
        var stringorderid       = req.payload.payment.entity.description;
        //New_Razorpay.orderid    = stringorderid.slice(9);
        var stringorderidarray  = stringorderid.match(/(\d+)/);
        New_Razorpay.orderid    = stringorderidarray[0];
        New_Razorpay.amount = req.payload.payment.entity.amount;
        New_Razorpay.payment_type = 2;
        New_Razorpay.razorpay_response = JSON.stringify(req);
        RazorpayWebhook.create_Razorpayresponse(New_Razorpay);
        ////RazorpayWebhook.order_failed_update(New_Razorpay);
        break;
      default:
        console.log("=============================================> No State");
    }
    result(null, req);
};


module.exports= RazorpayWebhook;