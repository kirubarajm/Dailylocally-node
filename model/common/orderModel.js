"user strict";
var sql = require("../db.js");
const util = require("util");
var Orderitem = require("../../model/common/orderItemsModel.js");
var MoveitRatingForMakeit = require("../../model/moveit/moveitRatingForMakeitModel");
var Orderlock = require("../../model/common/lockorderModel");
var master = require("../master");
var constant = require("../constant.js");
var Makeituser = require("../../model/makeit/makeitUserModel.js");
var Notification = require("../../model/common/notificationModel.js");
var moment = require("moment");
const Razorpay = require("razorpay");
var PushConstant = require("../../push/PushConstant.js");
var RefundCoupon = require("../../model/common/refundCouponModel");
var RefundOnline = require("../../model/common/refundonlineModel");
var CouponUsed = require("../../model/common/couponUsedModel");
var request = require('request');
var OrderDeliveryTime = require("../../model/common/orderdeliverytimeModel");
var MoveitReassignedOrders = require("../../model/common/moveitReassignedOrdersModel");
var MoveitStatus = require("../../model/moveit/moveitStatusModel");
var createForcedeliverylogs = require("../../model/common/forcedeliverylogsModel");
var MoveitFireBase =require("../../push/Moveit_SendNotification");
var Ordersqueue = require("../../model/common/ordersqueueModel");
var MoveitUser = require("../../model/moveit/moveitUserModel");
var OrderStatusHistory = require("../common/orderstatushistoryModel");
var Dunzo = require("../../model/webhooks/dunzoModel.js");
var requestpromise = require('request-promise');
var dunzoconst = require('../../model/dunzo_constant');
var PackageInvetoryTracking = require('../../model/makeit/packageInventoryTrackingModel');
var sendsms =  require("../common/smsModel");
var MakeitIncentive = require("../../model/common/makeitincentiveModel.js");
var orderactionlog = require("../../model/common/orderactionlog.js");



// var instance = new Razorpay({
//   key_id: "rzp_test_3cduMl5T89iR9G",
//   key_secret: "BSdpKV1M07sH9cucL5uzVnol"
// });

// var instance = new Razorpay({
//   key_id: 'rzp_live_BLJVf00DRLWexs',
//   key_secret: 'WLqR1JqCdQwnmYs6FI9nzLdD'
// })

var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Order = function(order) {
  this.userid = order.userid;
  this.locality = order.locality;
  this.delivery_charge = order.delivery_charge;
  this.ordertype = order.ordertype || 0;
  this.orderstatus = order.orderstatus || 0;
  this.gst = order.gst;
  this.coupon = order.coupon;
  this.payment_type = order.payment_type;
  this.makeit_user_id = order.makeit_user_id;
  this.moveit_user_id = order.moveit_user_id || 0;
  this.cus_lat = order.cus_lat;
  this.cus_lon = order.cus_lon;
  this.makeit_status = order.makeit_status || "0";
  this.moveit_expected_delivered_time = order.moveit_expected_delivered_time;
  this.moveit_actual_delivered_time = order.moveit_actual_delivered_time;
  this.moveit_remarks_order = order.moveit_remarks_order;
  this.makeit_expected_preparing_time = order.makeit_expected_preparing_time;
  this.makeit_actual_preparing_time = order.makeit_actual_preparing_time;
  this.price = order.price || 0;
  this.payment_status = order.payment_status || 0;
  this.cus_address = order.cus_address;
  this.lock_status = order.lock_status || 0;
  this.cancel_by = order.cancel_by || 0;
  this.item_missing = order.item_missing || 0;
  this.original_price = order.original_price || 0;
  this.refund_amount = order.refund_amount || 0;
  this.discount_amount = order.discount_amount || 0;
  this.address_title = order.address_title;
  this.locality_name = order.locality_name;
  this.cancel_reason = order.cancel_reason;
  this.makeit_earnings = order.makeit_earnings;
  this.moveit_accept_time = order.moveit_accept_time;
  this.moveit_status = order.moveit_status || 0;
  this.cancel_charge = order.cancel_charge;
  this.rating_skip = order.rating_skip;
  this.landmark = order.landmark;
  this.flatno = order.flatno;
  this.app_type = order.app_type || 3;
  this.cancel_status = order.cancel_status ||0;
  this.delivery_vendor=order.delivery_vendor ||0;
  this.cus_pincode = order.cus_pincode ||0;
  this.convenience_charge = order.convenience_charge || 0;
};



Order.createOrder = async function createOrder(req, orderitems, result) {
  //try {
    const res = await query( "select count(*) as count from Orders where orderstatus < 6 and lock_status = 0 and userid= '" +req.userid +"'");
    if (res[0].count === 0) {
      
      Makeituser.read_a_cartdetails_makeitid(req, orderitems,false,async function(err,res3) {
        if (err) {
          result(err, null);
        } else {
          if (res3.status != true) {
            result(null, res3);
          } else {
            var amountdata = res3.result[0].amountdetails;
            var address_data = await query("Select * from Address where aid = '" + req.aid + "'");
            req.cus_address = address_data[0].address;
            req.locality = address_data[0].locality;
            req.cus_lat = address_data[0].lat;
            req.cus_lon = address_data[0].lon;
            req.cus_pincode = address_data[0].pincode;


            // req.gst = amountdata.gstcharge;
            // req.price = amountdata.grandtotal;
            // req.makeit_earnings = amountdata.makeit_earnings;
            
            req.original_price = amountdata.original_price;
            req.refund_balance = amountdata.refund_balance;
            req.refund_amount = amountdata.refundamount;
            req.discount_amount = amountdata.coupon_discount_amount;
            req.after_discount_cost = amountdata.grandtotal;
            req.order_cost   = amountdata.original_price;
            req.gst = amountdata.gstcharge;
            req.price = amountdata.grandtotal;
            req.makeit_earnings = amountdata.makeit_earnings;
            req.convenience_charge = amountdata.convenience_charge;
            req.delivery_charge = amountdata.delivery_charge;
            
           Order.OrderInsert(req, res3.result[0].item,false,false,async function(err,res){
            if (err) {
              result(err, null);
            } else {
              await Notification.orderMakeItPushNotification(
                res.orderid,
                req.makeit_user_id,
                PushConstant.pageidMakeit_Order_Post
              );
              ////Insert Order History////
                var orderactionlog={};
                orderactionlog.orderid=res.orderid;
                orderactionlog.app_type=req.app_type || 0;
                orderactionlog.userid=req.admin_id || 0;
                orderactionlog.action=4;
                console.log("orderactionlog-->",orderactionlog);
                await Order.createOrderActionLog(orderactionlog);
              ////////////////////////////
              result(null, res);
            }
           });
           //ordercreatecashondelivery(req, res3.result[0].item);
          }
        }
      });
    } else {
      let resobj = {
        success: true,
        status: false,
        message: "Already you have one order, So please try once delivered exiting order"
      };
      result(null,resobj);
    }
  // } catch (error) {
  //   let resobj = {
  //     success: true,
  //     status: false,
  //     errorCode: 402,
  //     error:error
  //   };
  //   console.log("error--->",error);
  //   result(null, resobj);
  // }
};

/*Order.read_a_proceed_to_pay = async function read_a_proceed_to_pay(req,orderitems,result) {
  //makeit_user_id
    var day = moment().format("YYYY-MM-DD HH:mm:ss");;
    var currenthour  = moment(day).format("HH");
   // var currenthour = 23
    var breatfastcycle = constant.breatfastcycle;
    var dinnercycle = constant.dinnercycle;
    var lunchcycle = constant.lunchcycle;
    var dinnerend = constant.dinnerend;
    const delivery_charge = constant.deliverycharge;
    // console.log(currenthour);
    // console.log(dinnerend);
    Order.getXfactors(req,function(err,res){
      console.log('Res--->'+res.order_queue);
    });
    
  };*/
Order.read_a_proceed_to_pay = async function read_a_proceed_to_pay(req,orderitems,result) {
  //makeit_user_id
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  // var currenthour = 23
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var dinnerend = constant.dinnerend;


  cur_hr = moment().format("HH:mm:ss");
  if(cur_hr >= '06:45:00' && cur_hr < '09:00:00'){
    console.log("1st slot -->",cur_hr);
  }else if(cur_hr >= '11:45:00' && cur_hr < '14:00:00'){
    console.log("2nd slot -->",cur_hr);
  }else if(cur_hr >= '17:45:00' && cur_hr < '20:30:00'){
    console.log("3rd slot -->",cur_hr);
  }else{
    console.log("no slot -->",cur_hr);
  }


   if (currenthour >= breatfastcycle && currenthour <= dinnerend) { //validate the time 11 clcok

    
  // if ((cur_hr >= '06:45:00' && cur_hr < '09:00:00') || (cur_hr >= '11:45:00' && cur_hr < '14:00:00') || (cur_hr >= '17:45:00' && cur_hr < '20:30:00')) {
    if (req.payment_type==1) {
      


      const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
      if (res.length === 0 ){  //validate the existing already orders is available
  
        const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
        //console.log("address_data-->",address_data);
        if(address_data.length === 0) { //address validation
          let resobj = {
            success: true,
            status: false,
            message: "Sorry your selected address wrong.Please select correct address."
          };
          result(null, resobj);
        }else{
  
          req.lat = address_data[0].lat;
          req.lon = address_data[0].lon;
  
          if (constant.order_assign_status==false) {
  
            //normal flow order creation
            console.log("normal flow order creation");
            
            //   const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
            // if (res.length === 0 ) {
                //get address 
              //  const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
                //console.log("address_data-->",address_data);
                // if(address_data.length === 0) {
                //   let resobj = {
                //     success: true,
                //     status: false,
                //     message: "Sorry your selected address wrong.Please select correct address."
                //   };
                //   result(null, resobj);
                // }else{
                //   req.lat = address_data[0].lat;
                //   req.lon = address_data[0].lon;
                  Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
                  if (err) {
                    result(err, null);
                  } else {
                    if (res3.status != true) {
                      result(null, res3);
                    } else {
                      var amountdata = res3.result[0].amountdetails;
                      req.original_price = amountdata.original_price;
                      req.refund_balance = amountdata.refund_balance;
                      req.refund_amount = amountdata.refundamount;
                      req.discount_amount = amountdata.coupon_discount_amount;
                      req.after_discount_cost = amountdata.grandtotal;
                      req.order_cost   = amountdata.original_price;
                      req.gst = amountdata.gstcharge;
                      req.price = amountdata.grandtotal;
                      req.makeit_earnings = amountdata.makeit_earnings;                 
                      req.cus_address = address_data[0].address;
                      req.locality = address_data[0].locality;
                      req.cus_lat = address_data[0].lat;
                      req.cus_lon = address_data[0].lon;
                      req.address_title = address_data[0].address_title;
                      req.locality_name = address_data[0].locality;
                      req.flatno = address_data[0].flatno;
                      req.landmark = address_data[0].landmark;
                      req.cus_pincode = address_data[0].pincode;
                      req.coupon = req.cid
                      req.convenience_charge = amountdata.convenience_charge;
                      req.delivery_charge = amountdata.delivery_charge;
                
        
                      if (req.payment_type == 0 || req.payment_type == 3) {
                        Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                          if (err) {
                            result(err, null);
                          } else {
                            if (req.payment_type == 0) {
                              await Notification.orderMakeItPushNotification(
                                res.orderid,
                                req.makeit_user_id,
                                PushConstant.pageidMakeit_Order_Post
                              );
                            }
                            ////Insert Order History////
                                    
                            ////////////////////////////
                            result(null, res);
                          }
                        });
                        //ordercreatecashondelivery(req, res3.result[0].item);
                      } else if (req.payment_type == 1) {
                        Order.OrderOnline(req, res3.result[0].item,function(err,res){
                          if (err) {
                            result(err, null);
                          } else {
                            result(null, res);
                          }
                        });
                        //ordercreateonline(req, res3.result[0].item);
                      }
                    }
                  }
                });
             // }
            // }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
            //   let resobj = {
            //     success: true,
            //     status: false,
            //     message: "Please complete your payment for yor order",
            //     result : res
            //   };
            //   result(null, resobj);
            // }else {     
            //   let resobj = {
            //     success: true,
            //     status: false,
            //     message: "Already you have one order, So please try once delivered exiting order"      
            //   };
            //   result(null, resobj);
            // }
           
          }else{
            console.log("x factore");
            //x factore
            if (constant.Xfactor_status==true) {
        
            if(constant.zone_control==false){
              //zone_control is if true
              console.log("zone_control is if true");
              var get_hub_id_from_orders= await query("Select zone from MakeitUser where userid="+req.makeit_user_id);
              var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and zone="+get_hub_id_from_orders[0].zone);
              var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where zoneid="+get_hub_id_from_orders[0].zone+" and  status=0") ;
              var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.zoneid="+get_hub_id_from_orders[0].zone+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()");
              var get_hub_id_from_makeithub= await query("Select xfactor,zone_status from Zone where id="+get_hub_id_from_orders[0].zone);
            }else{
                //get x factore is if true
                console.log("get x factore is if true");
              var get_hub_id_from_orders= await query("Select makeithub_id from MakeitUser where userid="+req.makeit_user_id);
              var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and moveit_hub="+get_hub_id_from_orders[0].makeithub_id);
              var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where hubid="+get_hub_id_from_orders[0].makeithub_id+" and  status=0") ;
              var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.hubid="+get_hub_id_from_orders[0].makeithub_id+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;    
              var get_hub_id_from_makeithub= await query("Select xfactor from Makeit_hubs where makeithub_id="+get_hub_id_from_orders[0].makeithub_id);
            }   
             //check zone status if dunzo or (moveit or dunzo)
            if (get_hub_id_from_makeithub[0].zone_status == 1 || get_hub_id_from_makeithub[0].zone_status == undefined) {
              console.log("get_hub_id_from_makeithub[0].zone_status != 2");
              //Dunzo or moveit flow
              var xfactorValue = (get_hub_id_from_makeithub[0].xfactor - 1) * get_moveit_list_based_on_hub[0].no_of_move_it_count
              console.log("get_hub_id_from_orders-->",get_hub_id_from_orders[0].makeithub_id);
              console.log("get_hub_id_from_orders-->",get_hub_id_from_orders[0].zone);
              console.log("get_moveit_cound_based_on_hub-->",get_moveit_list_based_on_hub[0].no_of_move_it_count);
              console.log("xfactorValue-->",Math.round(xfactorValue));
              console.log("get_orders_queue_based_on_hub[0].no_of_orders_count-->",get_orders_queue_based_on_hub[0].no_of_orders_count);
              var fValue= Math.round(xfactorValue);
              if(get_orders_queue_based_on_hub[0].no_of_orders_count < fValue){      
            
                  // const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
                  // if (res.length === 0 ) {
                    //get address 
                    // const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
                    // //console.log("address_data-->",address_data);
                    // if(address_data.length === 0) {
                    //   let resobj = {
                    //     success: true,
                    //     status: false,
                    //     message: "Sorry your selected address wrong.Please select correct address."
                    //   };
                    //   result(null, resobj);
                    // }else{
                    //   req.lat = address_data[0].lat;
                    //   req.lon = address_data[0].lon;
                      Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
                        if (err) {
                          result(err, null);
                        } else {
                          if (res3.status != true) {
                            result(null, res3);
                          } else {
                            var amountdata = res3.result[0].amountdetails;                     
                            req.original_price = amountdata.original_price;
                            req.refund_balance = amountdata.refund_balance;
                            req.refund_amount = amountdata.refundamount;
                            req.discount_amount = amountdata.coupon_discount_amount;
                            req.after_discount_cost = amountdata.grandtotal;
                            req.order_cost   = amountdata.original_price;
                            req.gst = amountdata.gstcharge;
                            req.price = amountdata.grandtotal;
                            req.makeit_earnings = amountdata.makeit_earnings;                   
                            req.cus_address = address_data[0].address;
                            req.locality = address_data[0].locality;
                            req.cus_lat = address_data[0].lat;
                            req.cus_lon = address_data[0].lon;
                            req.address_title = address_data[0].address_title;
                            req.locality_name = address_data[0].locality;
                            req.flatno = address_data[0].flatno;
                            req.landmark = address_data[0].landmark;
                            req.cus_pincode = address_data[0].pincode;
                            req.coupon = req.cid
                            req.convenience_charge = amountdata.convenience_charge;
                            req.delivery_charge = amountdata.delivery_charge;
                       
                            if (req.payment_type == 0) {
                                Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                                  if (err) {
                                    result(err, null);
                                  } else {
                                    if (req.payment_type == 0) {
                                      await Notification.orderMakeItPushNotification(
                                        res.orderid,
                                        req.makeit_user_id,
                                        PushConstant.pageidMakeit_Order_Post
                                      );
                                    }                             
                                    result(null, res);
                                  }
                                });
                                //ordercreatecashondelivery(req, res3.result[0].item);
                            } else if (req.payment_type == 1) {
                                Order.OrderOnline(req, res3.result[0].item,function(err,res){
                                  if (err) {
                                    result(err, null);
                                  } else {
                                    result(null, res);
                                  }
                                });
                                //ordercreateonline(req, res3.result[0].item);
                            }
                          }
                        }
                      });
                  //  }
                  // }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
                  //   let resobj = {
                  //     success: true,
                  //     status: false,
                  //     message: "Please complete your payment for yor order",
                  //     result : res
                  //   };
                  //   result(null, resobj);
                  // }else {       
                  //   let resobj = {
                  //     success: true,
                  //     status: false,
                  //     message: "Already you have one order, So please try once delivered exiting order"        
                  //   };
                  //   result(null, resobj);
                  // }
                 
              }else{  
                req.payment_type=3;
                req.payment_status=3;
                req.orderstatus = 11;  
                Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
                  if (err) {
                    result(err, null);
                  } else {         
                    let resobj = {
                      success: true,
                      status:false,
                      order_queue:1,
                      title:"IN HIGH DEMAND",
                      message:'We are facing high demand. We will let you know when we are back to our best!'
                    };
                    result(null, resobj);        
                  }
                });
              }
          
            } else {
           
         //    if (req.payment_type==0) {
              //if (currenthour >= breatfastcycle && currenthour <= dinnerend) {
                // const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
                // if (res.length === 0 ) {
                  //get address 
            //      const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
                  // //console.log("address_data-->",address_data);
                  // if(address_data.length === 0) {
                  //   let resobj = {
                  //     success: true,
                  //     status: false,
                  //     message: "Sorry your selected address wrong.Please select correct address."
                  //   };
                  //   result(null, resobj);
                  // }else{
                    // req.lat = address_data[0].lat;
                    // req.lon = address_data[0].lon;
                    Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
                    if (err) {
                      result(err, null);
                    } else {
                      if (res3.status != true) {
                        result(null, res3);
                      } else {
                        var amountdata = res3.result[0].amountdetails;
                        req.original_price = amountdata.original_price;
                        req.refund_balance = amountdata.refund_balance;
                        req.refund_amount = amountdata.refundamount;
                        req.discount_amount = amountdata.coupon_discount_amount;
                        req.after_discount_cost = amountdata.grandtotal;
                        req.order_cost   = amountdata.original_price;
                        req.gst = amountdata.gstcharge;
                        req.price = amountdata.grandtotal;
                        req.makeit_earnings = amountdata.makeit_earnings;                 
                        req.cus_address = address_data[0].address;
                        req.locality = address_data[0].locality;
                        req.cus_lat = address_data[0].lat;
                        req.cus_lon = address_data[0].lon;
                        req.address_title = address_data[0].address_title;
                        req.locality_name = address_data[0].locality;
                        req.flatno = address_data[0].flatno;
                        req.landmark = address_data[0].landmark;
                        req.cus_pincode = address_data[0].pincode;
                        req.coupon = req.cid
                        req.convenience_charge = amountdata.convenience_charge;
                        req.delivery_charge = amountdata.delivery_charge;
                        if (req.payment_type == 0 ) {
                        
                          Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                            if (err) {
                              result(err, null);
                            } else {
                              if (req.payment_type == 0) {
                                await Notification.orderMakeItPushNotification(
                                  res.orderid,
                                  req.makeit_user_id,
                                  PushConstant.pageidMakeit_Order_Post
                                );
                              }
                              ////Insert Order History////
                                      
                              ////////////////////////////
                              result(null, res);
                            }
                          });
                          //ordercreatecashondelivery(req, res3.result[0].item);
                        }else if (req.payment_type == 1) {
                          Order.OrderOnline(req, res3.result[0].item,function(err,res){
                            if (err) {
                              result(err, null);
                            } else {
                              result(null, res);
                            }
                          });
                          //ordercreateonline(req, res3.result[0].item);
                        }else {
                         
                          req.payment_type=3;
                          req.payment_status=3;
                          req.orderstatus = 12;  
                          Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
                            if (err) {
                              result(err, null);
                            } else {         
                              let resobj = {
                                success: true,
                                status: false,
                                message: "We're sorry! Serving only online payments in your area",
                              };
                              result(null, resobj);        
                            }
                          });
        
                        }
                      }
                    }
                  });
              //   }
    
    
              //   }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
              //   let resobj = {
              //     success: true,
              //     status: false,
              //     message: "Please complete your payment for yor order",
              //     result : res
              //   };
              //   result(null, resobj);
              //   }else {     
              //   let resobj = {
              //     success: true,
              //     status: false,
              //     message: "Already you have one order, So please try once delivered exiting order"      
              //   };
              //   result(null, resobj);
              // }
            
            }
        
        
        
            }else{
        
                if(constant.zone_control==false){
                  var get_hub_id_from_orders= await query("Select zone from MakeitUser where userid="+req.makeit_user_id);
                  var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and zone="+get_hub_id_from_orders[0].zone);
                  var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where zoneid="+get_hub_id_from_orders[0].zone+" and  status !=1") ;
                 var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.zoneid="+get_hub_id_from_orders[0].zone+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;
                  var get_hub_id_from_makeithub= await query("Select xfactor,zone_status,overridden_value from Zone where id="+get_hub_id_from_orders[0].zone);
                }else{
                  var get_hub_id_from_orders= await query("Select makeithub_id from MakeitUser where userid="+req.makeit_user_id);
                  var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and moveit_hub="+get_hub_id_from_orders[0].makeithub_id);
                  var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where hubid="+get_hub_id_from_orders[0].makeithub_id+" and  status !=1") ;
                  var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.hubid="+get_hub_id_from_orders[0].makeithub_id+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;
                  var get_hub_id_from_makeithub= await query("Select xfactor from Makeit_hubs where makeithub_id="+get_hub_id_from_orders[0].makeithub_id);
                }
            ///this condition is Dunzo zone 10 //09-dec-2019
          
                  console.log(get_moveit_list_based_on_hub);
              
                if (get_moveit_list_based_on_hub[0].no_of_move_it_count >= constant.Xfactor_moveit_count) {
          
                  var xfactorValue = (get_hub_id_from_makeithub[0].xfactor - 1) * (get_moveit_list_based_on_hub[0].no_of_move_it_count || 0)
                  console.log("get_hub_id_from_orders-->",get_hub_id_from_orders[0].zone);
                  console.log("get_moveit_cound_based_on_hub-->",get_moveit_list_based_on_hub[0].no_of_move_it_count);
                  console.log("xfactorValue-->",Math.round(xfactorValue));
                  var fValue= Math.round(xfactorValue);
                  if(get_orders_queue_based_on_hub[0].no_of_orders_count < fValue){
                    
        
                    // const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
                    // if (res.length === 0 ) {
                      //get address 
                      // const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
                      // //console.log("address_data-->",address_data);
                      // if(address_data.length === 0) {
                      //   let resobj = {
                      //     success: true,
                      //     status: false,
                      //     message: "Sorry your selected address wrong.Please select correct address."
                      //   };
                      //   result(null, resobj);
                      // }else{
                      //   req.lat = address_data[0].lat;
                      //   req.lon = address_data[0].lon;
                        Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
                          if (err) {
                            result(err, null);
                          } else {
                            if (res3.status != true) {
                              result(null, res3);
                            } else {
                              var amountdata = res3.result[0].amountdetails;                     
                              req.original_price = amountdata.original_price;
                              req.refund_balance = amountdata.refund_balance;
                              req.refund_amount = amountdata.refundamount;
                              req.discount_amount = amountdata.coupon_discount_amount;
                              req.after_discount_cost = amountdata.grandtotal;
                              req.order_cost   = amountdata.original_price;
                              req.gst = amountdata.gstcharge;
                              req.price = amountdata.grandtotal;
                              req.makeit_earnings = amountdata.makeit_earnings;                   
                              req.cus_address = address_data[0].address;
                              req.locality = address_data[0].locality;
                              req.cus_lat = address_data[0].lat;
                              req.cus_lon = address_data[0].lon;
                              req.address_title = address_data[0].address_title;
                              req.locality_name = address_data[0].locality;
                              req.flatno = address_data[0].flatno;
                              req.landmark = address_data[0].landmark;
                              req.cus_pincode = address_data[0].pincode;
                              req.coupon = req.cid
                              req.convenience_charge = amountdata.convenience_charge;
                              req.delivery_charge = amountdata.delivery_charge;
                         
                              if (req.payment_type == 0) {
                                  Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                                    if (err) {
                                      result(err, null);
                                    } else {
                                      if (req.payment_type == 0) {
                                        await Notification.orderMakeItPushNotification(
                                          res.orderid,
                                          req.makeit_user_id,
                                          PushConstant.pageidMakeit_Order_Post
                                        );
                                      }                             
                                      result(null, res);
                                    }
                                  });
                                  //ordercreatecashondelivery(req, res3.result[0].item);
                              } else if (req.payment_type == 1) {
                                  Order.OrderOnline(req, res3.result[0].item,function(err,res){
                                    if (err) {
                                      result(err, null);
                                    } else {
                                      result(null, res);
                                    }
                                  });
                                  //ordercreateonline(req, res3.result[0].item);
                              }
                            }
                          }
                        });
                     // }
                    // }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
                    //   let resobj = {
                    //     success: true,
                    //     status: false,
                    //     message: "Please complete your payment for yor order",
                    //     result : res
                    //   };
                    //   result(null, resobj);
                    // }else {       
                    //   let resobj = {
                    //     success: true,
                    //     status: false,
                    //     message: "Already you have one order, So please try once delivered exiting order"        
                    //   };
                    //   result(null, resobj);
                    // }
        
        
                  }else{
                    req.payment_type=3;
                    req.payment_status=3;
                    req.orderstatus = 11;
                    Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
                      if (err) {
                        result(err, null);
                      } else {       
                        let resobj = {
                          success: true,
                          status:false,
                          order_queue:1,
                          title:"IN HIGH DEMAND",//Moveit Hign demand
                          message:'We are facing high demand. We will let you know when we are back to our best!'
                        };
                        result(null, resobj);      
                      }
                    });
                  }
              
                } else {
                  console.log("Xfactore overridding");
          
                  var queuecount = await query("select count(*)as count from Orders_queue where zoneid='"+get_hub_id_from_orders[0].zone+"' and status !=1 "); //and created_at > (NOW() - INTERVAL 10 MINUTE
                //  var xfacttore_overridden_value = await query("select overridden_value from Zone where id='"+get_hub_id_from_orders[0].zone+" "); 
                  if (queuecount[0].count < get_hub_id_from_makeithub[0].overridden_value) {
                    
                    // const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
                    // if (res.length === 0 ) {
                      //get address 
                      // const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
                      // //console.log("address_data-->",address_data);
                      // if(address_data.length === 0) {
                      //   let resobj = {
                      //     success: true,
                      //     status: false,
                      //     message: "Sorry your selected address wrong.Please select correct address."
                      //   };
                      //   result(null, resobj);
                      // }else{
                      //   req.lat = address_data[0].lat;
                      //   req.lon = address_data[0].lon;
                        Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
                        if (err) {
                          result(err, null);
                        } else {
                          if (res3.status != true) {
                            result(null, res3);
                          } else {
                            var amountdata = res3.result[0].amountdetails;
                            req.original_price = amountdata.original_price;
                            req.refund_balance = amountdata.refund_balance;
                            req.refund_amount = amountdata.refundamount;
                            req.discount_amount = amountdata.coupon_discount_amount;
                            req.after_discount_cost = amountdata.grandtotal;
                            req.order_cost   = amountdata.original_price;
                            req.gst = amountdata.gstcharge;
                            req.price = amountdata.grandtotal;
                            req.makeit_earnings = amountdata.makeit_earnings;                 
                            req.cus_address = address_data[0].address;
                            req.locality = address_data[0].locality;
                            req.cus_lat = address_data[0].lat;
                            req.cus_lon = address_data[0].lon;
                            req.address_title = address_data[0].address_title;
                            req.locality_name = address_data[0].locality;
                            req.flatno = address_data[0].flatno;
                            req.landmark = address_data[0].landmark;
                            req.cus_pincode = address_data[0].pincode;
                            req.coupon = req.cid
                            req.convenience_charge = amountdata.convenience_charge;
                            req.delivery_charge = amountdata.delivery_charge;
                            if (req.payment_type == 0 ) {
                            
                              Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                                if (err) {
                                  result(err, null);
                                } else {
                                  if (req.payment_type == 0) {
                                    await Notification.orderMakeItPushNotification(
                                      res.orderid,
                                      req.makeit_user_id,
                                      PushConstant.pageidMakeit_Order_Post
                                    );
                                  }
                                  ////Insert Order History////
                                          
                                  ////////////////////////////
                                  result(null, res);
                                }
                              });
                              //ordercreatecashondelivery(req, res3.result[0].item);
                            }else if (req.payment_type == 1) {
                              Order.OrderOnline(req, res3.result[0].item,function(err,res){
                                if (err) {
                                  result(err, null);
                                } else {
                                  result(null, res);
                                }
                              });
                              //ordercreateonline(req, res3.result[0].item);
                            }else {
                             
                              req.payment_type=3;
                              req.payment_status=3;
                              req.orderstatus = 11;  
                              Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
                                if (err) {
                                  result(err, null);
                                } else {         
                                  let resobj = {
                                    success: true,
                                    status: false,
                                    message: "We're sorry! Serving only online payments in your area",
                                  };
                                  result(null, resobj);        
                                }
                              });
            
                            }
                          }
                        }
                        });
                   //  }
                  //   }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
                  //   let resobj = {
                  //     success: true,
                  //     status: false,
                  //     message: "Please complete your payment for yor order",
                  //     result : res
                  //   };
                  //   result(null, resobj);
                  //   }else {     
                  //   let resobj = {
                  //     success: true,
                  //     status: false,
                  //     message: "Already you have one order, So please try once delivered exiting order"      
                  //   };
                  //   result(null, resobj);
                  // }
        
                  } else {
                    req.payment_type=3;
                    req.payment_status=3;
                    req.orderstatus = 11;
                    Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
                      if (err) {
                        result(err, null);
                      } else {       
                        let resobj = {
                          success: true,
                          status:false,
                          order_queue:1,
                          title:"IN HIGH DEMAND",//Dunzo Hign demand
                          message:'We are facing high demand. We will let you know when we are back to our best!'
                        };
                        result(null, resobj);      
                      }
                    });
                  }
          
                
                }
                
              
        
            }
        
          }
          
        }
  
        
  
  
  
  
      }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
        let resobj = {
          success: true,
          status: false,
          message: "Please complete your payment for yor order",
          result : res
        };
        result(null, resobj);
      }else {       
        let resobj = {
          success: true,
          status: false,
          message: "Already you have one order, So please try once delivered exiting order"        
        };
        result(null, resobj);
      }

    } else {
      
      let resobj = {
        success: true,
        status: false,
        message: "Sorry! Please make a Payment via online, Currently we are not accepting COD orders"
      };
      result(null, resobj);

    }
  
   



  }else{  
  let resobj = {
    success: true,
    status: false,
    message: "Sorry Currently we are not accepting orders!"
  };
  result(null, resobj);
}
};

Order.read_a_proceed_to_pay_xfactore = async function read_a_proceed_to_pay_xfactore(req,orderitems,result) {
  //makeit_user_id
  console.log("read_a_proceed_to_pay_xfactore");
    var day = moment().format("YYYY-MM-DD HH:mm:ss");;
    var currenthour  = moment(day).format("HH");
   // var currenthour = 23
    var breatfastcycle = constant.breatfastcycle;
    var dinnercycle = constant.dinnercycle;
    var lunchcycle = constant.lunchcycle;
    var dinnerend = constant.dinnerend;
  
    const delivery_charge = constant.deliverycharge;
    
  
    if (currenthour >= breatfastcycle && currenthour <= dinnerend) {
      const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
      if (res.length === 0 ) {
      //get address 
        const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
      //console.log("address_data-->",address_data);
      if(address_data.length === 0) {
        let resobj = {
                  success: true,
                  status: false,
                  message: "Sorry your selected address wrong.Please select correct address."
                };
                result(null, resobj);
        }else{
              req.lat = address_data[0].lat;
              req.lon = address_data[0].lon;
              Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
                if (err) {
                  result(err, null);
                } else {
                  if (res3.status != true) {
                    result(null, res3);
                  } else {
                    var amountdata = res3.result[0].amountdetails;
                   
                    req.original_price = amountdata.original_price;
                    req.refund_balance = amountdata.refund_balance;
                    req.refund_amount = amountdata.refundamount;
                    req.discount_amount = amountdata.coupon_discount_amount;
                    req.after_discount_cost = amountdata.grandtotal;
                    req.order_cost   = amountdata.original_price;
                    req.gst = amountdata.gstcharge;
                    req.price = amountdata.grandtotal;
                    req.makeit_earnings = amountdata.makeit_earnings;
                 
                    req.cus_address = address_data[0].address;
                    req.locality = address_data[0].locality;
                    req.cus_lat = address_data[0].lat;
                    req.cus_lon = address_data[0].lon;
                    req.address_title = address_data[0].address_title;
                    req.locality_name = address_data[0].locality;
                    req.flatno = address_data[0].flatno;
                    req.landmark = address_data[0].landmark;
                    req.coupon = req.cid
                    req.convenience_charge = amountdata.convenience_charge;
                    req.delivery_charge = amountdata.delivery_charge;
                      if (req.payment_type == 0 || req.payment_type == 3) {
                        Order.OrderInsert(req, res3.result[0].item,true,false,async function(err,res){
                          if (err) {
                            result(err, null);
                          } else {
                            if (req.payment_type == 0) {
                              await Notification.orderMakeItPushNotification(
                                res.orderid,
                                req.makeit_user_id,
                                PushConstant.pageidMakeit_Order_Post
                              );
                            }
                           
                            result(null, res);
                          }
                        });
                        //ordercreatecashondelivery(req, res3.result[0].item);
                      } else if (req.payment_type == 1) {
                        Order.OrderOnline(req, res3.result[0].item,function(err,res){
                          if (err) {
                            result(err, null);
                          } else {
                              result(null, res);
                          }
                        });
                        //ordercreateonline(req, res3.result[0].item);
                      }
                  }
                }
              });
        }
     }else if(res[0].payment_type === 1 || res[0].lock_status === 1){ 
    let resobj = {
      success: true,
      status: false,
      message: "Please complete your payment for yor order",
      result : res
    };
    result(null, resobj);
  }else {
     
      let resobj = {
        success: true,
        status: false,
        message: "Already you have one order, So please try once delivered exiting order"
        
      
      };
      result(null, resobj);
    }
    }else{
  
    
    let resobj = {
      success: true,
      status: false,
      message: "Sorry Currently we are not receiving orders!"
    };
    result(null, resobj);
    }
};

Order.OrderOnline = async function OrderOnline(req, orderitems,result) {
  var customerid = await Order.create_customerid_by_razorpay(req.userid);
  if (!customerid) {
      let resobj = {
        success: true,
        status: false,
        message: "Customer already exists for the merchant!"
      };
    result(null,resobj );
    return
  }
  req.lock_status = 1;
  Order.OrderInsert(req, orderitems,true,true,function(err,res){
    if (err) {
      result(err, null);
    } else {

      res.price=req.price;
      res.razer_customerid=customerid,
      res.refund_balance=req.refund_balance,
      result(null, res);
    }
  });
}

Order.OrderInsert = async function OrderInsert(req, orderitems,isMobile,isOnlineOrder,result) {
  var new_Order = new Order(req);

  //snew_Order.delivery_charge = constant.deliverycharge;
  sql.beginTransaction(function(err) {
    if (err) { 
      sql.rollback(function() {
        result(err, null);
      });
      return;
    }
    sql.query("INSERT INTO Orders set ?", new_Order, async function(err, res1) {
      if (err) { 
        sql.rollback(function() {
          result(err, null); //result.send(err);
        });
      }else{
        var orderid = res1.insertId;
          for (var i = 0; i < orderitems.length; i++) {
          var orderitem = {};
          orderitem.orderid = orderid;
          orderitem.productid = orderitems[i].productid;
          orderitem.quantity = orderitems[i].cartquantity;
          orderitem.price = orderitems[i].price;
          orderitem.original_price = orderitems[i].original_price;

          var items = new Orderitem(orderitem);
        
         
          Orderitem.createOrderitems(items,req.payment_type, function(err, res2) {
            //if (err) result.send(err);
            if (err) { 
              sql.rollback(function() {
                result(err, null);
              });
            }
          });

          if(isOnlineOrder) {
            var orderitemlock = new Orderlock(orderitem);
            Orderlock.lockOrderitems(orderitemlock, function(
              err,
              orderlockresponce
            ) {
              if (err) { 
                sql.rollback(function() {
                  result(err, null);
                });
              }//result.send(err);
            });
          }
        }

        if(isMobile&&!isOnlineOrder){
        

///payment type =3 orders we can't use coupon and refund coupon
          if (req.payment_type < 2) {

            if (req.cid) {
              var new_createCouponUsed = new CouponUsed(req); 
              new_createCouponUsed.orderid = res1.insertId;
              CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
                 //if (err) result.send(err);
                 if (err) { 
                  sql.rollback(function() {
                    result.send(err);
                  });
                }
               });
             }

            if (req.rcid) {
              var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(req.rcid,req.refund_balance,res1.insertId);
            }

          }
       
        }

        if (req.payment_type==0) {
          sendsms.send_sms_makeit(orderid);
        }
        let resobj = {
          success: true,
          status: true,
          message: "Order Created successfully",
          orderid: orderid
        };
        sql.commit(async function(err) {
          if (err) { 
            sql.rollback(function() {
              //result.send(err);
              result(err, null);
            });
          }
          
          result(null, resobj);
        });
      }
    });
  });
}

// Order.intelligentOrderInsert = async function intelligentOrderInsert(req, orderitems,isMobile,isOnlineOrder,result) {
//   var new_Order = new Order(req);
//   console.log(new_Order);
//   new_Order.delivery_charge = constant.deliverycharge;
//   sql.beginTransaction(function(err) {
//     if (err) { 
//       sql.rollback(function() {
//         result(err, null);
//       });
//       return;
//     }
//     sql.query("INSERT INTO Orders set ?", new_Order, async function(err, res1) {
//       if (err) { 
//         sql.rollback(function() {
//           result(err, null); //result.send(err);
//         });
//       }else{
//         var orderid = res1.insertId;
//           for (var i = 0; i < orderitems.length; i++) {
//           var orderitem = {};
//           orderitem.orderid = orderid;
//           orderitem.productid = orderitems[i].productid;
//           orderitem.quantity = orderitems[i].cartquantity;
//           orderitem.price = orderitems[i].price;
//           var items = new Orderitem(orderitem);
//           Orderitem.createOrderitems(items, function(err, res2) {
//             //if (err) result.send(err);
//             if (err) { 
//               sql.rollback(function() {
//                 result(err, null);
//               });
//             }
//           });

//           // if(isOnlineOrder) {
//           //   var orderitemlock = new Orderlock(orderitem);
//           //   Orderlock.lockOrderitems(orderitemlock, function(
//           //     err,
//           //     orderlockresponce
//           //   ) {
//           //     if (err) { 
//           //       sql.rollback(function() {
//           //         result(err, null);
//           //       });
//           //     }//result.send(err);
//           //   });
//           // }
//         }

//         // if(isMobile&&!isOnlineOrder){
//         //   if (req.cid) {
//         //     var new_createCouponUsed = new CouponUsed(req); 
//         //     new_createCouponUsed.orderid = res1.insertId;
//         //     CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
//         //        //if (err) result.send(err);
//         //        if (err) { 
//         //         sql.rollback(function() {
//         //           result.send(err);
//         //         });
//         //       }
//         //      });
//         //    }


//         //  if (req.rcid) {
//         //    var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(req.rcid,req.refund_balance,res1.insertId);
//         //  }
//         // }

//         let resobj = {
//           success: true,
//           status: true,
//           message: "Order Created successfully",
//           orderid: orderid
//         };
//         sql.commit(async function(err) {
//           if (err) { 
//             sql.rollback(function() {
//               //result.send(err);
//               result(err, null);
//             });
//           }
          
//           result(null, resobj);
//         });
//       }
//     });
//   });
// }

Order.online_order_place_conformation = async function(order_place, result) {

  var orderdetails = await query("select * from Orders where orderid ='"+order_place.orderid+"'");

  if (orderdetails.length!==0) {
    
    if (orderdetails[0].payment_status==2) {   
      let resobj = {
        success: true,
        message: "Sorry Order is already payment failed!",
        status: false,
        orderid: order_place.orderid
      };
      result(null, resobj);
    }else  if (orderdetails[0].payment_status==1) {
      
      let resobj = {
        success: true,
        message: "Sorry Order is already payment paid",
        status: true,
        orderid: order_place.orderid
      };
      result(null, resobj);
    }else{

    
  
  var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var transaction_status= order_place.payment_status === 1? 'success':'failed';
  var orderUpdateQuery =
  "update Orders set payment_status = '" +
  order_place.payment_status +
  "', lock_status = 0,transactionid='" +
  order_place.transactionid +
  "',transaction_status='"+transaction_status+"', transaction_time= '" +
  transaction_time +
  "' WHERE orderid = '" +
  order_place.orderid +
  "' ";

  //////////= Razorpay caption =////////// 
if(order_place.payment_status === 1){
  const getprice = await query("select price from Orders where orderid ='"+order_place.orderid+"'");
  if (getprice.err) {
 
  }else{
    var paymentid  = order_place.transactionid;
    var amount     = getprice[0].price*100;
    instance.payments.capture(paymentid, parseInt(amount))
    .then((data)=>{
      captionupdate = "update Orders set captured_status=1 where transactionid='"+order_place.transactionid+"'";
      sql.query(captionupdate, async function(err, captionresult) {
        if (err) {
          result(err, null);
        }else{
          console.log(captionresult);
        }
      });
    }).catch((err)=>{
      console.log(err);      
    });
  }
}
///////////////////////////////////

  sql.query(orderUpdateQuery, async function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      if (order_place.payment_status === 1) {
       
        // const orderdetails = await query("select * from Orders where orderid ='" +order_place.orderid +"'");
        // if (orderdetails.err) {
        //   let resobj = {
        //     success: true,
        //     status: false,
        //     result: orderdetails.err
        //   };
        //   result(null, resobj);
        // }else{

        //   if (orderdetails[0].coupon || order_place.cid) {
            
        //        var new_createCouponUsed = new CouponUsed(order_place); 
        //       new_createCouponUsed.after_discount_cost = orderdetails[0].price
        //       new_createCouponUsed.order_cost = orderdetails[0].original_price
        //       new_createCouponUsed.userid = orderdetails[0].userid
          
        //       CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
        //         if (err) {
        //           result(err, null);
        //           return;
        //         }
        //       });
        //   } 

        //   if (order_place.refund_balance !== 0 || order_place.rcid || orderdetails[0].refund_amount) {
        //     var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(
        //       order_place.rcid,
        //       order_place.refund_balance,
        //       order_place.orderid
        //     );
        //   }

        // }

        if (order_place.cid) {
          const orderdetailsquery = "select * from Orders where orderid ='" +order_place.orderid +"'";
          sql.query(orderdetailsquery, async function(err, orderdetails) {
            if (err) {
              result(err, null);
            }else{
              var new_createCouponUsed = new CouponUsed(order_place); 
              new_createCouponUsed.after_discount_cost = orderdetails[0].price
              new_createCouponUsed.order_cost = orderdetails[0].original_price
              new_createCouponUsed.userid = orderdetails[0].userid
          
              CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
                if (err) {
                  result(err, null);
                  return;
                }
              });
            }
          });
         }
         
   
        if (order_place.refund_balance !== 0 || order_place.rcid ) {
          var updateRefundCoupon = await RefundCoupon.updateByRefundCouponId(
            order_place.rcid,
            order_place.refund_balance,
            order_place.orderid
          );
        }

        var deletequery ="delete from Lock_order where orderid ='" + order_place.orderid + "' ";
        sql.query(deletequery, async function(err, deleteres) {
          if (err) {
            result(err, null);
          } else {
            await Notification.orderMakeItPushNotification(
              order_place.orderid,
              null,
              PushConstant.pageidMakeit_Order_Post
            );
            sendsms.send_sms_makeit(order_place.orderid);
            let resobj = {
              success: true,
              status: true,
              message: "Your order placed successfully"
            };
            result(null, resobj);
          }
        });
      }else if (order_place.payment_status === 2) {
        var releasequantityquery = "select * from Lock_order where orderid ='" + order_place.orderid + "' ";
        sql.query(releasequantityquery, function(err, res2) {
          if (err) {
            result(err, null);
          } else {
            for (let i = 0; i < res2.length; i++) {
              var productquantityadd =
                "update Product set quantity = quantity+" +
                res2[i].quantity +
                " where productid =" +
                res2[i].productid +
                "";
              sql.query(productquantityadd, function(err, res2) {
                if (err) {
                  result(err, null);
                }
              });
            }

            let resobj = {
              success: true,
              message: "Sorry payment not yet be paid following order",
              status: false,
              orderid: order_place.orderid
            };
            result(null, resobj);
          }
        });
      }
    }
  });
}
}else{
  let resobj = {
    success: true,
    message: "Sorry Order is not found!",
    status: false
  };
  result(null, resobj);
}
};

Order.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userid) {
  const userinfo = await query("Select * from User where userid = '" + userid + "'");
  var customerid = userinfo[0].razer_customerid;
  console.log("customerid-->",customerid);
  if(customerid) return customerid;

  var name = userinfo[0].name;
  var email = userinfo[0].email;
  var contact = userinfo[0].phoneno;
  var notes = "eatuser";
  var fail_existing="1";
  var cuId = false;


  return await instance.customers
    .create({ name, email, contact, notes,fail_existing})
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
            return false;
          }
        }
      );
      return cuId;
    })
    .catch(error => {
      console.log("error: ", error);
      return false;
    });
};

Order.getOrderById = function getOrderById(orderid, result) {
  sql.query("Select * from Orders where orderid = ? ", orderid, function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.updateOrderStatus = async function updateOrderStatus(req, result) {
  var orderdetails = await query(
    "select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon,mk.makeithub_id,mk.zone,zo.zone_status from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id left join Zone zo on zo.id=mk.zone where ors.orderid ='" +
      req.orderid +
      "'"
  );

  if (orderdetails[0].orderstatus < 5) {
    var updatequery = "Update Orders set orderstatus = ? where orderid = ?";
    var values = [req.orderstatus, req.orderid];
    if (req.orderstatus === PushConstant.masteridOrder_Accept) {
      var makeit_accept_time = moment().format("YYYY-MM-DD HH:mm:ss");
      var makeit_expected_preparing_time = moment()
        .add(0, "seconds")
        .add(15, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");
      values = [
        req.orderstatus,
        makeit_expected_preparing_time,
        makeit_accept_time,
        req.orderid
      ];
      updatequery =
        "Update Orders set orderstatus = ?,makeit_expected_preparing_time= ?,makeit_accept_time=?,makeit_status=1 where orderid = ? ";
    }else if (req.orderstatus === PushConstant.masteridOrder_Prepared) {

      req.makeit_userid=orderdetails[0].makeit_user_id;
      Makeituser.makeit_quantity_check(req);

      var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
      values = [req.orderstatus, transaction_time, req.orderid];
      updatequery ="Update Orders set orderstatus = ?,makeit_actual_preparing_time= ? where orderid = ? ";
    }

    sql.query(updatequery, values, async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (req.orderstatus === PushConstant.masteridOrder_Accept) {
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_accept
          );
        } else if (req.orderstatus === PushConstant.masteridOrder_Prepared) {
        
          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.masteridOrder_Prepared
          );
          // PackageInvetoryTracking.orderbasedpackageTracking(req.orderid,orderdetails[0].makeit_user_id, function(err,res4){
          //   if (err) {
          //     result(err, null);
          //   } else {
          //   }
          // });
        }


        req.orglat = orderdetails[0].makeit_lat;
        req.orglon = orderdetails[0].makeit_lon;
        req.deslat = orderdetails[0].cus_lat;
        req.deslon = orderdetails[0].cus_lon;
        req.hubid  = orderdetails[0].makeithub_id;
        req.zoneid  = orderdetails[0].zone;
        req.zone_status  = orderdetails[0].zone_status;
        req.payment_type  = orderdetails[0].payment_type;

        Order.eat_order_distance_calculation(req, async function(err, res3) {
          if (err) {
            result(err, null);
          } else {
            if (res3.status != true) {
              result(null, res3);
            } else {
              var routes = res3.result;
              var caldistance = routes.routes;
              var deliverytimedata = caldistance[0].legs;

               if (req.orderstatus==1) {
                if (constant.order_assign_status==true) {
                   Order.auto_order_assign_byadmin_makeit(req);

                  let response = {
                    success: true,
                    status: true,
                    message: "Order accepted successfully.",
          
                  };
                  result(null, response);
                 } else {
                   
                  let response = {
                  success: true,
                  status: true,
                  message: "Order accepted successfully.",
        
                };
                result(null, response);
                 }
               }else{
                let response = {
                  success: true,
                  status: true,
                  message: "Order accepted successfully.",
        
                };
                result(null, response);
               }
             
             
          
            }
          }
        });
        ////Insert Order History////
        
        ////////////////////////////
      }
    });
  } else if (orderdetails[0].orderstatus == 5) {
    let response = {
      success: true,
      status: true,
      message: "Order already pickedup"
      //   result :deliverytimedata
    };
    result(null, response);
  } else if (orderdetails[0].orderstatus == 6) {
    let response = {
      success: true,
      status: true,
      message: "Order already delivered"
      //   result :deliverytimedata
    };
    result(null, response);
  } else {
    let response = {
      success: true,
      status: true,
      message: "Order already Canceled"
      //   result :deliverytimedata
    };
    result(null, response);
  }
};

//Order.updateOrderStatus =async function updateOrderStatus(req, result) {

// //var orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid ='" + req.orderid + "'");
// const orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon,mk.makeithub_id from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid ='" + req.orderid + "'");
// if (orderdetails[0].orderstatus < 5) {
//   var updatequery = "Update Orders set orderstatus = ? where orderid = ?"
//   var values=[req.orderstatus, req.orderid];
//   if (req.orderstatus === PushConstant.masteridOrder_Accept){
//     var makeit_accept_time = moment().format("YYYY-MM-DD HH:mm:ss");
//       var makeit_expected_preparing_time = moment()
//       .add(0, "seconds")
//       .add(constant.foodpreparationtime, "minutes")
//       .format("YYYY-MM-DD HH:mm:ss");
//   values=[req.orderstatus, makeit_expected_preparing_time,makeit_accept_time,req.orderid];
//   updatequery = "Update Orders set orderstatus = ?,makeit_expected_preparing_time= ?,makeit_accept_time=?,makeit_status=1 where orderid = ? "
//   }else if (req.orderstatus === PushConstant.masteridOrder_Prepared){
//     var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
//     values=[req.orderstatus, transaction_time, req.orderid];
//     updatequery = "Update Orders set orderstatus = ?,makeit_actual_preparing_time= ? where orderid = ? "
//   }

//   sql.query(updatequery,values,async function(err, res) {
//   if (err) {
//       result(err, null);
//   } else {
//         if (req.orderstatus === PushConstant.masteridOrder_Accept) {
//           await Notification.orderEatPushNotification(
//             req.orderid,
//             null,
//             PushConstant.Pageid_eat_order_accept
//           );
//         } else if (req.orderstatus === PushConstant.masteridOrder_Prepared) {
//           await Notification.orderEatPushNotification(
//             req.orderid,
//             null,
//             PushConstant.masteridOrder_Prepared
//           );
//         }

//         req.orglat = orderdetails[0].makeit_lat;
//         req.orglon = orderdetails[0].makeit_lon;
//         req.deslat = orderdetails[0].cus_lat;
//         req.deslon = orderdetails[0].cus_lon;
//         req.hubid  = orderdetails[0].makeithub_id;

//         Order.eat_order_distance_calculation(req ,async function(err,res3) {
//           if (err) {
//             result(err, null);
//           } else {
//             if (res3.status != true) {
//               result(null, res3);
//             } else {
  
              
//               var routes = res3.result;
//               var caldistance = routes.routes;
//               var deliverytimedata = caldistance[0].legs;
             
//               req.distance = parseInt(deliverytimedata[0].distance.text);
//                req.duration = parseInt(deliverytimedata[0].duration.text);
//                req.duration = req.duration + constant.orderbuffertime;
//                req.deliverytime  = moment()
//                .add(0, "seconds")
//                .add(req.duration, "minutes")
//                .format("YYYY-MM-DD HH:mm:ss");

//                await Order.insert_delivery_time(req);

//                Order.auto_order_assign(req ,async function(err,auto_order_data) {
//                 if (err) {
//                   result(err, null);
//                 } else {
//                   if (auto_order_data.status != true) {
//                     result(null, auto_order_data);
//                   } else {

//                     let response = {
//                       success: true,
//                       status: true,
//                       message: "Order accepted successfully."
//                      // result :deliverytimedata 
//                     };
//                     result(null, response);
//                   }
//                 }
//               });
//             //   let response = {
//             //     success: true,
//             //     status: true,
//             //     message: "Order accepted successfully.",
//             //  //   result :deliverytimedata 
//             //   };
//             //   result(null, response);
//             }
//           }
//         });
//       }
//     }
//   );
// }else if (orderdetails[0].orderstatus == 5){

//   let response = {
//     success: true,
//     status: true,
//     message: "Order already pickedup",
//  //   result :deliverytimedata 
//   };
//   result(null, response);
// }else if (orderdetails[0].orderstatus == 6){

//   let response = {
//     success: true,
//     status: true,
//     message: "Order already delivered",
//  //   result :deliverytimedata 
//   };
//   result(null, response);
// }else{

//   let response = {
//     success: true,
//     status: true,
//     message: "Order already Canceled",
//  //   result :deliverytimedata 
//   };
//   result(null, response);
// }
// };

Order.getAllOrder = function getAllOrder(result) {
  sql.query("Select * from Orders", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.getAllVirtualOrder = function getAllVirtualOrder(result) {
  sql.query("Select * from Orders where virtual=0", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Order.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Orders SET moveit_user_id = ? WHERE orderid = ?",
    [id, id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Order.remove = function(id, result) {
  sql.query("DELETE FROM Orders WHERE orderid = ?", [id], function(err, res) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Order.get_all_orders = function get_all_orders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * orderlimit;

  var countQuery="Select count(*) as totalcount from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id where (od.payment_type=0 or (od.payment_type=1 and od.payment_status<2))";
  var query =
  "Select od.*,us.*,mu.brandname,mu.virtualkey as kitchentype from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id where (od.payment_type=0 or (od.payment_type=1 and od.payment_status<2))";
 // var query =
    //"Select * from Orders as od left join User as us on od.userid=us.userid where (od.payment_type=0 or (od.payment_type=1 and od.payment_status>0) )and orderstatus < 9";
  var searchquery =
    "mu.phoneno LIKE  '%" +
    req.search +
    "%' OR mu.email LIKE  '%" +
    req.search +
    "%' or mu.name LIKE  '%" +
    req.search +
    "%'  or od.orderid LIKE  '%" +
    req.search +
    "%'";
  if (req.virtualkey !== "all") {
    query = query + " and od.ordertype = '" + req.virtualkey + "'";
    countQuery= countQuery + " and od.ordertype = '" + req.virtualkey + "'";
  }

  if (req.delivery_vendor !== "all"){
    query = query + " and od.delivery_vendor = '" + req.delivery_vendor + "'";
    countQuery= countQuery + " and od.delivery_vendor = '" + req.delivery_vendor + "'";
  }
  //var search= req.search
  if (req.virtualkey !== "all" && req.search) {
    query = query + " and (" + searchquery + ")";
    countQuery= countQuery + " and (" + searchquery + ")";
  } else if (req.search) {
    query = query + " and " + searchquery;
    countQuery= countQuery + " and " + searchquery;
  }

  var limitquery =query +" order by od.orderid desc limit " +startlimit +"," +orderlimit +" ";

 
  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;
     // console.log("countQuery-->",countQuery);
      sql.query(countQuery, function(err, res2) {
        totalcount = res2[0].totalcount;
        let resobj = {
          success: true,
          status:true,
          totalorder: totalcount,
          result: res1
        };
        console.log("totalcount-->",totalcount);
        result(null, resobj);
      });
    }
  });
};

// Order.get_today_vorders = function get_today_vorders(req, result) {
//   var orderlimit = 20;
//   var page = req.page || 1;
//   var makeithub_id = req.makeithub_id || 1;
//   var startlimit = (page - 1) * orderlimit;
//   var orderstatus =req.orderstatus||0
//   var query ="Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.orderstatus = "+orderstatus;

//   var searchquery =
//     "us.phoneno LIKE  '%" +
//     req.search +
//     "%' OR us.email LIKE  '%" +
//     req.search +
//     "%' or us.name LIKE  '%" +
//     req.search +
//     "%'  or od.orderid LIKE  '%" +
//     req.search +
//     "%'";

//   if (req.makeithub_id) {
//     query = query + " and mk.makeithub_id='" + makeithub_id + "'";
//   }

//   if (req.search) {
//     query = query + " and (" + searchquery + ")";
//   }

//   var limitquery =
//     query +
//     " order by od.orderid asc limit " +
//     startlimit +
//     "," +
//     orderlimit +
//     " ";

//     if(req.orderstatus===1){
//     limitquery = query +" order by od.makeit_expected_preparing_time asc limit " +
//     startlimit +
//     "," +
//     orderlimit +
//     " ";
//     }
//     if(req.orderstatus===3){
//     limitquery = query +" order by od.makeit_actual_preparing_time asc limit " +
//     startlimit +
//     "," +
//     orderlimit +
//     " ";
//     }
    
    

//   sql.query(limitquery, function(err, res1) {
//     if (err) {
//       result(err, null);
//     } else {
//       var totalcount = 0;

//       sql.query(query, function(err, res2) {
//         if (err) {
//           result(err, null);
//           return;
//         }
//         totalcount = res2.length;
//         let resobj = {
//           success: true,
//           status: true,
//           totalorder: totalcount,
//           result: res1
//         };
//         result(null, resobj);
//       });
//     }
//   });
// };

Order.get_today_vorders = function get_today_vorders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var makeithub_id = req.makeithub_id || 1;
  var startlimit = (page - 1) * orderlimit;
  var orderstatus =req.orderstatus||0

  //var query ="Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.lock_status=0 and od.orderstatus = "+orderstatus;
  var query =
    "Select od.*,mk.name as makeit_name,mk.brandname as makeit_brandname,IF(((od.created_at+ INTERVAL 10 MINUTE) < now() && od.orderstatus=0),'1','0') as isAlert,JSON_OBJECT('productitem', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'prod_desc',pt.prod_desc))) AS items"+ 
    " from Orders as od"+ 
    " left join MakeitUser as mk on mk.userid=od.makeit_user_id"+
    " left join OrderItem ci ON ci.orderid = od.orderid"+ 
    " left join Product pt on pt.productid = ci.productid"+
    " where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.orderstatus = "+orderstatus;
    
  var searchquery =
    "od.orderid LIKE  '%" +
    req.search +
    "%'";

  if (req.makeithub_id) {
    query = query + " and mk.makeithub_id='" + makeithub_id + "'";
  }

  if (req.search) {
    query = query + " and (" + searchquery + ")";
  }

  var limitquery =
    query +
    " group by od.orderid order by od.orderid asc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";

    if(req.orderstatus===1){
    limitquery = query +" group by od.orderid order by od.makeit_expected_preparing_time asc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";
    }
    if(req.orderstatus===3){
    limitquery = query +" group by od.orderid order by od.makeit_actual_preparing_time asc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";
    }

    if(req.orderstatus===3){
      limitquery = query +" group by od.orderid order by od.makeit_actual_preparing_time asc limit " +
      startlimit +
      "," +
      orderlimit +
      " ";
      }

      if(req.orderstatus===4){
        limitquery = query +" group by od.orderid order by od.makeit_actual_preparing_time asc limit " +
        startlimit +
        "," +
        orderlimit +
        " ";
        }


  sql.query(limitquery, function(err, res1) {
    if (err) {
      console.log("err-->",err);
      result(err, null);
    } else {
      var totalcount = 0;
      var isAlert =false;
      var isAlertCount =0;
      sql.query(query, function(err, res2) {
        if (err) {
          result(err, null);
          return;
        }
        totalcount = res2.length;
        for(var i=0;i<res1.length;i++){
          if(res1[i].isAlert==='1') {isAlert=true; isAlertCount+=1;}
          res1[i].items= JSON.parse(res1[i].items);
        }
        let resobj = {
          success: true,
          status: true,
          isAlertCount:isAlertCount,
          isAlert:isAlert,
          totalorder: totalcount,
          result: res1
        };
        result(null, resobj);
      });
    }
  });
};

Order.get_all_vorders = function get_all_vorders(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var makeithub_id = req.makeithub_id || 0;
  var startlimit = (page - 1) * orderlimit;

  var query =
    "Select od.*,us.name as name,us.phoneno as phoneno,mk.name as makeit_name,mk.brandname as makeit_brandname from Orders as od left join User as us on od.userid=us.userid left join MakeitUser as mk on mk.userid=od.makeit_user_id where mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) ";
  var searchquery =
    "us.phoneno LIKE  '%" +
    req.search +
    "%' OR us.email LIKE  '%" +
    req.search +
    "%' or us.name LIKE  '%" +
    req.search +
    "%'  or od.orderid LIKE  '%" +
    req.search +
    "%'";
  if (req.makeithub_id) {
    query = query + " and mk.makeithub_id='" + makeithub_id + "'";
  }
  //var search= req.search
  if(req.search) {
    query = query + " and (" + searchquery + ")";
  }

  var limitquery =
    query +
    " order by od.orderid desc limit " +
    startlimit +
    "," +
    orderlimit +
    " ";

  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;

      sql.query(query, function(err, res2) {
        totalcount = res2.length;
        let resobj = {
          success: true,
          status: true,
          totalorder: totalcount,
          result: res1
        };
        result(null, resobj);
      });
    }
  });
};

Order.order_assign = function order_assign(req, result) {
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");

  sql.query("Select online_status,pushid_android,pushid_ios,login_status From MoveitUser where userid= '" +req.moveit_user_id +"' ",function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        var online_status = res1[0].online_status;
        if (res1[0].login_status == 1) {
                 
        if (online_status == 1) {
          sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[req.moveit_user_id, assign_time, req.orderid],async function(err, res2) {
              if (err) {
                result(err, null);
              } else {
                //update to queue
                var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

                var orderactionlog={};
                orderactionlog.orderid=req.orderid;
                orderactionlog.app_type=req.app_type || 0;
                orderactionlog.userid=req.admin_id || 0;
                orderactionlog.action=3;
                await Order.createOrderActionLog(orderactionlog);

                await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned,res1[0]);

                 req.state=1;
                 Order.update_moveit_lat_long(req);

                

                let resobj = {
                  success: true,
                  status:true,
                  message: "Order Assign Successfully"
                };
                result(null, resobj);
              }
            }
          );
        } else {
          let resobj = {
            success: true,
            status: false,
            message: "Move it user is offline"
          };
          result(null, resobj);
        }
      }else if(res1[0].login_status == 2){
        let resobj = {
          success: true,
          status: false,
          message: "Please login"
      };
    
      result(null, resobj);
      }else if(res1[0].login_status == 3){
        let resobj = {
          success: true,
          status: false,
          message: "Please contact Administrator"
      };
    
      result(null, resobj);
      }
      }
    }
  );
};

Order.getUnassignorders =async function getUnassignorders(req,result) {
//req.id == 1 getUnassignorders
//req.id == 2 unacceptorders
//req.id == 3 delivery orders
  if (req.id == 1 ) {
    
    var res = await query("Select mk.makeithub_id,mk.zone,mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and ors.delivery_vendor = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status=0 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0");
    if (res.err) {
      result(err, null);
    } 
    // sql.query(
    //   "Select us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status=0 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0",
    //   function(err, res) {
    //     if (err) {
    //       result(err, null);
    //     } else {
    //       let resobj = {
    //         success: true,
    //         status:true,
    //         result: res
    //       };
    //       result(null, resobj);
    //     }
    //   }
    // );Select * from Orders where DATE(created_at) = CURDATE() and moveit_user_id !=0 and (moveit_status IS NULL OR moveit_status = '') and orderstatus < 6 order by orderid ASC
  }else if(req.id == 2){
    var res = await query("Select mk.makeithub_id,mk.zone,mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and ors.moveit_user_id !=0 and (ors.moveit_status IS NULL OR ors.moveit_status = '') and ors.orderstatus < 5 order by ors.orderid ASC");
    if (res.err) {
          result(err, null);
        } 
  }else if(req.id == 3){
    var res = await query("Select mk.makeithub_id,mk.zone,mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and ors.moveit_user_id !=0 and ors.moveit_status = 1  and ors.orderstatus < 6 order by ors.orderid ASC");
  if (res.err) {
    result(err, null);
  } 
  }else if(req.id == 4){
    var res = await query("Select mk.makeithub_id,mk.zone,mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and (ors.created_at+ INTERVAL 45 MINUTE) < now() and ors.payment_status<2 and ors.orderstatus < 6 order by ors.orderid ASC");
    if (res.err) {
      result(err, null);
    } 
  }else if(req.id == 5){
    var res = await query("Select mk.makeithub_id,mk.zone,mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,ors.moveit_user_id,mv.name as moveit_name,mk.lat as makeit_lat,mk.lon as makeit_lon,mv.phoneno as moveit_phoneno from Orders ors join Orders_queue oq on oq.orderid=ors.orderid left join MakeitUser as mk on mk.userid=ors.makeit_user_id left join User as us on ors.userid=us.userid left join MoveitUser as mv on mv.userid=ors.moveit_user_id  where DATE(ors.created_at) = CURDATE() and ors.payment_status < 2 and ors.orderstatus < 6 and oq.status!=1 order by ors.ordertime ASC");
    if (res.err) {
      result(err, null);
    } 
  }else{
    var res = await query("Select mk.makeithub_id,mk.zone,mk.brandname,mk.virtualkey,us.name,ors.orderid,ors.ordertime,ors.created_at,ors.cus_address,ors.makeit_user_id,ors.orderstatus,ors.ordertype,ors.original_price,ors.price,ors.userid,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser as mk on mk.userid=ors.makeit_user_id where ors.moveit_user_id = 0 and (ors.orderstatus = 1 or ors.orderstatus = 3) and ors.lock_status!=1 and DATE(ors.ordertime) = CURDATE() and ors.payment_status!=2 and ors.cancel_by = 0");
  }
 
  let resobj = {
            success:true,
            status:true,
            result: res
          };
          result(null, resobj);
 
};

Order.orderviewbymoveituser = function(orderid, result) {
  // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
  sql.query(
    "select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" +
      orderid +
      "'",
    function(err, responce) {
      if (err) {
        result(err,null);
      } else {
        let resobj = {
          success: true,
          status:true,
          res: responce
        };
        result(null, resobj);
      }
    }
  );
};



Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser( req,kitchenqualitylist,result) {
  var order_pickup_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var twentyMinutesLater = moment().add(0, "seconds").add(constant.foodpreparationtime, "minutes").format("YYYY-MM-DD HH:mm:ss");
  req.lat = req.lat || 0;
  req.lon = req.lon || 0;

sql.query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid = ?", [req.orderid],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      
      if (res1.length !==0) {
        
      
      if (res1[0].orderstatus == 7) {
        let resobj = {
          success: true,
          status:false,
          message: "Sorry! This order already canceled."
        };
        result(null, resobj);
       // return;
      }else if (res1[0].orderstatus < 3 ) {
        console.log(res1[0].orderstatus);
        let resobj = {
          success: true,
          status:false,
          message: "Please wait food not yet prepared"
        };
        result(null, resobj);
      //  return;
      }else{
     
      if (res1[0].moveit_user_id == req.moveit_userid) {

        req.moveitid = req.moveit_userid;
        req.status = 3 // order pickup by moveit
        await Order.insert_order_status(req);

        for (let i = 0; i < kitchenqualitylist.length; i++) {
          var qualitylist = new MoveitRatingForMakeit(kitchenqualitylist[i]);
          qualitylist.orderid = req.orderid;
          qualitylist.makeit_userid = req.makeit_userid;
          qualitylist.moveit_userid = req.moveit_userid;
  
          MoveitRatingForMakeit.create_moveit_kitchen_qualitycheck(
            qualitylist,
            function(err, res2) {
              if (err) result(err, null);
            }
          );
        }

        sql.query(
          "UPDATE Orders SET orderstatus = ? ,moveit_pickup_time = ?,moveit_expected_delivered_time = ?,moveit_Pickup_lat=?,moveit_Pickup_long=? WHERE orderid = ? and moveit_user_id =?",
          [
            req.orderstatus,
            order_pickup_time,
            twentyMinutesLater,
            req.lat,
            req.lon,
            req.orderid,
            req.moveit_userid
          ],
          async function(err, res2) {
            if (err) {
              result(err, null);
            } else {
              await Notification.orderEatPushNotification(req.orderid,null,PushConstant.Pageid_eat_order_pickedup);

              req.orglat = res1[0].makeit_lat;
              req.orglon = res1[0].makeit_lon;
              req.deslat = res1[0].cus_lat;
              req.deslon = res1[0].cus_lon;

              let response = {
                success: true,
                status: true,
                message: "Order Pickedup successfully.",
             
              };
              result(null, response);
    
              // Order.eat_order_distance_calculation(req ,async function(err,res3) {
              //   if (err) {
              //     result(err, null);
              //   } else {
              //     if (res3.status != true) {
              //       result(null, res3);
              //     } else {
        
                    
              //       var routes = res3.result;
              //       var caldistance = routes.routes;
              //       var deliverytimedata = caldistance[0].legs;
                   
              //       req.distance = parseInt(deliverytimedata[0].distance.text);
              //        req.duration = parseInt(deliverytimedata[0].duration.text);
              //        req.duration = req.duration + constant.orderbuffertime;
              //        req.deliverytime  = moment()
              //        .add(0, "seconds")
              //        .add(req.duration, "minutes")
              //        .format("YYYY-MM-DD HH:mm:ss");
    
              //        await Order.insert_delivery_time(req);
                                  
              //       let response = {
              //         success: true,
              //         status: true,
              //         message: "Order Pickedup successfully.",
                   
              //       };
              //       result(null, response);
              //     }
              //   }
              // });
              ////Insert Order History////
              
              ////////////////////////////
            }
          }
        );
      } else {
        let resobj = {
          success: true,
          status:false,
          message: "Following order is not assigned to you!"
        };
        result(null, resobj);
      }
      }
    }else{
      let response = {
        success: true,
        status: false,
        message: "Order not found.",
     
      };
      result(null, response);
    }
    }
});
};

// Order.order_delivery_status_by_moveituser = async function(req, result) {
//   var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
//   sql.query(
//     "Select * from Orders where orderid = ? and moveit_user_id = ?",
//     [req.orderid, req.moveit_user_id],async function(err, res1) {
//       if (err) {
//         result(err, null);
//       } else {
//         if (res1.length !== 0) {

//           if (res1[0].orderstatus == 6) {
//             let resobj = {
//               success: true,
//               message: "Sorry!  order was already deliverd.",
//               status:false
//             };
//             result(null, resobj);
//           }else if (res1[0].orderstatus == 7) {
//             let resobj = {
//               success: true,
//               message: "Sorry!  order already canceled.",
//               status:false
//             };
//             result(null, resobj);
//           }else{

//           if (res1[0].payment_status == 1) {
//             req.moveitid = req.moveit_user_id;
//             req.status = 7
//             await Order.insert_order_status(req); 

//             ////Start: Get Distance From geofire //////
//             sql.query("select * from MakeitUser where userid="+res1[0].makeit_user_id, async function(err,getmakeit){
//               if(err){
//                 result(err, null);
//               }else{
//                 var RequestDistance ={"orglat":res1[0].cus_lat,"orglon":res1[0].cus_lon,"deslat":getmakeit[0].lat.toString(),"deslon":getmakeit[0].lon.toString()};
//                 await Order.eat_order_distance_calculation(RequestDistance, async function(err, getdistance) {
//                   if(err){
//                     result(err, null);
//                   }else{
//                     distance_makeit_to_eat = getdistance.result.routes[0].legs[0].distance.value || 0;

//                     /////////////////////////////Start: Old Code/////////////////////////////
//                     sql.query(
//                       "UPDATE Orders SET orderstatus = ?,distance_makeit_to_eat = ?,moveit_actual_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",
//                       [req.orderstatus, distance_makeit_to_eat, order_delivery_time, req.orderid, req.moveit_user_id],
//                       async function(err, res) {
//                         if (err) {
//                           result(err, null);
//                         } else {
//                           let resobj = {
//                             success: true,
//                             message: "Order Delivery successfully",
//                             status:true,
//                             orderdeliverystatus: true
//                           };
//                           await Notification.orderEatPushNotification(
//                             req.orderid,
//                             null,
//                             PushConstant.Pageid_eat_order_delivered
//                           );
//                           ////Insert Order History////
                          
//                           ////////////////////////////
//                           result(null, resobj);
//                         }
//                       }
//                     );
//                     /////////////////////////////End: Old Code/////////////////////////////

//                   }
//                 });
//               }
//             });
//             /////End: Get Distance From geofire/////////////////////////////////

//           } else {
//             let resobj = {
//               success: true,
//               status:false,
//               message: "Payment not yet paid!",
//               orderdeliverystatus: false
//             };
//             result(null, resobj);
//           }
//         }
//         } else {
//           let resobj = {
//             success: true,
//             message: "Following order is not assigned to you!.",
//             status:false
//           };
//           result(null, resobj);
//         }
//       }
//     }
//   );
// };


Order.order_delivery_status_by_moveituser =async function(req, result) {
  req.lat = req.lat || 0;
  req.lon = req.lon || 0;
  var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
  const orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon,mk.makeithub_id,mk.zone,zo.zone_status from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id left join Zone zo on zo.id=mk.zone where ors.orderid ='" + req.orderid + "'");
  sql.query("Select * from Orders where orderid = ? and moveit_user_id = ?",[req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length !== 0) {

          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
          req.deslat = orderdetails[0].cus_lat;
          req.deslon = orderdetails[0].cus_lon;
          req.hubid= orderdetails[0].makeithub_id;
          req.zoneid= orderdetails[0].zone;
          req.zone_status= orderdetails[0].zone_status;
          req.payment_type= orderdetails[0].payment_type;

          if (res1[0].orderstatus == 6) {
            let resobj = {
              success: true,
              message: "Sorry!  order was already deliverd.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus == 7) {
            let resobj = {
              success: true,
              message: "Sorry!  order already canceled.",
              status:false
            };
            result(null, resobj);
          }else{

          if (res1[0].payment_status == 1) {

            req.moveitid = req.moveit_user_id;
            req.status = 7
            await Order.insert_order_status(req); 


            Order.eat_order_distance_calculation(req ,async function(err,res3) {
              if (err) {
                result(err, null);
              } else {
                if (res3.status != true) {
                  result(null, res3);
                } else {
      
                  var routes = res3.result;
                  var caldistance = routes.routes;
                  var deliverytimedata = caldistance[0].legs;
                 
                  req.distance = parseInt(deliverytimedata[0].distance.text);
                  req.duration = parseInt(deliverytimedata[0].duration.text);
  
                
                  sql.query("UPDATE Orders SET orderstatus = ?,moveit_actual_delivered_time = ?,last_mile=?,moveit_delivery_lat=?,moveit_delivery_long=? WHERE orderid = ? and moveit_user_id =?",[req.orderstatus, order_delivery_time, req.distance,req.lat,req.lon, req.orderid, req.moveit_user_id],async function(err, res) {
                    if (err) {
                      result(err, null);
                    } else {
    
                     
                      let resobj = {
                        success: true,
                        message: "Order Delivery successfully",
                        status:true,
                        orderdeliverystatus: true
                      };
                      await Notification.orderEatPushNotification(
                        req.orderid,
                        null,
                        PushConstant.Pageid_eat_order_delivered
                      );
                      result(null, resobj);
                   
                     
                    }
                  }
                );
  
               
                }
              }
            });

           
          } else {
            let resobj = {
              success: true,
              status:false,
              message: "Payment not yet paid!",
              orderdeliverystatus: false
            };
            result(null, resobj);
          }
        }
        } else {
          let resobj = {
            success: true,
            message: "Following order is not assigned to you!.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.moveit_kitchen_reached_status = function(req, result) {
  var kitchenreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
  var twentyMinutesLater = new Date();
  twentyMinutesLater.setMinutes(twentyMinutesLater.getMinutes() + 20);
  req.lat = req.lat || 0;
  req.lon = req.lon || 0;
  sql.query("Select * from Orders where orderid = ?", [req.orderid],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      var getmoveitid = res1[0].moveit_user_id;
      if (getmoveitid == req.moveit_user_id) {
        req.moveitid = req.moveit_user_id
        req.status = 2
        await Order.insert_order_status(req);

        sql.query(
          "UPDATE Orders SET moveit_reached_time = ?,moveit_kitchen_reached_lat=?,moveit_kitchen_reached_long=? WHERE orderid = ? and moveit_user_id =?",
          [           
            kitchenreachtime,
            req.lat,
            req.lon,
            req.orderid,
            req.moveit_user_id
          ],
         async  function(err, res) {
            if (err) {
              result(err, null);
            } else {
              let resobj = {
                success: true,
                status:true,
                message: "kitchen reached successfully"
              };
              ////Insert Order History////
              
              ////////////////////////////
              result(null, resobj);
            }
          }
        );
      } else {
        let resobj = {
          success: true,
          status:false,
          message: "Following order is not assigned to you!"
        };
        result(null, resobj);
      }
    }
  });
};

Order.order_payment_status_by_moveituser = function(req, result) {
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length > 0) {
          // check the payment status - 1 is paid
          console.log(res1[0].payment_status);
          if (res1[0].payment_status == 0) {

            req.moveitid = req.moveit_user_id;
            req.status = 6
            await Order.insert_order_status(req); 

            sql.query(
              "UPDATE Orders SET payment_status = ? WHERE orderid = ? and moveit_user_id =?",
              [req.payment_status, req.orderid, req.moveit_user_id],
              function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    status:true,
                    message: "Cash received successfully"
                  };
                  result(null, resobj);
                }
              }
            );
          } else {
            let resobj = {
              success: true,
              status:false,
              message: "Already Payment has been paid!"
            };
            result(null, resobj);
          }
        } else {
          let resobj = {
            success: true,
            status:false,
            message: "Please check your orderid and moveit user id! / order values is null"
          };

          result(null, resobj);
        }
      }
    }
  );
};

Order.orderhistorybymoveituserid = async function(moveit_user_id, result) {
    const rows = await query(
      "Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makitphone,ms.userid as makeituserid,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ors.landmark,ors.flatno from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid  where ors.moveit_user_id =" +
        moveit_user_id +
        " and (ors.orderstatus = 6 or ors.orderstatus = 7) order by ors.moveit_actual_delivered_time desc"
    );

    if (rows.length === 0) {
      let resobj = {
        success: false,
        status:false,
        result: rows
      };
      result(null, resobj);
    } else {


      const yesterdaycod = await query("select sum(price) as cod from Orders where moveit_user_id =" +
      moveit_user_id +
      " and DATE(created_at) = DATE(NOW() - INTERVAL 1 DAY) and orderstatus = 6 and payment_type = 0  ");

      console.log(yesterdaycod[0].cod);
    for (let i = 0; i < rows.length; i++) {
      var url =
        "Select ot.productid,pt.product_name,ot.quantity from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = " +
        rows[i].orderid +
        "";
      let products = await query(url);
      rows[i].items = products;
    }
    let resobj = {
      success: true,
      status:true,
      yesterdaycod : yesterdaycod[0].cod || 0,
      result: rows
    };
    result(null, resobj);
  }
};

Order.orderlistbymoveituserid = async function(moveit_user_id, result) {

  // const rows = await query(
  //   "Select  ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.landmark,ors.flatno,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress,mt.status from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id left join Moveit_status mt on mt.moveitid = ors.moveit_user_id where ors.moveit_user_id =" +moveit_user_id +" and  DATE(ors.ordertime) = CURDATE() group by ors.orderid order by ors.order_assigned_time desc"
  // );

  const rows = await query(
    "Select  ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.landmark,ors.flatno,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id where ors.moveit_user_id ="+moveit_user_id+" and  DATE(ors.ordertime) = CURDATE()  group by ors.orderid order by ors.order_assigned_time desc"
);

  const cod_amount = await query(
    "select sum(price) as totalamount from Orders where DATE(created_at) = CURDATE() and orderstatus = 6  and payment_status = 1 and payment_type = 0  and lock_status = 0 and  moveit_user_id = " +moveit_user_id +"");

    console.log(rows.length);
  if (rows.length == 0) {
    var res = {
      result: "Order not found!",
      status: false,
      success: true,
    };
    result(null, res);
    return;
  }else{

    

    for (let i = 0; i < rows.length; i++) {

      var moveitstatusquery ="select * from Moveit_status  where orderid = " +rows[i].orderid +" order by id desc limit 1";
      var statuslist = await query(moveitstatusquery);
      if (statuslist.length !==0 ) {
        rows[i].status = statuslist[0].status

      }
     

      var url =
        "Select ot.productid,pt.product_name,ot.quantity from OrderItem ot join Product pt on ot.productid=pt.productid where ot.orderid = " +
        rows[i].orderid +
        "";
      let products = await query(url);
      rows[i].items = products;
      rows[i].locality = "Guindy";

     
    }
    console.log(cod_amount);
    let resobj = {
      success: true,
      status: true,
      cod_amount :cod_amount[0].totalamount || 0,
      result: rows
    };
  
    result(null, resobj);

  }
};

Order.orderviewbyadmin = function(req, result) {
  sql.query(
    "SELECT dm.*,ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'virtualkey',ms.virtualkey) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items,JSON_OBJECT('makeithub_name',mh.makeithub_name,'lat',mh.lat,'lon',mh.lon,'address',mh.address,'addressDetails',mh.addressDetails,'flat_no',mh.flat_no,'phone_number',mh.phone_number,'pincode',mh.pincode) as makeithubdetail from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid left join Dunzo_moveit_details dm on dm.task_id=ors.dunzo_taskid  left join Makeit_hubs mh on mh.makeithub_id=ms.makeithub_id  where ors.orderid ='" +req.id +"'",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        var orderDetail=res[0];
        // orderDetail.userdetail = JSON.parse(orderDetail.userdetail);
        // orderDetail.makeitdetail = JSON.parse(orderDetail.makeitdetail);
        // orderDetail.moveitdetail = JSON.parse(orderDetail.moveitdetail);
        // orderDetail.makeithubdetail = JSON.parse(orderDetail.makeithubdetail);
        // orderDetail.items = JSON.parse(orderDetail.items);
        // orderDetail.items =orderDetail.items.item;

        res[0].userdetail = JSON.parse(orderDetail.userdetail);
        res[0].makeitdetail = JSON.parse(orderDetail.makeitdetail);
        res[0].moveitdetail = JSON.parse(orderDetail.moveitdetail);
        res[0].makeithubdetail = JSON.parse(orderDetail.makeithubdetail);
        orderDetail.items = JSON.parse(orderDetail.items);
        res[0].items =orderDetail.items.item;

        if ( res[0].makeitdetail.virtualkey==1) {
          res[0].makeitdetail.address = res[0].makeithubdetail.addressDetails;
          res[0].makeitdetail.phoneno = res[0].makeithubdetail.phone_number;
        }


       
        let resobj = {
          success: true,
          status:true,
          result: res
        };

        result(null, resobj);
      }
    }
  );
};

Order.eat_get_delivery_time = function eat_get_delivery_time(req) {

  Order.eat_get_delivery_time_by_moveit_id(req, function(err, res) {
    if (err) return err;
    else return res;
  });
};

// Order.orderviewbyeatuser = function(req, result) {

//   var foodpreparationtime = constant.foodpreparationtime;
//   var onekm = constant.onekm;
//   var radiuslimit=constant.radiuslimit;
//   var orderquery =  "SELECT dm.*,ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid left join Dunzo_moveit_details dm on dm.task_id=ors.dunzo_taskid where ors.orderid ='"+req.orderid +"'  " ;//and dm.active_status=1
//   sql.query(orderquery,async function(err, res1) {
//       if (err) {
//         result(err, null);
//       } else {
//         if (res1.length === 0 || res1[0].orderid === null) {
//           let resobj = {
//             success: true,
//             status: false,
//             message: "Order not found!",
//             result: []
//           };
//           result(null, resobj);
//         } else {

//                 if (res1[0].runner_name== null) {
//                   res1[0].runner_name='';
//                   res1[0].runner_phone_number='';
//                 }
              
//                 res1[0].servicecharge = constant.servicecharge;
//                 res1[0].cancellationmessage = constant.cancellationmessage;;
              

//                 res1[0].payment_type_name ='Cash on delivery'; 
//                 if (res1[0].payment_type === 1 || res1[0].payment_type === "1") {
//                   res1[0].payment_type_name ='Online'; 
//                 }

//                 if (res1[0].userdetail) {
//                   res1[0].userdetail = JSON.parse(res1[0].userdetail);
//                 }

//                 if (res1[0].makeitdetail) {
//                   res1[0].makeitdetail = JSON.parse(res1[0].makeitdetail);
//                 }
//                 if (res1[0].moveitdetail) {
//                   res1[0].moveitdetail = JSON.parse(res1[0].moveitdetail);
//                 }

//                 if (res1[0].items) {
//                   var items = JSON.parse(res1[0].items);
//                   res1[0].items = items.item;
//                 }

//                 ////dunzo code
//                 if (res1[0].delivery_vendor==1) {
                  
//                   res1[0].moveitdetail.name=res1[0].runner_name;
//                   res1[0].moveitdetail.phoneno=res1[0].runner_phone_number;

//                 }
//                 res1[0].dunzo_client_id= dunzoconst.dunzo_client_id;
//                 res1[0].Authorization= dunzoconst.Authorization;


//                   var itemlist = res1[0].items
//                   var productprice = 0;
//                 for (let i = 0; i < itemlist.length; i++) {
                  
//                   productprice = productprice + ( itemlist[i].quantity * itemlist[i].price);
                 
//                 }

//                 res1[0].trackingstatus = Order.orderTrackingDetail(
//                   res1[0].orderstatus,
//                   res1[0].moveitdetail
//                 );
//                 //}

//                 var cartdetails = [];
//                 var totalamountinfo = {};
//                 var couponinfo = {};
//                 var gstinfo = {};
//                 var deliverychargeinfo = {};
//                 var refundinfo = {};
//                 var productinfo = {};
//                 //var grandtotalinfo = {};
        
//                     productinfo.title = "Product Price";
//                     productinfo.charges = productprice;
//                     productinfo.status = true;
//                     cartdetails.push(productinfo); 


//                   if (res1[0].discount_amount) {
//                     couponinfo.title = "Coupon adjustment (-)";
//                     couponinfo.charges = res1[0].discount_amount;
//                     couponinfo.status = true;
//                     cartdetails.push(couponinfo);
//                   }
        
//                   gstinfo.title = "GST";
//                   gstinfo.charges = res1[0].gst;
//                   gstinfo.status = true;
//                   cartdetails.push(gstinfo);

//                   console.log("Handling charge" +res1[0].delivery_charge);

//                   if (res1[0].delivery_charge != 0) {
//                     deliverychargeinfo.title = "Handling charge";
//                     deliverychargeinfo.charges = res1[0].delivery_charge;
//                     deliverychargeinfo.status = true;
//                     cartdetails.push(deliverychargeinfo);
//                   }
                 
        
//                   if (res1[0].refund_amount) {
//                     refundinfo.title = "Refund adjustment (-)";
//                     refundinfo.charges = res1[0].refund_amount;
//                     refundinfo.status = true;
//                     cartdetails.push(refundinfo);
//                   }

//                   res1[0].cartdetails = cartdetails;


//                   if ( res1[0].orderstatus < 6 ) {

//                     await Order.eat_get_delivery_time(req);
                   
//                     var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+req.orderid +" order by od_id desc limit 1");
                    
  
//                     if (res1[0].delivery_vendor==1) {
                      
                  
//                     var url ='https://apis-staging.dunzo.in/api/v1/tasks/'+res1[0].dunzo_taskid+'/status?test=true'

//                     var headers= {
//                       'Content-Type': 'application/json',
//                       'client-id': dunzoconst.dunzo_client_id,
//                       'Authorization' : dunzoconst.Authorization,
//                       'Accept-Language':'en_US'
//                     };
                  
//                     const options = {
//                       url: url,
//                       method: 'GET',
//                       headers: headers
//                   };
                  
//                   request(options, function(err, res, body) {
//                       let dunzo_status = JSON.parse(body);
//                     //  console.log(json);
//                     console.log("dunzo_status------------------->",dunzo_status);
//                     var pickup=dunzo_status.eta.pickup || 0;
//                     var dropoff= dunzo_status.eta.dropoff || 0;

//                     var eta = Math.round(pickup + dropoff);
//                     res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");
//                     res1[0].eta = eta;
                   
//                     let resobj = {
//                       success: true,
//                       status: true,
//                       result: res1
//                     };
    
//                     result(null, resobj);  
//                   });

//                     } else {

//                       if (orderdeliverytime.length !== 0) {
//                         res1[0].deliverytime = orderdeliverytime[0].deliverytime;
//                         res1[0].eta = orderdeliverytime[0].duration;

//                         let resobj = {
//                           success: true,
//                           status: true,
//                           result: res1
//                         };
        
//                         result(null, resobj);  
//                       }else{
    
//                         // we need to remove once delivery time stable
//                         eta = foodpreparationtime + Math.round(onekm * res1[0].distance);
//                         //15min Food Preparation time , 3min 1 km
                    
//                         res1[0].eta = Math.round(eta) + " mins";

//                         let resobj = {
//                           success: true,
//                           status: true,
//                           result: res1
//                         };
        
//                         result(null, resobj);  
//                       }
  
//                     }
                    
//                   }else{

//                     let resobj = {
//                       success: true,
//                       status: true,
//                       result: res1
//                     };
    
//                     result(null, resobj);  

//                   }
  
                  
//         }
//       }
//     }s
//   );
// };

Order.orderviewbyeatuser = function(req, result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit=constant.radiuslimit;
  var orderquery =  "SELECT dm.*,ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid left join Dunzo_moveit_details dm on dm.task_id=ors.dunzo_taskid where ors.orderid ='"+req.orderid +"'  " ;//and dm.active_status=1
  sql.query(orderquery,async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length === 0 || res1[0].orderid === null) {
          let resobj = {
            success: true,
            status: false,
            message: "Order not found!",
            result: []
          };
          result(null, resobj);
        } else {

               
              
                res1[0].servicecharge = constant.servicecharge;
                res1[0].cancellationmessage = constant.cancellationmessage;;
              

                res1[0].payment_type_name ='Cash on delivery'; 
                if (res1[0].payment_type === 1 || res1[0].payment_type === "1") {
                  res1[0].payment_type_name ='Online'; 
                }

                if (res1[0].userdetail) {
                  res1[0].userdetail = JSON.parse(res1[0].userdetail);
                }

                if (res1[0].makeitdetail) {
                  res1[0].makeitdetail = JSON.parse(res1[0].makeitdetail);
                }
                if (res1[0].moveitdetail) {
                  res1[0].moveitdetail = JSON.parse(res1[0].moveitdetail);
                }

                if (res1[0].items) {
                  var items = JSON.parse(res1[0].items);
                  res1[0].items = items.item;
                }

                ////dunzo code
                if (res1[0].delivery_vendor==1) {
                  
                  res1[0].moveitdetail.name=res1[0].runner_name;
                  res1[0].moveitdetail.phoneno=res1[0].runner_phone_number;

                }
                res1[0].dunzo_client_id= dunzoconst.dunzo_client_id;
                res1[0].Authorization= dunzoconst.Authorization;


                  var itemlist = res1[0].items
                  var productprice = 0;
                for (let i = 0; i < itemlist.length; i++) {
                  
                  productprice = productprice + ( itemlist[i].quantity * itemlist[i].price);
                 
                }

                
              
              

                res1[0].trackingstatus = Order.orderTrackingDetail(res1[0].orderstatus,res1[0].moveitdetail);
                //}

                var cartdetails = [];
                var totalamountinfo = {};
                var couponinfo = {};
                var gstinfo = {};
                var deliverychargeinfo = {};
                var refundinfo = {};
                var productinfo = {};
                //var grandtotalinfo = {};
        
                    productinfo.title = "Product Price";
                    productinfo.charges = productprice;
                    productinfo.status = true;
                    cartdetails.push(productinfo); 


                  if (res1[0].discount_amount) {
                    couponinfo.title = "Coupon adjustment (-)";
                    couponinfo.charges = res1[0].discount_amount;
                    couponinfo.status = true;
                    cartdetails.push(couponinfo);
                  }
        
                  if (res1[0].gst !=0) {
                  gstinfo.title = "Taxes";
                  gstinfo.charges = res1[0].gst;
                  gstinfo.status = true;
                  cartdetails.push(gstinfo);
                  }
                  


                  if (res1[0].delivery_charge != 0) {
                    deliverychargeinfo.title = "other charges";
                    deliverychargeinfo.charges = Math.round(parseInt(res1[0].delivery_charge) + res1[0].convenience_charge);
                   
                    deliverychargeinfo.status = true;
                    cartdetails.push(deliverychargeinfo);
                  }
                 
        
                  if (res1[0].refund_amount) {
                    refundinfo.title = "Refund adjustment (-)";
                    refundinfo.charges = res1[0].refund_amount;
                    refundinfo.status = true;
                    cartdetails.push(refundinfo);
                  }

                  res1[0].cartdetails = cartdetails;


                  if ( res1[0].orderstatus < 6 ) {

                    await Order.eat_get_delivery_time(req);
                   
                    var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+req.orderid +" order by od_id desc limit 1");
                    
                    var pickup= parseInt(res1[0].runner_eta_pickup_min) || 0;
                    var dropoff= parseInt(res1[0].runner_eta_dropoff_min) || 0;
                    if (res1[0].delivery_vendor==1) {
                      
                  
                  //   var url =dunzoconst.dunzo_cancel_url+'/'+res1[0].dunzo_taskid+'/status?test=true'

                  //   var headers= {
                  //     'Content-Type': 'application/json',
                  //     'client-id': dunzoconst.dunzo_client_id,
                  //     'Authorization' : dunzoconst.Authorization,
                  //     'Accept-Language':'en_US'
                  //   };
                  
                  //   const options = {
                  //     url: url,
                  //     method: 'GET',
                  //     headers: headers
                  // };
                  
                  // request(options, function(err, res, body) {
                  //     let dunzo_status = JSON.parse(body);
                  //   //  console.log(json);
                  //   console.log("dunzo_status------------------->",dunzo_status);
                  //   var pickup=dunzo_status.eta.pickup || 0;
                  //   var dropoff= dunzo_status.eta.dropoff || 0;

                  //   var eta = Math.round(pickup + dropoff);
                  //   res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");
                  //   res1[0].eta = eta;
                   
                  //   let resobj = {
                  //     success: true,
                  //     status: true,
                  //     result: res1
                  //   };
    
                  //   result(null, resobj);  
                  // });


                  var pickup= parseInt(res1[0].runner_eta_pickup_min) || 0;
                  var dropoff= parseInt(res1[0].runner_eta_dropoff_min) || 0;

                
                  var eta = Math.round(pickup + dropoff);
                   if (eta ==0) {                  
                    eta = constant.delivery_buffer_time + foodpreparationtime + Math.round(onekm * res1[0].distance);            
                   }
                if (res1[0].moveit_expected_delivered_time) {
                  res1[0].deliverytime = res1[0].moveit_expected_delivered_time;
                 }else{
                  res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");
                 }
                 
                  let resobj = {
                    success: true,
                    status: true,
                    result: res1
                  };
  
                  result(null, resobj);  


                    } else {

                      if (orderdeliverytime.length !== 0) {
                        res1[0].deliverytime = orderdeliverytime[0].deliverytime;
                        res1[0].eta = orderdeliverytime[0].duration;

                        let resobj = {
                          success: true,
                          status: true,
                          result: res1
                        };
        
                        result(null, resobj);  
                      }else{
    
                      
                        res1[0].distance = Math.ceil(res1[0].distance);

                  
                        eta = constant.delivery_buffer_time + foodpreparationtime + Math.round(onekm * res1[0].distance);
                        //15min Food Preparation time , 3min 1 km
                    
                        res1[0].eta = Math.round(eta) + " mins";
                        res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");


                        let resobj = {
                          success: true,
                          status: true,
                          result: res1
                        };
        
                        result(null, resobj);  
                      }
  
                    }
                    
                  }else{

                    let resobj = {
                      success: true,
                      status: true,
                      result: res1
                    };
    
                    result(null, resobj);  

                  }
  
                  
        }
      }
    }
  );
};

Order.orderTrackingDetail = function(orderstatus, moveit_detail) {
  var trackingDetail = {};
  var moveit_name = moveit_detail ? moveit_detail.name : "";
  orderstatus = orderstatus ? orderstatus : 0;
  switch (orderstatus) {
    case 0:
      trackingDetail.message1 = "Awaiting your mom’s response";
      trackingDetail.message2 = "Yet to start preparation";
      trackingDetail.message3 = "Delivery partner is awaiting the order";
      break;

    case 1:
      trackingDetail.message1 = "Your order has been received";
      trackingDetail.message2 = "Preparing.. With love, Your MOM";
      trackingDetail.message3 = moveit_name?
        "Mr." + moveit_name + " is on his way to pickup":"Delivery partner is awaiting the order";
      break;

    case 2:
    case 3:
    case 4:
      trackingDetail.message1 = "Your order has been received";
      trackingDetail.message2 = "Your MOM has packed your food";
      trackingDetail.message3 =moveit_name?
      "Mr." + moveit_name + " is on his way to pickup":"Delivery partner is awaiting the order";
      if (!moveit_name) {
        trackingDetail.message3 =" Delivery partner is awaiting the order";
      }
      break;

    case 5:
      trackingDetail.message1 = "Your order has been received";
      trackingDetail.message2 = "Your MOM has packed your food";
      trackingDetail.message3 =
        "Mr." + moveit_name + " is on his way to delivery";
        if (!moveit_name) {
          trackingDetail.message3 =
          " Delivery partner is on his way to delivery";
        }
      break;
  }

 
  return trackingDetail;
};

Order.orderlistbyeatuser = async function(req,result) {

  var query = "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where us.userid ='" +
            req.userid +
            "' and (ors.orderstatus = 6 or orderstatus = 7 or orderstatus = 8 ) group by ors.orderid order by ors.orderid desc";
  sql.query(query,function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "orders not found!"
          };
          result(null, resobj);
        } else {
           
            history_list =res;
            //history_list.push(res1);
           // history_list = Array.prototype.concat.apply([], history_list);
           for (let i = 0; i < history_list.length; i++) {

            history_list[i].payment_type_name ='Cash on delivery'; 
              if (history_list[i].payment_type === 1 || history_list[i].payment_type === "1") {
                history_list[i].payment_type_name ='Online'; 
              }

             if (history_list[i].userdetail) {
               history_list[i].userdetail = JSON.parse(history_list[i].userdetail);
             }

             if (history_list[i].makeitdetail) {
               history_list[i].makeitdetail = JSON.parse(history_list[i].makeitdetail);
             }

             if (history_list[i].moveitdetail) {
               history_list[i].moveitdetail = JSON.parse(history_list[i].moveitdetail);
             }

             if (history_list[i].items) {
               var items = JSON.parse(history_list[i].items);
               history_list[i].items = items;
             }

             history_list[i].ordercancelstatus = false;
             if (history_list[i].orderstatus === 7 || history_list[i].orderstatus === 8) {
              history_list[i].ordercancelstatus = true;
             }

           }

           
           let resobj = {
             success: true,
             status: true,
             result: history_list
           };

           result(null, resobj);

         //var eat_order_history_query = 'CALL eat_order_history(?)';
        //  sql.query(eat_order_history_query,[req.userid], async function(err, res1) {
        // sql.query(query, async function(err, res1) {
        //     if (err) {
        //       result(err, null);
        //     } else {
              
        //     }
         // });
        }
      }
    }
  );
};

// Order.live_order_list_byeatuserid = async function live_order_list_byeatuserid(req,result) {

//   var foodpreparationtime = constant.foodpreparationtime;
//   var onekm = constant.onekm;
//   var radiuslimit = constant.radiuslimit;

//   const orderdetails = await query("select ors.*,mk.brandname from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.userid ='" +req.userid +"' and ors.orderstatus = 6  and ors.payment_status = 1 order by ors.orderid desc limit 1");
 
//   if (orderdetails.length !== 0) {

//     orderdetails[0].rating = true;
//     orderdetails[0].showrating = false;
    
//   if (orderdetails[0].rating_skip < constant.max_order_rating_skip) {
              
//     const orderratingdetails = await query("select * from Order_rating where orderid ='" +orderdetails[0].orderid +"'");
   
//     var today = moment();
//     var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
//     var diffMs  = (today - moveit_actual_delivered_time);
//     var diffDays = Math.floor(diffMs / 86400000); 
//     var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
//     var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

//     if (orderratingdetails.length !== 0) orderdetails[0].rating = true;
//     if (diffDays || diffHrs || diffMins > 30) orderdetails[0].showrating = true;

//   }
//   }
//   // or payment_status !=3)
//   sql.query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2 order by orderid desc limit 1",function(err, res) {
//       if (err) {
//         result(err, null);
//       } else {
//      //   console.log(res.length);
//         if (res.length === 0) {
//           let resobj = {
//             success: true,
//             status: false,
//             message: "Active order not found!",
//             orderdetails: orderdetails
//           };
//           result(null, resobj);
//         } else {

//           if (res[0].delivery_vendor ==0) {
            
//             if (res[0].payment_type === "0" || res[0].payment_type === 0) liveorderquery ="Select distinct ors.orderid,ors.delivery_vendor,ors.dunzo_taskid,ors.ordertime,ors.order_assigned_time,ors.orderstatus,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid =" +req.userid +" and ors.orderstatus < 6  and payment_status !=2 ";
//             else if (res[0].payment_type === "1" || res[0].payment_status === 1) liveorderquery ="Select ors.orderid,ors.delivery_vendor,ors.dunzo_taskid,ors.ordertime,ors.orderstatus,ors.order_assigned_time,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid ='" +req.userid +"' and ors.orderstatus < 6 and payment_status !=2 ";
//             else {
//               let resobj = {
//                 success: true,
//                 status: false,
//                 message: "Active order not found!",
//                 orderdetails: orderdetails
//               };
//               result(null, resobj);
//               return;
//             }

//           }else{
            
//             liveorderquery ="Select dm.*,ors.delivery_vendor,ors.dunzo_taskid,ors.orderid,ors.ordertime,ors.orderstatus,ors.order_assigned_time,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid left join Dunzo_moveit_details as dm on dm.task_id=ors.dunzo_taskid where ors.userid ='" +req.userid +"' and ors.orderstatus < 6 and payment_status !=2 ";

//           }
          
        
//           sql.query(liveorderquery,async function(err, res1) {
//             if (err) {
//               result(err, null);
//             } else {
           
            
  
//               for (let i = 0; i < res1.length; i++) {
           
//                 if (res1[i].items) {
//                   var items = JSON.parse(res1[i].items);
//                   res1[i].items = items.item;
//                 }
//               }

//               ///this code only online payment incomplete orderA to return pay the payment If false res1[0].onlinepaymentstatus thay have to repay true track the order,  not for COD
//               if (res1[0].payment_type == 1 && res1[0].payment_status == 0 && res1[0].lock_status === 1) {
//                 res1[0].onlinepaymentstatus = false;
//               }else{
//                 res1[0].onlinepaymentstatus = true;
//               }
          
              
//                 // if ( res1[0].orderstatus < 6 ) {
//                 //   //check our delivery or dunzo delivery
//                 //   if (res1[0].deliver_vendor==0) {
//                 //     //store order delivery time
//                 //     if ( res1[0].orderstatus < 5 ){
//                 //       req.orderid  =res1[0].orderid;
//                 //       await Order.eat_get_delivery_time(req);
//                 //     }
                   
//                 //   //get delivery time
//                 //    var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+res1[0].orderid +" order by od_id desc limit 1");
                   
//                 //    if (orderdeliverytime.length !== 0) {
//                 //      res1[0].deliverytime = orderdeliverytime[0].deliverytime;
//                 //      res1[0].eta = foodpreparationtime + orderdeliverytime[0].duration;
//                 //    }else{
       
//                 //      // we need to remove once delivery time stable
//                 //      eta = foodpreparationtime + Math.round(onekm * res1[0].distance);
//                 //      //15min Food Preparation time , 3min 1 km
                  
//                 //      res1[0].eta = Math.round(eta) + " mins";
//                 //    }
  
  
//                 //   }else{
  
                   
//                 //     // await Order.dunzo_task_status(res1[0].dunzo_taskid, function(error, response, data){
//                 //     //   console.log(response);
  
//                 //     //   console.log(data);
  
//                 //     // });
//                 //     console.log(res1[0].runner_eta_pickup_min);
//                 //     res1[0].eta = parseInt(res1[0].runner_eta_pickup_min) + parseInt(res1[0].runner_eta_dropoff_min);
  
//                 //   }
                  
//                 //   // we need to remove once delivery time stable
//                 //   if (!res1[0].deliverytime) {
//                 //     if (res1[0].orderstatus > 3) {
//                 //       // +20 min add with moveit order assign time
//                 //      res1[0].deliverytime = res1[0].moveit_expected_delivered_time;
//                 //    }else{
//                 //      var deliverytime = moment(res1[0].ordertime)
//                 //      .add(0, "seconds")
//                 //      .add(20, "minutes")
//                 //      .format("YYYY-MM-DD HH:mm:ss");
//                 //      res1[0].deliverytime = deliverytime;
//                 //    }
//                 //   }
      
//                 // }
           
                
//                 if ( res1[0].orderstatus < 6 ) {
//                   req.orderid  =res1[0].orderid;
//                   await Order.eat_get_delivery_time(req);
                 
//                   var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+req.orderid +" order by od_id desc limit 1");
                  

//                   if (res1[0].delivery_vendor==1) {
                    
//                     console.log("res1[0].delivery_vendor----------------->",res1[0].delivery_vendor);
//                   var url ='https://apis-staging.dunzo.in/api/v1/tasks/'+res1[0].dunzo_taskid+'/status?test=true'

//                   var headers= {
//                     'Content-Type': 'application/json',
//                     'client-id': dunzoconst.dunzo_client_id,
//                     'Authorization' : dunzoconst.Authorization,
//                     'Accept-Language':'en_US'
//                   };
                
//                   const options = {
//                     url: url,
//                     method: 'GET',
//                     headers: headers
//                 };
                
//                 request(options, function(err, res, body) {
//                     let dunzo_status = JSON.parse(body);
//                   //  console.log(json);
//                   console.log("dunzo_status------------------->",dunzo_status);
//                   var pickup=dunzo_status.eta.pickup || 0;
//                   var dropoff= dunzo_status.eta.dropoff || 0;

//                   var eta = Math.round(pickup + dropoff);
//                   res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");
//                   res1[0].eta = eta;
                 
//                   let resobj = {
//                     success: true,
//                     status: true,
//                     orderdetails: orderdetails,
//                     result: res1
//                   };
  
//                   result(null, resobj);  
//                 });

//                   } else {

//                     if (orderdeliverytime.length !== 0) {
//                       res1[0].deliverytime = orderdeliverytime[0].deliverytime;
//                       res1[0].eta = orderdeliverytime[0].duration;

//                       let resobj = {
//                         success: true,
//                         status: true,
//                         orderdetails: orderdetails,
//                         result: res1
//                       };
      
//                       result(null, resobj);  
//                     }else{
  
//                       // we need to remove once delivery time stable
//                       eta = foodpreparationtime + Math.round(onekm * res1[0].distance);
//                       //15min Food Preparation time , 3min 1 km
                  
//                       res1[0].eta = Math.round(eta) + " mins";

//                       let resobj = {
//                         success: true,
//                         status: true,
//                         orderdetails: orderdetails,
//                         result: res1
//                       };
      
//                       result(null, resobj);  
//                     }

//                   }
                  
//                 }else{

//                   let resobj = {
//                     success: true,
//                     status: true,
//                     orderdetails: orderdetails,
//                     result: res1
//                   };
  
//                   result(null, resobj);  

//                 }







//               // let resobj = {
//               //   success: true,
//               //   status: true,
//               //   orderdetails: orderdetails,
//               //   result: res1
//               // };
//               // result(null, resobj);
//             }
//           });
//         }
//       }
//   }
//   );
// };

Order.live_order_list_byeatuserid = async function live_order_list_byeatuserid(req,result) {

  var foodpreparationtime = constant.foodpreparationtime;
  var onekm = constant.onekm;
  var radiuslimit = constant.radiuslimit;

  const orderdetails = await query("select ors.*,mk.brandname from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.userid ='" +req.userid +"' and ors.orderstatus = 6  and ors.payment_status = 1 order by ors.orderid desc limit 1");
 
  if (orderdetails.length !== 0) {

    orderdetails[0].rating = false;
    orderdetails[0].showrating = false;
    
  if (orderdetails[0].rating_skip < constant.max_order_rating_skip) {
              
    const orderratingdetails = await query("select * from Order_rating where orderid ='" +orderdetails[0].orderid +"'");
   
    var today = moment();
    var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
    var diffMs  = (today - moveit_actual_delivered_time);
    var diffDays = Math.floor(diffMs / 86400000); 
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    if (orderratingdetails.length !== 0) orderdetails[0].rating = true;
    if (diffDays || diffHrs || diffMins > 30) orderdetails[0].showrating = true;

  }
  }
  // or payment_status !=3)
  sql.query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2 order by orderid desc limit 1",function(err, res) {
      if (err) {
        result(err, null);
      } else {
     //   console.log(res.length);
        if (res.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "Active order not found!",
            orderdetails: orderdetails
          };
          result(null, resobj);
        } else {

          if (res[0].delivery_vendor ==0) {
            
            if (res[0].payment_type === "0" || res[0].payment_type === 0) liveorderquery ="Select distinct ors.orderid,ors.delivery_vendor,ors.dunzo_taskid,ors.ordertime,ors.order_assigned_time,ors.orderstatus,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid =" +req.userid +" and ors.orderstatus < 6  and payment_status !=2 ";
            else if (res[0].payment_type === "1" || res[0].payment_status === 1) liveorderquery ="Select ors.orderid,ors.delivery_vendor,ors.dunzo_taskid,ors.ordertime,ors.orderstatus,ors.order_assigned_time,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where ors.userid ='" +req.userid +"' and ors.orderstatus < 6 and payment_status !=2 ";
            else {
              let resobj = {
                success: true,
                status: false,
                message: "Active order not found!",
                orderdetails: orderdetails
              };
              result(null, resobj);
              return;
            }

          }else{
            
            liveorderquery ="Select dm.*,ors.delivery_vendor,ors.dunzo_taskid,ors.orderid,ors.ordertime,ors.orderstatus,ors.order_assigned_time,ors.price,ors.userid,ors.payment_type,ors.payment_status,ors.moveit_user_id,ors.lock_status,mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.img1 as makeitimage,( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( mk.lat ) )  * cos( radians(mk.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(mk.lat)) ) ) AS distance,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'product_name',pt.product_name))) AS items from Orders ors join MakeitUser mk on ors.makeit_user_id = mk.userid left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid left join Dunzo_moveit_details as dm on dm.task_id=ors.dunzo_taskid where ors.userid ='" +req.userid +"' and ors.orderstatus < 6 and payment_status !=2 ";

          }
          
        
          sql.query(liveorderquery,async function(err, res1) {
            if (err) {
              result(err, null);
            } else {
         

      
              for (let i = 0; i < res1.length; i++) {
           
                if (res1[i].items) {
                  var items = JSON.parse(res1[i].items);
                  res1[i].items = items.item;
                }
              }

              ///this code only online payment incomplete orderA to return pay the payment If false res1[0].onlinepaymentstatus thay have to repay true track the order,  not for COD
              if (res1[0].payment_type == 1 && res1[0].payment_status == 0 && res1[0].lock_status === 1) {
                res1[0].onlinepaymentstatus = false;
              }else{
                res1[0].onlinepaymentstatus = true;
              }
          
                res1[0].distance = Math.ceil(res1[0].distance);

                if ( res1[0].orderstatus < 6 ) {
                  req.orderid  =res1[0].orderid;
                  await Order.eat_get_delivery_time(req);
                 
                  var orderdeliverytime = await query("select * from Order_deliverytime where orderid = "+req.orderid +" order by od_id desc limit 1");
                  

                  if (res1[0].delivery_vendor==1) {
                    
                //   var url = dunzoconst.dunzo_cancel_url+'/'+res1[0].dunzo_taskid+'/status?test=true'

                //   var headers= {
                //     'Content-Type': 'application/json',
                //     'client-id': dunzoconst.dunzo_client_id,
                //     'Authorization' : dunzoconst.Authorization,
                //     'Accept-Language':'en_US'
                //   };
                
                //   const options = {
                //     url: url,
                //     method: 'GET',
                //     headers: headers
                // };
                
                // request(options, function(err, res, body) {
                //     let dunzo_status = JSON.parse(body);
                //   //  console.log(json);
                //  // console.log("dunzo_status------------------->",dunzo_status);
                //   var pickup=dunzo_status.eta.pickup || 0;
                //   var dropoff= dunzo_status.eta.dropoff || 0;

                //   var eta = Math.round(pickup + dropoff);
                //   res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");
                //   res1[0].eta = eta;
                 
                //   let resobj = {
                //     success: true,
                //     status: true,
                //     orderdetails: orderdetails,
                //     result: res1
                //   };
  
                //   result(null, resobj);  
                // });

                var pickup= parseInt(res1[0].runner_eta_pickup_min) || 0;
                var dropoff= parseInt(res1[0].runner_eta_dropoff_min) || 0;

                var eta = Math.round(pickup + dropoff);

                if (eta ==0) {                  
                  eta = constant.delivery_buffer_time + foodpreparationtime + Math.round(onekm * res1[0].distance);            
               
                }
               // /moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss")
               if (res1[0].moveit_expected_delivered_time) {
                res1[0].deliverytime = res1[0].moveit_expected_delivered_time;
               }else{
                res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");
               }
               
                res1[0].eta = eta;
               
       
                let resobj = {
                  success: true,
                  status: true,
                  orderdetails: orderdetails,
                  result: res1
                };

                result(null, resobj);  


                  } else {

                    if (orderdeliverytime.length !== 0) {
                      res1[0].deliverytime = orderdeliverytime[0].deliverytime;
                      res1[0].eta = orderdeliverytime[0].duration;

                      let resobj = {
                        success: true,
                        status: true,
                        orderdetails: orderdetails,
                        result: res1
                      };
      
                      result(null, resobj);  
                    }else{
  
                      // we need to remove once delivery time stable
                      eta = constant.delivery_buffer_time + foodpreparationtime + Math.round(onekm * res1[0].distance);
                      //15min Food Preparation time , 3min 1 km
                  
                      res1[0].eta = Math.round(eta) + " mins";
                      res1[0].deliverytime = moment().add(0, "seconds").add(eta, "minutes").format("YYYY-MM-DD HH:mm:ss");


                      let resobj = {
                        success: true,
                        status: true,
                        orderdetails: orderdetails,
                        result: res1
                      };
      
                      result(null, resobj);  
                    }

                  }
                  
                }else{

                  let resobj = {
                    success: true,
                    status: true,
                    orderdetails: orderdetails,
                    result: res1
                  };
  
                  result(null, resobj);  

                }


            }
          });
        }
      }
  }
  );
};
//online refund coupon
Order.create_refund = function create_refund(refundDetail) {
  var refund = new RefundOnline(refundDetail);
  RefundOnline.createRefund(refund, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.cod_create_refund_coupon_servicecharge = function cod_create_refund_coupon_servicecharge(refundDetail) {

  var rc = new RefundCoupon(refundDetail);
  console.log(rc)
   RefundCoupon.create_Refund_Coupon_online_orders_servicecharge(rc, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.create_Refund_Coupon_by_totalamount_servicecharge = function create_Refund_Coupon_by_totalamount_servicecharge(refundDetail) {

  var rc = new RefundCoupon(refundDetail);
   RefundCoupon.create_Refund_Coupon_by_totalamount_servicecharge(rc, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.eat_order_cancel = async function eat_order_cancel(req, result) {

  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");

  var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");

  if (orderdetails[0].orderstatus < 5) {
    sql.query("UPDATE Orders SET orderstatus = 7,cancel_by = 1,cancel_reason= '" +req.cancel_reason +"',cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid = " +req.orderid+"");

          if (orderdetails[0].delivery_vendor==1) {
            console.log("dunzo_task_cancel");
            orderdetails[0].cancellation_reason= req.cancel_reason ;
            Dunzo.dunzo_task_cancel(orderdetails[0]);
            
          }
          var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
                    
          //  console.log(orderitemdetails);
          for (let i = 0; i < orderitemdetails.length; i++) {
            var productquantityadd ="update Product set quantity = quantity+" +orderitemdetails[i].quantity +" where productid =" +orderitemdetails[i].productid +"";

            var res3 = await query(productquantityadd);
            
          }

          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };

          req.makeit_userid = orderdetails[0].makeit_user_id;
         Makeituser.makeit_quantity_check(req);
          var totalrefund = orderdetails[0].price + orderdetails[0].refund_amount;
          //var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

          var querycancel_charge ="update Orders set cancel_charge = "+constant.servicecharge+"  where orderid =" +req.orderid+"";

          /// check the order refunded amount and payment status
          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status === 1) {
            
            /// check the order refunded amount and payment type 
          if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
 
                
              if (orderdetails[0].refund_amount  > constant.servicecharge) {
                //online user paid and used refund coupon amount so after he cancel order . so detect the serivice charge
               
                await Order.cod_create_refund_coupon_servicecharge(refundDetail);
                await Order.create_refund(refundDetail);
                await Notification.orderEatPushNotification(req.orderid,
                  null,
                  PushConstant.Pageid_eat_order_cancel
                );
                var updatecancel_charge = await query(querycancel_charge);
              }else if (orderdetails[0].price  > constant.servicecharge){
                console.log("price service charge");
                refundDetail.original_amt = orderdetails[0].price - constant.servicecharge;
                await Order.create_refund(refundDetail);
                await Notification.orderEatPushNotification(
                  req.orderid,
                  null,
                  PushConstant.Pageid_eat_order_cancel
                );

                //online user paid and used refund coupon amount so after he cancel order . so create refund again
                if (orderdetails[0].refund_amount !== 0) {
                  console.log("Online cod refund");
                 await Order.cod_create_refund_byonline(refundDetail);
                 var updatecancel_charge = await query(querycancel_charge);
                }

              }else if (totalrefund  > constant.servicecharge){
               //online order paid and used refund amount . and total amount was too low comparing serivce charge so summ of price and refundamount and defetect service charge
                await Order.create_Refund_Coupon_by_totalamount_servicecharge(refundDetail);
                await Notification.orderEatPushNotification(
                  req.orderid,
                  null,
                  PushConstant.Pageid_eat_order_cancel
                );

                var updatecancel_charge = await query(querycancel_charge);
                

               
    
              }

          }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon_by_id(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } else{
                let response = {
                  success: true,
                  status: true,
                  message: "Refunded created successfully."
                };
                result(null, response);
            
              }
            });
          }
      
          }
                   
          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
          }

          await Notification.orderMakeItPushNotification(
            req.orderid,
            null,
            PushConstant.pageidMakeit_Order_Cancel
          );

          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            console.log("EAT  Cancel-->"+orderdetails[0].moveit_user_id)
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }

          let response = {
            success: true,
            status: true,
            message: "Your order cancelled successfully."
          };
          ////Insert Order History////
          
          ////////////////////////////
          result(null, response);
        }
      }
    );
  } else if (orderdetails[0].orderstatus === 5) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! Your order almost reached to you.So can't be cancel"
    };
    result(null, response);
  } else if (orderdetails[0].orderstatus === 6) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! Your order already deliverd."
    };
    result(null, response);
  } else if (orderdetails[0].orderstatus === 7) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! Your order already canceled."
    };
    result(null, response);
  }
};

Order.remove_used_coupon = function remove_used_coupon(removecoupon) {

   CouponUsed.remove_coupon_by_userid(removecoupon, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.makeit_order_cancel = async function makeit_order_cancel(req, result) {
  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
  var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");


  var cancel_reason = req.cancel_reason || null ;
  if (orderdetails[0].orderstatus === 7 ) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  }else if(orderdetails[0].orderstatus === 5){
      let response = {
        success: true,
        status: false,
        message: "Sorry! This order has been pickeped."
      };
      result(null, response);

  }else if(orderdetails[0].orderstatus === 6){
    let response = {
      success: true,
      status: false,
      message: "Sorry! This order is already delivered."
    };
    result(null, response);

} else {
    sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2 ,cancel_time = '" +ordercanceltime+"',cancel_reason='" +cancel_reason+"' WHERE orderid ='" +req.orderid +"'",
    async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };
          var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
          var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

          for (let i = 0; i < orderitemdetails.length; i++) {
            var productquantityadd =
              "update Product set quantity = quantity+" +
              orderitemdetails[i].quantity +
              " where productid =" +
              orderitemdetails[i].productid +
              "";
            sql.query(productquantityadd, function(err, res2) {
              if (err) {
                result(err, null);
              }
            });
          }

          if (orderdetails[0].ordertype==0) {
          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

            if (orderdetails[0].payment_type === "1" && orderdetails[0].payment_status === 1){
              
              await Order.create_refund(refundDetail);
              if (orderdetails[0].refund_amount !== 0) {
                console.log("Online cod refund");
               await Order.cod_create_refund_byonline(refundDetail);
               
              }


            }else if (orderdetails[0].payment_type === "0" && orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } 
            });
          }
          }

          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
          }
          }

          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );
          
          if(orderdetails[0]&&orderdetails[0].moveit_user_id){
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_Cancel,
              null
            );
          }
          let response = {
            success: true,
            status: true,
            message: "Order canceled successfully."
          };
          ////Insert Order History////
          
          ////////////////////////////
          result(null, response);
        }
      }
    );
  }
};

Order.insert_delivery_time = function insert_delivery_time(req) {
  var new_OrderDeliveryTime = new OrderDeliveryTime(req);
  OrderDeliveryTime.createOrderDeliveryTime(new_OrderDeliveryTime, function(err, res) {
   if (err) return err;
   else return res;
 });
};

Order.auto_order_assign_byadmin_makeit = function auto_order_assign_byadmin_makeit(req) {
  ////Start: Zone Based Auto Assign///////
  if(constant.zone_control){
    Order.zone_moveit_order_auto_assign(req, function(err, res) {
      if (err) return err;
      else return res;
    });
  }else{
      Order.auto_order_assign(req, function(err, res) {
        if (err) return err;
        else return res;
      });
  }
  ////End: Zone Based Auto Assign///////
};

Order.makeit_order_accept = async function makeit_order_accept(req, result) {
  const orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon,mk.makeithub_id,mk.zone,zo.zone_status from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id left join Zone zo on zo.id=mk.zone where ors.orderid ='" + req.orderid + "'");
  var makeitaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
  // d.setHours(d.getHours() + 5);
  if (orderdetails.length !== 0) {
    if (orderdetails[0].orderstatus < 1) {
      var orderaccepttime = moment()
        .add(0, "seconds")
        .add(constant.foodpreparationtime, "minutes")
        .format("YYYY-MM-DD HH:mm:ss");
      // deliverytime.setMinutes(transaction_time.getMinutes() + 15);     
      updatequery ="UPDATE Orders SET makeit_status=1,orderstatus = 1 ,makeit_expected_preparing_time= '" + orderaccepttime +"',makeit_accept_time= '" + makeitaccepttime +"' WHERE orderid ='" +req.orderid +"'";
     
      sql.query(updatequery, async function(err, res) {
        if (err) {
          result(err, null);
        } else {

          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_accept
          );

         
          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
          req.deslat = orderdetails[0].cus_lat;
          req.deslon = orderdetails[0].cus_lon;
          req.hubid= orderdetails[0].makeithub_id;
          req.zoneid= orderdetails[0].zone;
          req.zone_status= orderdetails[0].zone_status;
          req.payment_type= orderdetails[0].payment_type;

          // let response = {
          //   success: true,
          //   status: true,
          //   message: "Order accepted successfully.",
  
          // };
          // result(null, response);
          Order.eat_order_distance_calculation(req ,async function(err,res3) {
            if (err) {
              result(err, null);
            } else {
              if (res3.status != true) {
                result(null, res3);
              } else {
    
                var routes = res3.result;
                var caldistance = routes.routes;
                var deliverytimedata = caldistance[0].legs;
               
                req.distance = parseInt(deliverytimedata[0].distance.text);
                req.duration = parseInt(deliverytimedata[0].duration.text);

              
                 req.duration = constant.foodpreparationtime + req.duration + constant.orderbuffertime;
                 req.deliverytime  = moment().add(0, "seconds").add(req.duration, "minutes").format("YYYY-MM-DD HH:mm:ss");

                 await Order.insert_delivery_time(req);

              
                 if (constant.order_assign_status==true) {
                  Order.auto_order_assign_byadmin_makeit(req);

                 let response = {
                   success: true,
                   status: true,
                   message: "Order accepted successfully.",
         
                 };
                 result(null, response);
        

                } else {
                  
                 let response = {
                 success: true,
                 status: true,
                 message: "Order accepted successfully.",
       
               };
               result(null, response);
                }
                // if (constant.order_assign_status==true) {
           
                //   Order.auto_order_assign(req ,async function(err,auto_order_data) {
                //     if (err) {
                //       result(err, null);
                //     } else {
                //       if (auto_order_data.status != true) {
                //         result(null, auto_order_data);
                //       } else {
    
                //         // let response = {
                //         //   success: true,
                //         //   status: true,
                //         //   message: "Order accepted successfully."
                //         //  // result :deliverytimedata 
                //         // };
                //         // result(null, response);
                //       }
                //     }
                //   });

                //   let response = {
                //     success: true,
                //     status: true,
                //     message: "Order accepted successfully."
                //    // result :deliverytimedata 
                //   };
                //   result(null, response);
                //  } else {
                   
                //   let response = {
                //   success: true,
                //   status: true,
                //   message: "Order accepted successfully.",
        
                // };
                // result(null, response);
                //  }


             
              }
            }
          });
          ////Insert Order History////
          
          ////////////////////////////
        }
      });
    } else if (orderdetails[0].orderstatus == 1) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order already accepted"
      };
      result(null, response);
    } else if (orderdetails[0].orderstatus == 7) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order was cancelled"
      };
      result(null, response);
    } else {
      let response = {
        success: true,
        status: false,
        message: "order not found please check"
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "order not found please check"
    };
    result(null, response);
  }
};

Order.insert_order_status = function insert_order_status(req) {
  var new_MoveitStatus = new MoveitStatus(req);
  MoveitStatus.createMoveitStatus(new_MoveitStatus, function(err, res) {
   if (err) return err;
   else return res;
 });
};

Order.moveit_order_accept = async function moveit_order_accept(req, result) {

 // const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "' and moveit_user_id= '" + req.moveituserid + "'");

  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "' ");

  const ordermoveitstatus = await query("select * from Moveit_status where orderid ='" + req.orderid + "' ");

  if (orderdetails.length !== 0) {

    if (orderdetails[0].moveit_status < 1 ) {
      req.moveitid = req.moveituserid;
      req.status = 1;
    //  if (orderdetails[0].moveit_user_id === req.moveituserid || orderdetails[0].moveit_user_id === "req.moveituserid") {
      if (ordermoveitstatus.length == 0) {
        await Order.insert_order_status(req);
      }
      
      
      var orderaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
      req.lat = req.lat || 0;
      req.lon = req.lon || 0;
      updatequery ="UPDATE Orders SET moveit_status = 1 ,moveit_accept_time= '" + orderaccepttime +"',moveit_accept_lat='" + req.lat +"',moveit_accept_long='" + req.lon +"' WHERE orderid ='" +req.orderid +"'";
     
      sql.query(updatequery, async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          let response = {
            success: true,
            status: true,
            message: "Order accepted successfully."
          };
          ////Insert Order History////
          
          ////////////////////////////
          result(null, response);
        }
      });
   
    } else if (orderdetails[0].moveit_status == 1) {
      let response = {
        success: true,
        status: false,
        message: "Sorry your order already accepted"
      };
      result(null, response);
    } else {
      let response = {
        success: true,
        status: false,
        message: "Following order is not assigned to you!"
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "Following order is not assigned to you!"
    };
    result(null, response);
  }
};

// Order.order_missing_by_makeit = async function order_missing_by_makeit(req, result) {
//   const orderdetails = await query(
//     "select * from Orders where orderid ='" + req.orderid + "'"
//   );

//   var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
//   if (orderdetails[0].orderstatus === 8) {
//     let response = {
//       success: true,
//       status: false,
//       message: "Sorry! order already canceled."
//     };
//     result(null, response);
//   } else {
//     sql.query("UPDATE Orders SET orderstatus = 8,cancel_by = 2,cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
//         if (err) {
//           result(err, null);
//         } else {
//           var refundDetail = {
//             orderid: req.orderid,
//             original_amt: orderdetails[0].price,
//             active_status: 1,
//             userid: orderdetails[0].userid,
//             payment_id: orderdetails[0].transactionid
//           };
//           var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
//           for (let i = 0; i < orderitemdetails.length; i++) {
//             var productquantityadd =
//               "update Product set quantity = quantity+" +
//               orderitemdetails[i].quantity +
//               " where productid =" +
//               orderitemdetails[i].productid +
//               "";
//             sql.query(productquantityadd, function(err, res2) {
//               if (err) {
//                 result(err, null);
//               }
//             });
//           }

//           if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

//             if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
              
//               await Order.create_refund(refundDetail);
//               if (orderdetails[0].refund_amount !== 0) {
//                 console.log("Online cod refund");
//                await Order.cod_create_refund_byonline(refundDetail);
               
//               }


//           }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
//             var rc = new RefundCoupon(req);
//             RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
//               if (err) {
//                 result(err, null);
//               } 
//             });
//           }
//           }

          
//           if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
//             removecoupon = {};
//             removecoupon.userid = orderdetails[0].userid;
//             removecoupon.cid = orderdetails[0].coupon;
//             removecoupon.orderid = req.orderid;
//             // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
//             // await query(deletequery);
//             await Order.remove_used_coupon(removecoupon);
//           }

//           await Notification.orderEatPushNotification(
//             req.orderid,
//             null,
//             PushConstant.Pageid_eat_order_cancel
//           );
          
//           if(orderdetails[0]&&orderdetails[0].moveit_user_id){
//             await Notification.orderMoveItPushNotification(
//               req.orderid,
//               PushConstant.pageidMoveit_Order_Cancel,
//               null
//             );
//           }
//           let response = {
//             success: true,
//             status: true,
//             message: "Order canceled successfully."
//           };
//           ////Insert Order History////
          
//           ////////////////////////////
//           result(null, response);
//         }
//       }
//     );
//   }
// };

Order.order_missing_by_makeit = async function order_missing_by_makeit(req, result) {
  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");

  var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
  if (orderdetails[0].orderstatus == 8) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  }else if (orderdetails[0].orderstatus ==1) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already accepted."
    };
    result(null, response);
  }else if (orderdetails[0].orderstatus ==3) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already prepared."
    };
    result(null, response);
  }else if (orderdetails[0].orderstatus ==5) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already prepared."
    };
    result(null, response);
  } else {

    let response = {
      success: true,
      status: true,
      message: "Time has been extented. Please accept the order."
    };
    result(null, response);
    // sql.query("UPDATE Orders SET orderstatus = 8,cancel_by = 2,cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
    //     if (err) {
    //       result(err, null);
    //     } else {
    //       var refundDetail = {
    //         orderid: req.orderid,
    //         original_amt: orderdetails[0].price,
    //         active_status: 1,
    //         userid: orderdetails[0].userid,
    //         payment_id: orderdetails[0].transactionid
    //       };
    //       var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
    //       for (let i = 0; i < orderitemdetails.length; i++) {
    //         var productquantityadd =
    //           "update Product set quantity = quantity+" +
    //           orderitemdetails[i].quantity +
    //           " where productid =" +
    //           orderitemdetails[i].productid +
    //           "";
    //         sql.query(productquantityadd, function(err, res2) {
    //           if (err) {
    //             result(err, null);
    //           }
    //         });
    //       }

    //       if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

    //         if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
              
    //           await Order.create_refund(refundDetail);
    //           if (orderdetails[0].refund_amount !== 0) {
    //             console.log("Online cod refund");
    //            await Order.cod_create_refund_byonline(refundDetail);
               
    //           }


    //       }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
    //         var rc = new RefundCoupon(req);
    //         RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
    //           if (err) {
    //             result(err, null);
    //           } 
    //         });
    //       }
    //       }

          
    //       if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
    //         removecoupon = {};
    //         removecoupon.userid = orderdetails[0].userid;
    //         removecoupon.cid = orderdetails[0].coupon;
    //         removecoupon.orderid = req.orderid;
    //         // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
    //         // await query(deletequery);
    //         await Order.remove_used_coupon(removecoupon);
    //       }

    //       await Notification.orderEatPushNotification(
    //         req.orderid,
    //         null,
    //         PushConstant.Pageid_eat_order_cancel
    //       );
          
    //       if(orderdetails[0]&&orderdetails[0].moveit_user_id){
    //         await Notification.orderMoveItPushNotification(
    //           req.orderid,
    //           PushConstant.pageidMoveit_Order_Cancel,
    //           null
    //         );
    //       }
    //       let response = {
    //         success: true,
    //         status: true,
    //         message: "Order canceled successfully."
    //       };
    //       result(null, response);
    //     }
    //   }
    // );
  }
};
Order.admin_order_cancel = async function admin_order_cancel(req, result) {

 var cancel_reason=req.cancel_reason||"";
 const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");

  if (orderdetails[0].orderstatus === 7 ) {
    let response = {
      success: true,
      status: false,
      message: "Sorry! order already canceled."
    };
    result(null, response);
  }else if(orderdetails[0].orderstatus === 5){
      let response = {
        success: true,
        status: false,
        message: "Sorry! This order has been pickeped."
      };
      result(null, response);

  } else {
    sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2,cancel_reason= '"+cancel_reason+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
        if (err) {
          result(err, null);
        } else {
          var refundDetail = {
            orderid: req.orderid,
            original_amt: orderdetails[0].price + orderdetails[0].refund_amount,
            active_status: 1,
            userid: orderdetails[0].userid,
            payment_id: orderdetails[0].transactionid
          };


          if (orderdetails[0].delivery_vendor==1) {
            console.log("dunzo_task_cancel");
            orderdetails[0].cancellation_reason= cancel_reason ;
            Dunzo.dunzo_task_cancel(orderdetails[0]);
            
          }

          var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
          var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

          for (let i = 0; i < orderitemdetails.length; i++) {
            var productquantityadd =
              "update Product set quantity = quantity+" +
              orderitemdetails[i].quantity +
              " where productid =" +
              orderitemdetails[i].productid +
              "";
            sql.query(productquantityadd, function(err, res2) {
              if (err) {
                result(err, null);
              }
            });
          }

          if (orderdetails[0].ordertype==0) {
            
        
          if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {

            if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
              
              await Order.create_refund(refundDetail);
              if (orderdetails[0].refund_amount !== 0) {
                console.log("Online cod refund");
               await Order.cod_create_refund_byonline(refundDetail);
               
              }


          }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
            var rc = new RefundCoupon(req);
            RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
              if (err) {
                result(err, null);
              } 
            });
          }
          }

          if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
            removecoupon = {};
            removecoupon.userid = orderdetails[0].userid;
            removecoupon.cid = orderdetails[0].coupon;
            removecoupon.orderid = req.orderid;
            // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
            // await query(deletequery);
            await Order.remove_used_coupon(removecoupon);
          }
        }

          await Notification.orderEatPushNotification(
            req.orderid,
            null,
            PushConstant.Pageid_eat_order_cancel
          );

          await Notification.orderMakeItPushNotification(
            req.orderid,
            null,
            PushConstant.pageidMakeit_Order_Cancel
          );
          
          if (orderdetails[0].delivery_vendor=0) {
            if(orderdetails[0]&&orderdetails[0].moveit_user_id){
              await Notification.orderMoveItPushNotification(
                req.orderid,
                PushConstant.pageidMoveit_Order_Cancel,
                null
              );
            }
          }

                  var orderactionlog={};
                  orderactionlog.orderid=req.orderid;
                  orderactionlog.app_type=req.app_type || 0;
                  orderactionlog.userid=req.admin_id || 0;
                  orderactionlog.action=7;
                  await Order.createOrderActionLog(orderactionlog);
         
          let response = {
            success: true,
            status: true,
            message: "Order canceled successfully."
          };
          result(null, response);
        }
      }
    );
  }
};


// this code is online order cod refund creation
Order.cod_create_refund_byonline = function cod_create_refund_byonline(refundDetail) {

  var rc = new RefundCoupon(refundDetail);
  console.log(rc)
   RefundCoupon.create_Refund_Coupon_online_orders(rc, function(err, res) {
    if (err) return err;
    else return res;
  });
};


Order.eat_order_item_missing_byuserid = async function eat_order_item_missing_byuserid(req,result) {

  const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
  if (orderdetails) {
    
    if (orderdetails[0].orderstatus === 6) {

      var today = moment();
      var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
      var diffMs  = (today - moveit_actual_delivered_time);
      var diffDays = Math.floor(diffMs / 86400000); 
      var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  
      ///minimum 24 hours for item missing or 1 day
      console.log(diffDays);  
      if (diffDays < 3) {
        var item_missing_by=req.item_missing_by || 0 ;
        sql.query("UPDATE Orders SET item_missing = 1,item_missing_reason='" +req.item_missing_reason +"',item_missing_by='" +item_missing_by +"' WHERE orderid ='" +req.orderid +"'",async function(err, res1) {
            if (err) {
            result(err, null);
          } else {

            var refundDetail = {
              orderid : req.orderid,
              original_amt : orderdetails[0].price,
              active_status : 1,
              userid : orderdetails[0].userid,
              payment_id : orderdetails[0].transactionid
            };

            if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_type === 0) {

              var rc = new RefundCoupon(req);
              RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
                if (err) {
                  result(err, null);
                } else{

                 

                  let response = {
                    success: true,
                    status: true,
                    message: "Refunded created successfully."
                  };
                  result(null, response);
              
                }
              });

            } else if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_type === 1) {
              

              if (orderdetails[0].price !==0) {
                console.log("Online refund");
                await Order.create_refund(refundDetail);
              }
            

            if (orderdetails[0].refund_amount !== 0) {
              console.log("Online cod refund");
             await Order.cod_create_refund_byonline(refundDetail);
             
            }
            ///Order Action Log By admin
            var orderactionlog={};
            orderactionlog.orderid=req.orderid;
            orderactionlog.app_type=req.app_type || 0;
            orderactionlog.userid=req.admin_id || 0;
            orderactionlog.action=6;
            await Order.createOrderActionLog(orderactionlog);
                
              
                let response = {
                  success: true,
                  status: true,
                  message: "Refunded created successfully."
                };
                result(null, response);
            }
         
         
          }
      }
      );

      }else{

        let response = {
          success: true,
          status: false,
          message: "Sorry can't create the item missing due to time 1 day extened."
        };
        result(null, response);

      }
  
  
    } else if(orderdetails[0].orderstatus === 7){
      let response = {
        success: true,
        status: false,
        message: "Order already canceled."
      };
      result(null, response);
    }else {
      let response = {
        success: true,
        status: false,
        message: "Order not yet to delivered."
      };
      result(null, response);
    }
  } else {
    let response = {
      success: true,
      status: false,
      message: "Order is not available"
    };
    result(null, response);
  }
};


Order.get_order_waiting_list = function get_order_waiting_list(req, result) {
  var waitinglistquery = "SELECT ors.orderid,ors.ordertime,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail from Orders as ors left join MakeitUser ms on ors.makeit_user_id = ms.userid WHERE  ors.orderstatus=0 and ors.lock_status = 0 and ors.payment_status!=2 and (ors.created_at+ INTERVAL 6 MINUTE) < now() group by ors.orderid order by ors.orderid  desc";
  sql.query(waitinglistquery, function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].makeitdetail) {
          res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
        }
      }
      let resobj = {
        success: true,
        status:true,
        result: res1
      };
      result(null, resobj);
    }
    
  });
};

Order.moveit_delivery_cash_received_by_today_by_userid = async function moveit_delivery_cash_received_by_today_by_userid(req,result) {
  req.startdate = req.startdate+" 00:00:00";
  req.enddate = req.enddate+" 23:59:59";
  var moveitquery = "select * from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and payment_type = 0  and lock_status = 0 and  moveit_user_id = '"+req.userid+"' ";
  var moveitqueryamount = moveitquery+";"+"select sum(price) as totalamount from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and payment_type = 0  and lock_status = 0 and  moveit_user_id = '"+req.userid+"' ";
  sql.query(moveitqueryamount,function(err, res) {
      if (err) {
        result(err, null);
      } else{
        let resobj = {
          success: true,
          status:true,
          cod_amount:res[1][0].totalamount,
          result: res[0]
        };
        result(null, resobj);
      }
    }
  );
};


Order.get_orders_cash_online_amount = async function get_orders_cash_online_amount(req,result) {
  req.startdate = req.startdate;
  req.enddate = req.enddate;
  var paymentType=req.payment_type;
  var orderquery = "select * from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and (moveit_user_id!=0 or delivery_vendor=1)";
  var orderamountquery ="select sum(price) as totalamount from Orders where moveit_actual_delivered_time between '"+req.startdate+"' and '"+req.enddate+"' and orderstatus = 6  and payment_status = 1 and (moveit_user_id!=0 or delivery_vendor=1)";
  
  if(paymentType===0||paymentType===1){
    orderquery=orderquery+" and payment_type = "+paymentType;
    orderamountquery=orderamountquery+" and payment_type = "+paymentType;  
  }
  var orderamountquery =orderquery+";"+orderamountquery;
  
  sql.query(orderamountquery,function(err, res) {
      if (err) {
        result(err, null);
      } else{
        let resobj = {
          success: true,
          status:true,
          totalamount:res[1][0].totalamount,
          result: res[0]
        };
        result(null, resobj);
      }
    }
  );
};

Order.eat_order_skip_count_by_uid = async function eat_order_skip_count_by_uid(req,result) {

  var orderdetails = await query("select * from Orders where orderid = '"+req.orderid+"'");

  if (orderdetails.length !==0) {
    
    rating_skip =  orderdetails[0].rating_skip + 1;

    var skipupdatequery = await query("update Orders set rating_skip = "+rating_skip+"  where orderid = '"+req.orderid+"'");
    if (skipupdatequery.err) {
      let resobj = {
        success: true,
        status:false,
        result: err
      };
      result(null, resobj);
    }
    let resobj = {
      success: true,
      status: true,
      message:"Rating skip updated",
      result: orderdetails
    };
    result(null, resobj);

  }else{

    let resobj = {
      success: true,
      status:false,
      message:"There is no orders found!",
      result: orderdetails
    };
    result(null, resobj);

  }

};

// Order.eat_get_delivery_time_by_moveit_id = async function eat_get_delivery_time_by_moveit_id(req,result) {

//   var orderdetails = await query("select *,( 3959 * acos( cos( radians("+req.lat+") ) * cos( radians( cus_lat ) )  * cos( radians( cus_lon ) - radians("+req.lon+") ) + sin( radians("+req.lat+") ) * sin(radians(cus_lat)) ) ) AS distance from Orders where orderid = "+req.orderid+" ");

//   if (orderdetails.length !==0) {
  
//  //var eta = constant.onekm + Math.round(constant.onekm * orderdetails[0].distance);

//  var deliverytime = moment()
//         .add(0, "seconds")
//         .add(eta, "minutes")
//         .format("YYYY-MM-DD HH:mm:ss");
    
//         orderdetails[0].deliverytime = deliverytime;  

//     let resobj = {
//       success: true,
//       status: true,
//       result: orderdetails
//     };
//     result(null, resobj);

//   }else{

//     let resobj = {
//       success: true,
//       status:false,
//       message:"There is no orders found!",
//       result: orderdetails
//     };
//     result(null, resobj);

//   }

// };


Order.get_sales_product_count = async function get_sales_product_count(req,result) {
  //req.date = req.date;
  // var query =
  // "Select JSON_OBJECT('productitem', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name))) AS items"+ 
  // " from Orders as od"+ 
  // " left join MakeitUser as mk on mk.userid=od.makeit_user_id"+
  // " left join OrderItem ci ON ci.orderid = od.orderid"+ 
  // " left join Product pt on pt.productid = ci.productid"+
  // " where DATE(od.ordertime) = CURDATE() and mk.virtualkey = 1 and (od.payment_type=0 or (od.payment_type=1 and od.payment_status=1)) and od.orderstatus = 6";

  var query ="SELECT c.productid,p.product_name,COUNT(*) product_count FROM OrderItem as c JOIN Product p on p.productid= c.productid Where c.orderid IN(SELECT orderid FROM Orders Where DATE(ordertime) = "+req.date+" and payment_status=1 and orderstatus = 6) GROUP BY c.productid ORDER BY product_count DESC";
  sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else{
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
}

Order.moveit_notification_time_orderid = async function moveit_notification_time_orderid(req,result) {

  var orderdetails = await query("select * from Orders where orderid = '"+req.orderid+"'");

  if (orderdetails.length !==0) {
    
    var currenttime = moment().format("YYYY-MM-DD HH:mm:ss");

    var skipupdatequery = await query("update Orders set moveit_notification_time = '"+currenttime+"'  where orderid = '"+req.orderid+"'");
    if (skipupdatequery.err) {
      let resobj = {
        success: true,
        status:false,
        result: err
      };
      result(null, resobj);
    }
    let resobj = {
      success: true,
      status: true,
      message:"Order moveit notification updated"
    };
    result(null, resobj);

  }else{

    let resobj = {
      success: true,
      status:false,
      message:"There is no orders found!",
      result: orderdetails
    };
    result(null, resobj);

  }

};


Order.eat_order_distance_calculation = async function eat_order_distance_calculation(req,result) {
 console.log(req);
//https://maps.googleapis.com/maps/api/directions/json?origin=12.9801,80.2184&destination=13.0072,80.2064&key=AIzaSyDsjqcaz5Ugj7xoBn9dhOedDWE1uyW82Nc
  var diatnceurl =
  "https://maps.googleapis.com/maps/api/directions/json?origin="+req.orglat+","+req.orglon+"&destination="+req.deslat+","+req.deslon+"&key="+constant.distanceapiKey+"";

  
  request(  
    {
      method: "GET",
      rejectUnauthorized: false,
      url: diatnceurl
    },
    function(error,data) {
      if (error) {
        console.log("error: ", err);
        result(null, err);
      } else {
      
        if (data.statusCode === 200) {
          routesdata = JSON.parse(data.body)
    
          let resobj = {
            success: true,
            status:true,
            result: routesdata
          };
          result(null, resobj);
        }else{
          routes = JSON.parse(data.body)

          let resobj = {
            success: true,
            status: false,
            result: data
          };
          result(null, resobj);
        }
           
      }
    }
  );

};


Order.createMoveitReassignedOrders = function createMoveitReassignedOrders(reassignorders) {

  var ReassignedOrders = new MoveitReassignedOrders(reassignorders);
 
  MoveitReassignedOrders.createMoveitReassignedOrders(ReassignedOrders, function(err, res) {
    if (err) return err;
    else return res;
  });
};


Order.createOrderActionLog = function createOrderActionLog(logreq) {

  var actionLog = new orderactionlog(logreq);
 
  orderactionlog.createOrderActionLog(actionLog, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Order.reassign_orders_by_id =async function reassign_orders_by_id(req, result) {
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
  var orderdetails = await query("select * from Orders where orderid = '"+req.orderid+"' ");

if (orderdetails[0].orderstatus <= 5) {
    
  sql.query("Select online_status,pushid_android,pushid_ios From MoveitUser where userid= '" +req.moveit_user_id +"' ",async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        var online_status = res1[0].online_status;
        if (online_status == 1) {
          var moveitstatusupdate = await query("update Moveit_status set moveitid = '"+req.moveit_user_id+"' where moveitid = '"+orderdetails[0].moveit_user_id+"'");

          sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ?,moveit_status=0 WHERE orderid = ?",[req.moveit_user_id, assign_time, req.orderid],async function(err, res2) {
              if (err) {
                result(err, null);
              } else {
                var reassignorders  = {};
              
                reassignorders.orderid = req.orderid;
                reassignorders.moveit_userid = orderdetails[0].moveit_user_id;
                reassignorders.notification_time =orderdetails[0].moveit_notification_time;
                reassignorders.accept_time =orderdetails[0].moveit_accept_time;
                reassignorders.reason = req.reason;


                await Order.createMoveitReassignedOrders(reassignorders);
                
                var orderactionlog={};
                orderactionlog.orderid=req.orderid;
                orderactionlog.app_type=req.app_type || 0;
                orderactionlog.userid=req.admin_id || 0;
                orderactionlog.action=2;
                await Order.createOrderActionLog(orderactionlog);

                await Notification.orderMoveItPushNotification(
                  req.orderid,
                  PushConstant.pageidMoveit_Order_Assigned,
                  res1[0]
                );
                await Notification.orderMoveItPushNotification(
                  req.orderid,
                  PushConstant.pageidMoveit_Order_Reassign,
                  await Notification.getMovieitDetail( orderdetails[0].moveit_user_id)
                );
                var order_queue_update = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");


                let resobj = {
                  success: true,
                  status:true,
                  message: "Order Re-Assigned Successfully"
                };
                result(null, resobj);
              }
            }
          );
        } else {
          let resobj = {
            success: true,
            status: false,
            message: "Move it user is offline"
          };
          result(null, resobj);
        }
      }
    }
  );
  }else if(orderdetails[0].orderstatus === 6){

    let resobj = {
      success: true,
      status: false,
      message: "Order already delivered"
    };
    result(null, resobj);
  }else if(orderdetails[0].orderstatus === 7){

    let resobj = {
      success: true,
      status: false,
      message: "Order already cancelled"
    };
    result(null, resobj);
  }else{

    let resobj = {
      success: true,
      status: false,
      message: "Waiting for order assign"
    };
    result(null, resobj);
  }
};


Order.eat_get_delivery_time_by_moveit_id = async function eat_get_delivery_time_by_moveit_id(req,result) {
 

  var orderdetails = await query("select od.deliverytime,od.duration,od.distance,od.orderid,ors.orderstatus,ors.cus_lat,ors.cus_lon,mk.lat as makeit_lat,mk.lon as makeit_lon from Order_deliverytime od join Orders ors on od.orderid=ors.orderid join MakeitUser mk on mk.userid=ors.makeit_user_id where od.orderid = "+req.orderid+"  order by od.od_id desc limit 1");
 // var orderdeliverytimedetails = await query("select * from Order_deliverytime where orderid = "+req.orderid+"  and deliverytime < NOW()  order by od_id desc limit 1");
 
  var day = moment().format("YYYY-MM-DD HH:mm:ss");
  var currenthour  = moment(day).format("HH:mm:ss");
 
  // if (orderdetails[0].deliverytime) {
    if (orderdetails.length !== 0) {
  var deliverytime = moment(orderdetails[0].deliverytime).format("YYYY-MM-DD HH:mm:ss");
  var deliveryhours = moment(deliverytime).format("HH:mm:ss");  
             
    if (deliveryhours <= currenthour)  {

      
        req.deslat = orderdetails[0].cus_lat;
        req.deslon = orderdetails[0].cus_lon;
       
        if (orderdetails[0].orderstatus < 5) {
          
          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
        }else if (orderdetails[0].orderstatus == 5){
    
          if (req.lat) {
            req.orglat = req.lat;
            req.orglon = req.lon;
          }else{
            req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
          }
          
    
        }else{
          req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
        }

        Order.eat_order_distance_calculation(req ,async function(err,res3) {
          if (err) {
            result(err, null);
          } else {
            if (res3.status != true) {
              result(null, res3);
            } else {
    
              
              var routes = res3.result;
              var caldistance = routes.routes;
              var deliverytimedata = caldistance[0].legs;
             
              req.distance = parseInt(deliverytimedata[0].distance.text);
               req.duration = parseInt(deliverytimedata[0].duration.text);
               req.duration = constant.foodpreparationtime + req.duration + constant.orderbuffertime;
               req.deliverytime  = moment()
               .add(0, "seconds")
               .add(req.duration, "minutes")
               .format("YYYY-MM-DD HH:mm:ss");
    
               await Order.insert_delivery_time(req);
                            
              let response = {
                success: true,
                status: true,
                message: "On the way your food."
               // deliverytime : res3
              };
              result(null, response);
            }
          }
        });

   

    }else{
      let resobj = {
        success: true,
        status: false,
        message: "On the way your food",
        deliverytime : orderdetails[0].deliverytime
    }
    
    result(null, resobj);
  }
   

  }else{

    let resobj = {
      success: true,
      status: false,
      message: "delivery time not found"
  
    };
    result(null, resobj);

  }
  // }else{
  //   let resobj = {
  //     success: true,
  //     status: false,
  //     message: "Delivery time not found",
     
  
  //   };
  //   result(null, resobj);
  // }
};

Order.moveit_customer_location_reached_by_userid = function(req, result) {
  var customerlocationreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
req.lat=req.lat || 0;
req.lon=req.lon || 0;
  sql.query("Select * from Orders where orderid = ?", [req.orderid],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      var getmoveitid = res1[0].moveit_user_id;
      if (getmoveitid == req.moveit_user_id) {

        req.moveitid = req.moveit_user_id;
        req.status = 5 // order pickup by moveit
        await Order.insert_order_status(req);

        sql.query(
          "UPDATE Orders SET moveit_customerlocation_reached_time = ?,moveit_customer_location_reached_lat=?,moveit_customer_location_reached_long=? WHERE orderid = ? and moveit_user_id =?",
          [           
            customerlocationreachtime,
            req.lat,
            req.lon,
            req.orderid,
            req.moveit_user_id
          ],
         async function(err, res) {
            if (err) {
              result(err, null);
            } else {
              let resobj = {
                success: true,
                status:true,
                message: "Customer location reached successfully"
              };
              //PushConstant.Pageid_eat_order_pickedup = 6;
              await Notification.orderEatPushNotification(req.orderid,null,PushConstant.Pageid_eat_order_pickedup);
              result(null, resobj); 
            }
          }
        );
      } else {
        let resobj = {
          success: true,
          status:false,
          message: "Following order is not assigned to you!"
        };
        result(null, resobj);
      }
    }
  });
};

Order.moveit_unaccept_orders_byid = function moveit_unaccept_orders_byid(req, result) {
 
  sql.query("Select ors.orderid,ors.userid as cus_userid,us.name as cus_name,us.phoneno as cus_phoneno,us.Locality as cus_Locality,ors.price,ors.gst,ors.payment_type,ors.payment_status,ors.ordertime,ors.delivery_charge,ors.cus_lat,ors.cus_lon,ors.cus_address,ors.landmark,ors.flatno,ors.orderstatus,ors.moveit_actual_delivered_time,ms.name as makeitname,ms.lat as makitlat,ms.lon as makitlon,ms.address as makeitaddress,ms.phoneno as makeitphone,ms.userid as makeituserid,ms.virtualkey as makeitvirtualkey,ms.brandName as makeitbrandname,ms.localityid as makeitlocalityid,ms.makeithub_id as makeithubid,mh.makeithub_name as makeithubname,mh.lat as makeithublat,mh.lon as makeithublon,mh.address as makeithubaddress,ors.moveit_status,ors.moveit_accept_time from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join Makeit_hubs mh on mh.makeithub_id = ms.makeithub_id where ors.moveit_user_id = ?  and (ors.moveit_status IS NULL OR ors.moveit_status = '') and DATE(ors.ordertime) = CURDATE() and ors.moveit_user_id !=0 and ors.orderstatus < 5 order by  ors.order_assigned_time desc ", [req.moveit_user_id],async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      
      if (res1.length !==0) {

              let resobj = {
                success: true,
                status:true,
                result: res1
              };
              result(null, resobj); 
         
      
      } else {
        let resobj = {
          success: true,
          status: false,
          message: "Orders not found!"
        };
        result(null, resobj);
      }
    }
  });
};


Order.insert_force_delivery = function insert_force_delivery(req) {
  var new_createForcedeliverylogs = new createForcedeliverylogs(req);
  createForcedeliverylogs.createForcedeliverylogs(new_createForcedeliverylogs, function(err, res) {
   if (err) return err;
   else return res;
 });
};

Order.order_delivery_status_by_admin =async function order_delivery_status_by_admin(req, result) {
  var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
  const orderdetails = await query("select ors.*,mk.lat as makeit_lat,mk.lon as makeit_lon,mk.makeithub_id,mk.zone,zo.zone_status from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id left join Zone zo on zo.id=mk.zone where ors.orderid ='" + req.orderid + "'");
  sql.query("Select * from Orders where orderid = ? and moveit_user_id = ?",[req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {

        if (res1.length !== 0) {

          if (res1[0].orderstatus == 6) {
            let resobj = {
              success: true,
              message: "Sorry!  order was already deliverd.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus == 7) {
            let resobj = {
              success: true,
              message: "Sorry!  order already canceled.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus < 3) {
            let resobj = {
              success: true,
              message: "Sorry! Order not prepared",
              status:false
            };
            result(null, resobj);
          }else{

          if (res1[0].payment_status == 1) {

            req.moveitid = req.moveit_user_id;
            req.moveit_userid = req.moveit_user_id;
            req.status = 7
            await Order.insert_order_status(req); 

            await Order.insert_force_delivery(req); 

            req.orglat = orderdetails[0].makeit_lat;
          req.orglon = orderdetails[0].makeit_lon;
          req.deslat = orderdetails[0].cus_lat;
          req.deslon = orderdetails[0].cus_lon;
          req.hubid= orderdetails[0].makeithub_id;
          req.zoneid= orderdetails[0].zone;
          req.zone_status= orderdetails[0].zone_status;
          req.payment_type= orderdetails[0].payment_type;

          Order.eat_order_distance_calculation(req ,async function(err,res3) {
            if (err) {
              result(err, null);
            } else {
              if (res3.status != true) {
                result(null, res3);
              } else {
    
                var routes = res3.result;
                var caldistance = routes.routes;
                var deliverytimedata = caldistance[0].legs;
               
                req.distance = parseInt(deliverytimedata[0].distance.text);
                req.duration = parseInt(deliverytimedata[0].duration.text);

            sql.query("UPDATE Orders SET orderstatus = 6,moveit_actual_delivered_time = ?,last_mile=? WHERE orderid = ? and moveit_user_id =?",[ order_delivery_time,req.distance, req.orderid, req.moveit_user_id],async function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    message: "Order Delivery successfully",
                    status:true,
                    orderdeliverystatus: true
                  };
                  await Notification.orderEatPushNotification(
                    req.orderid,
                    null,
                    PushConstant.Pageid_eat_order_delivered
                  );
                  ////Insert Order History////
                  
                  ////////////////////////////
                  result(null, resobj);
                }
              }
            );


          
          }
        }
      });

          var orderactionlog={};
          orderactionlog.orderid=req.orderid;
          orderactionlog.app_type=req.app_type || 0;
          orderactionlog.userid=req.admin_id || 0;
          orderactionlog.action=9;
          await Order.createOrderActionLog(orderactionlog);
  
               
                
          } else {
            let resobj = {
              success: true,
              status:false,
              message: "Payment not yet paid!",
              orderdeliverystatus: false
            };
            result(null, resobj);
          }
        }
        } else {
          let resobj = {
            success: true,
            message: "Sorry! no order found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.admin_order_payment_status_by_moveituser = function(req, result) {
  sql.query(
    "Select * from Orders where orderid = ? and moveit_user_id = ?",
    [req.orderid, req.moveit_user_id],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length > 0) {

          // check the payment status - 1 is paid

          if (res1[0].orderstatus < 3) {
            let resobj = {
              success: true,
              message: "Sorry order not prepared.",
              status:false
            };
            result(null, resobj);
          }else{

          


          if (res1[0].payment_status == 0) {

            req.moveitid = req.moveit_user_id;
            req.status = 6
            await Order.insert_order_status(req); 
           
            sql.query(
              "UPDATE Orders SET payment_status = ? WHERE orderid = ? and moveit_user_id =?",
              [req.payment_status, req.orderid, req.moveit_user_id],
              async function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  var orderactionlog={};
                  orderactionlog.orderid=req.orderid;
                  orderactionlog.app_type=req.app_type || 0;
                  orderactionlog.userid=req.admin_id || 0;
                  orderactionlog.action=10;
                  await Order.createOrderActionLog(orderactionlog);

                  let resobj = {
                    success: true,
                    status:true,
                    message: "Cash received successfully"
                  };
                  result(null, resobj);
                }
              }
            );
          } else {
            let resobj = {
              success: true,
              status:false,
              message: "Already Payment has been paid!"
            };
            result(null, resobj);
          }
        }
        } else {
          let resobj = {
            success: true,
            status:false,
            message: "Please check your orderid and moveit user id! / order values is null"
          };

          result(null, resobj);
        }
      }
    }
  );
};


Order.admin_orders_count_by_moveit= function admin_orders_count_by_moveit(req, result) {
 
  sql.query("SELECT mo.userid, mo.name, count(*) as count,CURDATE()  FROM Orders as ors JOIN MoveitUser as mo ON ors.moveit_user_id = mo.userid where ors.orderstatus=6 and Date(ors.created_at)= CURDATE() Group by mo.userid ",async function(err,res1) {
    if (err) {
      result(err, null);
    } else {
      
      if (res1.length !==0) {

              let resobj = {
                success: true,
                status:true,
                result: res1
              };
              result(null, resobj); 
         
      
      } else {
        let resobj = {
          success: true,
          status: false,
          message: "Orders not found!"
        };
        result(null, resobj);
      }
    }
  });
};


Order.moveit_no_of_orders = function moveit_no_of_orders(req, result) {
  sql.query(
    "SELECT M.userid, M.name, count(*) as no_of_orders FROM Orders as Ord JOIN MoveitUser as M ON Ord.moveit_user_id = M.userid where Ord.orderstatus=6 and Date(Ord.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' Group by M.userid",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.order_turnaround_time_makeit = function order_turnaround_time_makeit(req, result) {
  sql.query(
    "Select orderid,ordertime,TIMEDIFF(makeit_accept_time,ordertime) as Accep_time,TimeDiff(makeit_actual_preparing_time, makeit_accept_time) as Preparation_time , ADDTIME(TIMEDIFF(makeit_accept_time,ordertime),TimeDiff(makeit_actual_preparing_time, makeit_accept_time)) as Totaltime from Orders as Ord  where Ord.orderstatus=6 and Date(Ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};


Order.order_turnaround_time_moveit = function order_turnaround_time_moveit(req, result) {
  var query="Select Ord.orderid,Ord.ordertime,TIMEDIFF(moveit_accept_time,order_assigned_time) as Moveit_Accept_time, TimeDiff(moveit_actual_delivered_time,moveit_pickup_time) as Moveit_delivered_time,ADDTIME(TIMEDIFF(moveit_accept_time,order_assigned_time) ,TimeDiff(moveit_actual_delivered_time,moveit_pickup_time) ) as Totaltime,time(Ord.order_assigned_time) as  moveitAssignedtime, time(Ord.moveit_accept_time) as moveitaccepttime,time(Ord.moveit_actual_delivered_time) as moveitdeliverdtime,time(Ord.moveit_pickup_time) as moveitpickuptime,(CASE WHEN Ord.ordertype=1 THEN 'Virtual' ELSE 'Real' END) as kitchen from `Orders` as Ord  where Ord.orderstatus=6 and Date(Ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order. orders_canceled= function orders_canceled(req, result) {
  sql.query("Select ord.orderid,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where ord.orderstatus=7 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.orders_cost = function orders_cost(req, result) {
  sql.query("Select orderid,ordertime,original_price,discount_amount from Orders where orderstatus=6 and Date(created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.admin_via_order_delivey = function admin_via_order_delivey(req, result) {
  sql.query("select orderid, if(admin_id=1,'EAT','Kitchen') as who, reason, created_at from Force_delivery_logs where Date(created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//New Users
Order.new_users = function new_users(req, result) {
  //sql.query("Select u.userid, u.phoneno from User as u join Orders as o on o.userid=u.userid where o.orderstatus=6  and Date(u.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
  sql.query("Select u.userid, u.phoneno,u.created_at,u.name from User as u where Date(u.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Total new user orders
Order.new_users_orders = function new_users_orders(req, result) {
  sql.query("Select distinct o.userid,u.name,u.phoneno,Count(o.orderid) as Total_orders from Orders as o join User as u on o.userid = u.userid where o.orderstatus=6 and Date(u.created_at) between '"+req.fromdate+"' AND '"+req.todate+"' GROUP BY u.userid Order BY Count(DISTINCT o.orderid) DESC",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Total Retained Customer Report
Order.retained_customer = function retained_customer(req, result) {
  sql.query("Select distinct o.userid,u.name,u.phoneno,Count(o.orderid) as Total_orders from Orders as o join User as u on o.userid = u.userid where o.orderstatus=6 and Date(o.created_at) between '"+req.fromdate+"' and '"+req.todate+"' GROUP BY u.userid HAVING Count(DISTINCT o.orderid) > 1 Order BY Count(DISTINCT o.orderid) DESC",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//No of orders per user
Order.user_orders_history = function user_orders_history(req, result) {
  sql.query("Select distinct o.userid,u.name,u.phoneno,Count(o.orderid) as Total_orders from Orders as o join User as u on o.userid = u.userid where o.orderstatus=6 and Date(o.created_at) between '"+req.fromdate+"' and '"+req.todate+"' GROUP BY u.userid Order BY Count(DISTINCT o.orderid) DESC",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Date Wise Sales Report  
Order.datewise_sales = function datewise_sales(req, result) {
  var ordercond = "";
  if(req.ordertype==0||req.ordertype==1){
    ordercond = " and ordertype = "+req.ordertype+" "; 
  }
  sql.query("Select DATE(o.created_at) as todaysdate, count(*) as Delivered_Orders, sum(price) as Totalmoney_received,sum(gst) as gst ,sum(original_price) as Totalmoney_without_discount, sum(refund_amount) as refund_coupon_amount,sum(discount_amount) as discount_amount,sum(ro.refund_amt) as refund_online, sum(ro.cancellation_charges) as cancellation_charges,sum(delivery_charge) as delivery_charge,if(o.payment_type=1,'Online','Cash') as payment_type  from Orders as o left join Refund_Online as ro on ro.orderid=o.orderid where orderstatus=6 "+ordercond+" and payment_type = "+req.payment_type+" and Date(o.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' group by Date(o.created_at)",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Canceled orders between date
Order.cancel_orders = function cancel_orders(req, result) {
  sql.query("Select ord.orderid,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where ord.orderstatus=7 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Driver wise COD Settlement 
Order.driverwise_cod = async function driverwise_cod(req,result) {
  var moveitqueryamount ="select mo.userid,mo.name,mo.phoneno,count(o.orderid) as ordercount ,sum(o.price) as totalamount,mo.moveit_hub as hub_id,mh.address as hubname,mo.zone as zone_id,zo.Zonename as zonename from Orders as o left join MoveitUser as mo on mo.userid= o.moveit_user_id  left join Makeit_hubs as mh on mh.makeithub_id= mo.moveit_hub left join Zone as zo on zo.id= mo.zone where Date(o.moveit_actual_delivered_time) between '"+req.fromdate+"' and '"+req.todate+"' and o.orderstatus = 6  and o.payment_status = 1 and o.payment_type = 0 Group by mo.userid";
  //console.log(moveitqueryamount);
  sql.query(moveitqueryamount,function(err, res) {
      if (err) {
        result(err, null);
      } else{
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

//Total delivered orders between date  and hub
Order.hub_total_delivery = async function hub_total_delivery(req,result) {
  var hubfilter="";
  if(req.makeithub_id){
    hubfilter = " and M.makeithub_id='"+req.makeithub_id+"'";
   }
  var selectquery = "SELECT count(*) as orders_count,Date(Ord.created_at) as ordertime FROM Orders as Ord JOIN MakeitUser as M ON Ord.makeit_user_id = M.userid where Ord.orderstatus=6 and Date(Ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'"+hubfilter+" group by date(Ord.created_at);";
  sql.query(selectquery,function(err, res) {
      if (err) {
        result(err, null);
      } else{
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

//Product wise report
Order.product_wise = function product_wise(req, result) {
  var query="Select pr.product_name as productname,pr.makeit_userid ,ord.productid, sum(ord.quantity) as quan, m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from OrderItem as ord join Orders as orde on orde.orderid= ord.orderid join Product as pr on pr.productid = ord.productid  join MakeitUser as m on m.userid=pr.makeit_userid  left outer join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where (Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  and  orde.orderstatus=6 group by ord.productid order by quan desc";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Orders report
Order.orders_report = function orders_report(req, result) {
  var query="Select o.orderid,o.original_price,o.refund_amount,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,o.order_assigned_time,o.makeit_accept_time,o.makeit_actual_preparing_time,o.moveit_pickup_time,o.moveit_actual_delivered_time,o.created_at,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid    where o.orderstatus=6 and (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//tunnel order
Order.create_tunnel_order_new_user = async function create_tunnel_order_new_user(req,orderitems,result) {

  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
 // var currenthour = 23
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var dinnerend = constant.dinnerend;

  const delivery_charge = constant.deliverycharge;
  // console.log(currenthour);
  // console.log(dinnerend);
 // if (currenthour >= breatfastcycle && currenthour <= dinnerend) {
     
    // const res = await query("select * from Orders where userid ='" +req.userid +"' and orderstatus < 6  and payment_status !=2");
 

    // if (res.length === 0 ) {

    //get address 
      const address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
    //console.log("address_data-->",address_data);
    if(address_data.length === 0) {
      let resobj = {
                success: true,
                status: false,
                message: "Sorry your selected address wrong.Please select correct address."
              };
              result(null, resobj);
      }else{
            req.lat = address_data[0].lat;
            req.lon = address_data[0].lon;
            Makeituser.read_a_cartdetails_makeitid(req, orderitems,true,async function(err,res3) {
              if (err) {
                result(err, null);
              } else {
           
                if (res3.status != true) {
                  result(null, res3);
                } else {

                
                  var amountdata = res3.result[0].amountdetails;

                  req.original_price = amountdata.original_price;
                  req.refund_balance = amountdata.refund_balance;
                  req.refund_amount = amountdata.refundamount;
                  req.discount_amount = amountdata.coupon_discount_amount;
                  req.after_discount_cost = amountdata.grandtotal;
                  req.order_cost   = amountdata.original_price;
                  req.gst = amountdata.gstcharge;
                  req.price = amountdata.grandtotal;
                  req.makeit_earnings = amountdata.makeit_earnings; 
                  req.cus_address = address_data[0].address;
                  req.locality = address_data[0].locality;
                  req.cus_lat = address_data[0].lat;
                  req.cus_lon = address_data[0].lon;
                  req.address_title = address_data[0].address_title;
                  req.locality_name = address_data[0].locality;
                  req.flatno = address_data[0].flatno;
                  req.landmark = address_data[0].landmark;
                  req.coupon = req.cid
                  req.orderstatus = 10;
                  req.payment_status = 3;
                  req.payment_type = 3;


                  Order.OrderInsert_tunnel_user(req, res3.result[0].item,true,false,async function(err,res){
                    if (err) {
                      result(err, null);
                    } else {
                      ////Insert Order History////
                      
                      ////////////////////////////
                      result(null, res);
                    }
                  });

                 
                }
              }
            });
      }

};

Order.OrderInsert_tunnel_user = async function OrderInsert_tunnel_user(req, orderitems,isMobile,isOnlineOrder,result) {
  var new_Order = new Order(req);
  new_Order.delivery_charge = constant.deliverycharge;
  sql.beginTransaction(function(err) {
    if (err) { 
      sql.rollback(function() {
        result(err, null);
      });
      return;
    }
    sql.query("INSERT INTO Orders set ?", new_Order, async function(err, res1) {
      if (err) { 
        sql.rollback(function() {
          result(err, null); //result.send(err);
        });
      }else{
        var orderid = res1.insertId;
        for (var i = 0; i < orderitems.length; i++) {
          var orderitem = {};
          orderitem.orderid = orderid;
          orderitem.productid = orderitems[i].productid;
          orderitem.quantity = orderitems[i].cartquantity;
          orderitem.price = orderitems[i].price;
          var items = new Orderitem(orderitem);
          Orderitem.createOrderitems_by_tunnel(items, function(err, res2) {
            //if (err) result.send(err);
            if (err) { 
              sql.rollback(function() {
                result(err, null);
              });
            }
          });

          
        }
            req.orderid = orderid;
            req.refundamount = constant.tunnel_refund_amout;
            var rc = new RefundCoupon(req);
           
              RefundCoupon.createRefundCoupon_by_tunnel_user(rc, async function(err, res2) {
                if (err) {
                  result(err, null);
                } 
              });

        var updatetunnel = await query("update User set first_tunnel = 0 where userid = "+req.userid+" ");

        let resobj = {
          success: true,
          status: true,
          message: "Order Created successfully",
          orderid: orderid
        };
        sql.commit(async function(err) {
          if (err) { 
            sql.rollback(function() {
              //result.send(err);
              result(err, null);
            });
          }
          
          result(null, resobj);
        });
      }
    });
  });
}

Order.kitchenwise_report = function kitchenwise_report(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.brandname, sum(makeit_earnings) as MakeitEarnings, sum(original_price-gst) as Sellingprice from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and orderstatus=6 group by Date(o.created_at),makeit_user_id";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Product wise Virual Kitchen report
Order.product_wise_virtual = function product_wise_virtual(req, result) {
  var query="Select pr.product_name as productname,pr.makeit_userid,mh.makeithub_name ,ord.productid, sum(ord.quantity) as quan, m.brandname,mh.address as hub_location from OrderItem as ord join Orders as orde on orde.orderid= ord.orderid join Product as pr on pr.productid = ord.productid join MakeitUser as m on m.userid = pr.makeit_userid join Makeit_hubs as mh on m.makeithub_id = mh.makeithub_id where (Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  and m.virtualkey=1 and  orde.orderstatus=6 group by ord.productid order by quan desc;";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Product wise Real Kitchen report
Order.product_wise_real = function product_wise_real(req, result) {
  var query="Select pr.product_name as productname,pr.makeit_userid,mh.makeithub_name ,ord.productid, sum(ord.quantity) as quan, m.brandname,m.address as hub_location from OrderItem as ord join Orders as orde on orde.orderid= ord.orderid join Product as pr on pr.productid = ord.productid join MakeitUser as m on m.userid = pr.makeit_userid left join Makeit_hubs as mh on m.makeithub_id = mh.makeithub_id where (Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  and m.virtualkey=0 and  orde.orderstatus=6 group by ord.productid order by quan desc;";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Virtual Kitchen Orders report
Order.virtual_orders_report = function virtual_orders_report(req, result) {
  var query="Select o.orderid,o.created_at,date(o.ordertime) as orderdate,time(o.ordertime) as ordertime,o.gst,o.original_price,o.price,o.refund_amount,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,ma.brandname,o.makeit_accept_time,date(o.makeit_accept_time) as makeitacceptdate,time(o.makeit_accept_time) as makeitaccepttime,o.makeit_actual_preparing_time,date(o.makeit_actual_preparing_time) as makeitactualpreparingdate,time(o.makeit_actual_preparing_time) as makeitactualpreparingtime,o.makeit_earnings,mh.address as hub_location,o.order_assigned_time,date(o.order_assigned_time) as moveitassigneddate,time(o.order_assigned_time) as moveitassignedtime,o.moveit_assign_lat,o.moveit_assign_long,o.moveit_accept_time,date(o.moveit_accept_time) as moveitacceptdate,time(o.moveit_accept_time) as moveitaccepttime,o.moveit_accept_lat,o.moveit_accept_long,o.moveit_reached_time as moveit_kitchen_reached,date(o.moveit_reached_time) as moveitkitchenreacheddate,time(o.moveit_reached_time) as moveitkitchenreachedtime,o.moveit_kitchen_reached_lat,o.moveit_kitchen_reached_long,o.moveit_pickup_time,date(o.moveit_pickup_time) as moveitpickupdate,time(o.moveit_pickup_time) as moveitpickuptime,o.moveit_Pickup_lat,o.moveit_Pickup_long,o.moveit_actual_delivered_time,date(o.moveit_actual_delivered_time) as moveitactualdelivereddate,time(o.moveit_actual_delivered_time) as moveitactualdeliveredtime,o.moveit_delivery_lat,moveit_delivery_long,if(o.delivery_vendor=1,'Dunzo','Eat') as delivered_by from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid join Makeit_hubs as mh on ma.makeithub_id=mh.makeithub_id where o.orderstatus=6 and ma.virtualkey=1 and o.ordertype=0 and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Real Kitchen Orders report
Order.real_orders_report = function real_orders_report(req, result) {
  var query="Select o.orderid,o.created_at,date(o.ordertime) as orderdate,time(o.ordertime) as ordertime,o.gst,o.original_price,o.price,o.refund_amount,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,GROUP_CONCAT(DISTINCT p.product_name,' - ',oi.quantity SEPARATOR ',') as product,ma.brandname,o.makeit_accept_time,date(o.makeit_accept_time) as makeitacceptdate,time(o.makeit_accept_time) as makeitaccepttime,o.makeit_actual_preparing_time,date(o.makeit_actual_preparing_time) as makeitactualpreparingdate,time(o.makeit_actual_preparing_time) as makeitactualpreparingtime,o.makeit_earnings,mh.address as hub_location,o.order_assigned_time,date(o.order_assigned_time) as moveitassigneddate,time(o.order_assigned_time) as moveitassignedtime,o.moveit_assign_lat,o.moveit_assign_long,o.moveit_accept_time,date(o.moveit_accept_time) as moveitacceptdate,time(o.moveit_accept_time) as moveitaccepttime,o.moveit_accept_lat,o.moveit_accept_long,o.moveit_reached_time as moveit_kitchen_reached,date(o.moveit_reached_time) as moveitkitchenreacheddate,time(o.moveit_reached_time) as moveitkitchenreachedtime,o.moveit_kitchen_reached_lat,o.moveit_kitchen_reached_long,o.moveit_pickup_time,date(o.moveit_pickup_time) as moveitpickupdate,time(o.moveit_pickup_time) as moveitpickuptime,o.moveit_Pickup_lat,o.moveit_Pickup_long,o.moveit_actual_delivered_time,date(o.moveit_actual_delivered_time) as moveitactualdelivereddate,time(o.moveit_actual_delivered_time) as moveitactualdeliveredtime,sum((pp.count*pb.price))+1 as packaging_cost,o.moveit_delivery_lat,moveit_delivery_long,if(o.delivery_vendor=1,'Dunzo','Eat') as delivered_by from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid left join Makeit_hubs as mh on ma.makeithub_id=mh.makeithub_id left join ProductPackaging as pp on pp.product_id=oi.productid left join PackagingBox as pb on pb.id=pp.package_id where o.orderstatus=6 and ma.virtualkey='0' and o.ordertype=0 and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Daywise Virtual Makeit Earnings report
Order.virtual_makeit_earnings = function virtual_makeit_earnings(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.userid as kitchen_id,mu.brandname, sum(makeit_earnings) as MakeitEarnings, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and orderstatus=6 and mu.virtualkey=1 group by Date(o.created_at),makeit_user_id";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Daywise Real Makeit Earnings report
Order.real_makeit_earnings = function real_makeit_earnings(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.userid as kitchen_id,mu.brandname, sum(makeit_earnings) as MakeitEarnings, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and orderstatus=6 and mu.virtualkey=0 group by Date(o.created_at),makeit_user_id";
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

Order.admin_order_pickup_cancel = async function admin_order_pickup_cancel(req, result) {

  var cancel_reason=req.cancel_reason||""
   const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
 
   if (orderdetails[0].orderstatus == 7 ) {
     let response = {
       success: true,
       status: false,
       message: "Sorry! order already canceled."
     };
     result(null, response);
   }else if(orderdetails[0].orderstatus == 6){
       let response = {
         success: true,
         status: false,
         message: "Sorry! This order has been already deliverd."
       };
       result(null, response);
 
   } else {
    var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
     sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2,cancel_reason= '"+cancel_reason+"',cancel_status = 2,cancel_time = '" +ordercanceltime+"' WHERE orderid ='" +req.orderid +"'",async function(err, res) {
         if (err) {
           result(err, null);
         } else {

          if (orderdetails[0].delivery_vendor==1) {
            console.log("dunzo_task_cancel");
            orderdetails[0].cancellation_reason= cancel_reason ;
            Dunzo.dunzo_task_cancel(orderdetails[0]);
            
          }
            var refundDetail = {
             orderid: req.orderid,
             original_amt: orderdetails[0].price + orderdetails[0].refund_amount,
             active_status: 1,
             userid: orderdetails[0].userid,
             payment_id: orderdetails[0].transactionid
           };
           var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
           //var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

           for (let i = 0; i < orderitemdetails.length; i++) {
             var productquantityadd =
               "update Product set quantity = quantity+" +
               orderitemdetails[i].quantity +
               " where productid =" +
               orderitemdetails[i].productid +
               "";
             sql.query(productquantityadd, function(err, res2) {
               if (err) {
                 result(err, null);
               }
             });
           }
 
           if (orderdetails[0].ordertype==0) {
           if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {
 
             if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
               
               await Order.create_refund(refundDetail);
               if (orderdetails[0].refund_amount !== 0) {
             
                await Order.cod_create_refund_byonline(refundDetail);
                
               }
 
 
           }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
             var rc = new RefundCoupon(req);
             RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
               if (err) {
                 result(err, null);
               } 
             });
           }
           }
 
           if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
             removecoupon = {};
             removecoupon.userid = orderdetails[0].userid;
             removecoupon.cid = orderdetails[0].coupon;
             removecoupon.orderid = req.orderid;
             // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
             // await query(deletequery);
             await Order.remove_used_coupon(removecoupon);
           }
          }
 
              var orderactionlog={};
                orderactionlog.orderid=req.orderid;
                orderactionlog.app_type=req.app_type || 0;
                orderactionlog.userid=req.admin_id || 0;
                orderactionlog.action=11;
                await Order.createOrderActionLog(orderactionlog);

           await Notification.orderEatPushNotification(
             req.orderid,
             null,
             PushConstant.Pageid_eat_order_cancel
           );
           
           if(orderdetails[0]&&orderdetails[0].moveit_user_id){
             await Notification.orderMoveItPushNotification(
               req.orderid,
               PushConstant.pageidMoveit_Order_Cancel,
               null
             );
           }
           let response = {
             success: true,
             status: true,
             message: "Order canceled successfully."
           };
           ////Insert Order History////

           ////////////////////////////
           result(null, response);
         }
       }
     );
   }
 };

 Order.admin_order_prepared_cancel = async function admin_order_prepared_cancel(req, result) {

  var cancel_reason=req.cancel_reason||""
   const orderdetails = await query("select * from Orders where orderid ='" + req.orderid + "'");
 
   if (orderdetails[0].orderstatus == 7 ) {
     let response = {
       success: true,
       status: false,
       message: "Sorry! order already canceled."
     };
     result(null, response);
   }else if(orderdetails[0].orderstatus == 6){
       let response = {
         success: true,
         status: false,
         message: "Sorry! This order has been already deliverd."
       };
       result(null, response);
 
   } else {
    var ordercanceltime = moment().format("YYYY-MM-DD HH:mm:ss");
     sql.query("UPDATE Orders SET makeit_status=0,orderstatus = 7,cancel_by = 2,cancel_reason= '"+cancel_reason+"',cancel_status = 1,cancel_time = '" +ordercanceltime+"'  WHERE orderid ='" +req.orderid +"'",async function(err, res) {
         if (err) {
           result(err, null);
         } else {

          if (orderdetails[0].delivery_vendor==1) {
            console.log("dunzo_task_cancel");
            orderdetails[0].cancellation_reason= cancel_reason ;
            Dunzo.dunzo_task_cancel(orderdetails[0]);
            
          }
          
            var refundDetail = {
             orderid: req.orderid,
             original_amt: orderdetails[0].price + orderdetails[0].refund_amount,
             active_status: 1,
             userid: orderdetails[0].userid,
             payment_id: orderdetails[0].transactionid
           };
           var orderitemdetails = await query("select * from OrderItem where orderid ='" + req.orderid + "'");
           //var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");

           for (let i = 0; i < orderitemdetails.length; i++) {
             var productquantityadd =
               "update Product set quantity = quantity+" +
               orderitemdetails[i].quantity +
               " where productid =" +
               orderitemdetails[i].productid +
               "";
             sql.query(productquantityadd, function(err, res2) {
               if (err) {
                 result(err, null);
               }
             });
           }
 
           if (orderdetails[0].ordertype==0) {
           if (orderdetails[0].refund_amount !== 0 || orderdetails[0].payment_status == 1) {
 
             if (orderdetails[0].payment_type === "1" || orderdetails[0].payment_status === 1){
               
               await Order.create_refund(refundDetail);
               if (orderdetails[0].refund_amount !== 0) {
              
                await Order.cod_create_refund_byonline(refundDetail);
                
               }
 
 
           }else if (orderdetails[0].payment_type === "0" || orderdetails[0].payment_status === 0) {
             var rc = new RefundCoupon(req);
             RefundCoupon.createRefundCoupon(rc, async function(err, res2) {
               if (err) {
                 result(err, null);
               } 
             });
           }
           }
 
           if ( orderdetails[0].discount_amount !==0 || orderdetails[0].coupon) {
             removecoupon = {};
             removecoupon.userid = orderdetails[0].userid;
             removecoupon.cid = orderdetails[0].coupon;
             removecoupon.orderid = req.orderid;
             // var deletequery = "delete from CouponsUsed where cid = '"+removecoupon.cid+"' and userid = "+removecoupon.userid+" and orderid ="+removecoupon.orderid+"  order by cuid desc limit 1";
             // await query(deletequery);
             await Order.remove_used_coupon(removecoupon);
           }
          }
 
           await Notification.orderEatPushNotification(
             req.orderid,
             null,
             PushConstant.Pageid_eat_order_cancel
           );
           
           if(orderdetails[0]&&orderdetails[0].moveit_user_id){
             await Notification.orderMoveItPushNotification(
               req.orderid,
               PushConstant.pageidMoveit_Order_Cancel,
               null
             );
           }

           var orderactionlog={};
          orderactionlog.orderid=req.orderid;
          orderactionlog.app_type=req.app_type || 0;
          orderactionlog.userid=req.admin_id || 0;
          orderactionlog.action=8;
          await Order.createOrderActionLog(orderactionlog);

           let response = {
             success: true,
             status: true,
             message: "Order canceled successfully."
           };
           ////Insert Order History////
           
           ////////////////////////////
           result(null, response);
         }
       }
     );
   }
 };

 //Orders rating
Order.orders_rating = function orders_rating(req, result) {
  var pagelimt = 20;
  var page = req.page || 1;
  var date = req.date;
  var startlimit = (page - 1) * pagelimt;
  var ratingquery="Select * from Order_rating"
  if(date) ratingquery=ratingquery+" where Date(created_at) = "+date;
  var limtquery=ratingquery+" order by orid desc limit "+startlimit+"," +pagelimt;
  sql.query(limtquery,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        var orderrating = await query(ratingquery);
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            totalcount:orderrating.length,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Virtual Kitchen Prepare After Cancel Report
Order.virtual_after_cancel = function virtual_after_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.userid as kitchen_id,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL) THEN makeit_earnings ELSE 0 END) as AfterCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL)) and mu.virtualkey=1 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Real Kitchen Prepare After Cancel Report
Order.real_after_cancel = function real_after_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.userid as kitchen_id,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL) THEN makeit_earnings ELSE 0 END) as AfterCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o left join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL)) and mu.virtualkey=0 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Virtual Kitchen Prepare Before Cancel Report
Order.virtual_before_cancel = function virtual_before_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.userid as kitchen_id,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NULL) THEN makeit_earnings ELSE 0 END) as BeforeCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NULL)) and mu.virtualkey=1 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Makeit Earnings Real Kitchen Prepare Before Cancel Report
Order.real_before_cancel = function real_before_cancel(req, result) {
  var query="Select Date(o.created_at) as Todaysdate,mu.userid as kitchen_id,mu.brandname, SUM(CASE WHEN orderstatus=6 THEN makeit_earnings ELSE 0 END) as MakeitEarnings, SUM(CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NULL) THEN makeit_earnings ELSE 0 END) as BeforeCancelAmount, sum(original_price-gst) as Sellingprice,mu.commission from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and (orderstatus=6 or (orderstatus=7 and makeit_actual_preparing_time IS NULL)) and mu.virtualkey=0 group by Date(o.created_at),makeit_user_id";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////////Virtual Cancel Orders////////////////////
Order.virtual_order_canceled= function virtual_order_canceled(req, result) {
  sql.query("Select ord.orderid,ord.ordertype,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname,m.makeithub_id,mh.makeithub_name,mh.address from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id = m.makeithub_id where ord.orderstatus=7 and m.virtualkey=1 and ord.ordertype=0 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////////Real Cancel Orders/////////////////
Order.real_order_canceled= function real_order_canceled(req, result) {
  sql.query("Select ord.orderid,ord.ordertype,ord.original_price,ord.gst,ord.price,ord.refund_amount,ord.discount_amount,ord.ordertime,if(ord.cancel_by=1,'EAT','Kitchen') as canceled_by,ord.cancel_charge,ord.cancel_reason,m.brandname from Orders as ord join MakeitUser as m on m.userid=ord.makeit_user_id  where ord.orderstatus=7 and m.virtualkey=0 and ord.ordertype=0 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//Check Orders in queue 
Order.getXfactors = async function getXfactors(req,orderitems, result) {
  //X factor Algorithm
  //(Total no of orders in Queue) = (X-1) * (No of Drivers in hub)
  //Note X value in hub based.

  //////21-feb-2020  
  //If there are more than 5 riders live in that zone, then x factor must not be overridden and the abandoned cart logic should happen according to the x factor calculation
  // If there are less than 5 riders live in that zone, then x factor condition must be overridden and the condition to be checked is - “Are there 10 orders in queue ?” . Abandoned cart must appear if there are 10 orders in the queue.
  if (constant.Xfactor_status==true) {
    
  if (constant.order_assign_status==false) {   
    let resobj = {
      success: true,
      status:true,
      order_queue:0,
      title:"Available",
      message:'Delivery boys are available!'
    };    
    result(null, resobj);
  }else{
    if(constant.zone_control==false){
      var get_hub_id_from_orders= await query("Select zone from MakeitUser where userid="+req.makeit_user_id);
      var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and zone="+get_hub_id_from_orders[0].zone);
    //  var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where zoneid="+get_hub_id_from_orders[0].zone+" and  status !=1") ;
      var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.zoneid="+get_hub_id_from_orders[0].zone+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;
      var get_hub_id_from_makeithub= await query("Select xfactor,zone_status from Zone where id="+get_hub_id_from_orders[0].zone);
    }else{
      var get_hub_id_from_orders= await query("Select makeithub_id from MakeitUser where userid="+req.makeit_user_id);
      var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and moveit_hub="+get_hub_id_from_orders[0].makeithub_id);
     // var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where hubid="+get_hub_id_from_orders[0].makeithub_id+" and  status !=1") ;
      var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.hubid="+get_hub_id_from_orders[0].makeithub_id+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;
      var get_hub_id_from_makeithub= await query("Select xfactor from Makeit_hubs where makeithub_id="+get_hub_id_from_orders[0].makeithub_id);
    }
///this condition is Dunzo zone 10 //09-dec-2019
    if (get_hub_id_from_makeithub[0].zone_status == 1 || get_hub_id_from_makeithub[0].zone_status == undefined) {
      console.log("Dunzo and moveit");

      var xfactorValue = (get_hub_id_from_makeithub[0].xfactor - 1) * (get_moveit_list_based_on_hub[0].no_of_move_it_count || 0)
      console.log("get_hub_id_from_orders-->",get_hub_id_from_orders[0].zone);
      console.log("get_moveit_cound_based_on_hub-->",get_moveit_list_based_on_hub[0].no_of_move_it_count);
      console.log("xfactorValue-->",Math.round(xfactorValue));
      var fValue= Math.round(xfactorValue);
      if(get_orders_queue_based_on_hub[0].no_of_orders_count < fValue){
        let resobj = {
          success: true,
          status:true,
          order_queue:0,
          title:"Available",
          message:'Delivery boys are available!'
        };      
        result(null, resobj);
      }else{
        req.payment_type=3;
        req.payment_status=3;
        req.orderstatus = 11;
        Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
          if (err) {
            result(err, null);
          } else {       
            let resobj = {
              success: true,
              status:false,
              order_queue:1,
              title:"IN HIGH DEMAND",//Moveit Hign demand
              message:'We are facing high demand. We will let you know when we are back to our best!'
            };
            result(null, resobj);      
          }
        });
      }
  
    } else {
      console.log("Dunzo");

      var queuecount = await query("select count(*)as count from Orders_queue where zoneid='"+get_hub_id_from_orders[0].zone+"' and status !=1 "); //and created_at > (NOW() - INTERVAL 10 MINUTE
    
      if (queuecount[0].count <=constant.Dunzo_zone_order_limit) {
        let resobj = {
          success: true,
          status:true,
          order_queue:0,
          title:"Available",
          message:'Delivery boys are available!'
        };      
        result(null, resobj);
      } else {
        req.payment_type=3;
        req.payment_status=3;
        req.orderstatus = 12;
        Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
          if (err) {
            result(err, null);
          } else {       
            let resobj = {
              success: true,
              status:false,
              order_queue:1,
              title:"IN HIGH DEMAND",//Dunzo Hign demand
              message:'We are facing high demand. We will let you know when we are back to our best!'
            };
            result(null, resobj);      
          }
        });
      }

     
    }
    
  }
  
  }else{

    
    if (constant.order_assign_status==false) {   
      let resobj = {
        success: true,
        status:true,
        order_queue:0,
        title:"Available",
        message:'Delivery boys are available!'
      };    
      result(null, resobj);
    }else{
      if(constant.zone_control==false){
        var get_hub_id_from_orders= await query("Select zone from MakeitUser where userid="+req.makeit_user_id);
        var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and zone="+get_hub_id_from_orders[0].zone);
       var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where zoneid="+get_hub_id_from_orders[0].zone+" and  status !=1") ;
         var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.zoneid="+get_hub_id_from_orders[0].zone+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;
         var get_hub_id_from_makeithub= await query("Select xfactor,zone_status,overridden_value from Zone where id="+get_hub_id_from_orders[0].zone);
      }else{
        var get_hub_id_from_orders= await query("Select makeithub_id from MakeitUser where userid="+req.makeit_user_id);
        var get_moveit_list_based_on_hub = await query("Select count(*) as no_of_move_it_count from MoveitUser where online_status=1 and moveit_hub="+get_hub_id_from_orders[0].makeithub_id);
       var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue where hubid="+get_hub_id_from_orders[0].makeithub_id+" and  status !=1") ;
         var get_orders_queue_based_on_hub = await query("Select count(*) as no_of_orders_count from Orders_queue as oq left join Orders as ors on ors.orderid=oq.orderid where oq.hubid="+get_hub_id_from_orders[0].makeithub_id+" and oq.status !=1 and orderstatus < 6 and  Date(oq.created_at)= CURDATE()") ;
         var get_hub_id_from_makeithub= await query("Select xfactor from Makeit_hubs where makeithub_id="+get_hub_id_from_orders[0].makeithub_id);
      }
  ///this condition is Dunzo zone 10 //09-dec-2019

        console.log(get_moveit_list_based_on_hub);
    
      if (get_moveit_list_based_on_hub[0].no_of_move_it_count >= constant.Xfactor_moveit_count) {

        var xfactorValue = (get_hub_id_from_makeithub[0].xfactor - 1) * (get_moveit_list_based_on_hub[0].no_of_move_it_count || 0)
        console.log("get_hub_id_from_orders-->",get_hub_id_from_orders[0].zone);
        console.log("get_moveit_cound_based_on_hub-->",get_moveit_list_based_on_hub[0].no_of_move_it_count);
        console.log("xfactorValue-->",Math.round(xfactorValue));
        var fValue= Math.round(xfactorValue);
        if(get_orders_queue_based_on_hub[0].no_of_orders_count < fValue){
          let resobj = {
            success: true,
            status:true,
            order_queue:0,
            title:"Available",
            message:'Delivery boys are available!'
          };      
          result(null, resobj);
        }else{
          req.payment_type=3;
          req.payment_status=3;
          req.orderstatus = 11;
          Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
            if (err) {
              result(err, null);
            } else {       
              let resobj = {
                success: true,
                status:false,
                order_queue:1,
                title:"IN HIGH DEMAND",//Moveit Hign demand
                message:'We are facing high demand. We will let you know when we are back to our best!'
              };
              result(null, resobj);      
            }
          });
        }
    
      } else {
        console.log("Xfactore overridding");

        var queuecount = await query("select count(*)as count from Orders_queue where zoneid='"+get_hub_id_from_orders[0].zone+"' and status !=1 "); //and created_at > (NOW() - INTERVAL 10 MINUTE
        console.log(queuecount);
     //   var xfacttore_overridden_value = await query("select overridden_value from Zone where id='"+get_hub_id_from_orders[0].zone+" "); 
        if (queuecount[0].count < get_hub_id_from_makeithub[0].overridden_value) {
          let resobj = {
            success: true,
            status:true,
            order_queue:0,
            title:"Available",
            message:'Delivery boys are available!'
          };      
          result(null, resobj);
        } else {
          req.payment_type=3;
          req.payment_status=3;
          req.orderstatus = 12;
          Order.read_a_proceed_to_pay_xfactore(req, orderitems,async function(err,res){
            if (err) {
              result(err, null);
            } else {       
              let resobj = {
                success: true,
                status:false,
                order_queue:1,
                title:"IN HIGH DEMAND",//Dunzo Hign demand
                message:'We are facing high demand. We will let you know when we are back to our best!'
              };
              result(null, resobj);      
            }
          });
        }

      
      }
      
    }


  }
}

Order.checkOrdersinQueue = function checkOrdersinQueue(req, result) {
  var query="Select count(*) ordercount from Orders as ors where ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( "+req.lat+" ) )  * cos( radians( "+req.lon+" ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians("+req.lat+")) ) )<2 and (ors.payment_type=0 or (ors.payment_type=1 and ors.payment_status<2))";
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            ordercount:res[0].ordercount
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            status:true,
            ordercount:0
          };
          result(null, resobj);
        }
      }
    }
  );
};

//auto order assign to moveit 
Order.auto_order_assign =async function auto_order_assign(req, result) {
 
  var order_queue_query = await query("select * from Orders_queue where status = 0 and orderid =" +req.orderid+"");

if (order_queue_query.length ==0) {
  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");

  var radius = constant.order_assign_first_radius + constant.order_assign_second_radius;
        var geoLocation = [];
        geoLocation.push(req.orglat);
        geoLocation.push(req.orglon);
      

  MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,radius,async function(err, move_it_id_list) {
    if (err) {
      let error = {
        success: true,
        status: false,
        message:"No Move-it found,please after some time"
      };
      result(error, null);
    }else{
 
      //don't remove the commanded code 19-feb-2020
      // var moveitlist = move_it_id_list.moveitid;
      // console.log(move_it_id_list.moveitid_below_2);
      // console.log(move_it_id_list.moveitid_above_2);
      var nearbymoveit = [];
      var near_by_moveit_data = [];
      move_it_id_list.sort(
            (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
          );

      for (let i = 0; i < move_it_id_list.length; i++) {
        
        near_by_moveit_data.push(move_it_id_list[i].moveit_id);
      }

      var get_zoneid = await query("select mk.zone from Orders ors join MakeitUser mk on ors.makeit_user_id=mk.userid where ors.orderid='"+req.orderid+"' ");
               

      // if (move_it_id_list.moveitid_below_2) {
  
      //   var moveitlistquery =
      //     "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
      //     move_it_id_list.moveitid_below_2 +
      //     ") and mu.online_status = 1 and login_status=1  and mu.zone = "+get_zoneid[0].zone+" group by mu.userid order by ordercount";
      //      nearbymoveit = await query(moveitlistquery);

      // }
      
      // if(move_it_id_list.moveitid_above_2 && nearbymoveit.length ==0){

      //   var moveitlistquery =
      //     "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
      //     move_it_id_list.moveitid_above_2 +
      //     ") and mu.online_status = 1 and login_status=1 and mu.zone = "+get_zoneid[0].zone+" group by mu.userid order by ordercount";
      //     nearbymoveit = await query(moveitlistquery);
      // }
      console.log("near_by_moveit_data---------------->",near_by_moveit_data);
      var moveitlistquery =
      "select mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN(" +
      near_by_moveit_data +
      ") and mu.online_status = 1 and login_status=1 and mu.zone = "+get_zoneid[0].zone+" group by mu.userid ORDER BY FIELD(mu.userid,"+near_by_moveit_data+") ";
      console.log(moveitlistquery);
      nearbymoveit = await query(moveitlistquery);

      if (nearbymoveit.length !==0) {
        
   

         console.log("nearbymoveit[0].userid"+nearbymoveit[0].userid);
 
             sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[nearbymoveit[0].userid, assign_time, req.orderid],async function(err, res2) {
                 if (err) {
                   result(err, null);
                 } else {
                   var moveit_offline_query = await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");
                   req.state=1;
                   req.moveit_user_id=nearbymoveit[0].userid
                   Order.update_moveit_lat_long(req);
                   await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned);
   
                   let resobj = {
                     success: true,
                     status:true,
                     message: "Order Assign Successfully",
                     
                   };
                   result(null, resobj);
                }
               }
             );
       
 
       }else{
 
       // if (req.payment_type==1) {
          
        var new_Ordersqueue = new Ordersqueue(req);
        new_Ordersqueue.status = 0;
        Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
         if (err) { 
           result(err, null);
         }else{
 
           let resobj = {
             success: true,
             status: true,
             message: "Order moved to Queue"
         };
       
         result(null, resobj);
         }
       });

      // }
       
       }

    }
  })
}else{
  let resobj = {
    success: true,
    status:true,
    message: "already exist",
    
  };
  result(null, resobj);
}
};

//////////////Orders move to queue/////////////////
Order.order_move_to_queue_by_admin= function order_move_to_queue_by_admin(req, result) {
  sql.query("select * from Orders where orderid='"+req.orderid+"' and moveit_user_id="+req.moveit_user_id+"",async function(err, res) {
      if (err) {
        result(err, null);
      } else {
       
        if (res.length !== 0) {
          var reassignorders  = {};
            
          reassignorders.orderid = req.orderid;
          reassignorders.moveit_userid = res[0].moveit_user_id;
          reassignorders.notification_time = res[0].moveit_notification_time;
          reassignorders.accept_time = res[0].moveit_accept_time;
          reassignorders.reason = req.reason;
          await Order.createMoveitReassignedOrders(reassignorders);

          var orderactionlog={};
          orderactionlog.orderid=req.orderid;
          orderactionlog.app_type=req.app_type || 0;
          orderactionlog.userid=req.admin_id||0;
          orderactionlog.action=1;
          await Order.createOrderActionLog(orderactionlog);

          
          var moveit_online_status_date = await query("Update MoveitUser set online_status = 0  where userid = '"+req.moveit_user_id+"'");
          var Orders_update_moveit = await query("update Orders set moveit_user_id = 0,moveit_status=0 where orderid =" +req.orderid+"");

          /////Moveit Time Log History////////////////////
          var reqqq = {};
          reqqq.moveit_userid = req.moveit_user_id;
          reqqq.type = 0;
          reqqq.action = 4;
          await MoveitUser.create_createMoveitTimelog(reqqq);
          /////////////////////////////////////////////////

          var Orders_queue_details = await query("select * from Orders_queue where orderid =" +req.orderid+"");

          if (Orders_queue_details.length !==0) {
            var order_update = await query("update Orders_queue set status = 0 where orderid =" +req.orderid+"");
        
            await Notification.orderMoveItPushNotification(
              req.orderid,
              PushConstant.pageidMoveit_Order_unassign,
              await Notification.getMovieitDetail( res[0].moveit_user_id)
            );
  
            let resobj = {
              success: true,
              status:true,
              result:res
            };
            result(null, resobj);
          }else{
            var makeit_details = await query("select * from MakeitUser where userid =" +res[0].makeit_user_id+"");
              req.hubid=makeit_details[0].makeithub_id;
             var new_Ordersqueue = new Ordersqueue(req);
              new_Ordersqueue.status = 0;
              Ordersqueue.createOrdersqueue(new_Ordersqueue,async function(err, res2) {
                if (err) { 
                  result(err, null);
                }else{
               
                  await Notification.orderMoveItPushNotification(
                    req.orderid,
                    PushConstant.pageidMoveit_Order_unassign,
                    await Notification.getMovieitDetail( res[0].moveit_user_id)
                  );
        
                  let resobj = {
                    success: true,
                    status:true,
                    result:res
                  };
                  result(null, resobj);
                }
              });

          }


          // if(res[0]&&res[0].moveit_user_id){
          //   await Notification.orderMoveItPushNotification(
          //     req.orderid,
          //     PushConstant.pageidMoveit_Order_Cancel,
          //     null
          //   );
          // }

          // let resobj = {
          //   success: true,
          //   status:true,
          //   result:res
          // };
          // result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

////Lost customers list/////////
Order.lostcustomerlist_report= function lostcustomerlist_report(req, result) {
  if(req.max && req.min){
    var query = "select u.userid,u.name,u.email,u.phoneno,ord.orderid,(CASE WHEN (DATE(ord.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL "+req.min+" DAY) AND  CURDATE()) THEN ord.orderid ELSE 0 END) as with7day from User as u join Orders as ord on ord.userid=u.userid where u.userid!='' and (DATE(ord.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL "+req.max+" DAY) AND  CURDATE()) group by u.userid order by ord.orderid desc"
    sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        const res_result = res.filter(re => re.with7day===0);
        if (res_result.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res_result
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
  }
};

/////Virtual orders purchased report//////////////
Order.virtualorderpurchased_report= function virtualorderpurchased_report(req, result) {
  var query="Select o.orderid,o.gst,o.original_price,o.refund_amount,o.makeit_earnings,o.discount_amount,if(o.payment_type=1,'Online','Cash') as payment_type,o.order_assigned_time,o.makeit_accept_time,o.makeit_actual_preparing_time,o.moveit_pickup_time,o.moveit_actual_delivered_time,o.created_at,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,date(o.ordertime) as orderdate,time(o.ordertime) as ordertime,date(o.makeit_accept_time) as makeitacceptdate,time(o.makeit_accept_time) as makeitaccepttime,date(o.makeit_actual_preparing_time) as makeitactualpreparingdate,time(o.makeit_actual_preparing_time) as makeitactualpreparingtime,date(o.order_assigned_time) as moveitassigneddate,time(o.order_assigned_time) as moveitassignedtime,date(o.moveit_pickup_time) as moveitpickupdate,time(o.moveit_pickup_time) as moveitpickuptime,date(o.moveit_actual_delivered_time) as moveitactualdelivereddate,time(o.moveit_actual_delivered_time) as moveitactualdeliveredtime from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid where o.orderstatus=6 and o.ordertype=1 and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

/////funnel orders report////////////////////
Order.funnelorders_report= function funnelorders_report(req, result) {
  var query="Select o.orderid,o.gst,o.original_price,o.refund_amount,o.makeit_earnings,o.discount_amount,o.created_at,ma.brandname, GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,mh.address as hub_location,o.cus_lat,o.cus_lon,o.cus_address from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on ma.userid=o.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id=ma.makeithub_id where o.orderstatus=10 and o.ordertype=0 and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

/////X-Factor orders report//////////////
Order.xfactororders_report= function xfactororders_report(req, result) {
  var query="Select o.orderid,o.gst,o.original_price,o.refund_amount,o.makeit_earnings,o.discount_amount,o.created_at,ma.brandname, GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,mh.address as hub_location,o.cus_lat,o.cus_lon,o.cus_address from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on ma.userid=o.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id=ma.makeithub_id where o.orderstatus=11 and o.ordertype=0 and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////Add Order Status History/////////////
Order.addorderhistory = async function addorderhistory(req,result){
  var GetOrderStatus = await query("select orderid,orderstatus from Orders where orderid="+req);
  var insertdata={"orderid":GetOrderStatus[0].orderid,"orderstatus":GetOrderStatus[0].orderstatus};
  var inserthistory = await OrderStatusHistory.createorderstatushistory(insertdata);
}

////////Zone Based Moveit Auto Order Assign
Order.zone_moveit_order_auto_assign = async function zone_moveit_order_auto_assign(req, result) {
  var order_queue_query = await query("select * from Orders_queue where status = 0 and orderid =" +req.orderid+"");
  if (order_queue_query.length ==0) {
    var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
    var makeitLocation = [];
    makeitLocation.push(req.orglat);
    makeitLocation.push(req.orglon);
    
    var moveitlistzonequery="select mv.userid from Orders ord left join MakeitUser as mu on mu.userid = ord.makeit_user_id left join MoveitUser as mv on mv.zone = mu.zone where ord.orderid="+req.orderid+" and mv.online_status = 1 group by mv.userid";

    var moveitlistquery ="select zo.boundaries,mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Zone as zo on zo.id = mu.zone left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN("+moveitlistzonequery+") and mu.online_status = 1 and login_status=1 group by mu.userid order by ordercount";
          var zonemoveitlist = await query(moveitlistquery);
          ///console.log("moveitlistquery-->",JSON.stringify(zonemoveitlist));
          if (zonemoveitlist.length !==0) {
            MoveitFireBase.getInsideZoneMoveitList(makeitLocation,zonemoveitlist,async function(err, zoneInsideMoveitlist) {
            //  console.log("zoneInsideMoveitlist-->",JSON.stringify(zoneInsideMoveitlist));
              if(zoneInsideMoveitlist.length>0){
              sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[zoneInsideMoveitlist[0].userid, assign_time, req.orderid],async function(err, res2) {
                if (err) {
                  result(err, null);
                } else {
                  await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");
                  req.state=1;
                  req.moveit_user_id=zoneInsideMoveitlist[0].userid
                  console.log("Zone order assign",req);
                  Order.update_moveit_lat_long(req);
                  await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned);
                  let resobj = {
                    success: true,
                    status:true,
                    message: "Order Assign Successfully",
                  };
                  result(null, resobj);
                }
              });
            }else{
              console.log("new_Ordersqueue-->");
              var new_Ordersqueue = new Ordersqueue(req);
              new_Ordersqueue.status = 0;
          
              Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
                if (err) { 
                  console.log("err  new_Ordersqueue-->");
                  result(err, null);
                }else{
                  console.log("success  new_Ordersqueue-->");
                  let resobj = {
                    success: true,
                    status: true,
                    message: "Order moved to Queue"
                  };
                  result(null, resobj);
                }
              });
            }
            });
            
          }else{
         
            if ((req.zone_status ==2 || req.zone_status ==1) && req.payment_type ==1) {
              var new_Ordersqueue = new Ordersqueue(req);
              new_Ordersqueue.status = 0;
              Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
                if (err) { 
                  result(err, null);
                }else{
                  let resobj = {
                    success: true,
                    status: true,
                    message: "Order moved to Queue"
                  };
                  result(null, resobj);
                }
              });
            }else if (req.zone_status ==1 && req.payment_type ==0) {
              var new_Ordersqueue = new Ordersqueue(req);
              new_Ordersqueue.status = 0;
              Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
                if (err) { 
                  result(err, null);
                }else{
                  let resobj = {
                    success: true,
                    status: true,
                    message: "Order moved to Queue"
                  };
                  result(null, resobj);
                }
              });
            }else{
              let resobj = {
                success: true,
                status: true,
                message: "Please order assign to dunzo"
              };
              result(null, resobj);

            } 
           
          }
  }else{
    let resobj = {
      success: true,
      status:true,
      message: "already exist",
    };
    result(null, resobj);
  }
};

// ////////Zone Based Moveit Auto Order Assign
// Order.zone_moveit_order_auto_assign = async function zone_moveit_order_auto_assign(req, result) {
//   var order_queue_query = await query("select * from Orders_queue where status = 0 and orderid =" +req.orderid+"");
//   if (order_queue_query.length ==0) {
//     var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
//     var makeitLocation = [];
//     makeitLocation.push(req.orglat);
//     makeitLocation.push(req.orglon);
    
//     var moveitlistzonequery="select mv.userid from Orders ord left join MakeitUser as mu on mu.userid = ord.makeit_user_id left join MoveitUser as mv on mv.zone = mu.zone where ord.orderid="+req.orderid+" and mv.online_status = 1 group by mv.userid";

//     var moveitlistquery ="select zo.boundaries,mu.name,mu.Vehicle_no,mu.address,mu.email,mu.phoneno,mu.userid,mu.online_status,count(ord.orderid) as ordercount from MoveitUser as mu left join Zone as zo on zo.id = mu.zone left join Orders as ord on (ord.moveit_user_id=mu.userid and ord.orderstatus=6 and DATE(ord.ordertime) = CURDATE()) where mu.userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and mu.userid IN("+moveitlistzonequery+") and mu.online_status = 1 and login_status=1 group by mu.userid order by ordercount";
//           var zonemoveitlist = await query(moveitlistquery);
//           console.log("moveitlistquery-->",JSON.stringify(zonemoveitlist));
//           if (zonemoveitlist.length !==0) {
//             MoveitFireBase.getInsideZoneMoveitList(makeitLocation,zonemoveitlist,async function(err, zoneInsideMoveitlist) {
//               console.log("zoneInsideMoveitlist-->",JSON.stringify(zoneInsideMoveitlist));
//               if(zoneInsideMoveitlist.length>0){
//               sql.query("UPDATE Orders SET moveit_user_id = ?,order_assigned_time = ? WHERE orderid = ?",[zoneInsideMoveitlist[0].userid, assign_time, req.orderid],async function(err, res2) {
//                 if (err) {
//                   result(err, null);
//                 } else {
//                   await query("update Orders_queue set status = 1 where orderid =" +req.orderid+"");
//                   await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Assigned);
//                   let resobj = {
//                     success: true,
//                     status:true,
//                     message: "Order Assign Successfully",
//                   };
//                   result(null, resobj);
//                 }
//               });
//             }else{
//               console.log("new_Ordersqueue-->");
//               var new_Ordersqueue = new Ordersqueue(req);
//               new_Ordersqueue.status = 0;
//               Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
//                 if (err) { 
//                   console.log("err  new_Ordersqueue-->");
//                   result(err, null);
//                 }else{
//                   console.log("success  new_Ordersqueue-->");
//                   let resobj = {
//                     success: true,
//                     status: true,
//                     message: "Order moved to Queue"
//                   };
//                   result(null, resobj);
//                 }
//               });
//             }
//             });
            
//           }else{
//             var new_Ordersqueue = new Ordersqueue(req);
//             new_Ordersqueue.status = 0;
//             Ordersqueue.createOrdersqueue(new_Ordersqueue, function(err, res2) {
//               if (err) { 
//                 result(err, null);
//               }else{
//                 let resobj = {
//                   success: true,
//                   status: true,
//                   message: "Order moved to Queue"
//                 };
//                 result(null, resobj);
//               }
//             });
//           }
//   }else{
//     let resobj = {
//       success: true,
//       status:true,
//       message: "already exist",
//     };
//     result(null, resobj);
//   }
// };

//////Item Missing OR Funnel Refunded coupon list//////////////
Order.funnelrefunded_couponreport= function funnelrefunded_couponreport(req, result) {
  var query="select rc.userid,if(ors.orderstatus=7,'cancel orders',if(ors.orderstatus=10,'funnel order','itemmissing')) as refund_reason,rc.orderid,rc.created_at,rc.refundamount as itemmissing_or_funnel_refund_coupon,rc.refund_used_orderid,rc.refund_balance,rc.refund_used_date_time from Refund_Coupon rc left join Orders ors on rc.orderid=ors.orderid where (rc.active_status=0 and rc.refund_used_orderid IS NOT NULL OR rc.refund_used_orderid = '') and (DATE(rc.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////Item Missing OR Online Refunded coupon list/////////////
Order.onlinerefunded_couponreport= function onlinerefunded_couponreport(req, result) {
  var query="select userid,orderid,created_at,original_amt as online_paid_amount,payment_id,refund_amt as refunded_amt from Refund_Online where (active_status=0 and  payment_id IS NOT NULL OR payment_id = '')and (DATE(created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////order_report_byadmin/////////////
Order.order_report_byadmin= function order_report_byadmin(req, result) {

  var query="Select o.created_at as Orderdate ,o.orderid,CASE WHEN o.ordertype=1 then 'Virtual' WHEN o.ordertype=0 then 'Real' END as order_type,if(o.payment_type=1,'Online','Cash') as payment_type,o.price,o.original_price,o.refund_amount,o.gst,o.discount_amount,o.delivery_charge,o.orderstatus,CASE WHEN (orderstatus=7 and makeit_actual_preparing_time IS NOT NULL) then 'AfterCancel' WHEN (orderstatus=7 and makeit_actual_preparing_time IS NULL) then 'BeforeCancel' END as order_cancel_status,u.userid as customer_id,u.name as customer_name,o.address_title as customer_address,o.locality_name as customer_location,o.cus_lat as customer_lat,o.cus_lon as customer_long,o.makeit_user_id as kitchen_id,ma.brandname as kitchen_name,if(ma.virtualkey=1,'Virtual','Real') as kitchen_type,ma.lat as kitchen_lat,ma.lon as kitchen_long,mh.address as hub_location,o.makeit_accept_time as kitchen_accept_time,o.makeit_expected_preparing_time as kitchen_expected_preparing_time,o.makeit_actual_preparing_time as kitchen_actual_preparing_time,o.makeit_earnings as kitche_earnings,if(o.delivery_vendor=1,'Dunzo','Eat') as delivered_by,o.moveit_user_id as moveit_id,mu.name as moveit_name,o.order_assigned_time,o.moveit_assign_lat,o.moveit_assign_long,o.moveit_notification_time,o.moveit_accept_time,o.moveit_accept_lat,moveit_accept_long,o.moveit_reached_time as moveit_kitchen_reached_time,o.moveit_kitchen_reached_lat,o.moveit_kitchen_reached_long,o.moveit_pickup_time,o.moveit_Pickup_lat,o.moveit_Pickup_long,o.moveit_customerlocation_reached_time,o.moveit_customer_location_reached_lat,o.moveit_customer_location_reached_long,o.moveit_expected_delivered_time,o.moveit_actual_delivered_time,o.moveit_delivery_lat,o.moveit_delivery_long,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,sum((pp.count*pb.price))+1 as packaging_cost,o.makeit_earnings as food_cost,o.dunzo_price,rat.rating_food,rat.rating_delivery from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid join User as u on o.userid=u.userid left join MoveitUser as mu on mu.userid = o.moveit_user_id left join Makeit_hubs as mh on mh.makeithub_id = ma.makeithub_id left join ProductPackaging as pp on pp.product_id=oi.productid left join PackagingBox as pb on pb.id=pp.package_id left join Order_rating as rat on rat.orderid=o.orderid where (o.orderstatus=6 or o.orderstatus=7  or  o.orderstatus=8 or o.orderstatus=9 or o.orderstatus=10 or o.orderstatus=11) and  (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') GROUP BY o.orderid";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////order_report_byadmin/////////////
Order.Item_wise_report_byadmin= function Item_wise_report_byadmin(req, result) {
  
  var query="Select o.orderid,ma.brandname,p.productid as product_id,p.product_name as product_name,oi.quantity as product_quantity,oi.price as product_price,(oi.quantity * oi.price) as price,o.created_at from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on o.makeit_user_id=ma.userid where (o.orderstatus=6 or o.orderstatus=7  or  o.orderstatus=8 or o.orderstatus=9 or o.orderstatus=10 or o.orderstatus=11) and (DATE(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {
          let resobj = {
            success: true,
            status:true,
            result:res
          };
          result(null, resobj);
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

//////////moveit master report/////////////
Order.moveit_master_report= async function moveit_master_report(req, result) {
  
  var moveitdata = await query("select mu.userid as moveit_id,mu.name,mu.phoneno,zo.Zonename,mu.Vehicle_no,mu.driver_lic,mu.vech_insurance,date(mu.created_at) as date,mh.address as hub from MoveitUser mu left join Makeit_hubs as mh on mh.makeithub_id = mu.moveit_hub left join Zone as zo on zo.id = mu.zone order by mu.userid");
  
  var moveitorder = await query("select MIN(created_at) as first_order_date,MAX(created_at) as last_order_date,COUNT(CASE WHEN orderstatus=6 THEN orderid END)as life_time_orders,moveit_user_id from Orders group by moveit_user_id order by orderid asc");

  for(let i=0; i<moveitdata.length; i++){
    for(let j=0; j<moveitorder.length; j++){
      if(moveitdata[i].moveit_id == moveitorder[j].moveit_user_id){
        moveitdata[i].first_order_date = moveitorder[j].first_order_date;
        moveitdata[i].last_order_date = moveitorder[j].last_order_date;
        moveitdata[i].life_time_orders = moveitorder[j].life_time_orders;
      }
    }
  }

  if(moveitdata.length !=''){
    let resobj = {
      success: true,
      status:true,
      result:moveitdata
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }  

  
};

//////////makeit_master_report/////////////
Order.makeit_master_report= async function makeit_master_report(req, result) {
  var makeitdata = await query("select mu.userid as makeit_id,mu.brandname as kitchen_name,mu.name,CASE WHEN mu.virtualkey=1 then 'Virtual' WHEN mu.virtualkey=0 then 'Real' END as kitchen_type,c.cuisinename,re.regionname,mu.lat as Lattitude, mu.lon as Longitude,mu.email,mu.phoneno,zo.Zonename,mh.address as hub,mu.bank_holder_name as account_name,mu.bank_account_no as account_number,mu.bank_name,mu.ifsc as ifsc_code, mu.address,if(makeit_type=1,'caterer','home') as homemaker_type,0 as first_order_date,0 as last_order_date,0 as life_time_orders,sqe.name as accountmanagername,MIN(date(prd.created_at)) as onboarding_date,CASE WHEN mu.appointment_status=0 then 'waiting for sales appoinment' WHEN mu.appointment_status=1 then 'waiting for sales approval' WHEN mu.appointment_status=2 then 'waiting for admin approval' WHEN mu.appointment_status=3 then 'admin approved' END as status,CASE WHEN mu.delete_status=0 then 'live' WHEN mu.delete_status=1 then 'deleted' END as  delete_status from MakeitUser mu left join Makeit_hubs as mh on mh.makeithub_id = mu.makeithub_id left join Cuisine_makeit as cm on cm.makeit_userid = mu.userid left join Cuisine as c on c.cuisineid = cm.cuisineid left join Region as re on re.regionid = mu.regionid left join Zone as zo on zo.id = mu.zone left join Allocation as alo on alo.makeit_userid=mu.userid left join Sales_QA_employees as sqe on sqe.id = alo.sales_emp_id left join Product as prd on prd.makeit_userid=mu.userid group by mu.userid order by mu.userid");
  
  var makeitorder = await query("select MIN(created_at) as first_order_date,MAX(created_at) as last_order_date,COUNT(orderid) as life_time_orders,makeit_user_id from Orders group by makeit_user_id order by orderid asc");

  for(let i=0; i<makeitdata.length; i++){
    for(let j=0; j<makeitorder.length; j++){
      if(makeitdata[i].makeit_id == makeitorder[j].makeit_user_id){
        makeitdata[i].first_order_date = makeitorder[j].first_order_date;
        makeitdata[i].last_order_date = makeitorder[j].last_order_date;
        makeitdata[i].life_time_orders = makeitorder[j].life_time_orders;
      }
    }
  }

  if(makeitdata.length !=''){
    let resobj = {
      success: true,
      status:true,
      result:makeitdata
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }   
};

///User Exp report///
Order.userexperience_report= function userexperience_report(req, result) {  
  var query="select orderid,date(ordertime) as date,count(orderid) as order_count, CASE WHEN (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:45:00')) THEN  '5' WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:45:00')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:47:50'))) THEN  '4'  WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:47:50')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:50:50'))) THEN  '3' WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:50:50')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:55:00'))) THEN  '2' WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:55:00')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('01:00:00'))) THEN  '1' WHEN (TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('01:00:00')) THEN  '0' END as user_experience from Orders where moveit_actual_delivered_time IS NOT NULL and ordertime Is NOT NULL and date(created_at) between CURDATE()-6 AND  CURDATE() and orderstatus=6 group by date(ordertime),user_experience order by date(ordertime),user_experience ASC";
  // console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length !== 0) {       
          var dates     = res[0].date;
          var datelist  = new Array();
          datelist.push({"date":dates});
          var daycount  = 0;
          
          for(var i=0; i<res.length; i++){ 
            if(res[i].date != datelist[daycount].date){
              datelist.push({"date":res[i].date});
              daycount++;              
            }else{   }
          }
          
          for(var z=0; z<datelist.length; z++){
            for(var j=0; j<res.length; j++){                
              if(datelist[z].date == res[j].date){
                if(res[j].user_experience == 0){
                  datelist[z].user_exp0 = res[j].order_count;                  
                }else if(res[j].user_experience == 1){
                  datelist[z].user_exp1 = res[j].order_count;
                }else if(res[j].user_experience == 2){
                  datelist[z].user_exp2 = res[j].order_count;
                }else if(res[j].user_experience == 3){
                  datelist[z].user_exp3 = res[j].order_count;
                }else if(res[j].user_experience == 4){
                  datelist[z].user_exp4 = res[j].order_count;
                }else if(res[j].user_experience == 5){
                  datelist[z].user_exp5 = res[j].order_count;
                }else{   }                
              }else{ }
            }        
          }

          result(null, datelist);        
        }else {
          let resobj = {
            success: true,
            message: "Sorry! no data found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

////Virtual Total completed orders revenu////
Order.virtualorder_completedrevenu_report= function virtualorder_completedrevenu_report(req, result) {  
  var query="select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=1 and ord.ordertype=0 and ord.orderstatus=6 and date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at)";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      }else {        
        result(null, res);
      }
    }
  );
};

////Real Total completed orders revenu////
Order.realorder_completedrevenu_report= function realorder_completedrevenu_report(req, result) {  
  var query="select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=0 and ord.ordertype=0 and ord.orderstatus=6 and date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at)";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      }else {        
        result(null, res);
      }
    }
  );
};

////Virtual Total cancelled orders revenu////
Order.virtualorder_cancelledrevenu_report= function virtualorder_cancelledrevenu_report(req, result) {  
  var query="select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=1 and ord.ordertype=0 and ord.orderstatus=7 and date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at)";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      }else {        
        result(null, res);
      }
    }
  );
};

////Real Total cancelled orders revenu////
Order.realorder_cancelledrevenu_report= function realorder_cancelledrevenu_report(req, result) {  
  var query="select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=0 and ord.ordertype=0 and ord.orderstatus=7 and date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at)";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      }else {        
        result(null, res);
      }
    }
  );
};

////Virtual Abandoned Cart orders revenu////
Order.virtual_abandonedcartrevenu_report= function virtual_abandonedcartrevenu_report(req, result) {  
  var query="select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=1 and ord.ordertype=0 and ord.orderstatus=11 and date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at)";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      }else {        
        result(null, res);
      }
    }
  );
};

////real Abandoned Cart orders revenu////
Order.real_abandonedcartrevenu_report= function real_abandonedcartrevenu_report(req, result) {  
  var query="select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=0 and ord.ordertype=0 and ord.orderstatus=11 and date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at)";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {        
        result(null, res);
      }
    }
  );
};


Order.list_dunzo_zone_cod_orders_by_admin = function list_dunzo_zone_cod_orders_by_admin(req, result) {
  var orderlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * orderlimit;

  if (req.orderstatus==1) {
    var query ="Select od.*,us.*,mu.brandname,mu.virtualkey as kitchentype,zo.zone_status from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id join Zone zo on zo.id=mu.zone where (od.orderstatus =1 or orderstatus =3 ) and  zo.zone_status =2 and od.payment_type=0 and delivery_vendor=0";
  }else if(req.orderstatus==2){
    var query ="Select od.*,us.*,mu.brandname,mu.virtualkey as kitchentype,zo.zone_status from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id join Zone zo on zo.id=mu.zone where (od.orderstatus =1 or orderstatus =3 ) and zo.zone_status =2 and od.payment_type=0 and delivery_vendor=1";
  }else if(req.orderstatus==3) {
    var query ="Select od.*,us.*,mu.brandname,mu.virtualkey as kitchentype,zo.zone_status from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id join Zone zo on zo.id=mu.zone where od.orderstatus =5 and zo.zone_status =2  and od.payment_type=0 and delivery_vendor=1 ";

  } // var query =
    //"Select * from Orders as od left join User as us on od.userid=us.userid where (od.payment_type=0 or (od.payment_type=1 and od.payment_status>0) )and orderstatus < 9";
  var searchquery =
    "mu.phoneno LIKE  '%" +
    req.search +
    "%' OR mu.email LIKE  '%" +
    req.search +
    "%' or mu.name LIKE  '%" +
    req.search +
    "%'  or od.orderid LIKE  '%" +
    req.search +
    "%'";
  // if (req.virtualkey !== "all") {
  //   query = query + " and od.ordertype = '" + req.virtualkey + "'";
  // }

  // if (req.delivery_vendor !== "all"){
  //   query = query + " and od.delivery_vendor = '" + req.delivery_vendor + "'";
  // }
  //var search= req.search
 if (req.search) {
    query = query + " and " + searchquery;
  }

  var limitquery =query +" order by od.orderid desc limit " +startlimit +"," +orderlimit +" ";

  sql.query(limitquery, function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      var totalcount = 0;
      sql.query(query, function(err, res2) {
        totalcount = res2.length;
        let resobj = {
          success: true,
          status:true,
          totalorder: totalcount,
          result: res1
        };
        result(null, resobj);
      });
    }
  });
};


Order.dunzo_order_assign =async function dunzo_order_assign(req, result) {

  var assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
  if (!req.moveit_user_id) {
    req.moveit_user_id=0;
    
  }
  if (req.order_status==1) {
    var query = "UPDATE Orders SET moveit_user_id = ?,delivery_vendor=1,order_assigned_time = ? WHERE orderid = ?"
     var queryvalues=[req.moveit_user_id, assign_time, req.orderid]
    var  message= "Order Assign Successfully"
  }else{
    var twentyMinutesLater = moment().add(0, "seconds").add(constant.foodpreparationtime, "minutes").format("YYYY-MM-DD HH:mm:ss");

    var query = "UPDATE Orders SET orderstatus = ?,moveit_expected_delivered_time = ? WHERE orderid = ?"
    var queryvalues = [5, twentyMinutesLater, req.orderid]
    var  message= "Order pickuped Successfully"
    await Notification.orderEatPushNotification(req.orderid,null,PushConstant.Pageid_eat_order_pickedup);
  }
  sql.query(query,queryvalues,async function(err, res2) {
              if (err) {
                result(err, null);
              } else {
                
                let resobj = {
                  success: true,
                  status:true,
                  message:message
                };
                result(null, resobj);
              }
  }
  );
     
};

Order.dunzo_order_delivery_by_admin = function dunzo_order_delivery_by_admin(req, result) {
  var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
  sql.query("Select * from Orders where orderid = ?",[req.orderid],async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length !== 0) {

          if (res1[0].orderstatus == 6) {
            let resobj = {
              success: true,
              message: "Sorry!  order was already deliverd.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus == 7) {
            let resobj = {
              success: true,
              message: "Sorry!  order already canceled.",
              status:false
            };
            result(null, resobj);
          }else if (res1[0].orderstatus < 3) {
            let resobj = {
              success: true,
              message: "Sorry! Order not prepared",
              status:false
            };
            result(null, resobj);
          }else{


            // req.moveitid = req.moveit_user_id;
            // req.moveit_userid = req.moveit_user_id;
            // req.status = 7
            // await Order.insert_order_status(req); 

            // await Order.insert_force_delivery(req); 

            sql.query("UPDATE Orders SET orderstatus = 6,moveit_actual_delivered_time = ? WHERE orderid = ? and moveit_user_id =?",[ order_delivery_time, req.orderid, req.moveit_user_id],async function(err, res) {
                if (err) {
                  result(err, null);
                } else {
                  let resobj = {
                    success: true,
                    message: "Order Delivery successfully",
                    status:true,
                    orderdeliverystatus: true
                  };
                  await Notification.orderEatPushNotification(
                    req.orderid,
                    null,
                    PushConstant.Pageid_eat_order_delivered
                  );
                  ////Insert Order History////
                  
                  ////////////////////////////
                  result(null, resobj);
                }
              }
            );
          
        }
        } else {
          let resobj = {
            success: true,
            message: "Sorry! no order found.",
            status:false
          };
          result(null, resobj);
        }
      }
    }
  );
};

////Average Order Value////
Order.averageordervalue_report= async function averageordervalue_report(req, result) {  
  var virtuallist = await query("select date(ord.created_at) as date,count(ord.orderid) as order_count,sum(ord.price) as price,( sum(ord.price)/count(ord.orderid)) as avg_price  from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=1 and ord.ordertype=0 and ord.orderstatus=6 and date(ord.created_at)  BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at) Order BY date(ord.created_at)");

  var reallist = await query("select date(ord.created_at) as date,count(ord.orderid) as real_order_count,sum(ord.price) as real_price,( sum(ord.price)/count(ord.orderid)) as real_avg_price  from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id where mu.virtualkey=0 and ord.ordertype=0 and ord.orderstatus=6 and date(ord.created_at)  BETWEEN CURDATE()-6 AND  CURDATE() GROUP BY date(ord.created_at) Order BY date(ord.created_at)");

  for(var i=0; i<virtuallist.length; i++){
    for(var j=0; j<reallist.length; j++){
      if(reallist[j].date == virtuallist[i].date){
        reallist[j].virtual_order_count = virtuallist[j].order_count;
        reallist[j].virtual_price = virtuallist[j].price;
        reallist[j].virtual_avg_price = virtuallist[j].avg_price;
      }
    }
  }
  result(null, reallist);
};

////Live Kitchen count////
Order.livekitchenavgcount_report= async function livekitchenavgcount_report(req, result) {    
  var cyclequery = "";
  var day = new Date();
  var currenthour = day.getHours();
  if (currenthour < 12) {
    cyclequery = cyclequery + " and pro.breakfast = 1";    
  }else if(currenthour >= 12 && currenthour < 16){
    cyclequery = cyclequery + " and pro.lunch = 1";
  }else if( currenthour >= 16){    
    cyclequery = cyclequery + " and pro.dinner = 1";
  }
  
  var makeithubquery = "select makeithub_id,address from Makeit_hubs order by address ASC";
  var hublist = await query(makeithubquery);

  var virtuallistquery = "select mu.brandname,mh.makeithub_id,mh.address,count(pro.productid) as  product_count from Makeit_hubs as mh left join MakeitUser as mu on mu.makeithub_id = mh.makeithub_id left join Product as pro on pro.makeit_userid = mu.userid where mu.virtualkey=1 and (mu.appointment_status = 3 and mu.ka_status = 2 and pro.approved_status=2 and mu.verified_status = 1 ) and (pro.active_status = 1 and pro.quantity != 0 and pro.delete_status !=1 ) "+cyclequery+" group by mu.userid order by mh.address,pro.makeit_userid ASC";
  var virtuallist = await query(virtuallistquery);
  
  var reallistquery = "select mu.brandname,mh.makeithub_id,mh.address,count(pro.productid) as  product_count from Makeit_hubs as mh left join MakeitUser as mu on mu.makeithub_id = mh.makeithub_id left join Product as pro on pro.makeit_userid = mu.userid where mu.virtualkey=0 and (mu.appointment_status = 3 and mu.ka_status = 2 and pro.approved_status=2 and mu.verified_status = 1 ) and (pro.active_status = 1 and pro.quantity != 0 and pro.delete_status !=1 ) "+cyclequery+" group by mu.userid order by mh.address,pro.makeit_userid ASC";
  var reallist = await query(reallistquery);

  for(var i=0; i<hublist.length; i++){
    hublist[i].virtual_kitchencount = 0;
    hublist[i].virtual_productcount = 0;
    for(var j=0; j<virtuallist.length; j++){
      if(hublist[i].makeithub_id == virtuallist[j].makeithub_id){
        hublist[i].virtual_kitchencount++;
        hublist[i].virtual_productcount = hublist[i].virtual_productcount + virtuallist[j].product_count;
      }      
    }
    hublist[i].virtual_kitchen_average = hublist[i].virtual_productcount/hublist[i].virtual_kitchencount || 0;
  }

  for(var i=0; i<hublist.length; i++){
    hublist[i].real_kitchencount = 0;
    hublist[i].real_productcount = 0;
    for(var j=0; j<reallist.length; j++){
      if(hublist[i].makeithub_id == reallist[j].makeithub_id){
        hublist[i].real_kitchencount++;
        hublist[i].real_productcount = hublist[i].real_productcount + reallist[j].product_count;
      }
    }
    hublist[i].real_kitchen_average = hublist[i].real_productcount/hublist[i].real_kitchencount || 0;
  }
  result(null, hublist);
};

////KPI Live Kitchen count and Avg////
Order.log_livekitchenavgcount_report= async function log_livekitchenavgcount_report(req, result) {    
  var kpiproducthistoryquery = "select time(kph.date_time) as time,kph.makeit_id,count(kph.product_id) as product_count,mu.virtualkey from KPI_Product_History as kph left join MakeitUser as mu on mu.userid=kph.makeit_id where date(kph.created_at)=CURDATE() group by kph.makeit_id,time(kph.date_time) order by time(kph.created_at)";
  //console.log("kpiproducthistoryquery =================>", kpiproducthistoryquery);
  var producthistory = await query(kpiproducthistoryquery);
  var timearray = new Array();
  timearray.push({"time":producthistory[0].time});
  
  for(var i=0; i<producthistory.length; i++){
    if(timearray[timearray.length-1].time != producthistory[i].time){
      timearray.push({"time":producthistory[i].time});
    }
  }

  for(var j=0; j<timearray.length; j++){
    var realmakeitcount     = 0;
    var realproductcount    = 0;
    var virtualmakeitcount  = 0;
    var virtualproductcount = 0;
    for(var k=0; k<producthistory.length; k++){
      if((timearray[j].time == producthistory[k].time) && (producthistory[k].virtualkey==0)){
        realmakeitcount++;
        realproductcount = realproductcount+producthistory[k].product_count;
      }
      if((timearray[j].time == producthistory[k].time) && (producthistory[k].virtualkey==1)){
        virtualmakeitcount++;
        virtualproductcount = virtualproductcount+producthistory[k].product_count;
      }
    }
    timearray[j].realmakeitcount  = realmakeitcount;
    timearray[j].realproductcount = realproductcount;
    timearray[j].realavg = realproductcount/realmakeitcount;
    timearray[j].virtualmakeitcount  = virtualmakeitcount;
    timearray[j].virtualproductcount = virtualproductcount;
    timearray[j].virtualavg = virtualproductcount/virtualmakeitcount;
  }
  result(null, timearray);
};

////KPI HUB Live Kitchen count and Avg////
Order.log_hub_livekitchenavgcount_report= async function log_hub_livekitchenavgcount_report(req, result) { 
  var makeithubquery = "select makeithub_id,address from Makeit_hubs order by address ASC";
  var hublist = await query(makeithubquery);

  var kpiproducthistoryquery = "select time(kph.date_time) as time,kph.makeit_id,count(kph.product_id) as product_count,mu.virtualkey,mu.makeithub_id,mh.address from KPI_Product_History as kph left join MakeitUser as mu on mu.userid=kph.makeit_id left join Makeit_hubs as mh on mh.makeithub_id=mu.makeithub_id where date(kph.created_at)=CURDATE() group by kph.makeit_id,time(kph.created_at) order by time(kph.date_time)";
  var producthistory = await query(kpiproducthistoryquery);
  var timearray = new Array();

  for(var hub=0; hub<hublist.length; hub++){
    timearray.push({"makeithub_id":hublist[hub].makeithub_id,"hub":hublist[hub].address,"time":producthistory[0].time});
  }
  
  for(var hub1=0; hub1<hublist.length; hub1++){
    for(var i=0; i<producthistory.length; i++){
      if(hublist[hub1].makeithub_id == producthistory[i].makeithub_id){
        if(timearray[timearray.length-1].time != producthistory[i].time){
          timearray.push({"makeithub_id":hublist[hub1].makeithub_id,"hub":hublist[hub1].address,"time":producthistory[i].time});
        }
      }      
    }
  } 

  for(var j=0; j<timearray.length; j++){
    var realmakeitcount     = 0;
    var realproductcount    = 0;
    var virtualmakeitcount  = 0;
    var virtualproductcount = 0;
    for(var k=0; k<producthistory.length; k++){
      if((timearray[j].time == producthistory[k].time) && (producthistory[k].virtualkey==0) && (timearray[j].makeithub_id==producthistory[k].makeithub_id)){
        realmakeitcount++;
        realproductcount = realproductcount+producthistory[k].product_count;
      }
      if((timearray[j].time == producthistory[k].time) && (producthistory[k].virtualkey==1) && (timearray[j].makeithub_id==producthistory[k].makeithub_id)){
        virtualmakeitcount++;
        virtualproductcount = virtualproductcount+producthistory[k].product_count;
      }
    }
    timearray[j].realmakeitcount  = realmakeitcount ||0;
    timearray[j].realproductcount = realproductcount ||0;
    timearray[j].realavg = realproductcount/realmakeitcount ||0;
    timearray[j].virtualmakeitcount  = virtualmakeitcount ||0;
    timearray[j].virtualproductcount = virtualproductcount ||0;
    timearray[j].virtualavg = virtualproductcount/virtualmakeitcount ||0;
  }
  result(null, timearray);
};

////update moveit lat long////
Order.update_moveit_lat_long= async function update_moveit_lat_long(req, result) { 
 
 MoveitFireBase.get_moveit_lat_long(req.moveit_user_id,async function(err, moveit_info) {
            if (err) {
              let error = {
                success: true,
                status: false,
                message:"No Move-it found,please after some time"
              };
              result(error, null);
            }else{

              switch(req.state) {
                case 1:

                  update_assign_query = await query("UPDATE Orders SET moveit_assign_lat=?,moveit_assign_long=? WHERE orderid = ?",[moveit_info.lat,moveit_info.long,req.orderid]);
                  
                  break;
                case 2:
                  console.log("case");
                  // code block//
                  var makeit_details = await query("select * from MakeitUser where userid = '"+req.makeit_user_id+"'");
                  req.orglat = moveit_info.lat;
                  req.orglon = moveit_info.long ;
                  req.deslat = makeit_details[0].makeit_lat;
                  req.deslon = makeit_details[0].makeit_lon;
                  Order.eat_order_distance_calculation(req ,async function(err,res3) {
                    if (err) {
                      result(err, null);
                    } else {
                      if (res3.status != true) {
                        result(null, res3);
                      } else {
            
                        var routes = res3.result;
                        var caldistance = routes.routes;
                        var deliverytimedata = caldistance[0].legs;
                       
                        req.distance = parseInt(deliverytimedata[0].distance.text);
                        req.duration = parseInt(deliverytimedata[0].duration.text);
        
                        update_accept_query = await query("UPDATE Orders SET moveit_accept_lat=?,moveit_accept_long=?,first_mile=? WHERE orderid = ?",[moveit_info.lat,moveit_info.long,req.distance,req.orderid]);
                        
                      }
                    }
                  });

                  break;
                  case 3:
                  console.log("case 3");
                  update_accept_query = await query("UPDATE Orders SET moveit_kitchen_reached_lat=?,moveit_kitchen_reached_long=? WHERE orderid = ?",[moveit_info.lat,moveit_info.long,req.orderid]);

                  // code block
                  break;
                  case 4:
                  console.log("case 4");
                  update_accept_query = await query("UPDATE Orders SET moveit_Pickup_lat=?,moveit_Pickup_long=? WHERE orderid = ?",[moveit_info.lat,moveit_info.long,req.orderid]);

                  // code block
                  break;
                  case 5:
                  console.log("case 5 ");
                  // code block
                  update_accept_query = await query("UPDATE Orders SET moveit_customer_location_reached_lat=?,moveit_customer_location_reached_long=? WHERE orderid = ?",[moveit_info.lat,moveit_info.long,req.orderid]);

                  break;
                  case 6:
                  console.log("case 6 ");
                  // code block
                  update_accept_query = await query("UPDATE Orders SET moveit_delivery_lat=?,moveit_delivery_long=? WHERE orderid = ?",[moveit_info.lat,moveit_info.long,req.orderid]);

                  break;
                default:
                  // code block
              }
             
            }
          })
};

//////////Cancel order report follow up/////////////
Order.cancelled_report_follow_up= function cancelled_report_follow_up(req, result) {
  var query="Select ors.orderid,ors.created_at as ordertime,u.name, u.phoneno, ors.cancel_by, ors.cancel_reason,ors.cancel_time,ors.order_assigned_time as moveit_order_assignedtime, ors.moveit_reached_time, ors.moveit_pickup_time, ors.moveit_notification_time, ors.makeit_accept_time,ors.moveit_accept_time,ors.makeit_expected_preparing_time,ors.makeit_actual_preparing_time from Orders as ors join User as u on u.userid=ors.userid where ors.orderstatus=7 and Date(ors.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'";
//console.log("query-->",query);
sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else {
      if (res.length !== 0) {
        let resobj = {
          success: true,
          status:true,
          result:res
        };
        result(null, resobj);
      }else {
        let resobj = {
          success: true,
          message: "Sorry! no data found.",
          status:false
        };
        result(null, resobj);
      }
    }
  }
);
};

//////////Cancel order report follow up/////////////
Order.unclosed_orders= function unclosed_orders(req, result) {
  var query="Select Date(ors.created_at),ors.orderstatus,ors.payment_type,ors.orderid, Time(ors.created_at) as ordertime ,ors.order_assigned_time as moveit_order_assignedtime, ors.moveit_reached_time, ors.moveit_pickup_time, ors.moveit_notification_time, ors.makeit_accept_time,ors.moveit_accept_time,ors.makeit_expected_preparing_time,ors.makeit_actual_preparing_time from Orders as ors where (ors.orderstatus<6 and ors.payment_status=1) or (ors.orderstatus<6 and ors.payment_status=0 and ors.payment_type=0 ) and Date(ors.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'";
//console.log("query-->",query);
sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else {
      if (res.length !== 0) {
        let resobj = {
          success: true,
          status:true,
          result:res
        };
        result(null, resobj);
      }else {
        let resobj = {
          success: true,
          message: "Sorry! no data found.",
          status:false
        };
        result(null, resobj);
      }
    }
  }
);
};

//////////Cancel order report follow up/////////////
Order.customerexperience= function customerexperience(req, result) {
  var query="select orderid,date(ordertime) as date, CASE WHEN (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:45:00')) THEN  '5' WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:45:00')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:47:50'))) THEN  '4'  WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:47:50')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:50:50'))) THEN  '3' WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:50:50')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('00:55:00'))) THEN  '2' WHEN ((TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('00:55:00')) and (TIMEDIFF(moveit_actual_delivered_time,ordertime) <= time('01:00:00'))) THEN  '1' WHEN (TIMEDIFF(moveit_actual_delivered_time,ordertime) >= time('01:00:00')) THEN  '0' END as user_experience, u.name, u.phoneno, Time(ors.created_at) as ordertime ,ors.order_assigned_time as moveit_order_assignedtime, ors.moveit_reached_time, ors.moveit_pickup_time, ors.moveit_notification_time, ors.makeit_accept_time,ors.moveit_accept_time,ors.makeit_expected_preparing_time,ors.makeit_actual_preparing_time,ors.moveit_actual_delivered_time from Orders  as ors join User as u on u.userid=ors.userid where moveit_actual_delivered_time IS NOT NULL and ordertime Is NOT NULL and orderstatus=6 and Date(ors.created_at)  BETWEEN '"+req.fromdate+"' AND '"+req.todate+"'";
//console.log("query-->",query);
sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else {
      if (res.length !== 0) {
        let resobj = {
          success: true,
          status:true,
          result:res
        };
        result(null, resobj);
      }else {
        let resobj = {
          success: true,
          message: "Sorry! no data found.",
          status:false
        };
        result(null, resobj);
      }
    }
  }
);
};


//////////Cancel order report follow up/////////////
Order.xfactor_order_count= function xfactor_order_count(req, result) {
  var curDate=new Date();
  curDate.setDate(curDate.getDate()-7);
  var todate =moment().format("YYYY-MM-DD");
  var fromdate=moment(curDate).format("YYYY-MM-DD");

  if(req.fromdate) fromdate=req.fromdate;
  if(req.todate) todate=req.todate;
  
  console.log(fromdate+","+todate);

  var query="SELECT date(xfact.created_at) as date,count(xfact.userid) as order_count FROM (SELECT t.product, t.created_at,t.userid FROM (Select o.orderid,o.created_at,o.userid,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on ma.userid=o.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id=ma.makeithub_id where o.orderstatus=11 and o.ordertype=0 and (DATE(o.created_at) BETWEEN '"+fromdate+"' AND '"+todate+"') GROUP BY o.orderid) t GROUP BY date(t.created_at),t.userid,t.product) xfact GROUP BY date(xfact.created_at)";
//console.log("query-->",query);
sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else {
      if (res.length !== 0) {
        let resobj = {
          success: true,
          status:true,
          result:res
        };
        result(null, resobj);
      }else {
        let resobj = {
          success: true,
          message: "Sorry! no data found.",
          status:false
        };
        result(null, resobj);
      }
    }
  }
);
};


///Moveit Day wise Report////
Order.moveit_daywise_report= async function moveit_daywise_report(req) { 
  var moveitlog = await Order.moveit_logtime(req);
  var moveitloguser = [];
  if(moveitlog.length>0){
    for (let i = 0; i < moveitlog.length; i++) {
      moveitloguser.push(moveitlog[i].moveit_userid);
    }
    var moveitorders = await Order.moveit_order_count(req,moveitloguser);
    
    var moveitbusyhr = await Order.moveit_busy_hr(req,moveitloguser);

    for (let i = 0; i < moveitlog.length; i++) {
      for (let j = 0; j < moveitorders.length; j++) {
        if(moveitlog[i].date == moveitorders[j].date && moveitlog[i].moveit_userid == moveitorders[j].moveit_user_id){
          if(moveitlog[i].order_count==0){
            moveitlog[i].order_count= moveitorders[j].order_count;
            moveitlog[i].breakfast  = moveitorders[j].breakfast;
            moveitlog[i].lunch      = moveitorders[j].lunch;
            moveitlog[i].dinner     = moveitorders[j].dinner;
            moveitlog[i].log0809_count = moveitorders[j].log0809_count;
            moveitlog[i].log0910_count = moveitorders[j].log0910_count;
            moveitlog[i].log1011_count = moveitorders[j].log1011_count;
            moveitlog[i].log1112_count = moveitorders[j].log1112_count;
            moveitlog[i].log1213_count = moveitorders[j].log1213_count;
            moveitlog[i].log1314_count = moveitorders[j].log1314_count;
            moveitlog[i].log1415_count = moveitorders[j].log1415_count;
            moveitlog[i].log1516_count = moveitorders[j].log1516_count;
            moveitlog[i].log1617_count = moveitorders[j].log1617_count;
            moveitlog[i].log1718_count = moveitorders[j].log1718_count;
            moveitlog[i].log1819_count = moveitorders[j].log1819_count;
            moveitlog[i].log1920_count = moveitorders[j].log1920_count;
            moveitlog[i].log2021_count = moveitorders[j].log2021_count;
            moveitlog[i].log2122_count = moveitorders[j].log2122_count;
            moveitlog[i].log2223_count = moveitorders[j].log2223_count;            
          }        
        }
      }
      for(let k=0; k<moveitbusyhr.length; k++){
        if(moveitlog[i].moveit_userid == moveitbusyhr[k].moveit_user_id){
          moveitlog[i].busy_0809 = moveitbusyhr[k].busy_0809;
          moveitlog[i].busy_0910 = moveitbusyhr[k].busy_0910;
          moveitlog[i].busy_1011 = moveitbusyhr[k].busy_1011;
          moveitlog[i].busy_1112 = moveitbusyhr[k].busy_1112;
          moveitlog[i].busy_1213 = moveitbusyhr[k].busy_1213;
          moveitlog[i].busy_1314 = moveitbusyhr[k].busy_1314;
          moveitlog[i].busy_1415 = moveitbusyhr[k].busy_1415;
          moveitlog[i].busy_1516 = moveitbusyhr[k].busy_1516;
          moveitlog[i].busy_1617 = moveitbusyhr[k].busy_1617;
          moveitlog[i].busy_1718 = moveitbusyhr[k].busy_1718;
          moveitlog[i].busy_1819 = moveitbusyhr[k].busy_1819;
          moveitlog[i].busy_1920 = moveitbusyhr[k].busy_1920;
          moveitlog[i].busy_2021 = moveitbusyhr[k].busy_2021;
          moveitlog[i].busy_2122 = moveitbusyhr[k].busy_2122;
          moveitlog[i].busy_2223 = moveitbusyhr[k].busy_2223; 
        }
      }
    } 
  }  
  return moveitlog; 
};

////Moveit Order Count///////
Order.moveit_order_count = async function moveit_order_count(req,moveitloguser) {
  var ordercountquery = "select date(created_at) as date,moveit_user_id,count(orderid) as order_count, COUNT(CASE WHEN time(order_assigned_time)>='08:00:00' AND time(order_assigned_time)<'12:00:00' THEN orderid END) as breakfast, COUNT(CASE WHEN time(order_assigned_time)>='12:00:00' AND time(order_assigned_time)<'16:00:00' THEN orderid END) as lunch, COUNT(CASE WHEN time(order_assigned_time)>='16:00:00' AND time(order_assigned_time)<='23:59:59' THEN orderid END) as dinner,COUNT(CASE WHEN time(order_assigned_time)>='08:00:00' AND time(order_assigned_time)<'09:00:00' THEN orderid END) as log0809_count,COUNT(CASE WHEN time(order_assigned_time)>='09:00:00' AND time(order_assigned_time)<'10:00:00' THEN orderid END) as log0910_count, COUNT(CASE WHEN time(order_assigned_time)>='10:00:00' AND time(order_assigned_time)<'11:00:00' THEN orderid END) as log1011_count, COUNT(CASE WHEN time(order_assigned_time)>='11:00:00' AND time(order_assigned_time)<'12:00:00' THEN orderid END) as log1112_count, COUNT(CASE WHEN time(order_assigned_time)>='12:00:00' AND time(order_assigned_time)<'13:00:00' THEN orderid END) as log1213_count, COUNT(CASE WHEN time(order_assigned_time)>='13:00:00' AND time(order_assigned_time)<'14:00:00' THEN orderid END) as log1314_count, COUNT(CASE WHEN time(order_assigned_time)>='14:00:00' AND time(order_assigned_time)<'15:00:00' THEN orderid END) as log1415_count, COUNT(CASE WHEN time(order_assigned_time)>='15:00:00' AND time(order_assigned_time)<'16:00:00' THEN orderid END) as log1516_count, COUNT(CASE WHEN time(order_assigned_time)>='16:00:00' AND time(order_assigned_time)<'17:00:00' THEN orderid END) as log1617_count, COUNT(CASE WHEN time(order_assigned_time)>='17:00:00' AND time(order_assigned_time)<'18:00:00' THEN orderid END) as log1718_count, COUNT(CASE WHEN time(order_assigned_time)>='18:00:00' AND time(order_assigned_time)<'19:00:00' THEN orderid END) as log1819_count, COUNT(CASE WHEN time(order_assigned_time)>='19:00:00' AND time(order_assigned_time)<'20:00:00' THEN orderid END) as log1920_count, COUNT(CASE WHEN time(order_assigned_time)>='20:00:00' AND time(order_assigned_time)<'21:00:00' THEN orderid END) as log2021_count, COUNT(CASE WHEN time(order_assigned_time)>='21:00:00' AND time(order_assigned_time)<'22:00:00' THEN orderid END) as log2122_count,COUNT(CASE WHEN time(order_assigned_time)>='22:00:00' AND time(order_assigned_time)<'23:00:00' THEN orderid END) as log2223_count from Orders where moveit_user_id IN("+moveitloguser+") and date(created_at)= DATE_SUB(CURDATE(), INTERVAL 1 DAY) and orderstatus=6 and moveit_user_id!=0 group by moveit_user_id,date(created_at) order by moveit_user_id,date(created_at)";
  var ordercount = await query(ordercountquery);
  return ordercount;
};

////Moveit Logtime perday///////////
Order.moveit_logtime = async function moveit_logtime(req) {
  ///Get Moveit Log Dates///////
  var moveitlogusersdatesquery = "select date(created_at) as log_date from Moveit_Timelog where date(created_at)=DATE_SUB(CURDATE(), INTERVAL 1 DAY) group by date(created_at) order by date(created_at)";
  var moveitlogusersdates = await query(moveitlogusersdatesquery);
  ///Get Moveit Users list///////
  var moveitlogusersquery = "select moveit_userid from Moveit_Timelog where date(created_at)=DATE_SUB(CURDATE(), INTERVAL 1 DAY) group by moveit_userid order by moveit_userid";
  var moveitlogusers = await query(moveitlogusersquery);
  ///Get Moveit Logs///////
  var moveitlogquery = "select date(logtime) as log_date,time(logtime) as logtime,type,moveit_userid from Moveit_Timelog where date(created_at)=DATE_SUB(CURDATE(), INTERVAL 1 DAY) and action order by date(created_at),moveit_userid";
  var moveitlog = await query(moveitlogquery);

  var moveitavg = [];
  for (let i = 0; i < moveitlogusersdates.length; i++) {
    for (let j = 0; j < moveitlogusers.length; j++) {
      moveitavg.push({"date":moveitlogusersdates[i].log_date,"moveit_userid":moveitlogusers[j].moveit_userid});
    }    
  }
  
  ///console.log("Kloop ==>",moveitlog);
  for (let k = 0; k < moveitavg.length; k++) {
    var starttime  = '';
    var endtime    = '';
    ///////cycle-1/////////
    var starttimecycle1  = '';
    var endtimecycle1    = '';
    var avgtimediffcycle1    = '';
    var avgtimediffseccycle1 = '';
    var secondscycle1    = '';
    var avgtimecycle1    = '00:00:00';
    ///////cycle-2/////////
    var starttimecycle2  = '';
    var endtimecycle2   = '';
    var avgtimediffcycle2    = '';
    var avgtimediffseccycle2 = '';
    var secondscycle2    = '';
    var avgtimecycle2    = '00:00:00';
    ///////cycle-3/////////
    var starttimecycle3  = '';
    var endtimecycle3   = '';
    var avgtimediffcycle3    = '';
    var avgtimediffseccycle3 = '';
    var secondscycle3    = '';
    var avgtimecycle3    = '00:00:00';    

    /////// 1 hr variable declaration /////////////
    var hrstarttime = '';
    var hrendtime   = '';
    /////// log0809/////////
    var starttime0809     = '';
    var endtime0809       = '';
    var avgtimediff0809   = '';
    var avgtimediffsec0809 = '';
    var seconds0809       = '';
    var avgtime0809       = '00:00:00';
    /////// log0910/////////
    var starttime0910     = '';
    var endtime0910       = '';
    var avgtimediff0910   = '';
    var avgtimediffsec0910 = '';
    var seconds0910       = '';
    var avgtime0910       = '00:00:00';
    /////// log1011/////////
    var starttime1011     = '';
    var endtime1011       = '';
    var avgtimediff1011  = '';
    var avgtimediffsec1011 = '';
    var seconds1011       = '';
    var avgtime1011       = '00:00:00';
    /////// log1112/////////
    var starttime1112     = '';
    var endtime1112       = '';
    var avgtimediff1112  = '';
    var avgtimediffsec1112 = '';
    var seconds1112       = '';
    var avgtime1112       = '00:00:00';
    /////// log1213/////////
    var starttime1213     = '';
    var endtime1213       = '';
    var avgtimediff1213  = '';
    var avgtimediffsec1213 = '';
    var seconds1213       = '';
    var avgtime1213       = '00:00:00';
    /////// log1314/////////
    var starttime1314     = '';
    var endtime1314       = '';
    var avgtimediff1314  = '';
    var avgtimediffsec1314 = '';
    var seconds1314       = '';
    var avgtime1314       = '00:00:00';
    /////// log1415/////////
    var starttime1415     = '';
    var endtime1415       = '';
    var avgtimediff1415  = '';
    var avgtimediffsec1415 = '';
    var seconds1415       = '';
    var avgtime1415       = '00:00:00';
    /////// log1516/////////
    var starttime1516     = '';
    var endtime1516       = '';
    var avgtimediff1516  = '';
    var avgtimediffsec1516 = '';
    var seconds1516       = '';
    var avgtime1516       = '00:00:00';
    /////// log1617/////////
    var starttime1617     = '';
    var endtime1617       = '';
    var avgtimediff1617  = '';
    var avgtimediffsec1617 = '';
    var seconds1617       = '';
    var avgtime1617       = '00:00:00';
    /////// log1718/////////
    var starttime1718     = '';
    var endtime1718       = '';
    var avgtimediff1718  = '';
    var avgtimediffsec1718 = '';
    var seconds1718       = '';
    var avgtime1718       = '00:00:00';
    /////// log1819/////////
    var starttime1819     = '';
    var endtime1819       = '';
    var avgtimediff1819  = '';
    var avgtimediffsec1819 = '';
    var seconds1819       = '';
    var avgtime1819       = '00:00:00';
    /////// log1819/////////
    var starttime1819     = '';
    var endtime1819       = '';
    var avgtimediff1819  = '';
    var avgtimediffsec1819 = '';
    var seconds1819       = '';
    var avgtime1819       = '00:00:00';
    /////// log1920/////////
    var starttime1920     = '';
    var endtime1920       = '';
    var avgtimediff1920  = '';
    var avgtimediffsec1920 = '';
    var seconds1920       = '';
    var avgtime1920       = '00:00:00';
    /////// log2021/////////
    var starttime2021     = '';
    var endtime2021       = '';
    var avgtimediff2021  = '';
    var avgtimediffsec2021 = '';
    var seconds2021       = '';
    var avgtime2021       = '00:00:00';
    /////// log2122/////////
     var starttime2122     = '';
     var endtime2122       = '';
     var avgtimediff2122  = '';
     var avgtimediffsec2122 = '';
     var seconds2122       = '';
     var avgtime2122       = '00:00:00';
    /////// log2223/////////
    var starttime2223     = '';
    var endtime2223       = '';
    var avgtimediff2223  = '';
    var avgtimediffsec2223 = '';
    var seconds2223       = '';
    var avgtime2223       = '00:00:00';
    //////////////////////////////////////////////

    for (let l = 0; l < moveitlog.length; l++) { 
      if(moveitavg[k].moveit_userid == moveitlog[l].moveit_userid && moveitavg[k].date == moveitlog[l].log_date){ 
        if(moveitlog[l].type==1){
          starttime = moveitlog[l].logtime;  
          if(starttime >= "08:00:00" && starttime < "12:00:00"){
            starttimecycle1 = starttime;
          }else if(starttime >= "12:00:00" && starttime < "16:00:00"){
            starttimecycle2 = starttime;
          }else if(starttime >= "16:00:00" && starttime < "23:00:00"){
            starttimecycle3 = starttime;
          } 

          //////////1 hr type-1/////////
          hrstarttime = moveitlog[l].logtime;
          if(hrstarttime >= "08:00:00" && hrstarttime < "09:00:00"){ starttime0809 = hrstarttime; }
          else if(hrstarttime >= "09:00:00" && hrstarttime < "10:00:00"){ starttime0910 = hrstarttime; }
          else if(hrstarttime >= "10:00:00" && hrstarttime < "11:00:00"){ starttime1011 = hrstarttime; }
          else if(hrstarttime >= "11:00:00" && hrstarttime < "12:00:00"){ starttime1112 = hrstarttime; }
          else if(hrstarttime >= "12:00:00" && hrstarttime < "13:00:00"){ starttime1213 = hrstarttime; }
          else if(hrstarttime >= "13:00:00" && hrstarttime < "14:00:00"){ starttime1314 = hrstarttime; }
          else if(hrstarttime >= "14:00:00" && hrstarttime < "15:00:00"){ starttime1415 = hrstarttime; }
          else if(hrstarttime >= "15:00:00" && hrstarttime < "16:00:00"){ starttime1516 = hrstarttime; }
          else if(hrstarttime >= "16:00:00" && hrstarttime < "17:00:00"){ starttime1617 = hrstarttime; }
          else if(hrstarttime >= "17:00:00" && hrstarttime < "18:00:00"){ starttime1718 = hrstarttime; }
          else if(hrstarttime >= "18:00:00" && hrstarttime < "19:00:00"){ starttime1819 = hrstarttime; }
          else if(hrstarttime >= "19:00:00" && hrstarttime < "20:00:00"){ starttime1920 = hrstarttime; }
          else if(hrstarttime >= "20:00:00" && hrstarttime < "21:00:00"){ starttime2021 = hrstarttime; }
          else if(hrstarttime >= "21:00:00" && hrstarttime < "22:00:00"){ starttime2122 = hrstarttime; }
          else if(hrstarttime >= "22:00:00" && hrstarttime < "23:00:00"){ starttime2223 = hrstarttime; }
          //////////////////////////////
        }else if(moveitlog[l].type==0){
          endtime = moveitlog[l].logtime;
          if(endtime >= "08:00:00" && endtime < "12:00:00"){
            endtimecycle1 = endtime;
          }else if(endtime >= "12:00:00" && endtime < "16:00:00"){
            endtimecycle2 = endtime;
          }else if(endtime >= "16:00:00" && endtime < "23:00:00"){
            endtimecycle3 = endtime;
          } 

          //////////1 hr type-2/////////
          hrendtime = moveitlog[l].logtime;
          if(hrendtime >= "08:00:00" && hrendtime < "09:00:00"){ endtime0809 = hrendtime; }
          else if(hrendtime >= "09:00:00" && hrendtime < "10:00:00"){ endtime0910 = hrendtime; }
          else if(hrendtime >= "10:00:00" && hrendtime < "11:00:00"){ endtime1011 = hrendtime; }
          else if(hrendtime >= "11:00:00" && hrendtime < "12:00:00"){ endtime1112 = hrendtime; }
          else if(hrendtime >= "12:00:00" && hrendtime < "13:00:00"){ endtime1213 = hrendtime; }
          else if(hrendtime >= "13:00:00" && hrendtime < "14:00:00"){ endtime1314 = hrendtime; }
          else if(hrendtime >= "14:00:00" && hrendtime < "15:00:00"){ endtime1415 = hrendtime; }
          else if(hrendtime >= "15:00:00" && hrendtime < "16:00:00"){ endtime1516 = hrendtime; }
          else if(hrendtime >= "16:00:00" && hrendtime < "17:00:00"){ endtime1617 = hrendtime; }
          else if(hrendtime >= "17:00:00" && hrendtime < "18:00:00"){ endtime1718 = hrendtime; }
          else if(hrendtime >= "18:00:00" && hrendtime < "19:00:00"){ endtime1819 = hrendtime; }
          else if(hrendtime >= "19:00:00" && hrendtime < "20:00:00"){ endtime1920 = hrendtime; }
          else if(hrendtime >= "20:00:00" && hrendtime < "21:00:00"){ endtime2021 = hrendtime; }
          else if(hrendtime >= "21:00:00" && hrendtime < "22:00:00"){ endtime2122 = hrendtime; }
          else if(hrendtime >= "22:00:00" && hrendtime < "23:00:00"){ endtime2223 = hrendtime; }
          //////////////////////////////
        }
        
        if(starttimecycle1 !='' && endtimecycle1 !=''){
          var avgtimediffcycle1    = moment.utc(moment(endtimecycle1, "HH:mm:ss").diff(moment(starttimecycle1, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffseccycle1 = avgtimediffcycle1.split(':'); 
          var secondscycle1        = (+avgtimediffseccycle1[0]) * 60 * 60 + (+avgtimediffseccycle1[1]) * 60 + (+avgtimediffseccycle1[2]); 
          avgtimecycle1        = moment(avgtimecycle1,"HH:mm:ss").add(secondscycle1,'s').format("HH:mm:ss");
          starttimecycle1 = '';
          endtimecycle1   = '';
        }

        if(starttimecycle2 !='' && endtimecycle2 !=''){
          var avgtimediffcycle2    = moment.utc(moment(endtimecycle2, "HH:mm:ss").diff(moment(starttimecycle2, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffseccycle2 = avgtimediffcycle2.split(':'); 
          var secondscycle2        = (+avgtimediffseccycle2[0]) * 60 * 60 + (+avgtimediffseccycle2[1]) * 60 + (+avgtimediffseccycle2[2]); 
          avgtimecycle2        = moment(avgtimecycle2,"HH:mm:ss").add(secondscycle2,'s').format("HH:mm:ss");
          starttimecycle2   = '';
          endtimecycle1e2   = '';
        }

        if(starttimecycle3 !='' && endtimecycle3 !=''){
         var avgtimediffcycle3    = moment.utc(moment(endtimecycle3, "HH:mm:ss").diff(moment(starttimecycle3, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffseccycle3 = avgtimediffcycle3.split(':'); 
          var secondscycle3        = (+avgtimediffseccycle3[0]) * 60 * 60 + (+avgtimediffseccycle3[1]) * 60 + (+avgtimediffseccycle3[2]); 
          avgtimecycle3        = moment(avgtimecycle3,"HH:mm:ss").add(secondscycle3,'s').format("HH:mm:ss");
          starttimecycle3 = '';
          endtimecycle3   = '';
        }
        starttime ='';
        endtime ='';

        ///////////////////////////// 1hr Log /////////////////////
        if(starttime0809 !='' && endtime0809 !=''){
          var avgtimediff0809    = moment.utc(moment(endtime0809, "HH:mm:ss").diff(moment(starttime0809, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec0809 = avgtimediff0809.split(':'); 
          var seconds0809        = (+avgtimediffsec0809[0]) * 60 * 60 + (+avgtimediffsec0809[1]) * 60 + (+avgtimediffsec0809[2]); 
          avgtime0809        = moment(avgtime0809,"HH:mm:ss").add(seconds0809,'s').format("HH:mm:ss");
          starttime0809 = '';
          endtime0809   = '';
        }
        if(starttime0910 !='' && endtime0910 !=''){
          var avgtimediff0910    = moment.utc(moment(endtime0910, "HH:mm:ss").diff(moment(starttime0910, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec0910 = avgtimediff0910.split(':'); 
          var seconds0910        = (+avgtimediffsec0910[0]) * 60 * 60 + (+avgtimediffsec0910[1]) * 60 + (+avgtimediffsec0910[2]); 
          avgtime0910        = moment(avgtime0910,"HH:mm:ss").add(seconds0910,'s').format("HH:mm:ss");
          starttime0910 = '';
          endtime0910   = '';
        }
        if(starttime1011 !='' && endtime1011 !=''){
          var avgtimediff1011    = moment.utc(moment(endtime1011, "HH:mm:ss").diff(moment(starttime1011, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1011 = avgtimediff1011.split(':'); 
          var seconds1011        = (+avgtimediffsec1011[0]) * 60 * 60 + (+avgtimediffsec1011[1]) * 60 + (+avgtimediffsec1011[2]); 
          avgtime1011        = moment(avgtime1011,"HH:mm:ss").add(seconds1011,'s').format("HH:mm:ss");
          starttime1011 = '';
          endtime1011   = '';
        }
        if(starttime1112 !='' && endtime1112 !=''){
          var avgtimediff1112    = moment.utc(moment(endtime1112, "HH:mm:ss").diff(moment(starttime1112, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1112 = avgtimediff1112.split(':'); 
          var seconds1112        = (+avgtimediffsec1112[0]) * 60 * 60 + (+avgtimediffsec1112[1]) * 60 + (+avgtimediffsec1112[2]); 
          avgtime1112        = moment(avgtime1112,"HH:mm:ss").add(seconds1112,'s').format("HH:mm:ss");
          starttime1112 = '';
          endtime1112   = '';
        }
        if(starttime1213 !='' && endtime1213 !=''){
          var avgtimediff1213    = moment.utc(moment(endtime1213, "HH:mm:ss").diff(moment(starttime1213, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1213 = avgtimediff1213.split(':'); 
          var seconds1213        = (+avgtimediffsec1213[0]) * 60 * 60 + (+avgtimediffsec1213[1]) * 60 + (+avgtimediffsec1213[2]); 
          avgtime1213        = moment(avgtime1213,"HH:mm:ss").add(seconds1213,'s').format("HH:mm:ss");
          starttime1213 = '';
          endtime1213   = '';
        }
        if(starttime1314 !='' && endtime1314 !=''){
          var avgtimediff1314    = moment.utc(moment(endtime1314, "HH:mm:ss").diff(moment(starttime1314, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1314 = avgtimediff1314.split(':'); 
          var seconds1314        = (+avgtimediffsec1314[0]) * 60 * 60 + (+avgtimediffsec1314[1]) * 60 + (+avgtimediffsec1314[2]); 
          avgtime1314        = moment(avgtime1314,"HH:mm:ss").add(seconds1314,'s').format("HH:mm:ss");
          starttime1314 = '';
          endtime1314   = '';
        }
        if(starttime1415 !='' && endtime1415 !=''){
          var avgtimediff1415    = moment.utc(moment(endtime1415, "HH:mm:ss").diff(moment(starttime1415, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1415 = avgtimediff1415.split(':'); 
          var seconds1415        = (+avgtimediffsec1415[0]) * 60 * 60 + (+avgtimediffsec1415[1]) * 60 + (+avgtimediffsec1415[2]); 
          avgtime1415        = moment(avgtime1415,"HH:mm:ss").add(seconds1415,'s').format("HH:mm:ss");
          starttime1415 = '';
          endtime1415   = '';
        }
        if(starttime1516 !='' && endtime1516 !=''){
          var avgtimediff1516    = moment.utc(moment(endtime1516, "HH:mm:ss").diff(moment(starttime1516, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1516 = avgtimediff1516.split(':'); 
          var seconds1516        = (+avgtimediffsec1516[0]) * 60 * 60 + (+avgtimediffsec1516[1]) * 60 + (+avgtimediffsec1516[2]); 
          avgtime1516        = moment(avgtime1516,"HH:mm:ss").add(seconds1516,'s').format("HH:mm:ss");
          starttime1516 = '';
          endtime1516   = '';
        }
        if(starttime1617 !='' && endtime1617 !=''){
          var avgtimediff1617    = moment.utc(moment(endtime1617, "HH:mm:ss").diff(moment(starttime1617, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1617 = avgtimediff1617.split(':'); 
          var seconds1617        = (+avgtimediffsec1617[0]) * 60 * 60 + (+avgtimediffsec1617[1]) * 60 + (+avgtimediffsec1617[2]); 
          avgtime1617        = moment(avgtime1617,"HH:mm:ss").add(seconds1617,'s').format("HH:mm:ss");
          starttime1617 = '';
          endtime1617   = '';
        }
        if(starttime1718 !='' && endtime1718 !=''){
          var avgtimediff1718    = moment.utc(moment(endtime1718, "HH:mm:ss").diff(moment(starttime1718, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1718 = avgtimediff1718.split(':'); 
          var seconds1718        = (+avgtimediffsec1718[0]) * 60 * 60 + (+avgtimediffsec1718[1]) * 60 + (+avgtimediffsec1718[2]); 
          avgtime1718        = moment(avgtime1718,"HH:mm:ss").add(seconds1718,'s').format("HH:mm:ss");
          starttime1718 = '';
          endtime1718   = '';
        }
        if(starttime1819 !='' && endtime1819 !=''){
          var avgtimediff1819    = moment.utc(moment(endtime1819, "HH:mm:ss").diff(moment(starttime1819, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1819 = avgtimediff1819.split(':'); 
          var seconds1819        = (+avgtimediffsec1819[0]) * 60 * 60 + (+avgtimediffsec1819[1]) * 60 + (+avgtimediffsec1819[2]); 
          avgtime1819        = moment(avgtime1819,"HH:mm:ss").add(seconds1819,'s').format("HH:mm:ss");
          starttime1819 = '';
          endtime1819   = '';
        }
        if(starttime1920 !='' && endtime1920 !=''){
          var avgtimediff1920    = moment.utc(moment(endtime1920, "HH:mm:ss").diff(moment(starttime1920, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1920 = avgtimediff1920.split(':'); 
          var seconds1920        = (+avgtimediffsec1920[0]) * 60 * 60 + (+avgtimediffsec1920[1]) * 60 + (+avgtimediffsec1920[2]); 
          avgtime1920        = moment(avgtime1920,"HH:mm:ss").add(seconds1920,'s').format("HH:mm:ss");
          starttime1920 = '';
          endtime1920   = '';
        }
        if(starttime2021 !='' && endtime2021 !=''){
          var avgtimediff2021    = moment.utc(moment(endtime2021, "HH:mm:ss").diff(moment(starttime2021, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec2021 = avgtimediff2021.split(':'); 
          var seconds2021        = (+avgtimediffsec2021[0]) * 60 * 60 + (+avgtimediffsec2021[1]) * 60 + (+avgtimediffsec2021[2]); 
          avgtime2021        = moment(avgtime2021,"HH:mm:ss").add(seconds2021,'s').format("HH:mm:ss");
          starttime2021 = '';
          endtime2021   = '';
        }
        if(starttime2122 !='' && endtime2122 !=''){
          var avgtimediff2122    = moment.utc(moment(endtime2122, "HH:mm:ss").diff(moment(starttime2122, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec2122 = avgtimediff2122.split(':'); 
          var seconds2122        = (+avgtimediffsec2122[0]) * 60 * 60 + (+avgtimediffsec2122[1]) * 60 + (+avgtimediffsec2122[2]); 
          avgtime2122        = moment(avgtime2122,"HH:mm:ss").add(seconds2122,'s').format("HH:mm:ss");
          starttime2122 = '';
          endtime2122   = '';
        }
        if(starttime2223 !='' && endtime2223 !=''){
          var avgtimediff2223    = moment.utc(moment(endtime2223, "HH:mm:ss").diff(moment(starttime2223, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec2223 = avgtimediff2223.split(':'); 
          var seconds2223        = (+avgtimediffsec2223[0]) * 60 * 60 + (+avgtimediffsec2223[1]) * 60 + (+avgtimediffsec2223[2]); 
          avgtime2223        = moment(avgtime2223,"HH:mm:ss").add(seconds2223,'s').format("HH:mm:ss");
          starttime2223 = '';
          endtime2223   = '';
        }

        hrstarttime ='';
        hrendtime ='';
        ///////////////////////////////////////////////////////////
      } 
    }     
    moveitavg[k].cycle1 = avgtimecycle1;
    moveitavg[k].cycle2 = avgtimecycle2;
    moveitavg[k].cycle3 = avgtimecycle3;

    //////////// 1hr data//////////////
    moveitavg[k].log0809 = avgtime0809;
    moveitavg[k].log0910 = avgtime0910;
    moveitavg[k].log1011 = avgtime1011;
    moveitavg[k].log1112 = avgtime1112;
    moveitavg[k].log1213 = avgtime1213;
    moveitavg[k].log1314 = avgtime1314;
    moveitavg[k].log1415 = avgtime1415;
    moveitavg[k].log1516 = avgtime1516;
    moveitavg[k].log1617 = avgtime1617;
    moveitavg[k].log1718 = avgtime1718;
    moveitavg[k].log1819 = avgtime1819;
    moveitavg[k].log1920 = avgtime1920;
    moveitavg[k].log2021 = avgtime2021;
    moveitavg[k].log2122 = avgtime2122;
    moveitavg[k].log2223 = avgtime2223;
    //////////////////////////////////

    moveitavg[k].logtime ='00:00:00';
    var cycle1 = moveitavg[k].cycle1.split(':'); 
    var cycle1sec  = (+cycle1[0]) * 60 * 60 + (+cycle1[1]) * 60 + (+cycle1[2]); 
    moveitavg[k].logtime =  moment(moveitavg[k].logtime,"HH:mm:ss").add(cycle1sec,'s').format("HH:mm:ss");

    var cycle2 = moveitavg[k].cycle2.split(':'); 
    var cycle2sec  = (+cycle2[0]) * 60 * 60 + (+cycle2[1]) * 60 + (+cycle2[2]); 
    moveitavg[k].logtime =  moment(moveitavg[k].logtime,"HH:mm:ss").add(cycle2sec,'s').format("HH:mm:ss");

    var cycle3 = moveitavg[k].cycle3.split(':'); 
    var cycle3sec  = (+cycle3[0]) * 60 * 60 + (+cycle3[1]) * 60 + (+cycle3[2]); 
    moveitavg[k].logtime =  moment(moveitavg[k].logtime,"HH:mm:ss").add(cycle3sec,'s').format("HH:mm:ss");

    ///////////////////
    moveitavg[k].order_count =0;
    moveitavg[k].breakfast =0;
    moveitavg[k].lunch =0;
    moveitavg[k].dinner =0;

    moveitavg[k].log0809_count = 0;
    moveitavg[k].log0910_count = 0;
    moveitavg[k].log1011_count = 0;
    moveitavg[k].log1112_count = 0;
    moveitavg[k].log1213_count = 0;
    moveitavg[k].log1314_count = 0;
    moveitavg[k].log1415_count = 0;
    moveitavg[k].log1516_count = 0;
    moveitavg[k].log1617_count = 0;
    moveitavg[k].log1718_count = 0;
    moveitavg[k].log1819_count = 0;
    moveitavg[k].log1920_count = 0;
    moveitavg[k].log2021_count = 0;
    moveitavg[k].log2122_count = 0;
    moveitavg[k].log2223_count = 0;

    moveitavg[k].busy_0809 = '00:00:00';
    moveitavg[k].busy_0910 = '00:00:00';
    moveitavg[k].busy_1011 = '00:00:00';
    moveitavg[k].busy_1112 = '00:00:00';
    moveitavg[k].busy_1213 = '00:00:00';
    moveitavg[k].busy_1314 = '00:00:00';
    moveitavg[k].busy_1415 = '00:00:00';
    moveitavg[k].busy_1516 = '00:00:00';
    moveitavg[k].busy_1617 = '00:00:00';
    moveitavg[k].busy_1718 = '00:00:00';
    moveitavg[k].busy_1819 = '00:00:00';
    moveitavg[k].busy_1920 = '00:00:00';
    moveitavg[k].busy_2021 = '00:00:00';
    moveitavg[k].busy_2122 = '00:00:00';
    moveitavg[k].busy_2223 = '00:00:00';
  } 
  return moveitavg;
};

////Moveit Order Count///////
Order.moveit_busy_hr = async function moveit_busy_hr(req,moveitloguser) {
  var bysyhr = new Array();
  for(let k=0; k<moveitloguser.length; k++){
    bysyhr.push({'moveit_user_id':moveitloguser[k]});
  }
  
  var moveitordersquery = "select orderid,moveit_user_id,time(order_assigned_time) as assignedtime,time(moveit_actual_delivered_time) as moveit_actual_delivered_time from Orders where moveit_user_id IN("+moveitloguser+") and date(created_at)=DATE_SUB(CURDATE(), INTERVAL 1 DAY) and orderstatus=6 order by moveit_user_id";
  var moveitorders = await query(moveitordersquery);  

  for(let i=0; i<bysyhr.length; i++){  
    bysyhr[i].busy_0809 = '00:00:00';
    bysyhr[i].busy_0910 = '00:00:00';
    bysyhr[i].busy_1011 = '00:00:00';
    bysyhr[i].busy_1112 = '00:00:00';
    bysyhr[i].busy_1213 = '00:00:00';
    bysyhr[i].busy_1314 = '00:00:00';
    bysyhr[i].busy_1415 = '00:00:00';
    bysyhr[i].busy_1516 = '00:00:00';
    bysyhr[i].busy_1617 = '00:00:00';
    bysyhr[i].busy_1718 = '00:00:00';
    bysyhr[i].busy_1819 = '00:00:00';
    bysyhr[i].busy_1920 = '00:00:00';
    bysyhr[i].busy_2021 = '00:00:00';
    bysyhr[i].busy_2122 = '00:00:00';
    bysyhr[i].busy_2223 = '00:00:00';

    for(let j=0; j<moveitorders.length; j++){  
      if(bysyhr[i].moveit_user_id==moveitorders[j].moveit_user_id){
        var AHH = moment.utc(moveitorders[j].assignedtime,"HH").format("HH");
        var DHH = moment.utc(moveitorders[j].moveit_actual_delivered_time,"HH").format("HH");     
        switch(AHH) {
          //console.log("switch",AHH);
          case '8':
            if(AHH == DHH){
              //bysyhr[i].busy_0809  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff0809    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec0809 = avgtimediff0809.split(':'); 
              let seconds0809        = (+avgtimediffsec0809[0]) * 60 * 60 + (+avgtimediffsec0809[1]) * 60 + (+avgtimediffsec0809[2]); 
              bysyhr[i].busy_0809    = moment(bysyhr[i].busy_0809,"HH:mm:ss").add(seconds0809,'s').format("HH:mm:ss");
              
            }else{
              //bysyhr[i].busy_0809  = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff0809    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec0809 = avgtimediff0809.split(':'); 
              let seconds0809        = (+avgtimediffsec0809[0]) * 60 * 60 + (+avgtimediffsec0809[1]) * 60 + (+avgtimediffsec0809[2]); 
              bysyhr[i].busy_0809    = moment(bysyhr[i].busy_0809,"HH:mm:ss").add(seconds0809,'s').format("HH:mm:ss");

              //bysyhr[i].busy_0910  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff0910    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec0910 = avgtimediff0910.split(':'); 
              let seconds0910        = (+avgtimediffsec0910[0]) * 60 * 60 + (+avgtimediffsec0910[1]) * 60 + (+avgtimediffsec0910[2]); 
              bysyhr[i].busy_0910    = moment(bysyhr[i].busy_0910,"HH:mm:ss").add(seconds0910,'s').format("HH:mm:ss");

            }
            break;
          case '9':
            if(AHH == DHH){
              //bysyhr[i].busy_0910  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff0910    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec0910 = avgtimediff0910.split(':'); 
              let seconds0910        = (+avgtimediffsec0910[0]) * 60 * 60 + (+avgtimediffsec0910[1]) * 60 + (+avgtimediffsec0910[2]); 
              bysyhr[i].busy_0910    = moment(bysyhr[i].busy_0910,"HH:mm:ss").add(seconds0910,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_0910 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff0910    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec0910 = avgtimediff0910.split(':'); 
              let seconds0910        = (+avgtimediffsec0910[0]) * 60 * 60 + (+avgtimediffsec0910[1]) * 60 + (+avgtimediffsec0910[2]); 
              bysyhr[i].busy_0910    = moment(bysyhr[i].busy_0910,"HH:mm:ss").add(seconds0910,'s').format("HH:mm:ss");


              //bysyhr[i].busy_1011 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1011    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1011 = avgtimediff1011.split(':'); 
              let seconds1011        = (+avgtimediffsec1011[0]) * 60 * 60 + (+avgtimediffsec1011[1]) * 60 + (+avgtimediffsec1011[2]); 
              bysyhr[i].busy_1011    = moment(bysyhr[i].busy_1011,"HH:mm:ss").add(seconds1011,'s').format("HH:mm:ss");
            }
            break;
          case '10':
            if(AHH == DHH){
              //bysyhr[i].busy_1011  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1011    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1011 = avgtimediff1011.split(':'); 
              let seconds1011        = (+avgtimediffsec1011[0]) * 60 * 60 + (+avgtimediffsec1011[1]) * 60 + (+avgtimediffsec1011[2]); 
              bysyhr[i].busy_1011    = moment(bysyhr[i].busy_1011,"HH:mm:ss").add(seconds1011,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1011 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1011    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1011 = avgtimediff1011.split(':'); 
              let seconds1011        = (+avgtimediffsec1011[0]) * 60 * 60 + (+avgtimediffsec1011[1]) * 60 + (+avgtimediffsec1011[2]); 
              bysyhr[i].busy_1011    = moment(bysyhr[i].busy_1011,"HH:mm:ss").add(seconds1011,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1112 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1112    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1112 = avgtimediff1112.split(':'); 
              let seconds1112        = (+avgtimediffsec1112[0]) * 60 * 60 + (+avgtimediffsec1112[1]) * 60 + (+avgtimediffsec1112[2]); 
              bysyhr[i].busy_1112    = moment(bysyhr[i].busy_1112,"HH:mm:ss").add(seconds1112,'s').format("HH:mm:ss");
            }
            break;
          case '11':
            if(AHH == DHH){
              //bysyhr[i].busy_1112  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1112    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1112 = avgtimediff1112.split(':'); 
              let seconds1112        = (+avgtimediffsec1112[0]) * 60 * 60 + (+avgtimediffsec1112[1]) * 60 + (+avgtimediffsec1112[2]); 
              bysyhr[i].busy_1112    = moment(bysyhr[i].busy_1112,"HH:mm:ss").add(seconds1112,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1112 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1112    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1112 = avgtimediff1112.split(':'); 
              let seconds1112        = (+avgtimediffsec1112[0]) * 60 * 60 + (+avgtimediffsec1112[1]) * 60 + (+avgtimediffsec1112[2]); 
              bysyhr[i].busy_1112    = moment(bysyhr[i].busy_1112,"HH:mm:ss").add(seconds1112,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1213 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1213    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1213 = avgtimediff1213.split(':'); 
              let seconds1213        = (+avgtimediffsec1213[0]) * 60 * 60 + (+avgtimediffsec1213[1]) * 60 + (+avgtimediffsec1213[2]); 
              bysyhr[i].busy_1213    = moment(bysyhr[i].busy_1213,"HH:mm:ss").add(seconds1213,'s').format("HH:mm:ss");
            }
            break;
          case '12':
            if(AHH == DHH){
              //bysyhr[i].busy_1213  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1213    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1213 = avgtimediff1213.split(':'); 
              let seconds1213        = (+avgtimediffsec1213[0]) * 60 * 60 + (+avgtimediffsec1213[1]) * 60 + (+avgtimediffsec1213[2]); 
              bysyhr[i].busy_1213    = moment(bysyhr[i].busy_1213,"HH:mm:ss").add(seconds1213,'s').format("HH:mm:ss");
            }else{
              let avgtimediff1213    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1213 = avgtimediff1213.split(':'); 
              let seconds1213        = (+avgtimediffsec1213[0]) * 60 * 60 + (+avgtimediffsec1213[1]) * 60 + (+avgtimediffsec1213[2]); 
              bysyhr[i].busy_1213    = moment(bysyhr[i].busy_1213,"HH:mm:ss").add(seconds1213,'s').format("HH:mm:ss");
              
              let avgtimediff1314    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1314 = avgtimediff1314.split(':'); 
              let seconds1314        = (+avgtimediffsec1314[0]) * 60 * 60 + (+avgtimediffsec1314[1]) * 60 + (+avgtimediffsec1314[2]); 
              bysyhr[i].busy_1314    = moment(bysyhr[i].busy_1314,"HH:mm:ss").add(seconds1314,'s').format("HH:mm:ss");
            }
            break;
          case '13':
            if(AHH == DHH){
              let avgtimediff1314    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1314 = avgtimediff1314.split(':'); 
              let seconds1314        = (+avgtimediffsec1314[0]) * 60 * 60 + (+avgtimediffsec1314[1]) * 60 + (+avgtimediffsec1314[2]); 
              bysyhr[i].busy_1314    = moment(bysyhr[i].busy_1314,"HH:mm:ss").add(seconds1314,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1314 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1314    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1314 = avgtimediff1314.split(':'); 
              let seconds1314        = (+avgtimediffsec1314[0]) * 60 * 60 + (+avgtimediffsec1314[1]) * 60 + (+avgtimediffsec1314[2]); 
              bysyhr[i].busy_1314    = moment(bysyhr[i].busy_1314,"HH:mm:ss").add(seconds1314,'s').format("HH:mm:ss");


              //bysyhr[i].busy_1415 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1415    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1415 = avgtimediff1415.split(':'); 
              let seconds1415        = (+avgtimediffsec1415[0]) * 60 * 60 + (+avgtimediffsec1415[1]) * 60 + (+avgtimediffsec1415[2]); 
              bysyhr[i].busy_1415    = moment(bysyhr[i].busy_1415,"HH:mm:ss").add(seconds1415,'s').format("HH:mm:ss");
            }
            break;
          case '14':
            if(AHH == DHH){
              //bysyhr[i].busy_1415  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1415    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1415 = avgtimediff1415.split(':'); 
              let seconds1415        = (+avgtimediffsec1415[0]) * 60 * 60 + (+avgtimediffsec1415[1]) * 60 + (+avgtimediffsec1415[2]); 
              bysyhr[i].busy_1415    = moment(bysyhr[i].busy_1415,"HH:mm:ss").add(seconds1415,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1415 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1415    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1415 = avgtimediff1415.split(':'); 
              let seconds1415        = (+avgtimediffsec1415[0]) * 60 * 60 + (+avgtimediffsec1415[1]) * 60 + (+avgtimediffsec1415[2]); 
              bysyhr[i].busy_1415    = moment(bysyhr[i].busy_1415,"HH:mm:ss").add(seconds1415,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1516 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1516    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1516 = avgtimediff1516.split(':'); 
              let seconds1516        = (+avgtimediffsec1516[0]) * 60 * 60 + (+avgtimediffsec1516[1]) * 60 + (+avgtimediffsec1516[2]); 
              bysyhr[i].busy_1516    = moment(bysyhr[i].busy_1516,"HH:mm:ss").add(seconds1516,'s').format("HH:mm:ss");
            }
            break;
          case '15':
            if(AHH == DHH){
              //bysyhr[i].busy_1516  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1516    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1516 = avgtimediff1516.split(':'); 
              let seconds1516        = (+avgtimediffsec1516[0]) * 60 * 60 + (+avgtimediffsec1516[1]) * 60 + (+avgtimediffsec1516[2]); 
              bysyhr[i].busy_1516    = moment(bysyhr[i].busy_1516,"HH:mm:ss").add(seconds1516,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1516 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1516    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1516 = avgtimediff1516.split(':'); 
              let seconds1516        = (+avgtimediffsec1516[0]) * 60 * 60 + (+avgtimediffsec1516[1]) * 60 + (+avgtimediffsec1516[2]); 
              bysyhr[i].busy_1516    = moment(bysyhr[i].busy_1516,"HH:mm:ss").add(seconds1516,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1617 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1617    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1617 = avgtimediff1617.split(':'); 
              let seconds1617        = (+avgtimediffsec1617[0]) * 60 * 60 + (+avgtimediffsec1617[1]) * 60 + (+avgtimediffsec1617[2]); 
              bysyhr[i].busy_1617    = moment(bysyhr[i].busy_1617,"HH:mm:ss").add(seconds1617,'s').format("HH:mm:ss");
            }
            break;
          case '16':
            if(AHH == DHH){
              //bysyhr[i].busy_1617  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1617    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1617 = avgtimediff1617.split(':'); 
              let seconds1617        = (+avgtimediffsec1617[0]) * 60 * 60 + (+avgtimediffsec1617[1]) * 60 + (+avgtimediffsec1617[2]); 
              bysyhr[i].busy_1617    = moment(bysyhr[i].busy_1617,"HH:mm:ss").add(seconds1617,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1617 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1617    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1617 = avgtimediff1617.split(':'); 
              let seconds1617        = (+avgtimediffsec1617[0]) * 60 * 60 + (+avgtimediffsec1617[1]) * 60 + (+avgtimediffsec1617[2]); 
              bysyhr[i].busy_1617    = moment(bysyhr[i].busy_1617,"HH:mm:ss").add(seconds1617,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1718 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1718    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1718 = avgtimediff1718.split(':'); 
              let seconds1718        = (+avgtimediffsec1718[0]) * 60 * 60 + (+avgtimediffsec1718[1]) * 60 + (+avgtimediffsec1718[2]); 
              bysyhr[i].busy_1718    = moment(bysyhr[i].busy_1718,"HH:mm:ss").add(seconds1718,'s').format("HH:mm:ss");
            }
            break;
          case '17':
            if(AHH == DHH){
              //bysyhr[i].busy_1718  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1718    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1718 = avgtimediff1718.split(':'); 
              let seconds1718        = (+avgtimediffsec1718[0]) * 60 * 60 + (+avgtimediffsec1718[1]) * 60 + (+avgtimediffsec1718[2]); 
              bysyhr[i].busy_1718    = moment(bysyhr[i].busy_1718,"HH:mm:ss").add(seconds1718,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1718 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1718    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1718 = avgtimediff1718.split(':'); 
              let seconds1718        = (+avgtimediffsec1718[0]) * 60 * 60 + (+avgtimediffsec1718[1]) * 60 + (+avgtimediffsec1718[2]); 
              bysyhr[i].busy_1718    = moment(bysyhr[i].busy_1718,"HH:mm:ss").add(seconds1718,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1819 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1819    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1819 = avgtimediff1819.split(':'); 
              let seconds1819        = (+avgtimediffsec1819[0]) * 60 * 60 + (+avgtimediffsec1819[1]) * 60 + (+avgtimediffsec1819[2]); 
              bysyhr[i].busy_1819    = moment(bysyhr[i].busy_1819,"HH:mm:ss").add(seconds1819,'s').format("HH:mm:ss");
            }
            break;
          case '18':
            if(AHH == DHH){
              //bysyhr[i].busy_1819  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1819    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1819 = avgtimediff1819.split(':'); 
              let seconds1819        = (+avgtimediffsec1819[0]) * 60 * 60 + (+avgtimediffsec1819[1]) * 60 + (+avgtimediffsec1819[2]); 
              bysyhr[i].busy_1819    = moment(bysyhr[i].busy_1819,"HH:mm:ss").add(seconds1819,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1819 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1819    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1819 = avgtimediff1819.split(':'); 
              let seconds1819        = (+avgtimediffsec1819[0]) * 60 * 60 + (+avgtimediffsec1819[1]) * 60 + (+avgtimediffsec1819[2]); 
              bysyhr[i].busy_1819    = moment(bysyhr[i].busy_1819,"HH:mm:ss").add(seconds1819,'s').format("HH:mm:ss");

              //bysyhr[i].busy_1920 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1920    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1920 = avgtimediff1920.split(':'); 
              let seconds1920        = (+avgtimediffsec1920[0]) * 60 * 60 + (+avgtimediffsec1920[1]) * 60 + (+avgtimediffsec1920[2]); 
              bysyhr[i].busy_1920    = moment(bysyhr[i].busy_1920,"HH:mm:ss").add(seconds1920,'s').format("HH:mm:ss");
            }
            break;
          case '19':
            if(AHH == DHH){
              //bysyhr[i].busy_1920  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1920    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1920 = avgtimediff1920.split(':'); 
              let seconds1920        = (+avgtimediffsec1920[0]) * 60 * 60 + (+avgtimediffsec1920[1]) * 60 + (+avgtimediffsec1920[2]); 
              bysyhr[i].busy_1920    = moment(bysyhr[i].busy_1920,"HH:mm:ss").add(seconds1920,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_1920 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff1920    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec1920 = avgtimediff1920.split(':'); 
              let seconds1920        = (+avgtimediffsec1920[0]) * 60 * 60 + (+avgtimediffsec1920[1]) * 60 + (+avgtimediffsec1920[2]); 
              bysyhr[i].busy_1920    = moment(bysyhr[i].busy_1920,"HH:mm:ss").add(seconds1920,'s').format("HH:mm:ss");

              //bysyhr[i].busy_2021 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2021    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2021 = avgtimediff2021.split(':'); 
              let seconds2021        = (+avgtimediffsec2021[0]) * 60 * 60 + (+avgtimediffsec2021[1]) * 60 + (+avgtimediffsec2021[2]); 
              bysyhr[i].busy_2021    = moment(bysyhr[i].busy_2021,"HH:mm:ss").add(seconds2021,'s').format("HH:mm:ss");
            }
            break;
          case '20':
            if(AHH == DHH){
              //bysyhr[i].busy_2021  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2021    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2021 = avgtimediff2021.split(':'); 
              let seconds2021        = (+avgtimediffsec2021[0]) * 60 * 60 + (+avgtimediffsec2021[1]) * 60 + (+avgtimediffsec2021[2]); 
              bysyhr[i].busy_2021    = moment(bysyhr[i].busy_2021,"HH:mm:ss").add(seconds2021,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_2021 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2021    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2021 = avgtimediff2021.split(':'); 
              let seconds2021        = (+avgtimediffsec2021[0]) * 60 * 60 + (+avgtimediffsec2021[1]) * 60 + (+avgtimediffsec2021[2]); 
              bysyhr[i].busy_2021    = moment(bysyhr[i].busy_2021,"HH:mm:ss").add(seconds2021,'s').format("HH:mm:ss");

              //bysyhr[i].busy_2122 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2122    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2122 = avgtimediff2122.split(':'); 
              let seconds2122        = (+avgtimediffsec2122[0]) * 60 * 60 + (+avgtimediffsec2122[1]) * 60 + (+avgtimediffsec2122[2]); 
              bysyhr[i].busy_2122    = moment(bysyhr[i].busy_2122,"HH:mm:ss").add(seconds2122,'s').format("HH:mm:ss");
            }
            break;
          case '21':
            if(AHH == DHH){
              //bysyhr[i].busy_2122  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2122    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2122 = avgtimediff2122.split(':'); 
              let seconds2122        = (+avgtimediffsec2122[0]) * 60 * 60 + (+avgtimediffsec2122[1]) * 60 + (+avgtimediffsec2122[2]); 
              bysyhr[i].busy_2122    = moment(bysyhr[i].busy_2122,"HH:mm:ss").add(seconds2122,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_2122 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2122    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2122 = avgtimediff2122.split(':'); 
              let seconds2122        = (+avgtimediffsec2122[0]) * 60 * 60 + (+avgtimediffsec2122[1]) * 60 + (+avgtimediffsec2122[2]); 
              bysyhr[i].busy_2122    = moment(bysyhr[i].busy_2122,"HH:mm:ss").add(seconds2122,'s').format("HH:mm:ss");

              //bysyhr[i].busy_2223 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2223    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2223 = avgtimediff2223.split(':'); 
              let seconds2223        = (+avgtimediffsec2223[0]) * 60 * 60 + (+avgtimediffsec2223[1]) * 60 + (+avgtimediffsec2223[2]); 
              bysyhr[i].busy_2223    = moment(bysyhr[i].busy_2223,"HH:mm:ss").add(seconds2223,'s').format("HH:mm:ss");
            }
            break;
          case '22':
            if(AHH == DHH){
              //bysyhr[i].busy_2223  = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2223    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(moveitorders[j].assignedtime, "HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2223 = avgtimediff2223.split(':'); 
              let seconds2223        = (+avgtimediffsec2223[0]) * 60 * 60 + (+avgtimediffsec2223[1]) * 60 + (+avgtimediffsec2223[2]); 
              bysyhr[i].busy_2223    = moment(bysyhr[i].busy_2223,"HH:mm:ss").add(seconds2223,'s').format("HH:mm:ss");
            }else{
              //bysyhr[i].busy_2223 = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2223    = moment.utc(moment(""+DHH+":00:00","HH:mm:ss").diff(moment(moveitorders[j].assignedtime,"HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2223 = avgtimediff2223.split(':'); 
              let seconds2223        = (+avgtimediffsec2223[0]) * 60 * 60 + (+avgtimediffsec2223[1]) * 60 + (+avgtimediffsec2223[2]); 
              bysyhr[i].busy_2223    = moment(bysyhr[i].busy_2223,"HH:mm:ss").add(seconds2223,'s').format("HH:mm:ss");

              //bysyhr[i].busy_2324 = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediff2324    = moment.utc(moment(moveitorders[j].moveit_actual_delivered_time, "HH:mm:ss").diff(moment(""+DHH+":00:00","HH:mm:ss"))).format("HH:mm:ss");
              let avgtimediffsec2324 = avgtimediff2324.split(':'); 
              let seconds2324        = (+avgtimediffsec2324[0]) * 60 * 60 + (+avgtimediffsec2324[1]) * 60 + (+avgtimediffsec2324[2]); 
              bysyhr[i].busy_2324    = moment(bysyhr[i].busy_2324,"HH:mm:ss").add(seconds2324,'s').format("HH:mm:ss");
            }
            break;
          default:
            //console.log("default",AHH);
        }
      }
    }
  }
  return bysyhr;
};


///Makeit Succession Report////
Order.makeit_daywise_report= async function makeit_daywise_report(req) { 
  var makeitlog = await Order.makeit_logtime(req);
  var makeitloguser = [];
  if(makeitlog.length>0){ 
    for (let i = 0; i < makeitlog.length; i++) {
      makeitloguser.push(makeitlog[i].makeit_id);
    }
  
    var makeitorders = await Order.makeit_order_count(req,makeitloguser);
    if(makeitlog.length > 0 && makeitorders.length > 0){
      for (let i = 0; i < makeitlog.length; i++) {
        for (let j = 0; j < makeitorders.length; j++) {
          if(makeitlog[i].log_date == makeitorders[j].log_date && makeitlog[i].makeit_id == makeitorders[j].makeit_id){            
            if(makeitlog[i].order_count==0){
              makeitlog[i].order_count= makeitorders[j].order_count;
              makeitlog[i].breakfast_completed = makeitorders[j].breakfast_completed;
              makeitlog[i].lunch_completed     = makeitorders[j].lunch_completed;
              makeitlog[i].dinner_completed    = makeitorders[j].dinner_completed;
              makeitlog[i].breakfast_canceled  = makeitorders[j].breakfast_canceled || 0;
              makeitlog[i].lunch_canceled      = makeitorders[j].lunch_canceled || 0;
              makeitlog[i].dinner_canceled     = makeitorders[j].dinner_canceled || 0;
              makeitlog[i].total_makeit_earnings = makeitorders[j].total_makeit_earnings || 0;
              makeitlog[i].breakfast_total_makeit_earnings = makeitorders[j].breakfast_total_makeit_earnings || 0;
              makeitlog[i].lunch_total_makeit_earnings = makeitorders[j].lunch_total_makeit_earnings || 0;
              makeitlog[i].dinner_total_makeit_earnings = makeitorders[j].dinner_total_makeit_earnings || 0;
              makeitlog[i].cancel_order_count = makeitorders[j].breakfast_canceled + makeitorders[j].lunch_canceled + makeitorders[j].dinner_canceled || 0;
              makeitlog[i].cycle1_soldqty     = makeitorders[j].cycle1_soldqty || 0;
              makeitlog[i].cycle2_soldqty     = makeitorders[j].cycle2_soldqty || 0;
              makeitlog[i].cycle3_soldqty     = makeitorders[j].cycle3_soldqty || 0;

              makeitlog[i].log0809_completed  = makeitorders[j].log0809_completed || 0;
              makeitlog[i].log0910_completed  = makeitorders[j].log0910_completed || 0;
              makeitlog[i].log1011_completed  = makeitorders[j].log1011_completed || 0;
              makeitlog[i].log1112_completed  = makeitorders[j].log1112_completed || 0;
              makeitlog[i].log1213_completed  = makeitorders[j].log1213_completed || 0;
              makeitlog[i].log1314_completed  = makeitorders[j].log1314_completed || 0;
              makeitlog[i].log1415_completed  = makeitorders[j].log1415_completed || 0;
              makeitlog[i].log1516_completed  = makeitorders[j].log1516_completed || 0;
              makeitlog[i].log1617_completed  = makeitorders[j].log1617_completed || 0;
              makeitlog[i].log1718_completed  = makeitorders[j].log1718_completed || 0;
              makeitlog[i].log1819_completed  = makeitorders[j].log1819_completed || 0;
              makeitlog[i].log1920_completed  = makeitorders[j].log1920_completed || 0;
              makeitlog[i].log2021_completed  = makeitorders[j].log2021_completed || 0;
              makeitlog[i].log2122_completed  = makeitorders[j].log2122_completed || 0;
              makeitlog[i].log2223_completed  = makeitorders[j].log2223_completed || 0;
              makeitlog[i].log0809_canceled  = makeitorders[j].log0809_canceled || 0;
              makeitlog[i].log0910_canceled  = makeitorders[j].log0910_canceled || 0;
              makeitlog[i].log1011_canceled  = makeitorders[j].log1011_canceled || 0;
              makeitlog[i].log1112_canceled  = makeitorders[j].log1112_canceled || 0;
              makeitlog[i].log1213_canceled  = makeitorders[j].log1213_canceled || 0;
              makeitlog[i].log1314_canceled  = makeitorders[j].log1314_canceled || 0;
              makeitlog[i].log1415_canceled  = makeitorders[j].log1415_canceled || 0;
              makeitlog[i].log1516_canceled  = makeitorders[j].log1516_canceled || 0;
              makeitlog[i].log1617_canceled  = makeitorders[j].log1617_canceled || 0;
              makeitlog[i].log1718_canceled  = makeitorders[j].log1718_canceled || 0;
              makeitlog[i].log1819_canceled  = makeitorders[j].log1819_canceled || 0;
              makeitlog[i].log1920_canceled  = makeitorders[j].log1920_canceled || 0;
              makeitlog[i].log2021_canceled  = makeitorders[j].log2021_canceled || 0;
              makeitlog[i].log2122_canceled  = makeitorders[j].log2122_canceled || 0;
              makeitlog[i].log2223_canceled  = makeitorders[j].log2223_canceled || 0;
            }        
          }
        }    
      } 
    }
    var liveproducts = await Order.makeit_cycle_product_count(req,makeitloguser);
    if(makeitlog.length > 0 && liveproducts.length > 0){
      for (let i = 0; i < makeitlog.length; i++) {
        for (let j = 0; j < liveproducts.length; j++) {
          if(makeitlog[i].log_date == liveproducts[j].log_date && makeitlog[i].makeit_id == liveproducts[j].makeit_id){
            makeitlog[i].breakfast_count  = liveproducts[j].breakfast_count;
            makeitlog[i].lunch_count      = liveproducts[j].lunch_count;
            makeitlog[i].dinner_count     = liveproducts[j].dinner_count;             
            makeitlog[i].cycle1_qty       = liveproducts[j].cycle1_qty;
            makeitlog[i].cycle2_qty       = liveproducts[j].cycle2_qty; 
            makeitlog[i].cycle3_qty       = liveproducts[j].cycle3_qty;   
            
            makeitlog[i].log0809_count    = liveproducts[j].log0809;  
            makeitlog[i].log0910_count    = liveproducts[j].log0910;  
            makeitlog[i].log1011_count    = liveproducts[j].log1011;  
            makeitlog[i].log1112_count    = liveproducts[j].log1112;  
            makeitlog[i].log1213_count    = liveproducts[j].log1213;  
            makeitlog[i].log1314_count    = liveproducts[j].log1314;  
            makeitlog[i].log1415_count    = liveproducts[j].log1415;  
            makeitlog[i].log1516_count    = liveproducts[j].log1516;  
            makeitlog[i].log1617_count    = liveproducts[j].log1617;  
            makeitlog[i].log1718_count    = liveproducts[j].log1718;  
            makeitlog[i].log1819_count    = liveproducts[j].log1819;  
            makeitlog[i].log1920_count    = liveproducts[j].log1920;  
            makeitlog[i].log2021_count    = liveproducts[j].log2021;  
            makeitlog[i].log2122_count    = liveproducts[j].log2122; 
            makeitlog[i].log2223_count    = liveproducts[j].log2223;  
          }
        }   
      }
    }

    if(makeitlog.length > 0){
      for (let i = 0; i < makeitlog.length; i++) {
        let completeses = 0;
        let cycle1totaltime = "03:00:00";   //(4*constant.logtime_percentage)/100;
        let cycle2totaltime = "03:00:00";   //(4*constant.logtime_percentage)/100;
        let cycle3totaltime = "05:25:00";   //(7*constant.logtime_percentage)/100;  /// && makeitlog[i].logtime
        makeitlog[i].complete_succession_count = completeses;

        if(makeitlog[i].cycle1 !="00:00:00" && makeitlog[i].breakfast_count >= 4){  
          if(makeitlog[i].cycle1 >= cycle1totaltime){
            completeses++;
            makeitlog[i].complete_succession_count = completeses;  
          }else{
            if(makeitlog[i].cycle1_soldqty == makeitlog[i].cycle1_qty){
              completeses++;
              makeitlog[i].complete_succession_count = completeses;
            }
          }
        }
        
        if(makeitlog[i].cycle2 !="00:00:00" && makeitlog[i].lunch_count >= 4){  
          if(makeitlog[i].cycle2 >= cycle2totaltime){
            completeses++;
            makeitlog[i].complete_succession_count = completeses;  
          }else{
            if(makeitlog[i].cycle2_soldqty == makeitlog[i].cycle2_qty){
              completeses++;
              makeitlog[i].complete_succession_count = completeses;
            }
          }
        }
        
        if(makeitlog[i].cycle3 !="00:00:00" && makeitlog[i].dinner_count >= 4){  
          if(makeitlog[i].cycle3 >= cycle3totaltime){
            completeses++;
            makeitlog[i].complete_succession_count = completeses;  
          }else{
            if(makeitlog[i].cycle3_soldqty == makeitlog[i].cycle3_qty){
              completeses++;
              makeitlog[i].complete_succession_count = completeses;
            }
          }
        }
      }
    }

    ////////////////////////////////Kitchen Percentage////////////////////////////////////
    for(let i=0; i<makeitlog.length; i++){
      makeitlog[i].kitchen_percentage = await Order.kitchen_percentage(makeitlog[i].makeit_id);
      //console.log("makeitlog[i].kitchen_percentage --->",makeitlog[i].kitchen_percentage);
    }  
  } 
  return makeitlog; 
};

//////////Get Kitchen Percentage//////////
Order.kitchen_percentage= async function kitchen_percentage(makeit_id){
  if(makeit_id){
    var cycle1_kitchen_percentage = 1;
    var cycle2_kitchen_percentage = 1;
    var cycle3_kitchen_percentage = 1;

    if(cycle1_kitchen_percentage){
      var getmaxquantity = await query("select lph.makeit_id,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage,0 as kitchen_product_count_percentage,0 as kitchen_product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(lph.created_at)>='08:00:00' and time(lph.created_at)<'12:00:00' and lph.makeit_id="+makeit_id+" group by lph.product_id order by lph.product_id ASC");
    
      var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(ord.created_at)>='08:00:00' and time(ord.created_at)<'12:00:00' and ord.orderstatus<=6 and ord.payment_status<2 and ord.makeit_user_id="+makeit_id+" group by oi.productid order by oi.productid ASC");
      //result(null, getsoldquantity);
      var product_count = 0;
      var kitchen_percentage_cycle1= 0;
      if(getmaxquantity.length !=0){
        ////Calculation For Product Count
        
        for(var i=0; i<getmaxquantity.length; i++){
          var quantity=getmaxquantity[i].total_quantity|| 0;
          product_count = parseInt(product_count) + parseInt(quantity);
        }

        for(var i=0; i<getmaxquantity.length; i++){
          for(var j=0; j<getsoldquantity.length; j++){
            if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
              ////Set Soldout Quantity
              getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
              ////Calculation For Product Percentage
              getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100);
              ////Calculation For Kitchen Product Percentage
              getmaxquantity[i].kitchen_product_count_percentage = ((getmaxquantity[i].total_quantity/product_count)*100);
              ////Calculation For Kitchen Percentage
              getmaxquantity[i].kitchen_product_percentage = (getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
              ////Calcualtion For kitchen percentage
              kitchen_percentage_cycle1 = kitchen_percentage_cycle1+(getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
            }
          }
        }
      }else{ }
    }

    if(cycle2_kitchen_percentage){
      var getmaxquantity = await query("select lph.makeit_id,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage,0 as kitchen_product_count_percentage,0 as kitchen_product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(lph.created_at)>='12:00:00' and time(lph.created_at)<'16:00:00' and lph.makeit_id="+makeit_id+" group by lph.product_id order by lph.product_id ASC");
    
      var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(ord.created_at)>='12:00:00' and time(ord.created_at)<'16:00:00' and ord.orderstatus<=6 and ord.payment_status<2 and ord.makeit_user_id="+makeit_id+" group by oi.productid order by oi.productid ASC");
      //result(null, getsoldquantity);
      var product_count = 0;
      var kitchen_percentage_cycle2= 0;
      if(getmaxquantity.length !=0){
        ////Calculation For Product Count
        
        for(var i=0; i<getmaxquantity.length; i++){
          var quantity=getmaxquantity[i].total_quantity|| 0;
          product_count = parseInt(product_count) + parseInt(quantity);
        }

        for(var i=0; i<getmaxquantity.length; i++){
          for(var j=0; j<getsoldquantity.length; j++){
            if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
              ////Set Soldout Quantity
              getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
              ////Calculation For Product Percentage
              getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100);
              ////Calculation For Kitchen Product Percentage
              getmaxquantity[i].kitchen_product_count_percentage = ((getmaxquantity[i].total_quantity/product_count)*100);
              ////Calculation For Kitchen Percentage
              getmaxquantity[i].kitchen_product_percentage = (getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
              ////Calcualtion For kitchen percentage
              kitchen_percentage_cycle2 = kitchen_percentage_cycle2+(getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
            }
          }
        }
      }else{ }
    }

    if(cycle3_kitchen_percentage){
      var getmaxquantity = await query("select lph.makeit_id,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage,0 as kitchen_product_count_percentage,0 as kitchen_product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(lph.created_at)>='16:00:00' and time(lph.created_at)<'23:00:00' and lph.makeit_id="+makeit_id+" group by lph.product_id order by lph.product_id ASC");
    
      var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and ord.orderstatus<=6 and time(ord.created_at)>='16:00:00' and time(ord.created_at)<'23:00:00' and ord.payment_status<2 and ord.makeit_user_id="+makeit_id+" group by oi.productid order by oi.productid ASC");
      //result(null, getsoldquantity);
      var product_count = 0;
      var kitchen_percentage_cycle3= 0;
      if(getmaxquantity.length !=0){
        ////Calculation For Product Count
        
        for(var i=0; i<getmaxquantity.length; i++){
          var quantity=getmaxquantity[i].total_quantity|| 0;
          product_count = parseInt(product_count) + parseInt(quantity);
        }

        for(var i=0; i<getmaxquantity.length; i++){
          for(var j=0; j<getsoldquantity.length; j++){
            if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
              ////Set Soldout Quantity
              getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
              ////Calculation For Product Percentage
              getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100);
              ////Calculation For Kitchen Product Percentage
              getmaxquantity[i].kitchen_product_count_percentage = ((getmaxquantity[i].total_quantity/product_count)*100);
              ////Calculation For Kitchen Percentage
              getmaxquantity[i].kitchen_product_percentage = (getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
              ////Calcualtion For kitchen percentage
              kitchen_percentage_cycle3 = kitchen_percentage_cycle3+(getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
            }
          }
        }
      }else{ }
    }
    return (kitchen_percentage_cycle1+kitchen_percentage_cycle2+kitchen_percentage_cycle3)/3;

  }else{
    return 0;
  }
};
////Makeit Order Count///////
Order.makeit_order_count = async function makeit_order_count(req,makeitloguser) { 
  ////Get sold quantity/////////
  var ordercountquery = "select date(ord.created_at) as log_date,ord.makeit_user_id as makeit_id, COUNT(CASE WHEN ord.orderstatus=6 THEN ord.orderid END) as order_count, SUM(CASE WHEN ord.orderstatus=6 THEN ord.makeit_earnings END) as total_makeit_earnings, COUNT(CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<'12:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as breakfast_completed, COUNT(CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<'16:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as lunch_completed, COUNT(CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as dinner_completed, SUM(CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<'12:00:00' AND ord.orderstatus=6 THEN ord.makeit_earnings END) as breakfast_total_makeit_earnings, SUM(CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<'16:00:00' AND ord.orderstatus=6 THEN ord.makeit_earnings END) as lunch_total_makeit_earnings, SUM(CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=6 THEN ord.makeit_earnings END) as dinner_total_makeit_earnings, COUNT(CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<'12:00:00' AND ord.orderstatus=7 AND ord.cancel_by=2 THEN ord.orderid END) as breakfast_canceled, COUNT(CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<'16:00:00' AND ord.orderstatus=7 AND ord.cancel_by=2 THEN ord.orderid END) as lunch_canceled, COUNT(CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=7 AND ord.cancel_by=2 THEN ord.orderid END) as dinner_canceled, CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<'12:00:00' AND ord.orderstatus=6 THEN SUM(oi.quantity) END as cycle1_soldqty, CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<'16:00:00' AND ord.orderstatus=6 THEN SUM(oi.quantity) END as cycle2_soldqty, CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=6 THEN SUM(oi.quantity) END as cycle3_soldqty,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<='09:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log0809_completed,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' AND time(ord.created_at)<='10:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log0910_completed,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' AND time(ord.created_at)<='11:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1011_completed,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' AND time(ord.created_at)<='12:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1112_completed, COUNT(CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<='13:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1213_completed,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' AND time(ord.created_at)<='14:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1314_completed,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' AND time(ord.created_at)<='15:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1415_completed,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' AND time(ord.created_at)<='16:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1516_completed,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='17:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1617_completed,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' AND time(ord.created_at)<='18:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1718_completed,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' AND time(ord.created_at)<='19:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1819_completed,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' AND time(ord.created_at)<='20:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log1920_completed,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' AND time(ord.created_at)<='21:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log2021_completed,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' AND time(ord.created_at)<='22:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log2122_completed,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=6 THEN ord.orderid END) as log2223_completed,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<='09:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log0809_canceled,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' AND time(ord.created_at)<='10:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log0910_canceled,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' AND time(ord.created_at)<='11:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1011_canceled,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' AND time(ord.created_at)<='12:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1112_canceled,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<='13:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1213_canceled,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' AND time(ord.created_at)<='14:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1314_canceled,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' AND time(ord.created_at)<='15:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1415_canceled,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' AND time(ord.created_at)<='16:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1516_canceled,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='17:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1617_canceled,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' AND time(ord.created_at)<='18:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1718_canceled,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' AND time(ord.created_at)<='19:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1819_canceled,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' AND time(ord.created_at)<='20:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log1920_canceled,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' AND time(ord.created_at)<='21:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log2021_canceled,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' AND time(ord.created_at)<='22:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log2122_canceled,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=7 THEN ord.orderid END) as log2223_canceled from Orders as ord left join OrderItem as oi on oi.orderid= ord.orderid where ord.makeit_user_id IN("+makeitloguser+") and date(ord.created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) and ord.makeit_user_id!=0 and (ord.orderstatus=6 or ord.orderstatus=7) group by ord.makeit_user_id,  date(ord.created_at) order by ord.makeit_user_id,date(ord.created_at)"
  var ordercount = await query(ordercountquery);

  return ordercount;
};

////Makeit Logtime perday///////////
Order.makeit_logtime = async function makeit_logtime(req) {  
  ///Get Moveit Users list///////
  var makeitlogusersquery = "select makeit_id,date(created_at) as log_date from Makeit_Timelog where date(created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) group by makeit_id order by makeit_id";
  var makeitlogusers = await query(makeitlogusersquery);
  ///Get Moveit Logs///////
  var makeitlogquery = "select date(created_at) as log_date,time(created_at) as logtime,type,makeit_id from Makeit_Timelog where date(created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) order by date(created_at),makeit_id";
  var makeitlog = await query(makeitlogquery);  
  
  ///console.log("Kloop ==>",makeitlog);
  for (let k = 0; k < makeitlogusers.length; k++) {
    var starttime  = '';
    var endtime    = '';
    var cycle_count = 0;
    ///////cycle-1/////////
    var starttimecycle1  = '';
    var endtimecycle1    = '';
    var avgtimediffcycle1    = '';
    var avgtimediffseccycle1 = '';
    var secondscycle1    = '';
    var avgtimecycle1    = '00:00:00';
    ///////cycle-2/////////
    var starttimecycle2  = '';
    var endtimecycle2   = '';
    var avgtimediffcycle2    = '';
    var avgtimediffseccycle2 = '';
    var secondscycle2    = '';
    var avgtimecycle2    = '00:00:00';
    ///////cycle-3/////////
    var starttimecycle3  = '';
    var endtimecycle3   = '';
    var avgtimediffcycle3    = '';
    var avgtimediffseccycle3 = '';
    var secondscycle3    = '';
    var avgtimecycle3    = '00:00:00';    

    /////// 1 hr variable declaration /////////////
    var hrstarttime = '';
    var hrendtime   = '';
    /////// log0809/////////
    var starttime0809     = '';
    var endtime0809       = '';
    var avgtimediff0809   = '';
    var avgtimediffsec0809 = '';
    var seconds0809       = '';
    var avgtime0809       = '00:00:00';
    /////// log0910/////////
    var starttime0910     = '';
    var endtime0910       = '';
    var avgtimediff0910   = '';
    var avgtimediffsec0910 = '';
    var seconds0910       = '';
    var avgtime0910       = '00:00:00';
    /////// log1011/////////
    var starttime1011     = '';
    var endtime1011       = '';
    var avgtimediff1011  = '';
    var avgtimediffsec1011 = '';
    var seconds1011       = '';
    var avgtime1011       = '00:00:00';
    /////// log1112/////////
    var starttime1112     = '';
    var endtime1112       = '';
    var avgtimediff1112  = '';
    var avgtimediffsec1112 = '';
    var seconds1112       = '';
    var avgtime1112       = '00:00:00';
    /////// log1213/////////
    var starttime1213     = '';
    var endtime1213       = '';
    var avgtimediff1213  = '';
    var avgtimediffsec1213 = '';
    var seconds1213       = '';
    var avgtime1213       = '00:00:00';
    /////// log1314/////////
    var starttime1314     = '';
    var endtime1314       = '';
    var avgtimediff1314  = '';
    var avgtimediffsec1314 = '';
    var seconds1314       = '';
    var avgtime1314       = '00:00:00';
    /////// log1415/////////
    var starttime1415     = '';
    var endtime1415       = '';
    var avgtimediff1415  = '';
    var avgtimediffsec1415 = '';
    var seconds1415       = '';
    var avgtime1415       = '00:00:00';
    /////// log1516/////////
    var starttime1516     = '';
    var endtime1516       = '';
    var avgtimediff1516  = '';
    var avgtimediffsec1516 = '';
    var seconds1516       = '';
    var avgtime1516       = '00:00:00';
    /////// log1617/////////
    var starttime1617     = '';
    var endtime1617       = '';
    var avgtimediff1617  = '';
    var avgtimediffsec1617 = '';
    var seconds1617       = '';
    var avgtime1617       = '00:00:00';
    /////// log1718/////////
    var starttime1718     = '';
    var endtime1718       = '';
    var avgtimediff1718  = '';
    var avgtimediffsec1718 = '';
    var seconds1718       = '';
    var avgtime1718       = '00:00:00';
    /////// log1819/////////
    var starttime1819     = '';
    var endtime1819       = '';
    var avgtimediff1819  = '';
    var avgtimediffsec1819 = '';
    var seconds1819       = '';
    var avgtime1819       = '00:00:00';
    /////// log1819/////////
    var starttime1819     = '';
    var endtime1819       = '';
    var avgtimediff1819  = '';
    var avgtimediffsec1819 = '';
    var seconds1819       = '';
    var avgtime1819       = '00:00:00';
    /////// log1920/////////
    var starttime1920     = '';
    var endtime1920       = '';
    var avgtimediff1920  = '';
    var avgtimediffsec1920 = '';
    var seconds1920       = '';
    var avgtime1920       = '00:00:00';
    /////// log2021/////////
    var starttime2021     = '';
    var endtime2021       = '';
    var avgtimediff2021  = '';
    var avgtimediffsec2021 = '';
    var seconds2021       = '';
    var avgtime2021       = '00:00:00';
    /////// log2122/////////
     var starttime2122     = '';
     var endtime2122       = '';
     var avgtimediff2122  = '';
     var avgtimediffsec2122 = '';
     var seconds2122       = '';
     var avgtime2122       = '00:00:00';
    /////// log2223/////////
    var starttime2223     = '';
    var endtime2223       = '';
    var avgtimediff2223  = '';
    var avgtimediffsec2223 = '';
    var seconds2223       = '';
    var avgtime2223       = '00:00:00';
    //////////////////////////////////////////////

    for (let l = 0; l < makeitlog.length; l++) { 
      if(makeitlogusers[k].makeit_id == makeitlog[l].makeit_id && makeitlogusers[k].log_date == makeitlog[l].log_date){ 
        if(makeitlog[l].type==1){
          starttime = makeitlog[l].logtime;  
          if(starttime >= "08:00:00" && starttime < "12:00:00"){
            starttimecycle1 = starttime;
          }else if(starttime >= "12:00:00" && starttime < "16:00:00"){
            starttimecycle2 = starttime;
          }else if(starttime >= "16:00:00" && starttime < "23:00:00"){
            starttimecycle3 = starttime;
          }
          
          //////////1 hr type-1/////////
          hrstarttime = makeitlog[l].logtime;
          if(hrstarttime >= "08:00:00" && hrstarttime < "09:00:00"){ starttime0809 = hrstarttime; }
          else if(hrstarttime >= "09:00:00" && hrstarttime < "10:00:00"){ starttime0910 = hrstarttime; }
          else if(hrstarttime >= "10:00:00" && hrstarttime < "11:00:00"){ starttime1011 = hrstarttime; }
          else if(hrstarttime >= "11:00:00" && hrstarttime < "12:00:00"){ starttime1112 = hrstarttime; }
          else if(hrstarttime >= "12:00:00" && hrstarttime < "13:00:00"){ starttime1213 = hrstarttime; }
          else if(hrstarttime >= "13:00:00" && hrstarttime < "14:00:00"){ starttime1314 = hrstarttime; }
          else if(hrstarttime >= "14:00:00" && hrstarttime < "15:00:00"){ starttime1415 = hrstarttime; }
          else if(hrstarttime >= "15:00:00" && hrstarttime < "16:00:00"){ starttime1516 = hrstarttime; }
          else if(hrstarttime >= "16:00:00" && hrstarttime < "17:00:00"){ starttime1617 = hrstarttime; }
          else if(hrstarttime >= "17:00:00" && hrstarttime < "18:00:00"){ starttime1718 = hrstarttime; }
          else if(hrstarttime >= "18:00:00" && hrstarttime < "19:00:00"){ starttime1819 = hrstarttime; }
          else if(hrstarttime >= "19:00:00" && hrstarttime < "20:00:00"){ starttime1920 = hrstarttime; }
          else if(hrstarttime >= "20:00:00" && hrstarttime < "21:00:00"){ starttime2021 = hrstarttime; }
          else if(hrstarttime >= "21:00:00" && hrstarttime < "22:00:00"){ starttime2122 = hrstarttime; }
          else if(hrstarttime >= "22:00:00" && hrstarttime < "23:00:00"){ starttime2223 = hrstarttime; }
          //////////////////////////////
        }else if(makeitlog[l].type==0){
          endtime = makeitlog[l].logtime;
          if(endtime >= "08:00:00" && endtime < "12:00:00"){
            endtimecycle1 = endtime;
          }else if(endtime >= "12:00:00" && endtime < "16:00:00"){
            endtimecycle2 = endtime;
          }else if(endtime >= "16:00:00" && endtime < "23:00:00"){
            endtimecycle3 = endtime;
          } 

          //////////1 hr type-2/////////
          hrendtime = makeitlog[l].logtime;
          if(hrendtime >= "08:00:00" && hrendtime < "09:00:00"){ endtime0809 = hrendtime; }
          else if(hrendtime >= "09:00:00" && hrendtime < "10:00:00"){ endtime0910 = hrendtime; }
          else if(hrendtime >= "10:00:00" && hrendtime < "11:00:00"){ endtime1011 = hrendtime; }
          else if(hrendtime >= "11:00:00" && hrendtime < "12:00:00"){ endtime1112 = hrendtime; }
          else if(hrendtime >= "12:00:00" && hrendtime < "13:00:00"){ endtime1213 = hrendtime; }
          else if(hrendtime >= "13:00:00" && hrendtime < "14:00:00"){ endtime1314 = hrendtime; }
          else if(hrendtime >= "14:00:00" && hrendtime < "15:00:00"){ endtime1415 = hrendtime; }
          else if(hrendtime >= "15:00:00" && hrendtime < "16:00:00"){ endtime1516 = hrendtime; }
          else if(hrendtime >= "16:00:00" && hrendtime < "17:00:00"){ endtime1617 = hrendtime; }
          else if(hrendtime >= "17:00:00" && hrendtime < "18:00:00"){ endtime1718 = hrendtime; }
          else if(hrendtime >= "18:00:00" && hrendtime < "19:00:00"){ endtime1819 = hrendtime; }
          else if(hrendtime >= "19:00:00" && hrendtime < "20:00:00"){ endtime1920 = hrendtime; }
          else if(hrendtime >= "20:00:00" && hrendtime < "21:00:00"){ endtime2021 = hrendtime; }
          else if(hrendtime >= "21:00:00" && hrendtime < "22:00:00"){ endtime2122 = hrendtime; }
          else if(hrendtime >= "22:00:00" && hrendtime < "23:00:00"){ endtime2223 = hrendtime; }
          //////////////////////////////
        }
        
        if(starttimecycle1 !='' && endtimecycle1 !=''){
          var avgtimediffcycle1    = moment.utc(moment(endtimecycle1, "HH:mm:ss").diff(moment(starttimecycle1, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffseccycle1 = avgtimediffcycle1.split(':'); 
          var secondscycle1        = (+avgtimediffseccycle1[0]) * 60 * 60 + (+avgtimediffseccycle1[1]) * 60 + (+avgtimediffseccycle1[2]); 
          avgtimecycle1        = moment(avgtimecycle1,"HH:mm:ss").add(secondscycle1,'s').format("HH:mm:ss");
          starttimecycle1 = '';
          endtimecycle1   = '';
        }

        if(starttimecycle2 !='' && endtimecycle2 !=''){
          var avgtimediffcycle2    = moment.utc(moment(endtimecycle2, "HH:mm:ss").diff(moment(starttimecycle2, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffseccycle2 = avgtimediffcycle2.split(':'); 
          var secondscycle2        = (+avgtimediffseccycle2[0]) * 60 * 60 + (+avgtimediffseccycle2[1]) * 60 + (+avgtimediffseccycle2[2]); 
          avgtimecycle2        = moment(avgtimecycle2,"HH:mm:ss").add(secondscycle2,'s').format("HH:mm:ss");
          starttimecycle2   = '';
          endtimecycle1e2   = '';
        }

        if(starttimecycle3 !='' && endtimecycle3 !=''){
         var avgtimediffcycle3    = moment.utc(moment(endtimecycle3, "HH:mm:ss").diff(moment(starttimecycle3, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffseccycle3 = avgtimediffcycle3.split(':'); 
          var secondscycle3        = (+avgtimediffseccycle3[0]) * 60 * 60 + (+avgtimediffseccycle3[1]) * 60 + (+avgtimediffseccycle3[2]); 
          avgtimecycle3        = moment(avgtimecycle3,"HH:mm:ss").add(secondscycle3,'s').format("HH:mm:ss");
          starttimecycle3 = '';
          endtimecycle3   = '';
        }
        starttime ='';
        endtime ='';

        ///////////////////////////// 1hr Log /////////////////////
        if(starttime0809 !='' && endtime0809 !=''){
          var avgtimediff0809    = moment.utc(moment(endtime0809, "HH:mm:ss").diff(moment(starttime0809, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec0809 = avgtimediff0809.split(':'); 
          var seconds0809        = (+avgtimediffsec0809[0]) * 60 * 60 + (+avgtimediffsec0809[1]) * 60 + (+avgtimediffsec0809[2]); 
          avgtime0809        = moment(avgtime0809,"HH:mm:ss").add(seconds0809,'s').format("HH:mm:ss");
          starttime0809 = '';
          endtime0809   = '';
        }
        if(starttime0910 !='' && endtime0910 !=''){
          var avgtimediff0910    = moment.utc(moment(endtime0910, "HH:mm:ss").diff(moment(starttime0910, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec0910 = avgtimediff0910.split(':'); 
          var seconds0910        = (+avgtimediffsec0910[0]) * 60 * 60 + (+avgtimediffsec0910[1]) * 60 + (+avgtimediffsec0910[2]); 
          avgtime0910        = moment(avgtime0910,"HH:mm:ss").add(seconds0910,'s').format("HH:mm:ss");
          starttime0910 = '';
          endtime0910   = '';
        }
        if(starttime1011 !='' && endtime1011 !=''){
          var avgtimediff1011    = moment.utc(moment(endtime1011, "HH:mm:ss").diff(moment(starttime1011, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1011 = avgtimediff1011.split(':'); 
          var seconds1011        = (+avgtimediffsec1011[0]) * 60 * 60 + (+avgtimediffsec1011[1]) * 60 + (+avgtimediffsec1011[2]); 
          avgtime1011        = moment(avgtime1011,"HH:mm:ss").add(seconds1011,'s').format("HH:mm:ss");
          starttime1011 = '';
          endtime1011   = '';
        }
        if(starttime1112 !='' && endtime1112 !=''){
          var avgtimediff1112    = moment.utc(moment(endtime1112, "HH:mm:ss").diff(moment(starttime1112, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1112 = avgtimediff1112.split(':'); 
          var seconds1112        = (+avgtimediffsec1112[0]) * 60 * 60 + (+avgtimediffsec1112[1]) * 60 + (+avgtimediffsec1112[2]); 
          avgtime1112        = moment(avgtime1112,"HH:mm:ss").add(seconds1112,'s').format("HH:mm:ss");
          starttime1112 = '';
          endtime1112   = '';
        }
        if(starttime1213 !='' && endtime1213 !=''){
          var avgtimediff1213    = moment.utc(moment(endtime1213, "HH:mm:ss").diff(moment(starttime1213, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1213 = avgtimediff1213.split(':'); 
          var seconds1213        = (+avgtimediffsec1213[0]) * 60 * 60 + (+avgtimediffsec1213[1]) * 60 + (+avgtimediffsec1213[2]); 
          avgtime1213        = moment(avgtime1213,"HH:mm:ss").add(seconds1213,'s').format("HH:mm:ss");
          starttime1213 = '';
          endtime1213   = '';
        }
        if(starttime1314 !='' && endtime1314 !=''){
          var avgtimediff1314    = moment.utc(moment(endtime1314, "HH:mm:ss").diff(moment(starttime1314, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1314 = avgtimediff1314.split(':'); 
          var seconds1314        = (+avgtimediffsec1314[0]) * 60 * 60 + (+avgtimediffsec1314[1]) * 60 + (+avgtimediffsec1314[2]); 
          avgtime1314        = moment(avgtime1314,"HH:mm:ss").add(seconds1314,'s').format("HH:mm:ss");
          starttime1314 = '';
          endtime1314   = '';
        }
        if(starttime1415 !='' && endtime1415 !=''){
          var avgtimediff1415    = moment.utc(moment(endtime1415, "HH:mm:ss").diff(moment(starttime1415, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1415 = avgtimediff1415.split(':'); 
          var seconds1415        = (+avgtimediffsec1415[0]) * 60 * 60 + (+avgtimediffsec1415[1]) * 60 + (+avgtimediffsec1415[2]); 
          avgtime1415        = moment(avgtime1415,"HH:mm:ss").add(seconds1415,'s').format("HH:mm:ss");
          starttime1415 = '';
          endtime1415   = '';
        }
        if(starttime1516 !='' && endtime1516 !=''){
          var avgtimediff1516    = moment.utc(moment(endtime1516, "HH:mm:ss").diff(moment(starttime1516, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1516 = avgtimediff1516.split(':'); 
          var seconds1516        = (+avgtimediffsec1516[0]) * 60 * 60 + (+avgtimediffsec1516[1]) * 60 + (+avgtimediffsec1516[2]); 
          avgtime1516        = moment(avgtime1516,"HH:mm:ss").add(seconds1516,'s').format("HH:mm:ss");
          starttime1516 = '';
          endtime1516   = '';
        }
        if(starttime1617 !='' && endtime1617 !=''){
          var avgtimediff1617    = moment.utc(moment(endtime1617, "HH:mm:ss").diff(moment(starttime1617, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1617 = avgtimediff1617.split(':'); 
          var seconds1617        = (+avgtimediffsec1617[0]) * 60 * 60 + (+avgtimediffsec1617[1]) * 60 + (+avgtimediffsec1617[2]); 
          avgtime1617        = moment(avgtime1617,"HH:mm:ss").add(seconds1617,'s').format("HH:mm:ss");
          starttime1617 = '';
          endtime1617   = '';
        }
        if(starttime1718 !='' && endtime1718 !=''){
          var avgtimediff1718    = moment.utc(moment(endtime1718, "HH:mm:ss").diff(moment(starttime1718, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1718 = avgtimediff1718.split(':'); 
          var seconds1718        = (+avgtimediffsec1718[0]) * 60 * 60 + (+avgtimediffsec1718[1]) * 60 + (+avgtimediffsec1718[2]); 
          avgtime1718        = moment(avgtime1718,"HH:mm:ss").add(seconds1718,'s').format("HH:mm:ss");
          starttime1718 = '';
          endtime1718   = '';
        }
        if(starttime1819 !='' && endtime1819 !=''){
          var avgtimediff1819    = moment.utc(moment(endtime1819, "HH:mm:ss").diff(moment(starttime1819, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1819 = avgtimediff1819.split(':'); 
          var seconds1819        = (+avgtimediffsec1819[0]) * 60 * 60 + (+avgtimediffsec1819[1]) * 60 + (+avgtimediffsec1819[2]); 
          avgtime1819        = moment(avgtime1819,"HH:mm:ss").add(seconds1819,'s').format("HH:mm:ss");
          starttime1819 = '';
          endtime1819   = '';
        }
        if(starttime1920 !='' && endtime1920 !=''){
          var avgtimediff1920    = moment.utc(moment(endtime1920, "HH:mm:ss").diff(moment(starttime1920, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec1920 = avgtimediff1920.split(':'); 
          var seconds1920        = (+avgtimediffsec1920[0]) * 60 * 60 + (+avgtimediffsec1920[1]) * 60 + (+avgtimediffsec1920[2]); 
          avgtime1920        = moment(avgtime1920,"HH:mm:ss").add(seconds1920,'s').format("HH:mm:ss");
          starttime1920 = '';
          endtime1920   = '';
        }
        if(starttime2021 !='' && endtime2021 !=''){
          var avgtimediff2021    = moment.utc(moment(endtime2021, "HH:mm:ss").diff(moment(starttime2021, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec2021 = avgtimediff2021.split(':'); 
          var seconds2021        = (+avgtimediffsec2021[0]) * 60 * 60 + (+avgtimediffsec2021[1]) * 60 + (+avgtimediffsec2021[2]); 
          avgtime2021        = moment(avgtime2021,"HH:mm:ss").add(seconds2021,'s').format("HH:mm:ss");
          starttime2021 = '';
          endtime2021   = '';
        }
        if(starttime2122 !='' && endtime2122 !=''){
          var avgtimediff2122    = moment.utc(moment(endtime2122, "HH:mm:ss").diff(moment(starttime2122, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec2122 = avgtimediff2122.split(':'); 
          var seconds2122        = (+avgtimediffsec2122[0]) * 60 * 60 + (+avgtimediffsec2122[1]) * 60 + (+avgtimediffsec2122[2]); 
          avgtime2122        = moment(avgtime2122,"HH:mm:ss").add(seconds2122,'s').format("HH:mm:ss");
          starttime2122 = '';
          endtime2122   = '';
        }
        if(starttime2223 !='' && endtime2223 !=''){
          var avgtimediff2223    = moment.utc(moment(endtime2223, "HH:mm:ss").diff(moment(starttime2223, "HH:mm:ss"))).format("HH:mm:ss");
          var avgtimediffsec2223 = avgtimediff2223.split(':'); 
          var seconds2223        = (+avgtimediffsec2223[0]) * 60 * 60 + (+avgtimediffsec2223[1]) * 60 + (+avgtimediffsec2223[2]); 
          avgtime2223        = moment(avgtime2223,"HH:mm:ss").add(seconds2223,'s').format("HH:mm:ss");
          starttime2223 = '';
          endtime2223   = '';
        }

        hrstarttime ='';
        hrendtime ='';
        ///////////////////////////////////////////////////////////
      } 
    }     
    makeitlogusers[k].cycle1 = avgtimecycle1;
    makeitlogusers[k].cycle2 = avgtimecycle2;
    makeitlogusers[k].cycle3 = avgtimecycle3;

    //////////// 1hr data//////////////
    makeitlogusers[k].log0809 = avgtime0809;
    makeitlogusers[k].log0910 = avgtime0910;
    makeitlogusers[k].log1011 = avgtime1011;
    makeitlogusers[k].log1112 = avgtime1112;
    makeitlogusers[k].log1213 = avgtime1213;
    makeitlogusers[k].log1314 = avgtime1314;
    makeitlogusers[k].log1415 = avgtime1415;
    makeitlogusers[k].log1516 = avgtime1516;
    makeitlogusers[k].log1617 = avgtime1617;
    makeitlogusers[k].log1718 = avgtime1718;
    makeitlogusers[k].log1819 = avgtime1819;
    makeitlogusers[k].log1920 = avgtime1920;
    makeitlogusers[k].log2021 = avgtime2021;
    makeitlogusers[k].log2122 = avgtime2122;
    makeitlogusers[k].log2223 = avgtime2223;
    //////////////////////////////////

    if(avgtimecycle1 != '00:00:00'){
      cycle_count++;
    }
    if(avgtimecycle2 != '00:00:00'){
      cycle_count++;
    }
    if(avgtimecycle3 != '00:00:00'){
      cycle_count++;
    }
    makeitlogusers[k].cycle_count = cycle_count;

    makeitlogusers[k].logtime ='00:00:00';
    var cycle1 = makeitlogusers[k].cycle1.split(':'); 
    var cycle1sec  = (+cycle1[0]) * 60 * 60 + (+cycle1[1]) * 60 + (+cycle1[2]); 
    makeitlogusers[k].logtime =  moment(makeitlogusers[k].logtime,"HH:mm:ss").add(cycle1sec,'s').format("HH:mm:ss");

    var cycle2 = makeitlogusers[k].cycle2.split(':'); 
    var cycle2sec  = (+cycle2[0]) * 60 * 60 + (+cycle2[1]) * 60 + (+cycle2[2]); 
    makeitlogusers[k].logtime =  moment(makeitlogusers[k].logtime,"HH:mm:ss").add(cycle2sec,'s').format("HH:mm:ss");

    var cycle3 = makeitlogusers[k].cycle3.split(':'); 
    var cycle3sec  = (+cycle3[0]) * 60 * 60 + (+cycle3[1]) * 60 + (+cycle3[2]); 
    makeitlogusers[k].logtime =  moment(makeitlogusers[k].logtime,"HH:mm:ss").add(cycle3sec,'s').format("HH:mm:ss");

    ///////////////////
    makeitlogusers[k].order_count         = 0;
    makeitlogusers[k].breakfast_completed = 0;
    makeitlogusers[k].lunch_completed     = 0;
    makeitlogusers[k].dinner_completed    = 0;
    makeitlogusers[k].breakfast_canceled  = 0;
    makeitlogusers[k].lunch_canceled      = 0;
    makeitlogusers[k].dinner_canceled     = 0;
    makeitlogusers[k].breakfast_count     = 0;
    makeitlogusers[k].lunch_count         = 0;
    makeitlogusers[k].dinner_count        = 0;
    makeitlogusers[k].total_makeit_earnings = 0;
    makeitlogusers[k].breakfast_total_makeit_earnings = 0;
    makeitlogusers[k].lunch_total_makeit_earnings = 0;
    makeitlogusers[k].dinner_total_makeit_earnings = 0;
    makeitlogusers[k].cancel_order_count = 0;
    makeitlogusers[k].complete_succession_count = 0;
    makeitlogusers[k].cycle1_soldqty = 0;
    makeitlogusers[k].cycle2_soldqty = 0;
    makeitlogusers[k].cycle3_soldqty = 0;
    makeitlogusers[k].kitchen_percentage = 0;

    makeitlogusers[k].log0809_count = 0;
    makeitlogusers[k].log0910_count = 0;
    makeitlogusers[k].log1011_count = 0;
    makeitlogusers[k].log1112_count = 0;
    makeitlogusers[k].log1213_count = 0;
    makeitlogusers[k].log1314_count = 0;
    makeitlogusers[k].log1415_count = 0;
    makeitlogusers[k].log1516_count = 0;
    makeitlogusers[k].log1617_count = 0;
    makeitlogusers[k].log1718_count = 0;
    makeitlogusers[k].log1819_count = 0;
    makeitlogusers[k].log1920_count = 0;
    makeitlogusers[k].log2021_count = 0;
    makeitlogusers[k].log2122_count = 0;
    makeitlogusers[k].log2223_count = 0;

    makeitlogusers[k].log0809_completed = 0;
    makeitlogusers[k].log0910_completed = 0;
    makeitlogusers[k].log1011_completed = 0;
    makeitlogusers[k].log1112_completed = 0;
    makeitlogusers[k].log1213_completed = 0;
    makeitlogusers[k].log1314_completed = 0;
    makeitlogusers[k].log1415_completed = 0;
    makeitlogusers[k].log1516_completed = 0;
    makeitlogusers[k].log1617_completed = 0;
    makeitlogusers[k].log1718_completed = 0;
    makeitlogusers[k].log1819_completed = 0;
    makeitlogusers[k].log1920_completed = 0;
    makeitlogusers[k].log2021_completed = 0;
    makeitlogusers[k].log2122_completed = 0;
    makeitlogusers[k].log2223_completed = 0;

    makeitlogusers[k].log0809_canceled = 0;
    makeitlogusers[k].log0910_canceled = 0;
    makeitlogusers[k].log1011_canceled = 0;
    makeitlogusers[k].log1112_canceled = 0;
    makeitlogusers[k].log1213_canceled = 0;
    makeitlogusers[k].log1314_canceled = 0;
    makeitlogusers[k].log1415_canceled = 0;
    makeitlogusers[k].log1516_canceled = 0;
    makeitlogusers[k].log1617_canceled = 0;
    makeitlogusers[k].log1718_canceled = 0;
    makeitlogusers[k].log1819_canceled = 0;
    makeitlogusers[k].log1920_canceled = 0;
    makeitlogusers[k].log2021_canceled = 0;
    makeitlogusers[k].log2122_canceled = 0;
    makeitlogusers[k].log2223_canceled = 0;
  } 
  return makeitlogusers;
};

////Makeit Cycle Based Product Count///////
Order.makeit_cycle_product_count = async function makeit_cycle_product_count(req,makeitloguser) {
  var liveproductcountquery = "select date(created_at) as log_date,makeit_id, COUNT(distinct CASE WHEN time(created_at)>='08:00:00' AND time(created_at)<'12:00:00' THEN (product_id) END) as breakfast_count, COUNT(distinct CASE WHEN time(created_at)>='12:00:00' AND time(created_at)<'16:00:00' THEN (product_id) END) as lunch_count, COUNT(distinct CASE WHEN time(created_at)>='16:00:00' AND time(created_at)<='23:00:00' THEN (product_id) END) as dinner_count,COUNT(distinct CASE WHEN time(created_at)>='08:00:00' AND time(created_at)<'09:00:00' THEN (product_id) END) as log0809,COUNT(distinct CASE WHEN time(created_at)>='09:00:00' AND time(created_at)<'10:00:00' THEN (product_id) END) as log0910,COUNT(distinct CASE WHEN time(created_at)>='10:00:00' AND time(created_at)<'11:00:00' THEN (product_id) END) as log1011,COUNT(distinct CASE WHEN time(created_at)>='11:00:00' AND time(created_at)<'12:00:00' THEN (product_id) END) as log1112,COUNT(distinct CASE WHEN time(created_at)>='12:00:00' AND time(created_at)<'13:00:00' THEN (product_id) END) as log1213,COUNT(distinct CASE WHEN time(created_at)>='13:00:00' AND time(created_at)<'14:00:00' THEN (product_id) END) as log1314,COUNT(distinct CASE WHEN time(created_at)>='14:00:00' AND time(created_at)<'15:00:00' THEN (product_id) END) as log1415,COUNT(distinct CASE WHEN time(created_at)>='15:00:00' AND time(created_at)<'16:00:00' THEN (product_id) END) as log1516,COUNT(distinct CASE WHEN time(created_at)>='16:00:00' AND time(created_at)<'17:00:00' THEN (product_id) END) as log1617,COUNT(distinct CASE WHEN time(created_at)>='17:00:00' AND time(created_at)<'18:00:00' THEN (product_id) END) as log1718,COUNT(distinct CASE WHEN time(created_at)>='18:00:00' AND time(created_at)<'19:00:00' THEN (product_id) END) as log1819,COUNT(distinct CASE WHEN time(created_at)>='19:00:00' AND time(created_at)<'20:00:00' THEN (product_id) END) as log1920,COUNT(distinct CASE WHEN time(created_at)>='20:00:00' AND time(created_at)<'21:00:00' THEN (product_id) END) as log2021,COUNT(distinct CASE WHEN time(created_at)>='21:00:00' AND time(created_at)<'22:00:00' THEN (product_id) END) as log2122,COUNT(distinct CASE WHEN time(created_at)>='22:00:00' AND time(created_at)<'23:00:00' THEN (product_id) END) as log2223 from Live_Product_History where makeit_id IN("+makeitloguser+") and date(created_at)= DATE_SUB(CURDATE(), INTERVAL 1 DAY) group by makeit_id order by makeit_id";
  var productcount = await query(liveproductcountquery);

  /////////Get Product Count////////
  var cycle1productcountquery = "select *,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as qty from Live_Product_History as lph left join Product as prd on prd.productid=product_id where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(lph.created_at)>='08:00:00' and time(lph.created_at)<'12:00:00' and prd.breakfast=1 and lph.makeit_id IN("+makeitloguser+") group by lph.product_id order by lph.makeit_id";
  var cycle1productcount = await query(cycle1productcountquery);
  
  for (let i = 0; i < productcount.length; i++) {
    var count = 0;
    for (let j = 0; j < cycle1productcount.length; j++) {
      if(productcount[i].makeit_id == cycle1productcount[j].makeit_id){
        count = count + cycle1productcount[j].qty;
      }    
    }  
    productcount[i].cycle1_qty=count;  
  }

  var cycle2productcountquery = "select *,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as qty from Live_Product_History as lph left join Product as prd on prd.productid=product_id where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(lph.created_at)>='12:00:00' and time(lph.created_at)<'16:00:00' and prd.lunch=1 and lph.makeit_id IN("+makeitloguser+") group by lph.product_id order by lph.makeit_id";
  var cycle2productcount = await query(cycle2productcountquery);

  for (let i = 0; i < productcount.length; i++) {
    var count = 0;
    for (let j = 0; j < cycle2productcount.length; j++) {
      if(productcount[i].makeit_id == cycle2productcount[j].makeit_id){
        count = count + cycle2productcount[j].qty;
      }    
    }  
    productcount[i].cycle2_qty=count;  
  }

  var cycle3productcountquery = "select *,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as qty from Live_Product_History as lph left join Product as prd on prd.productid=product_id where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and time(lph.created_at)>='16:00:00' and time(lph.created_at)<='23:00:00' and prd.dinner=1 and lph.makeit_id IN("+makeitloguser+") group by lph.product_id order by lph.makeit_id";
  var cycle3productcount = await query(cycle3productcountquery);

  for (let i = 0; i < productcount.length; i++) {
    var count = 0;
    for (let j = 0; j < cycle3productcount.length; j++) {
      if(productcount[i].makeit_id == cycle3productcount[j].makeit_id){
        count = count + cycle3productcount[j].qty;
      }    
    }  
    productcount[i].cycle3_qty=count;  
  }
  return productcount;
};

///Moveit Succession Report////
Order.moveit_daywise_cycle_report= async function moveit_daywise_cycle_report(req,result) { 
  //console.log("model");
  var query="select date,moveit_userid,cycle1,cycle2,cycle3,logtime,order_count,breakfast,lunch,dinner from Moveit_daywise_report where date(date) between'"+req.fromdate+"' and '"+req.todate+"'";
  console.log("query-->",query);
  sql.query(query,function(err, res) {
    if (err) {
      result(err, null);
    } else {
      if (res.length !== 0) {
        let resobj = {
          success: true,
          status:true,
          result:res
        };
        result(null, resobj);
      }else {
        let resobj = {
          success: true,
          message: "Sorry! no data found.",
          status:false
        };
        result(null, resobj);
      }
    }
  });
};

///Makeit Incentive Report////
Order.makeit_incentive_report= async function makeit_incentive_report(req,inc_fromdate,inc_todate) {
  var inc_todate    = moment().subtract(1, "days").format("YYYY-MM-DD");
  var inc_fromdate  = moment().subtract(7, "days").format("YYYY-MM-DD");

  var query="select makeit_id,if(SUM(complete_succession_count),SUM(complete_succession_count),0) as complete_succession_count, if(SUM(cancel_order_count),SUM(cancel_order_count),0) as cancel_count  from Makeit_daywise_report where date(date) between '"+inc_fromdate+"' and '"+inc_todate+"' group by makeit_id";
  //console.log("query---------->",query);
  sql.query(query,async function(err, res) {
    if (err) {
      //result(err, null);
    } else {      
      if (res.length !== 0) {
        for (let i = 0; i < res.length; i++) {
          res[i].from_date  = inc_fromdate;
          res[i].to_date    = inc_todate;
          if(res[i].complete_succession_count >= 18 && res[i].cancel_count <=3 ){
            res[i].eligibility = 1;
            res[i].incentive_amount = constant.makeit_tier3;
          }else if(res[i].complete_succession_count >= 15 && res[i].complete_succession_count < 18 && res[i].cancel_count <=3 ){
            res[i].eligibility = 1;
            res[i].incentive_amount = constant.makeit_tier2;
          }else if(res[i].complete_succession_count >= 12 && res[i].complete_succession_count < 15 && res[i].cancel_count <=3 ){
            res[i].eligibility = 1;
            res[i].incentive_amount = constant.makeit_tier1;
          }else{
            res[i].eligibility = 0;
            res[i].incentive_amount = 0;
          }
        }
      }
      //////////Insert Makeit Incentive//////////////
      for (let j = 0; j < res.length; j++) {
        var makeitincentive = await MakeitIncentive.createmakeitincentive(res[j]);
      }

      return makeitincentive;
    }
  });
};

///makeit_shutdown_report////
Order.makeit_shutdown_report= async function makeit_shutdown_report(req,result) { 
  if(req.makeit_id && req.makeit_id !=''){
   var makeitshutdownquery = "select date(date) as date,cycle_count,makeit_id from Makeit_daywise_report where date(date) between '"+req.fromdate+"' and '"+req.todate+"' and makeit_id='"+req.makeit_id+"' group by date(date)";
    var res = await query(makeitshutdownquery);
  }else{  
    var makeitshutdownquery = "select date(date) as date,cycle_count,makeit_id from Makeit_daywise_report where date(date) between '"+req.fromdate+"' and '"+req.todate+"' group by date(date),makeit_id";
    var res = await query(makeitshutdownquery);
  }
  
  if (res.length !== 0) {
    let resobj = {
      success: true,
      status:true,
      result:res
    };
    result(null, resobj);
  }else {
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }    
};

////Moveit Driver Utilization Report///
Order.moveit_utilization_report= async function moveit_utilization_report(req,result) { 

  var curDate=new Date();
  curDate.setDate(curDate.getDate()-7);
  var todate =moment().format("YYYY-MM-DD");
  var fromdate=moment(curDate).format("YYYY-MM-DD");

  if(req.fromdate) fromdate=req.fromdate;
  if(req.todate) todate=req.todate;

  console.log(fromdate+","+todate);

  var orderscountquery = "select date(created_at) as date,COUNT(CASE WHEN time(created_at)>='08:00:00' and time(created_at)<'12:00:00' THEN orderid END) as cycle1_orders, COUNT(CASE WHEN time(created_at)>='12:00:00' and time(created_at)<'16:00:00' THEN orderid END) as cycle2_orders, COUNT(CASE WHEN time(created_at)>='16:00:00' and time(created_at)<'23:59:59' THEN orderid END) as cycle3_orders from Orders where date(created_at) between '"+fromdate+"' AND '"+todate+"' and orderstatus=6 and moveit_user_id!=0 group by date(created_at)";
  var orderscount = await query(orderscountquery);

  var logcountquery = "select date(logtime) as date,COUNT(distinct CASE WHEN time(logtime)>='08:00:00' and time(logtime)<'12:00:00' THEN (moveit_userid) END) as cycle1_users, COUNT(distinct CASE WHEN time(logtime)>='12:00:00' and time(logtime)<'16:00:00' THEN (moveit_userid) END) as cycle2_users, COUNT(distinct CASE WHEN time(logtime)>='16:00:00' and time(logtime)<'23:59:59' THEN (moveit_userid) END) as cycle3_users,0 as 'breakfast_utiltiy',0 as 'lunch_utiltiy',0 as 'dinner_utiltiy' from Moveit_Timelog where date(logtime) between '"+fromdate+"' AND '"+todate+"' group by date(logtime)";
  //var logcount = await query(logcountquery);

  var logcountquery_new = "select date(date) as date,sum(TIME_TO_SEC(logtime)) as total_log_time,sum(TIME_TO_SEC(cycle1)) as cycle1_time,sum(TIME_TO_SEC(cycle2)) as cycle2_time,sum(TIME_TO_SEC(cycle3)) as cycle3_time from Moveit_daywise_report where date(date)between '"+fromdate+"' AND '"+todate+"' group by date(date)";
  var logcount = await query(logcountquery_new);
  console.log(logcountquery_new);
  const hourtomin = 3600;
  var newdata=[];
  if(orderscount.length != 0 && logcount !=0){
    for (let i = 0; i < logcount.length; i++) {
      for (let j = 0; j < orderscount.length; j++) {

        if(logcount[i].date == orderscount[j].date){
          var utility_obj={};
          utility_obj.date=logcount[i].date;

          var breakfast_orders=orderscount[j].cycle1_orders;
          var lunch_orders=orderscount[j].cycle2_orders;
          var dinner_orders=orderscount[j].cycle3_orders;

          utility_obj.breakfast_orders=breakfast_orders;
          utility_obj.lunch_orders=lunch_orders;
          utility_obj.dinner_orders=dinner_orders;

          var breakfast_time=logcount[i].cycle1_time;
          var lunch_time=logcount[i].cycle2_time;
          var dinner_time=logcount[i].cycle3_time;

          utility_obj.breakfast_time=breakfast_time;
          utility_obj.lunch_time=lunch_time;
          utility_obj.dinner_time=dinner_time;

          var breakfast_utility = 0;
          var lunch_utility = 0;
          var dinner_utility =0;

          if(breakfast_orders && breakfast_time)
          breakfast_utility = breakfast_orders/(breakfast_time/hourtomin);

          if(lunch_orders && lunch_time)
          lunch_utility = lunch_orders/(lunch_time/hourtomin);

          if(dinner_orders && dinner_time)
          dinner_utility = dinner_orders/(dinner_time/hourtomin);

          utility_obj.breakfast_utility=breakfast_utility?breakfast_utility.toFixed(2):0;
          utility_obj.lunch_utility=lunch_utility?lunch_utility.toFixed(2):0;
          utility_obj.dinner_utility=dinner_utility?dinner_utility.toFixed(2):0;

          newdata.push(utility_obj)
        }
        
      }  
              
    }

    // for (let i = 0; i < logcount.length; i++) {
    //   delete logcount[i].cycle1_users;
    //   delete logcount[i].cycle2_users;
    //   delete logcount[i].cycle3_users;
    // }

    let resobj = {
      success: true,
      status:true,
      result: newdata      
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }
  
};


////OPE METRICS Report///
Order.ope_metrics_report= async function ope_metrics_report(req,result) { 
  var currentdateminus=1;
  var orderscountquery = "Select sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=0),o.price,0)) as real_lastweek_day_value,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=0),price,0)) as real_today_value,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=1),o.price,0)) as dark_lastweek_day_value,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=1),price,0)) as dark_today_value,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=0),1,0)) as real_lastweek_day_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=0),1,0)) as real_today_count,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=1),1,0)) as dark_lastweek_day_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=1),1,0)) as dark_today_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=7 and mk.virtualkey=0),1,0)) as real_today_cancel_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=7 and mk.virtualkey=1),1,0)) as dark_today_cancel_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and o.delivery_vendor=0),1,0)) as total_orders_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and o.delivery_vendor=0),TIMESTAMPDIFF(SECOND,o.ordertime,o.moveit_actual_delivered_time),0)) as total_delivery_time from Orders o left join MakeitUser as mk on mk.userid=o.makeit_user_id Where date(o.created_at) between DATE_SUB(CURDATE(), INTERVAL 8 DAY) AND CURDATE()-"+currentdateminus;
  //console.log("orderscountquery---",orderscountquery);
  var orderscount = await query(orderscountquery);

  var Abandoned_order_count_query = "SELECT sum(if((date(xfact.created_at)=CURDATE()-"+currentdateminus+"),1,0)) as today_count,sum(if((date(xfact.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY)),1,0)) as last_week_count,count(*) as order_count FROM (SELECT t.product, t.created_at,t.userid FROM (Select o.orderid,o.created_at,o.userid,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on ma.userid=o.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id=ma.makeithub_id where o.orderstatus=11 and o.ordertype=0 and (DATE(o.created_at)=CURDATE()-"+currentdateminus+" or DATE(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY)) GROUP BY o.orderid) t GROUP BY date(t.created_at),t.userid,t.product) xfact"

  //console.log("Abandoned_order_count_query---",Abandoned_order_count_query);

  var Abandoned_order_count = await query(Abandoned_order_count_query);
 
  if(orderscount.length != 0){

      var i = 0;

      var real_today_value =parseInt(orderscount[i].real_today_value);
      var dark_today_value =parseInt(orderscount[i].dark_today_value);

      var real_lastweek_day_value = parseInt(orderscount[i].real_lastweek_day_value);
      var dark_lastweek_day_value = parseInt(orderscount[i].dark_lastweek_day_value);

      var real_today_count=parseInt(orderscount[i].real_today_count);
      var dark_today_count=parseInt(orderscount[i].dark_today_count);

      var real_lastweek_day_count = parseInt(orderscount[i].real_lastweek_day_count);
      var dark_lastweek_day_count = parseInt(orderscount[i].dark_lastweek_day_count);

      var real_today_cancel_count=parseInt(orderscount[i].real_today_cancel_count);
      var dark_today_cancel_count=parseInt(orderscount[i].dark_today_cancel_count);

      var total_orders_count=parseInt(orderscount[i].total_orders_count);
      var total_delivery_time=parseInt(orderscount[i].total_delivery_time);


      orderscount[i].real_order_revenue=0;
      orderscount[i].dark_order_revenue=0;


      orderscount[i].real_avg_orders=0;
      orderscount[i].dark_avg_orders=0;

      orderscount[i].real_order_aov=0;
      orderscount[i].dark_order_aov=0;
      
      orderscount[i].real_order_cancellation_avg=0;
      orderscount[i].dark_order_cancellation_avg=0;

      orderscount[i].today_abandoned_cart=0;
      orderscount[i].last_week_abandoned_cart=0;

      orderscount[i].avg_delivery_time=0;


      if(real_today_value && real_today_count){
        var real_order_aov=(real_today_value/real_today_count);
        orderscount[i].real_order_aov =real_order_aov.toFixed(2);
      }
      

      if(dark_today_value && dark_today_count){
        var dark_order_aov=(dark_today_value/dark_today_count);
        orderscount[i].dark_order_aov =dark_order_aov.toFixed(2);
      }
      

      if(real_today_cancel_count && real_today_count){
        var real_order_cancellation_avg=(real_today_cancel_count/(real_today_count+dark_today_count))*100;
        orderscount[i].real_order_cancellation_avg=real_order_cancellation_avg.toFixed(2);
      }
      

      if(dark_today_cancel_count && dark_today_count){
        var dark_order_cancellation_avg=(dark_today_cancel_count/(real_today_count+dark_today_count))*100;
        orderscount[i].dark_order_cancellation_avg=dark_order_cancellation_avg.toFixed(2);
      }
      

      if(real_lastweek_day_value && real_today_value){
        var diffvalue=parseInt(real_today_value) - parseInt(real_lastweek_day_value);
        var diviedvalue=diffvalue/parseInt(real_lastweek_day_value);
        var avgvalue=diviedvalue * 100;
        orderscount[i].real_order_revenue=avgvalue.toFixed(2);
      }

      if(dark_lastweek_day_value &&dark_today_value){
        var diffvalue=parseInt(dark_today_value) - parseInt(dark_lastweek_day_value);
        var diviedvalue=diffvalue/parseInt(dark_lastweek_day_value);
        var avgvalue=diviedvalue * 100;
        orderscount[i].dark_order_revenue=avgvalue.toFixed(2);
      }


      if(real_lastweek_day_count && real_today_count){
        var diffvalue=parseInt(real_today_count) - parseInt(real_lastweek_day_count);
        var diviedvalue=diffvalue/parseInt(real_lastweek_day_count);
        var avgvalue=diviedvalue * 100;
        orderscount[i].real_avg_orders=avgvalue.toFixed(2);
      }


      if(dark_lastweek_day_count && dark_today_count){
        var diffvalue=parseInt(dark_today_count) - parseInt(dark_lastweek_day_count);
        var diviedvalue=diffvalue/parseInt(dark_lastweek_day_count);
        var avgvalue=diviedvalue * 100;
        orderscount[i].dark_avg_orders=avgvalue.toFixed(2);
      }

      if(Abandoned_order_count.length>0){
        //console.log("total_orders_count--",Abandoned_order_count[i].last_week_count);
       // console.log("total_delivery_time--",(real_lastweek_day_count+dark_lastweek_day_count));
        var today_abandoned_cart=(Abandoned_order_count[i].today_count/(real_today_count+dark_today_count))*100;
        orderscount[i].today_abandoned_cart=today_abandoned_cart.toFixed(2);
        var last_week_abandoned_cart=(Abandoned_order_count[i].last_week_count/(real_lastweek_day_count+dark_lastweek_day_count))*100;
        orderscount[i].last_week_abandoned_cart=last_week_abandoned_cart.toFixed(2);
      }

     
      if(total_orders_count && total_delivery_time){
        var avg_delivery_time=(total_delivery_time/total_orders_count);
        
        if(avg_delivery_time){
          var sec_to_hhmmss =toHHMMSS(avg_delivery_time);
          orderscount[i].avg_delivery_minutes=hhmmss_to_minutes(sec_to_hhmmss);
          orderscount[i].avg_delivery_time=sec_to_hhmmss;
        }
        
      }

    
    let resobj = {
      success: true,
      status:true,
      result: orderscount      
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }
  
};


////OPE METRICS Report new format///
Order.ope_metrics_report_format= async function ope_metrics_report_format(req,result) { 
  var currentdateminus=1;
  var orderscountquery = "Select DATE_SUB(CURDATE(), INTERVAL 8 DAY) as last_week,DATE_SUB(CURDATE(), INTERVAL 1 DAY) as today,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=0),o.price,0)) as real_lastweek_day_value,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=0),price,0)) as real_today_value,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=1),o.price,0)) as dark_lastweek_day_value,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=1),price,0)) as dark_today_value,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=0),1,0)) as real_lastweek_day_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=0),1,0)) as real_today_count,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=1),1,0)) as dark_lastweek_day_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=1),1,0)) as dark_today_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=7 and mk.virtualkey=0),1,0)) as real_today_cancel_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=7 and mk.virtualkey=1),1,0)) as dark_today_cancel_count,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=7 and mk.virtualkey=0),1,0)) as real_lastweek_cancel_count,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=7 and mk.virtualkey=1),1,0)) as dark_lastweek_cancel_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and o.delivery_vendor=0),1,0)) as total_orders_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and o.delivery_vendor=0),TIMESTAMPDIFF(SECOND,o.ordertime,o.moveit_actual_delivered_time),0)) as total_delivery_time,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and o.delivery_vendor=0),1,0)) as lastweek_total_orders_count,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and o.delivery_vendor=0),TIMESTAMPDIFF(SECOND,o.ordertime,o.moveit_actual_delivered_time),0)) as lastweek_total_delivery_time from Orders o left join MakeitUser as mk on mk.userid=o.makeit_user_id Where date(o.created_at) between DATE_SUB(CURDATE(), INTERVAL 8 DAY) AND CURDATE()-"+currentdateminus;
  //console.log("orderscountquery---",orderscountquery);
  var orderscount = await query(orderscountquery);

  var Abandoned_order_count_query = "SELECT DATE_SUB(CURDATE(), INTERVAL 8 DAY) as last_week,CURDATE()-"+currentdateminus+" as today, sum(if((date(xfact.created_at)=CURDATE()-"+currentdateminus+"),1,0)) as today_count,sum(if((date(xfact.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY)),1,0)) as last_week_count,count(*) as order_count FROM (SELECT t.product, t.created_at,t.userid FROM (Select o.orderid,o.created_at,o.userid,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product from Orders as o join OrderItem as oi on o.orderid=oi.orderid join Product as p on p.productid = oi.productid join MakeitUser as ma on ma.userid=o.makeit_user_id join Makeit_hubs as mh on mh.makeithub_id=ma.makeithub_id where o.orderstatus=11 and o.ordertype=0 and (DATE(o.created_at)=CURDATE()-"+currentdateminus+" or DATE(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY)) GROUP BY o.orderid) t GROUP BY date(t.created_at),t.userid,t.product) xfact"

  //console.log("Abandoned_order_count_query---",Abandoned_order_count_query);

  var Abandoned_order_count = await query(Abandoned_order_count_query);
 
  var ope_metrics_array=[];
  var today_metrics={};
  var lastweek_metrics={};
  var i=0;

  

  if(orderscount.length != 0){

    today_metrics.date=orderscount[i].today;
    lastweek_metrics.date=orderscount[i].last_week;

    today_metrics.key="Today";
    lastweek_metrics.key="Lastweek";

      var real_today_value =parseInt(orderscount[i].real_today_value);
      var dark_today_value =parseInt(orderscount[i].dark_today_value);


      today_metrics.real_value = real_today_value;
      today_metrics.dark_value = dark_today_value;
      

      var real_lastweek_day_value = parseInt(orderscount[i].real_lastweek_day_value);
      var dark_lastweek_day_value = parseInt(orderscount[i].dark_lastweek_day_value);
      
      lastweek_metrics.real_value = real_lastweek_day_value;
      lastweek_metrics.dark_value = dark_lastweek_day_value;

      var real_today_count=parseInt(orderscount[i].real_today_count);
      var dark_today_count=parseInt(orderscount[i].dark_today_count);
      
      today_metrics.real_orders = real_today_count;
      today_metrics.dark_orders = dark_today_count;

      var real_lastweek_day_count = parseInt(orderscount[i].real_lastweek_day_count);
      var dark_lastweek_day_count = parseInt(orderscount[i].dark_lastweek_day_count);

      lastweek_metrics.real_orders = real_lastweek_day_count;
      lastweek_metrics.dark_orders = dark_lastweek_day_count;


      var real_today_cancel_count=parseInt(orderscount[i].real_today_cancel_count);
      var dark_today_cancel_count=parseInt(orderscount[i].dark_today_cancel_count);

      var real_lastweek_cancel_count=parseInt(orderscount[i].real_lastweek_cancel_count);
      var dark_lastweek_cancel_count=parseInt(orderscount[i].dark_lastweek_cancel_count);

      var total_orders_count=parseInt(orderscount[i].total_orders_count);
      var total_delivery_time=parseInt(orderscount[i].total_delivery_time);

      var lastweek_total_orders_count=parseInt(orderscount[i].lastweek_total_orders_count);
      var lastweek_total_delivery_time=parseInt(orderscount[i].lastweek_total_delivery_time);


      orderscount[i].real_order_revenue=0;
      orderscount[i].dark_order_revenue=0;


      orderscount[i].real_avg_orders=0;
      orderscount[i].dark_avg_orders=0;

      orderscount[i].real_order_aov=0;
      orderscount[i].dark_order_aov=0;
      
      orderscount[i].real_order_cancellation_avg=0;
      orderscount[i].dark_order_cancellation_avg=0;

      orderscount[i].today_abandoned_cart=0;
      orderscount[i].last_week_abandoned_cart=0;

      orderscount[i].avg_delivery_time=0;


      if(real_today_value && real_today_count){
        var real_order_aov=(real_today_value/real_today_count);
        real_order_aov =real_order_aov?real_order_aov.toFixed(2):0;
        today_metrics.real_aov = real_order_aov;
      }else{
        today_metrics.real_aov = 0;
      }

      if(dark_today_value && dark_today_count){
        var dark_order_aov=(dark_today_value/dark_today_count);
        dark_order_aov =dark_order_aov?dark_order_aov.toFixed(2):0;
        today_metrics.dark_aov = dark_order_aov;
      }else{
        today_metrics.dark_aov = 0;
      }

      if(real_lastweek_day_value && real_lastweek_day_count){
        var real_order_lastweek_aov=(real_lastweek_day_value/real_lastweek_day_count);
        real_order_lastweek_aov =real_order_lastweek_aov?real_order_lastweek_aov.toFixed(2):0;
        lastweek_metrics.real_aov = real_order_lastweek_aov;
      }else{
        lastweek_metrics.real_aov = 0;
      }

      if(dark_lastweek_day_value && dark_lastweek_day_count){
        var dark_order_lastweek_aov=(dark_lastweek_day_value/dark_lastweek_day_count);
        dark_order_lastweek_aov =dark_order_lastweek_aov?dark_order_lastweek_aov.toFixed(2):0;
        lastweek_metrics.dark_aov = dark_order_lastweek_aov;
      }else{
        lastweek_metrics.dark_aov = 0;
      }
      

      if(real_today_cancel_count){
        var real_order_cancellation_avg=(real_today_cancel_count/(real_today_count+dark_today_count))*100;
        real_order_cancellation_avg=real_order_cancellation_avg?real_order_cancellation_avg.toFixed(2):0;
        today_metrics.real_avg_cancellation = real_order_cancellation_avg;
      }else{
        today_metrics.real_avg_cancellation = 0;
      }

      if(real_lastweek_cancel_count){
        var real_order_lastweek_avg_cancellation=(real_lastweek_cancel_count/(real_lastweek_day_count+dark_lastweek_day_count))*100;
        real_order_lastweek_avg_cancellation=real_order_lastweek_avg_cancellation?real_order_lastweek_avg_cancellation.toFixed(2):0;
        lastweek_metrics.real_avg_cancellation = real_order_lastweek_avg_cancellation;
      }else{
        lastweek_metrics.real_avg_cancellation = 0;
      }
      

      if(dark_today_cancel_count){
        var dark_order_cancellation_avg=(dark_today_cancel_count/(real_today_count+dark_today_count))*100;
        dark_order_cancellation_avg=dark_order_cancellation_avg?dark_order_cancellation_avg.toFixed(2):0;
        today_metrics.dark_avg_cancellation = dark_order_cancellation_avg;
      }else{
        today_metrics.dark_avg_cancellation = 0;
      }

      if(dark_lastweek_cancel_count){
        var dark_order_lastweek_avg_cancellation=(dark_lastweek_cancel_count/(real_lastweek_day_count+dark_lastweek_day_count))*100;
        dark_order_lastweek_avg_cancellation=dark_order_lastweek_avg_cancellation?dark_order_lastweek_avg_cancellation.toFixed(2):0;
        lastweek_metrics.dark_avg_cancellation = dark_order_lastweek_avg_cancellation;
        }else{
          lastweek_metrics.dark_avg_cancellation = 0;
        }
      
        today_metrics.delivery_time_avg = 0;
      if(total_orders_count && total_delivery_time){
        var avg_delivery_time=(total_delivery_time/total_orders_count);
        if(avg_delivery_time){
          var sec_to_hhmmss =toHHMMSS(avg_delivery_time);
          var avg_delivery_minutes=hhmmss_to_minutes(sec_to_hhmmss);
          today_metrics.delivery_time_avg = avg_delivery_minutes;
        }
      }

      lastweek_metrics.delivery_time_avg = 0;
      if(lastweek_total_orders_count && lastweek_total_delivery_time){
        var lastweek_avg_delivery_time=(lastweek_total_delivery_time/lastweek_total_orders_count);
        if(lastweek_avg_delivery_time){
          var sec_to_hhmmss =toHHMMSS(lastweek_avg_delivery_time);
          var lastweek_avg_delivery_minutes=hhmmss_to_minutes(sec_to_hhmmss);
          lastweek_metrics.delivery_time_avg = lastweek_avg_delivery_minutes;
        }
        
      }

      today_metrics.abandoned_cart=0;
      lastweek_metrics.abandoned_cart=0;

      if(Abandoned_order_count.length>0){
        var today_abandoned_cart=(Abandoned_order_count[i].today_count/(real_today_count+dark_today_count))*100;
        today_abandoned_cart=today_abandoned_cart?today_abandoned_cart.toFixed(2):0;
        today_metrics.abandoned_cart=today_abandoned_cart;
    
        var last_week_abandoned_cart=(Abandoned_order_count[i].last_week_count/(real_lastweek_day_count+dark_lastweek_day_count))*100;
        last_week_abandoned_cart=last_week_abandoned_cart?last_week_abandoned_cart.toFixed(2):0;
        lastweek_metrics.abandoned_cart=last_week_abandoned_cart;
      }

  }

  ope_metrics_array.push(today_metrics);
  ope_metrics_array.push(lastweek_metrics);
  let resobj = {
    success: true,
    status:true,
    result: ope_metrics_array      
  };
  result(null, resobj);
};


////OPE METRICS Report///
Order.ope_metrics_growth= async function ope_metrics_growth(req,result) { 
  var currentdateminus=1;
  var orderscountquery = "Select sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=0),o.price,0)) as real_lastweek_day_value,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=0),price,0)) as real_today_value,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=1),o.price,0)) as dark_lastweek_day_value,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=1),price,0)) as dark_today_value,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=0),1,0)) as real_lastweek_day_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=0),1,0)) as real_today_count,sum(if((date(o.created_at)=DATE_SUB(CURDATE(), INTERVAL 8 DAY) And o.orderstatus=6 and mk.virtualkey=1),1,0)) as dark_lastweek_day_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and mk.virtualkey=1),1,0)) as dark_today_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=7 and mk.virtualkey=0),1,0)) as real_today_cancel_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=7 and mk.virtualkey=1),1,0)) as dark_today_cancel_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and o.delivery_vendor=0),1,0)) as total_orders_count,sum(if((date(o.created_at)=CURDATE()-"+currentdateminus+" And o.orderstatus=6 and o.delivery_vendor=0),TIMESTAMPDIFF(SECOND,o.ordertime,o.moveit_actual_delivered_time),0)) as total_delivery_time from Orders o left join MakeitUser as mk on mk.userid=o.makeit_user_id Where date(o.created_at) between DATE_SUB(CURDATE(), INTERVAL 8 DAY) AND CURDATE()-"+currentdateminus;
  //console.log("orderscountquery---",orderscountquery);
  var orderscount = await query(orderscountquery);

  var growth_rate=[];
  var i = 0;
  growth_rate[i]={}
  growth_rate[i].real_order_revenue_growth=0;
  growth_rate[i].dark_order_revenue_growth=0;
  growth_rate[i].real_avg_order_growth=0;
  growth_rate[i].dark_avg_order_growth=0;
 
  if(orderscount.length != 0){

      var real_today_value =parseInt(orderscount[i].real_today_value);
      var dark_today_value =parseInt(orderscount[i].dark_today_value);

      var real_lastweek_day_value = parseInt(orderscount[i].real_lastweek_day_value);
      var dark_lastweek_day_value = parseInt(orderscount[i].dark_lastweek_day_value);

      var real_today_count=parseInt(orderscount[i].real_today_count);
      var dark_today_count=parseInt(orderscount[i].dark_today_count);

      var real_lastweek_day_count = parseInt(orderscount[i].real_lastweek_day_count);
      var dark_lastweek_day_count = parseInt(orderscount[i].dark_lastweek_day_count);

     
      

      if(real_lastweek_day_value && real_today_value){
        var diffvalue=parseInt(real_today_value) - parseInt(real_lastweek_day_value);
        var diviedvalue=diffvalue/parseInt(real_lastweek_day_value);
        var avgvalue=diviedvalue * 100;
        growth_rate[i].real_order_revenue_growth=avgvalue.toFixed(2);
      }

      if(dark_lastweek_day_value &&dark_today_value){
        var diffvalue=parseInt(dark_today_value) - parseInt(dark_lastweek_day_value);
        var diviedvalue=diffvalue/parseInt(dark_lastweek_day_value);
        var avgvalue=diviedvalue * 100;
        growth_rate[i].dark_order_revenue_growth=avgvalue.toFixed(2);
      }


      if(real_lastweek_day_count && real_today_count){
        var diffvalue=parseInt(real_today_count) - parseInt(real_lastweek_day_count);
        var diviedvalue=diffvalue/parseInt(real_lastweek_day_count);
        var avgvalue=diviedvalue * 100;
        growth_rate[i].real_avg_order_growth=avgvalue.toFixed(2);
      }


      if(dark_lastweek_day_count && dark_today_count){
        var diffvalue=parseInt(dark_today_count) - parseInt(dark_lastweek_day_count);
        var diviedvalue=diffvalue/parseInt(dark_lastweek_day_count);
        var avgvalue=diviedvalue * 100;
        growth_rate[i].dark_avg_order_growth=avgvalue.toFixed(2);
      }
    
    let resobj = {
      success: true,
      status:true,
      result: growth_rate      
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }
};

 function toHHMMSS(second) {
   
  var sec_num = parseInt(second); // don't forget the second param
  console.log("second-->",sec_num);
  var hours   = Math.floor(sec_num / 3600);
  var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
  var seconds = sec_num - (hours * 3600) - (minutes * 60);

  if (hours   < 10) {hours   = "0"+hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
  if (seconds < 10) {seconds = "0"+seconds;}
  return hours + ':' + minutes + ':' + seconds;
}

function hhmmss_to_minutes(hms){
  var a = hms.split(':'); // split it at the colons
  var minutes = (+a[0]) * 60 + (+a[1]);
  var to_minutes = minutes + ((+a[2]) / 60);
  console.log("to_minutes-->",to_minutes);
  return to_minutes.toFixed(2);
}


Order.sales_metrics_report= async function sales_metrics_report(req,result) { 
  var currentdateminus=1;
  var makeitonboardquery = "Select "+constant.virtual_kitchen_onboarded_count+" as drak_kitchen_onboarded,sum(if((mu.virtualkey=0 and mu.makeit_type=1),1,0)) as caterers_kitchen_onboarded,sum(if((mu.virtualkey=0 and mu.makeit_type=0),1,0)) as homemaker_kitchen_onboarded from MakeitUser mu where mu.appointment_status=3 and mu.verified_status=1 and mu.ka_status = 2 and mu.delete_status=0";
  //console.log("orderscountquery---",orderscountquery);
  var makeit_onboard_count = await query(makeitonboardquery);

  // var makeittodaylivedquery = "Select sum(if((mu.virtualkey=1),1,0)) as drak_kitchen_lived,sum(if((mu.virtualkey=0 and mu.makeit_type=1),1,0)) as caterers_kitchen_lived,sum(if((mu.virtualkey=0 and mu.makeit_type=0),1,0)) as homemaker_kitchen_lived from MakeitUser mu where mu.userid in(select distinct mt.makeit_id from Makeit_Timelog mt where mt.type=0 and date(mt.created_at)=CURDATE()-"+currentdateminus+")";

  //console.log("Abandoned_order_count_query---",Abandoned_order_count_query);

  //var makeit_todaylived_count = await query(makeittodaylivedquery);

  var makeitearingsquery = "select sum(f.makeit_earnings) as homemaker_earnings, count(f.makeit_user_id) as homemaker_count from (Select o.makeit_user_id,sum(o.makeit_earnings)as makeit_earnings  from Orders o left join MakeitUser as mu on  mu.userid=o.makeit_user_id  Where MONTH(o.created_at) = MONTH(CURDATE()) AND  YEAR(o.created_at) = YEAR(CURDATE()) and (o.orderstatus=6 or (o.orderstatus=7 and o.makeit_actual_preparing_time IS Not NULL)) and  mu.virtualkey=0 and mu.makeit_type=0 group by o.makeit_user_id) f";

  //console.log("Abandoned_order_count_query---",Abandoned_order_count_query);

  var makeit_earings_count = await query(makeitearingsquery);

  var makeit_session_time_query= "Select TIME_TO_SEC('15:00:00') as overall_seconds_of_the_day,Sum(if((mu.virtualkey=0 and mu.makeit_type=0),TIME_TO_SEC(ADDTIME(mdr.cycle1,ADDTIME(mdr.cycle2,mdr.cycle3))),0)) as homemaker_session_second,Sum(if((mu.virtualkey=0 and mu.makeit_type=1),TIME_TO_SEC(ADDTIME(mdr.cycle1,ADDTIME(mdr.cycle2,mdr.cycle3))),0)) as caterers_session_second,Sum(if((mu.virtualkey=1),TIME_TO_SEC(ADDTIME(mdr.cycle1,ADDTIME(mdr.cycle2,mdr.cycle3))),0)) as dark_session_second,Sum(if((mu.virtualkey=0 and mu.makeit_type=0),1,0)) as homemaker_kitchen_lived,Sum(if((mu.virtualkey=0 and mu.makeit_type=1),1,0)) as caterers_kitchen_lived,Sum(if((mu.virtualkey=1),1,0)) as drak_kitchen_lived,Sum(if((mu.virtualkey=0 and mu.makeit_type=0 and mdr.cycle_count),(mdr.dinner_count+mdr.lunch_count+mdr.breakfast_count)/mdr.cycle_count,0)) as homemaker_product_live_count,Sum(if((mu.virtualkey=0 and mu.makeit_type=1 and mdr.cycle_count),(mdr.dinner_count+mdr.lunch_count+mdr.breakfast_count)/mdr.cycle_count,0)) as caterers_product_live_count,Sum(if((mu.virtualkey=1 and mu.makeit_type IS NULL and mdr.cycle_count),(mdr.dinner_count+mdr.lunch_count+mdr.breakfast_count)/mdr.cycle_count,0)) as dark_product_live_count from Makeit_daywise_report mdr left join MakeitUser as mu on  mu.userid=mdr.makeit_id where  date(mdr.date)=DATE_SUB(CURDATE(),INTERVAL 1 DAY)"

  var makeit_session_time = await query(makeit_session_time_query);

  var makeit_Product_lived_query= "select sum(if((q.virtualkey=0 and q.makeit_type=0),1,0)) as no_of_homemaker_kitchen,sum(if((q.virtualkey=0 and q.makeit_type=0),q.live_count,0)) as homemaker_product_live_count,sum(if((q.virtualkey=0 and q.makeit_type=1),1,0)) as no_of_caterers_kitchen,sum(if((q.virtualkey=0 and q.makeit_type=1),q.live_count,0)) as caterers_product_live_count,sum(if((q.virtualkey=1),1,0)) as no_of_dark_kitchen,sum(if((q.virtualkey=1),q.live_count,0)) as dark_product_live_count,count(*) as no_of_makeit,sum(q.live_count) as total_product_live_count from (select p.makeit_id,p.virtualkey,p.makeit_type,count(*) as live_count from (select  lph.makeit_id,lph.product_id,mu.virtualkey,mu.makeit_type from Live_Product_History lph left join MakeitUser as mu on mu.userid=lph.makeit_id  where date(lph.created_at)=DATE_SUB(CURDATE(),INTERVAL 1 DAY) and mu.ka_status=2 group by product_id) p group by makeit_id) q"

  var makeit_Product_lived_count = await query(makeit_Product_lived_query);
  //Product succession average % (Homemaker only)
  var makeit_succession_query= "select sum(if((mu.virtualkey=0 and mu.makeit_type=0),1,0)) as homemaker_succession_count,sum(if((mdr.kitchen_percentage!=0 and mu.virtualkey=0 and mu.makeit_type=0),mdr.kitchen_percentage,0)) as homemaker_succession_percentage from Makeit_daywise_report mdr left join MakeitUser as mu on  mu.userid=mdr.makeit_id where date(date)=DATE_SUB(CURDATE(),INTERVAL 1 DAY)"

  var makeit_succession_value = await query(makeit_succession_query);

  //console.log("makeit_session_time_query---",makeit_session_time_query);

  var onresult=[];
  var i = 0;
  if(makeit_onboard_count.length != 0 && makeit_session_time.length!=0){
    onresult[i] = Object.assign(makeit_onboard_count[i],makeit_session_time[i]);

      var drak_kitchen_onboarded =parseInt(makeit_onboard_count[i].drak_kitchen_onboarded);
      var caterers_kitchen_onboarded =parseInt(makeit_onboard_count[i].caterers_kitchen_onboarded);
      var homemaker_kitchen_onboarded = parseInt(makeit_onboard_count[i].homemaker_kitchen_onboarded);
      homemaker_kitchen_onboarded=homemaker_kitchen_onboarded-constant.testing_kitchen_onboarded_count;
      onresult[i].homemaker_kitchen_onboarded=homemaker_kitchen_onboarded

       var drak_kitchen_lived =parseInt(makeit_session_time[i].drak_kitchen_lived);
       var caterers_kitchen_lived =parseInt(makeit_session_time[i].caterers_kitchen_lived);
       var homemaker_kitchen_lived = parseInt(makeit_session_time[i].homemaker_kitchen_lived);
      
      if(drak_kitchen_onboarded && drak_kitchen_lived){
      var drak_kitchen_lived_percentage=(drak_kitchen_lived/drak_kitchen_onboarded)*100;
      onresult[i].drak_kitchen_lived_percentage=drak_kitchen_lived_percentage.toFixed(2)
      }else onresult[i].drak_kitchen_lived_percentage=0;

      if(caterers_kitchen_onboarded && caterers_kitchen_lived){
      var caterers_kitchen_lived_percentage=(caterers_kitchen_lived/caterers_kitchen_onboarded)*100;
      onresult[i].caterers_kitchen_lived_percentage=caterers_kitchen_lived_percentage.toFixed(2);
      } else onresult[i].caterers_kitchen_lived_percentage=0;

      if(homemaker_kitchen_onboarded && homemaker_kitchen_lived){
        console.log(homemaker_kitchen_lived,homemaker_kitchen_onboarded);
      var homemaker_kitchen_lived_percentage=(homemaker_kitchen_lived/homemaker_kitchen_onboarded)*100;
      console.log(homemaker_kitchen_lived_percentage);
      onresult[i].homemaker_kitchen_lived_percentage=homemaker_kitchen_lived_percentage.toFixed(2);
      } else onresult[i].homemaker_kitchen_lived_percentage=0;
  }

  if(makeit_session_time.length>0){
   // onresult[i] = Object.assign(onresult[i],makeit_session_time[i]);
    var overall_seconds_of_the_day= makeit_session_time[i].overall_seconds_of_the_day;

    var homemaker_session_time = makeit_session_time[i].homemaker_session_second/(makeit_session_time[i].homemaker_kitchen_lived * overall_seconds_of_the_day)
    
    homemaker_session_time= homemaker_session_time?homemaker_session_time:0;
    console.log(homemaker_session_time);
    onresult[i].homemaker_session_time= (homemaker_session_time *100).toFixed(2);


    var caterers_session_time = makeit_session_time[i].caterers_session_second/(makeit_session_time[i].caterers_kitchen_lived * overall_seconds_of_the_day)
    caterers_session_time= caterers_session_time?caterers_session_time:0;
    onresult[i].caterers_session_time= (caterers_session_time*100).toFixed(2);

    var dark_session_time = makeit_session_time[i].dark_session_second/(makeit_session_time[i].drak_kitchen_lived * overall_seconds_of_the_day)
    dark_session_time= dark_session_time?dark_session_time:0;
    onresult[i].dark_session_time= (dark_session_time *100).toFixed(2);

    var homemaker_product_live_count =makeit_session_time[i].homemaker_product_live_count;
    var caterers_product_live_count =makeit_session_time[i].caterers_product_live_count;
    var dark_product_live_count =makeit_session_time[i].dark_product_live_count;

    var homemaker_avg_no_of_products_live =homemaker_product_live_count/makeit_session_time[i].homemaker_kitchen_lived;
    var caterers_avg_no_of_products_live =caterers_product_live_count/makeit_session_time[i].caterers_kitchen_lived;
    var dark_avg_no_of_products_live =dark_product_live_count/makeit_session_time[i].drak_kitchen_lived;

    onresult[i].homemaker_avg_no_of_products_live = homemaker_avg_no_of_products_live?homemaker_avg_no_of_products_live.toFixed(2) : 0;
    onresult[i].caterers_avg_no_of_products_live = caterers_avg_no_of_products_live?caterers_avg_no_of_products_live.toFixed(2):0;
    onresult[i].dark_avg_no_of_products_live = dark_avg_no_of_products_live?dark_avg_no_of_products_live.toFixed(2):0;

  }

  if(makeit_earings_count.length>0){
    onresult[i] = Object.assign(onresult[i],makeit_earings_count[i]);
    var makeit_earnings =parseInt(makeit_earings_count[i].homemaker_earnings);
    var makeit_count =parseInt(makeit_earings_count[i].homemaker_count);
    var avg_home_maker_earnings =(makeit_earnings/makeit_count).toFixed(2);
    onresult[i].home_maker_avg_earnings_month=avg_home_maker_earnings;
  }else{
    onresult[i].home_maker_avg_earnings_month=0;
  }

  // if(makeit_Product_lived_count.length>0){
  //   onresult[i] = Object.assign(onresult[i],makeit_Product_lived_count[i]);

  //   var no_of_homemaker_kitchen =makeit_Product_lived_count[i].no_of_homemaker_kitchen;
  //   var no_of_caterers_kitchen =makeit_Product_lived_count[i].no_of_caterers_kitchen;
  //   var no_of_dark_kitchen =makeit_Product_lived_count[i].no_of_dark_kitchen;

  //   var homemaker_product_live_count =makeit_Product_lived_count[i].homemaker_product_live_count;
  //   var caterers_product_live_count =makeit_Product_lived_count[i].caterers_product_live_count;
  //   var dark_product_live_count =makeit_Product_lived_count[i].dark_product_live_count;

  //   var homemaker_avg_no_of_products_live =homemaker_product_live_count/no_of_homemaker_kitchen;
  //   var caterers_avg_no_of_products_live =caterers_product_live_count/no_of_caterers_kitchen;
  //   var dark_avg_no_of_products_live =dark_product_live_count/no_of_dark_kitchen;

  //   onresult[i].homemaker_avg_no_of_products_live = homemaker_avg_no_of_products_live?homemaker_avg_no_of_products_live.toFixed(2) : 0;
  //   onresult[i].caterers_avg_no_of_products_live = caterers_avg_no_of_products_live?caterers_avg_no_of_products_live.toFixed(2):0;
  //   onresult[i].dark_avg_no_of_products_live = dark_avg_no_of_products_live?dark_avg_no_of_products_live.toFixed(2):0;

  // }

  if(makeit_succession_value.length>0){
    onresult[i] = Object.assign(onresult[i],makeit_succession_value[i]);
    var homemaker_succession_count = makeit_succession_value[i].homemaker_succession_count;
    var homemaker_succession_percentage = makeit_succession_value[i].homemaker_succession_percentage;
    if(homemaker_succession_count&&homemaker_succession_percentage){
    var homemaker_avg_succession = (homemaker_succession_percentage/homemaker_succession_count);
    onresult[i].homemaker_avg_succession=homemaker_avg_succession.toFixed(2);
    }
  }
 
    
    let resobj = {
      success: true,
      status:true,
      result: onresult      
    };
    result(null, resobj);
  
  
};


Order.logs_metrics_report= async function logs_metrics_report(req,result) { 
  var currentdateminus=1;
  var noofDriverslivedquery = "select count(mov.moveit_lived_per_day) as no_of_moveit_lived_per_day from (select count(*) as moveit_lived_per_day from Orders where date(created_at) =CURDATE()-"+currentdateminus+" and orderstatus=6 and moveit_user_id!='' group by moveit_user_id) mov";
  //console.log("orderscountquery---",orderscountquery);
  var noof_driver_lived_count = await query(noofDriverslivedquery);

  var noof_orders_per_day_query = "select count(*) as no_of_orders_perday from Orders where date(created_at) =CURDATE()-"+currentdateminus+" and orderstatus=6 and moveit_user_id!=''";

  //console.log("Abandoned_order_count_query---",Abandoned_order_count_query);

  var noof_orders_perday_query_count = await query(noof_orders_per_day_query);

  var orderscountquery = "select date(created_at) as date,COUNT(CASE WHEN time(created_at)>='08:00:00' and time(created_at)<'12:00:00' THEN orderid END) as cycle1_orders, COUNT(CASE WHEN time(created_at)>='12:00:00' and time(created_at)<'16:00:00' THEN orderid END) as cycle2_orders, COUNT(CASE WHEN time(created_at)>='16:00:00' and time(created_at)<'23:59:59' THEN orderid END) as cycle3_orders from Orders where date(created_at) =CURDATE()-"+currentdateminus+" and orderstatus=6 and moveit_user_id!=0 group by date(created_at)";
  var orderscount = await query(orderscountquery);

  var logcountquery = "select sum(TIME_TO_SEC(logtime)) as total_log_time,sum(TIME_TO_SEC(cycle1)) as cycle1_time,sum(TIME_TO_SEC(cycle2)) as cycle2_time,sum(TIME_TO_SEC(cycle3)) as cycle3_time from Moveit_daywise_report where date(date) =CURDATE()-"+currentdateminus;
  var logcount = await query(logcountquery);
  
  

  var onresult=[];
  var i = 0;
  if(noof_driver_lived_count.length != 0 && noof_orders_perday_query_count.length!=0){
      onresult[i] = Object.assign(noof_driver_lived_count[i], noof_orders_perday_query_count[i]);
      var no_of_moveit_lived_per_day =parseInt(noof_driver_lived_count[i].no_of_moveit_lived_per_day);
      var no_of_orders_perday =parseInt(noof_driver_lived_count[i].no_of_orders_perday);
      
      if(no_of_moveit_lived_per_day && no_of_orders_perday){
      var no_of_order_per_rider=(no_of_orders_perday/no_of_moveit_lived_per_day);
      onresult[i].no_of_order_per_rider=no_of_order_per_rider.toFixed(2)
      }
  }else{
    onresult[i].no_of_moveit_lived_per_day=0;
    onresult[i].no_of_orders_perday=0;
    onresult[i].no_of_order_per_rider=0;
  }

  console.log(orderscount.length,logcount.length);
  if(orderscount.length != 0 && logcount.length!=0){
    
    onresult[i].breakfast_hours =secondsToDhms(logcount[i].cycle1_time);
    onresult[i].lunch_hours =secondsToDhms(logcount[i].cycle2_time);
    onresult[i].dinner_hours =secondsToDhms(logcount[i].cycle3_time);
    onresult[i].total_hours =secondsToDhms(logcount[i].total_log_time);

    onresult[i].breakfast_orders =orderscount[i].cycle1_orders;
    onresult[i].lunch_orders =orderscount[i].cycle2_orders;
    onresult[i].dinner_orders =orderscount[i].cycle3_orders;
    var total_orders =orderscount[i].cycle1_orders+orderscount[i].cycle2_orders+orderscount[i].cycle3_orders;
    onresult[i].total_orders = total_orders;

          var breakfast_utiltiy = orderscount[i].cycle1_orders/(logcount[i].cycle1_time/3600);
          var lunch_utiltiy = (orderscount[i].cycle2_orders)/(logcount[i].cycle2_time/3600);
          var dinner_utiltiy = (orderscount[i].cycle3_orders)/(logcount[i].cycle3_time/3600);
          var driver_utiltiy = (total_orders)/(logcount[i].total_log_time/3600);
//Driver utilisation
          var driver_utilisation_per_day=(breakfast_utiltiy+lunch_utiltiy+dinner_utiltiy);
          onresult[i].breakfast_utiltiy=breakfast_utiltiy.toFixed(2);
          onresult[i].lunch_utiltiy=lunch_utiltiy.toFixed(2);
          onresult[i].dinner_utiltiy=dinner_utiltiy.toFixed(2);

          onresult[i].driver_utilisation_per_day=driver_utilisation_per_day.toFixed(2);
          onresult[i].driver_utiltiy=driver_utiltiy.toFixed(2);
  }else{
    onresult[i].no_of_moveit_lived_per_day=0;
    onresult[i].no_of_orders_perday=0;
    onresult[i].no_of_order_per_rider=0;
    onresult[i].driver_utilisation_per_day=0;
  }
  let resobj = {
    success: true,
    status:true,
    result: onresult      
  };
  result(null, resobj);
  
};

function secondsToDhms(seconds) {
  seconds = Number(seconds);
  var d = Math.floor(seconds / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);
  
  if(d>0) h=h+(d*24);
  h=h>9?h:"0"+h;
  m=m>9?m:"0"+m;
  s=s>9?s:"0"+s;

  return  h +":"+ m +":"+ s;
}
///Show makeit_incentive_report////
Order.show_makeit_incentive_report= async function show_makeit_incentive_report(req,result) {   
  if(req.eligibility && req.eligibility!=''){
    var makeitincentivequery ="select makeit_id,eligibility,complete_succession_count,cancel_count,incentive_amount from Makeit_incentive where date(created_at)='"+req.date+"' and eligibility="+req.eligibility;
    var res = await query(makeitincentivequery);
  }else{
    var makeitincentivequery = "select makeit_id,eligibility,complete_succession_count,cancel_count,incentive_amount from Makeit_incentive where date(created_at)='"+req.date+"'";
    var res = await query(makeitincentivequery);
  } 
  
  if (res.length !== 0) {
    let resobj = {
      success: true,
      status:true,
      result:res
    };
    result(null, resobj);
  }else {
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }    
};


///Eat users orders list////
Order.eat_user_order_list= async function eat_user_order_list(req,result) {   
  var isEmptylist=true;
  if(req.userid){
    var orderlimit = 20;
    var page = req.page || 1;
    var startlimit = (page - 1) * orderlimit;
  
    var or_query =
    "Select od.*,us.*,mu.brandname,mu.virtualkey as kitchentype from Orders as od left join User as us on od.userid=us.userid join MakeitUser as mu on mu.userid=od.makeit_user_id where (od.payment_type=0 or (od.payment_type=1 and od.payment_status<2)) and od.userid="+req.userid;
   // var query =
      //"Select * from Orders as od left join User as us on od.userid=us.userid where (od.payment_type=0 or (od.payment_type=1 and od.payment_status>0) )and orderstatus < 9";
    var searchquery =
      "od.orderid LIKE  '%" +
      req.search +
      "%'";
  
    if (req.delivery_vendor !== "all"){
      or_query = or_query + " and od.delivery_vendor = '" + req.delivery_vendor + "'";
    }
    if (req.search) {
      or_query = or_query + " and " + searchquery;
    }
  
    var limitquery =or_query +" order by od.orderid desc limit " +startlimit +"," +orderlimit +" ";
    var ordertotalcount = await query(or_query);
    var orderlist = await query(limitquery);
    var totalcount = 0;
    if (orderlist.length !== 0) {
      totalcount = ordertotalcount.length;
      isEmptylist=false;
      let resobj = {
        success: true,
        status:true,
        totalorder: totalcount,
        result:orderlist
      };
      result(null, resobj);
    }
  }
  
   if(isEmptylist){
    let resobj = {
      success: true,
      message: "Sorry!No Orders Found",
      status:false
    };
    result(null, resobj);
  }    
};

///Admin Raw Data Report -> liveproducthistory_rawreport////
Order.liveproducthistory_rawreport= async function liveproducthistory_rawreport(req,result) {
  if(req.fromdate !='' && req.todate !=''){
    var liveproducthistoryquery ="select * from Live_Product_History where date(created_at) between '"+req.fromdate+"' and '"+req.todate+"'";
    var res = await query(liveproducthistoryquery); 
  
    if (res.length !== 0) {
      let resobj = {
        success: true,
        status:true,
        result:res
      };
      result(null, resobj);
    }else {
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status:false
      };
      result(null, resobj);
    }  
  }else{
    let resobj = {
      success: false,
      status:false,
      message: "please check all required fields",
    };
    result(null, resobj);
  }    
};

///Admin Raw Data Report -> makeitlog_rawreport////
Order.makeitlog_rawreport= async function makeitlog_rawreport(req,result) {
  if(req.fromdate !='' && req.todate !=''){
    var makeitlogquery ="select * from Makeit_Timelog where date(created_at) between '"+req.fromdate+"' and '"+req.todate+"'";
    var res = await query(makeitlogquery); 
  
    if (res.length !== 0) {
      let resobj = {
        success: true,
        status:true,
        result:res
      };
      result(null, resobj);
    }else {
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status:false
      };
      result(null, resobj);
    }  
  }else{
    let resobj = {
      success: false,
      status:false,
      message: "please check all required fields",
    };
    result(null, resobj);
  }    
};

///Admin Raw Data Report -> moveitlog_rawreport////
Order.moveitlog_rawreport= async function moveitlog_rawreport(req,result) {
  if(req.fromdate !='' && req.todate !=''){
    var moveitlogquery ="select * from Moveit_Timelog where date(created_at) between '"+req.fromdate+"' and '"+req.todate+"'";
    var res = await query(moveitlogquery); 
  
    if (res.length !== 0) {
      let resobj = {
        success: true,
        status:true,
        result:res
      };
      result(null, resobj);
    }else {
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status:false
      };
      result(null, resobj);
    }  
  }else{
    let resobj = {
      success: false,
      status:false,
      message: "please check all required fields",
    };
    result(null, resobj);
  }    
};

  //////Zone Level Performance/////
  Order.zone_level_performance_report= async function zone_level_performance_report(req,result) {   
  
    var makeitimatrixquery ="select date,mu.zone as zone_id,zo.Zonename,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log0809))/60*60) as ops_hr_0809,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log0910))/60*60) as ops_hr_0910,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1011))/60*60) as ops_hr_1011,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1112))/60*60) as ops_hr_1112,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1213))/60*60) as ops_hr_1213,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1314))/60*60) as ops_hr_1314,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1415))/60*60) as ops_hr_1415,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1516))/60*60) as ops_hr_1516,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1617))/60*60) as ops_hr_1617,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1718))/60*60) as ops_hr_1718,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1819))/60*60) as ops_hr_1819,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1920))/60*60) as ops_hr_1920,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log2021))/60*60) as ops_hr_2021,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log2122))/60*60) as ops_hr_2122,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log2223))/60*60) as ops_hr_2223, COUNT(CASE WHEN mdr.log0809!='00:00:00' AND mdr.log0809_count!=0 THEN makeit_id END) as log0809_live_kitchencount,COUNT(CASE WHEN mdr.log0910!='00:00:00' AND mdr.log0910_count!=0 THEN makeit_id END) as log0910_live_kitchencount,COUNT(CASE WHEN mdr.log1011!='00:00:00' AND mdr.log1011_count!=0 THEN makeit_id END) as log1011_live_kitchencount,COUNT(CASE WHEN mdr.log1112!='00:00:00' AND mdr.log1112_count!=0 THEN makeit_id END) as log1112_live_kitchencount,COUNT(CASE WHEN mdr.log1213!='00:00:00' AND mdr.log1213_count!=0 THEN makeit_id END) as log1213_live_kitchencount,COUNT(CASE WHEN mdr.log1314!='00:00:00' AND mdr.log1314_count!=0 THEN makeit_id END) as log1314_live_kitchencount,COUNT(CASE WHEN mdr.log1415!='00:00:00' AND mdr.log1415_count!=0 THEN makeit_id END) as log1415_live_kitchencount,COUNT(CASE WHEN mdr.log1516!='00:00:00' AND mdr.log1516_count!=0 THEN makeit_id END) as log1516_live_kitchencount,COUNT(CASE WHEN mdr.log1617!='00:00:00' AND mdr.log1617_count!=0 THEN makeit_id END) as log1617_live_kitchencount,COUNT(CASE WHEN mdr.log1718!='00:00:00' AND mdr.log1718_count!=0 THEN makeit_id END) as log1718_live_kitchencount,COUNT(CASE WHEN mdr.log1819!='00:00:00' AND mdr.log1819_count!=0 THEN makeit_id END) as log1819_live_kitchencount,COUNT(CASE WHEN mdr.log1920!='00:00:00' AND mdr.log1920_count!=0 THEN makeit_id END) as log1920_live_kitchencount,COUNT(CASE WHEN mdr.log2021!='00:00:00' AND mdr.log2021_count!=0 THEN makeit_id END) as log2021_live_kitchencount,COUNT(CASE WHEN mdr.log2122!='00:00:00' AND mdr.log2122_count!=0 THEN makeit_id END) as log2122_live_kitchencount,COUNT(CASE WHEN mdr.log2223!='00:00:00' AND mdr.log2223_count!=0 THEN makeit_id END) as log2223_live_kitchencount from Makeit_daywise_report as mdr left join MakeitUser as mu on mu.userid=mdr.makeit_id left join Zone as zo on zo.id=mu.zone where date(mdr.date) between DATE_SUB(CURDATE(), INTERVAL 1 DAY) and DATE_SUB(CURDATE(), INTERVAL 1 DAY) group by date(mdr.date),mu.zone";
    var makeitmatrix = await query(makeitimatrixquery);
  
    var moveitmatrixquery = "select date,mu.zone as zone_id,zo.Zonename,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log0809))/60*60) as login_hr_0809,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log0910))/60*60) as login_hr_0910,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1011))/60*60) as login_hr_1011,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1112))/60*60) as login_hr_1112,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1213))/60*60) as login_hr_1213,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1314))/60*60) as login_hr_1314,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1415))/60*60) as login_hr_1415,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1516))/60*60) as login_hr_1516,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1617))/60*60) as login_hr_1617,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1718))/60*60) as login_hr_1718,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1819))/60*60) as login_hr_1819,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log1920))/60*60) as login_hr_1920,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log2021))/60*60) as login_hr_2021,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log2122))/60*60) as login_hr_2122,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.log2223))/60*60) as login_hr_2223, SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_0809))/60*60) as busy_hr_0809,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_0910))/60*60) as busy_hr_0910,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1011))/60*60) as busy_hr_1011,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1112))/60*60) as busy_hr_1112,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1213))/60*60) as busy_hr_1213,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1314))/60*60) as busy_hr_1314,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1415))/60*60) as busy_hr_1415,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1516))/60*60) as busy_hr_1516,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1617))/60*60) as busy_hr_1617,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1718))/60*60) as busy_hr_1718,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1819))/60*60) as busy_hr_1819,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_1920))/60*60) as busy_hr_1920,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_2021))/60*60) as busy_hr_2021,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_2122))/60*60) as busy_hr_2122,SEC_TO_TIME(SUM(TIME_TO_SEC(mdr.busy_2223))/60*60) as busy_hr_2223,COUNT(CASE WHEN mdr.log0809!='00:00:00' THEN moveit_userid END) as log0809_live_moveitcount,COUNT(CASE WHEN mdr.log0910!='00:00:00' THEN moveit_userid END) as log0910_live_moveitcount,COUNT(CASE WHEN mdr.log1011!='00:00:00' THEN moveit_userid END) as log1011_live_moveitcount,COUNT(CASE WHEN mdr.log1112!='00:00:00' THEN moveit_userid END) as log1112_live_moveitcount,COUNT(CASE WHEN mdr.log1213!='00:00:00' THEN moveit_userid END) as log1213_live_moveitcount,COUNT(CASE WHEN mdr.log1314!='00:00:00' THEN moveit_userid END) as log1314_live_moveitcount,COUNT(CASE WHEN mdr.log1415!='00:00:00' THEN moveit_userid END) as log1415_live_moveitcount,COUNT(CASE WHEN mdr.log1516!='00:00:00' THEN moveit_userid END) as log1516_live_moveitcount,COUNT(CASE WHEN mdr.log1617!='00:00:00' THEN moveit_userid END) as log1617_live_moveitcount,COUNT(CASE WHEN mdr.log1718!='00:00:00' THEN moveit_userid END) as log1718_live_moveitcount,COUNT(CASE WHEN mdr.log1819!='00:00:00' THEN moveit_userid END) as log1819_live_moveitcount,COUNT(CASE WHEN mdr.log1920!='00:00:00' THEN moveit_userid END) as log1920_live_moveitcount,COUNT(CASE WHEN mdr.log2021!='00:00:00' THEN moveit_userid END) as log2021_live_moveitcount,COUNT(CASE WHEN mdr.log2122!='00:00:00' THEN moveit_userid END) as log2122_live_moveitcount,COUNT(CASE WHEN mdr.log2223!='00:00:00' THEN moveit_userid END) as log2223_live_moveitcount from Moveit_daywise_report as mdr left join MoveitUser as mu on mu.userid=mdr.moveit_userid left join Zone as zo on zo.id=mu.zone where date(mdr.date) between DATE_SUB(CURDATE(), INTERVAL 1 DAY) and DATE_SUB(CURDATE(), INTERVAL 1 DAY) group by date(mdr.date),mu.zone";
    var moveitmatrix = await query(moveitmatrixquery);

    var ordermatrixquery = "select date(ord.created_at) as date,mu.zone as zone_id,zo.Zonename,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=0  THEN orderid END) as log0809_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=1  THEN orderid END) as log0809_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=2  THEN orderid END) as log0809_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=3  THEN orderid END) as log0809_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=4  THEN orderid END) as log0809_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=5  THEN orderid END) as log0809_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=6  THEN orderid END) as log0809_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=7  THEN orderid END) as log0809_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=8  THEN orderid END) as log0809_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=9  THEN orderid END) as log0809_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=10  THEN orderid END) as log0809_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=11  THEN orderid END) as log0809_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='08:00:00' and time(ord.created_at)<'09:00:00' and orderstatus=12  THEN orderid END) as log0809_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=0  THEN orderid END) as log0910_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=1  THEN orderid END) as log0910_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=2  THEN orderid END) as log0910_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=3  THEN orderid END) as log0910_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=4  THEN orderid END) as log0910_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=5  THEN orderid END) as log0910_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=6  THEN orderid END) as log0910_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=7  THEN orderid END) as log0910_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=8  THEN orderid END) as log0910_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=9  THEN orderid END) as log0910_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=10  THEN orderid END) as log0910_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=11  THEN orderid END) as log0910_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='09:00:00' and time(ord.created_at)<'10:00:00' and orderstatus=12  THEN orderid END) as log0910_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=0  THEN orderid END) as log1011_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=1  THEN orderid END) as log1011_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=2  THEN orderid END) as log1011_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=3  THEN orderid END) as log1011_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=4  THEN orderid END) as log1011_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=5  THEN orderid END) as log1011_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=6  THEN orderid END) as log1011_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=7  THEN orderid END) as log1011_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=8  THEN orderid END) as log1011_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=9  THEN orderid END) as log1011_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=10  THEN orderid END) as log1011_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=11  THEN orderid END) as log1011_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='10:00:00' and time(ord.created_at)<'11:00:00' and orderstatus=12  THEN orderid END) as log1011_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=0  THEN orderid END) as log1112_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=1  THEN orderid END) as log1112_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=2  THEN orderid END) as log1112_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=3  THEN orderid END) as log1112_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=4  THEN orderid END) as log1112_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=5  THEN orderid END) as log1112_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=6  THEN orderid END) as log1112_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=7  THEN orderid END) as log1112_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=8  THEN orderid END) as log1112_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=9  THEN orderid END) as log1112_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=10  THEN orderid END) as log1112_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=11  THEN orderid END) as log1112_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='11:00:00' and time(ord.created_at)<'12:00:00' and orderstatus=12  THEN orderid END) as log1112_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=0  THEN orderid END) as log1213_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=1  THEN orderid END) as log1213_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=2  THEN orderid END) as log1213_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=3  THEN orderid END) as log1213_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=4  THEN orderid END) as log1213_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=5  THEN orderid END) as log1213_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=6  THEN orderid END) as log1213_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=7  THEN orderid END) as log1213_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=8  THEN orderid END) as log1213_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=9  THEN orderid END) as log1213_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=10  THEN orderid END) as log1213_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=11  THEN orderid END) as log1213_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='12:00:00' and time(ord.created_at)<'13:00:00' and orderstatus=12  THEN orderid END) as log1213_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=0  THEN orderid END) as log1314_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=1  THEN orderid END) as log1314_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=2  THEN orderid END) as log1314_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=3  THEN orderid END) as log1314_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=4  THEN orderid END) as log1314_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=5  THEN orderid END) as log1314_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=6  THEN orderid END) as log1314_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=7  THEN orderid END) as log1314_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=8  THEN orderid END) as log1314_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=9  THEN orderid END) as log1314_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=10  THEN orderid END) as log1314_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=11  THEN orderid END) as log1314_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='13:00:00' and time(ord.created_at)<'14:00:00' and orderstatus=12  THEN orderid END) as log1314_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=0  THEN orderid END) as log1415_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=1  THEN orderid END) as log1415_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=2  THEN orderid END) as log1415_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=3  THEN orderid END) as log1415_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=4  THEN orderid END) as log1415_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=5  THEN orderid END) as log1415_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=6  THEN orderid END) as log1415_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=7  THEN orderid END) as log1415_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=8  THEN orderid END) as log1415_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=9  THEN orderid END) as log1415_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=10  THEN orderid END) as log1415_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=11  THEN orderid END) as log1415_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='14:00:00' and time(ord.created_at)<'15:00:00' and orderstatus=12  THEN orderid END) as log1415_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=0  THEN orderid END) as log1516_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=1  THEN orderid END) as log1516_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=2  THEN orderid END) as log1516_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=3  THEN orderid END) as log1516_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=4  THEN orderid END) as log1516_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=5  THEN orderid END) as log1516_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=6  THEN orderid END) as log1516_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=7  THEN orderid END) as log1516_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=8  THEN orderid END) as log1516_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=9  THEN orderid END) as log1516_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=10  THEN orderid END) as log1516_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=11  THEN orderid END) as log1516_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='15:00:00' and time(ord.created_at)<'16:00:00' and orderstatus=12  THEN orderid END) as log1516_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=0  THEN orderid END) as log1617_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=1  THEN orderid END) as log1617_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=2  THEN orderid END) as log1617_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=3  THEN orderid END) as log1617_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=4  THEN orderid END) as log1617_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=5  THEN orderid END) as log1617_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=6  THEN orderid END) as log1617_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=7  THEN orderid END) as log1617_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=8  THEN orderid END) as log1617_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=9  THEN orderid END) as log1617_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=10  THEN orderid END) as log1617_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=11  THEN orderid END) as log1617_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='16:00:00' and time(ord.created_at)<'17:00:00' and orderstatus=12  THEN orderid END) as log1617_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=0  THEN orderid END) as log1718_orderstatus0,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=1  THEN orderid END) as log1718_orderstatus1,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=2  THEN orderid END) as log1718_orderstatus2,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=3  THEN orderid END) as log1718_orderstatus3,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=4  THEN orderid END) as log1718_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=5  THEN orderid END) as log1718_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=6  THEN orderid END) as log1718_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=7  THEN orderid END) as log1718_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=8  THEN orderid END) as log1718_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=9  THEN orderid END) as log1718_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=10  THEN orderid END) as log1718_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=11  THEN orderid END) as log1718_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='17:00:00' and time(ord.created_at)<'18:00:00' and orderstatus=12  THEN orderid END) as log1718_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=0  THEN orderid END) as log1819_orderstatus0, COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=1  THEN orderid END) as log1819_orderstatus1, COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=2  THEN orderid END) as log1819_orderstatus2, COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=3  THEN orderid END) as log1819_orderstatus3, COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=4  THEN orderid END) as log1819_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=5  THEN orderid END) as log1819_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=6  THEN orderid END) as log1819_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=7  THEN orderid END) as log1819_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=8  THEN orderid END) as log1819_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=9  THEN orderid END) as log1819_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=10  THEN orderid END) as log1819_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=11  THEN orderid END) as log1819_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='18:00:00' and time(ord.created_at)<'19:00:00' and orderstatus=12  THEN orderid END) as log1819_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=0  THEN orderid END) as log1920_orderstatus0, COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=1  THEN orderid END) as log1920_orderstatus1, COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=2  THEN orderid END) as log1920_orderstatus2, COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=3  THEN orderid END) as log1920_orderstatus3, COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=4  THEN orderid END) as log1920_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=5  THEN orderid END) as log1920_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=6  THEN orderid END) as log1920_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=7  THEN orderid END) as log1920_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=8  THEN orderid END) as log1920_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=9  THEN orderid END) as log1920_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=10  THEN orderid END) as log1920_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=11  THEN orderid END) as log1920_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='19:00:00' and time(ord.created_at)<'20:00:00' and orderstatus=12  THEN orderid END) as log1920_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=0  THEN orderid END) as log2021_orderstatus0, COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=1  THEN orderid END) as log2021_orderstatus1, COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=2  THEN orderid END) as log2021_orderstatus2, COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=3  THEN orderid END) as log2021_orderstatus3, COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=4  THEN orderid END) as log2021_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=5  THEN orderid END) as log2021_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=6  THEN orderid END) as log2021_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=7  THEN orderid END) as log2021_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=8  THEN orderid END) as log2021_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=9  THEN orderid END) as log2021_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=10  THEN orderid END) as log2021_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=11  THEN orderid END) as log2021_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='20:00:00' and time(ord.created_at)<'21:00:00' and orderstatus=12  THEN orderid END) as log2021_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=0  THEN orderid END) as log2122_orderstatus0, COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=1  THEN orderid END) as log2122_orderstatus1, COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=2  THEN orderid END) as log2122_orderstatus2, COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=3  THEN orderid END) as log2122_orderstatus3, COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=4  THEN orderid END) as log2122_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=5  THEN orderid END) as log2122_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=6  THEN orderid END) as log2122_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=7  THEN orderid END) as log2122_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=8  THEN orderid END) as log2122_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=9  THEN orderid END) as log2122_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=10  THEN orderid END) as log2122_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=11  THEN orderid END) as log2122_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='21:00:00' and time(ord.created_at)<'22:00:00' and orderstatus=12  THEN orderid END) as log2122_orderstatus12,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=0  THEN orderid END) as log2223_orderstatus0, COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=1  THEN orderid END) as log2223_orderstatus1, COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=2  THEN orderid END) as log2223_orderstatus2, COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=3  THEN orderid END) as log2223_orderstatus3, COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=4  THEN orderid END) as log2223_orderstatus4,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=5  THEN orderid END) as log2223_orderstatus5,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=6  THEN orderid END) as log2223_orderstatus6,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=7  THEN orderid END) as log2223_orderstatus7,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=8  THEN orderid END) as log2223_orderstatus8,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=9  THEN orderid END) as log2223_orderstatus9,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=10  THEN orderid END) as log2223_orderstatus10,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=11  THEN orderid END) as log2223_orderstatus11,COUNT(CASE WHEN time(ord.created_at)>='22:00:00' and time(ord.created_at)<'23:00:00' and orderstatus=12  THEN orderid END) as log2223_orderstatus12 from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id left join Zone as zo on zo.id=mu.zone where date(ord.created_at) between DATE_SUB(CURDATE(), INTERVAL 1 DAY) and DATE_SUB(CURDATE(), INTERVAL 1 DAY) group by date(ord.created_at),mu.zone";
    var ordermatrix = await query(ordermatrixquery);

    var kitchenshutdownmatrixquery ="select date(date) as date,mu.zone as zone_id,zo.Zonename,makeit_id,SUBTIME('00:59:00', if(mdr.log0809!='00:00:00',mdr.log0809,'00:00:00')) as shutdown0809,SUBTIME('00:59:00', if(mdr.log0910!='00:00:00',mdr.log0910,'00:00:00')) as shutdown0910,SUBTIME('00:59:00', if(mdr.log1011!='00:00:00',mdr.log1011,'00:00:00')) as shutdown1011,SUBTIME('00:59:00', if(mdr.log1112!='00:00:00',mdr.log1112,'00:00:00')) as shutdown1112,SUBTIME('00:59:00', if(mdr.log1213!='00:00:00',mdr.log1213,'00:00:00')) as shutdown1213,SUBTIME('00:59:00', if(mdr.log1314!='00:00:00',mdr.log1314,'00:00:00')) as shutdown1314,SUBTIME('00:59:00', if(mdr.log1415!='00:00:00',mdr.log1415,'00:00:00')) as shutdown1415,SUBTIME('00:59:00', if(mdr.log1516!='00:00:00',mdr.log1516,'00:00:00')) as shutdown1516,SUBTIME('00:59:00', if(mdr.log1617!='00:00:00',mdr.log1617,'00:00:00')) as shutdown1617,SUBTIME('00:59:00', if(mdr.log1718!='00:00:00',mdr.log1718,'00:00:00')) as shutdown1718,SUBTIME('00:59:00', if(mdr.log1819!='00:00:00',mdr.log1819,'00:00:00')) as shutdown1819,SUBTIME('00:59:00', if(mdr.log1920!='00:00:00',mdr.log1920,'00:00:00')) as shutdown1920,SUBTIME('00:59:00', if(mdr.log2021!='00:00:00',mdr.log2021,'00:00:00')) as shutdown2021,SUBTIME('00:59:00', if(mdr.log2122!='00:00:00',mdr.log2122,'00:00:00')) as shutdown2122,SUBTIME('00:59:00', if(mdr.log2223!='00:00:00',mdr.log2223,'00:00:00')) as shutdown2223 from Makeit_daywise_report as mdr left join MakeitUser as mu on mu.userid=mdr.makeit_id left join Zone as zo on zo.id=mu.zone where date(mdr.date) between DATE_SUB(CURDATE(), INTERVAL 1 DAY) and DATE_SUB(CURDATE(), INTERVAL 1 DAY) ";
    var kitchenshutdownmatrix = await query(kitchenshutdownmatrixquery);

    var logisticsshutdownmatrixquery ="select type,zone_id,created_at from Queue_Timelog where date(created_at) between DATE_SUB(CURDATE(), INTERVAL 1 DAY) and DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
    var logisticsshutdownmatrix = await query(logisticsshutdownmatrixquery);

  //makeitmatrix.push(moveitmatrix);
  
  if (makeitmatrix.length !== 0) {
    let resobj = {
      success: true,
      status:true,
      makeitmatrix:makeitmatrix,
      moveitmatrix:moveitmatrix,
      ordermatrix:ordermatrix,
      kitchenshutdownmatrix:kitchenshutdownmatrix,
      logisticsshutdownmatrix:logisticsshutdownmatrix
    };
    result(null, resobj);
  }else {
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status:false
    };
    result(null, resobj);
  }    
};

module.exports = Order;