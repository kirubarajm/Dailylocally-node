"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require("util");
var master = require("../master");
var constant = require("../constant.js");
var Notification = require("../../model/common/notificationModel.js");
var sendsms =  require("../common/smsModel");
var moment = require("moment");
const Razorpay = require("razorpay");
var PushConstant = require("../../push/PushConstant.js");
var Category = require("../../model/category/categoryModel");
var razer_customerid_responce = require("../../model/common/razorpaycustomeridresponceModel");
var CouponUsed = require("../../model/common/couponUsedModel");
var orderproductModel = require("../../model/common/orderproductModel");
var instance = new Razorpay({
  key_id: constant.razorpay_key_id,
  key_secret: constant.razorpay_key_secret
})
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Order = function(order) {
  this.userid = order.userid;
  this.tsid = order.tsid;
  this.price = order.price || 0;
  this.gst = order.gst;
  this.payment_status = order.payment_status || 0;
  this.aid = order.aid || 0;
  this.cus_lat = order.cus_lat;
  this.cus_lon = order.cus_lon;
  this.cus_address = order.cus_address;
  this.cus_address_title = order.cus_address_title;
  this.flatno = order.flatno;
  this.cus_locality= order.cus_locality;
  this.cus_pincode = order.cus_pincode ||0;
  this.landmark = order.landmark;
  this.app_type = order.app_type || 0;
  // this.delivery_charge = order.delivery_charge;
  this.payment_type = order.payment_type;

  
};


Order.read_a_proceed_to_pay = async function read_a_proceed_to_pay(req,orderitems,subscription,result) {
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");


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

    if (req.payment_type==1) {
      
        var address_data = await query("Select * from Address where aid = '" +req.aid +"' and userid = '" +req.userid +"'");
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
  
            //normal flow order creation
            console.log("normal flow order creation");
            
            Category.read_a_cartdetails(req, orderitems, subscription,async function(err,res3) {
                  if (err) {
                    result(err, null);
                  } else {
                    if (res3.status != true) {
                      result(null, res3);
                    } else {
                      var amountdata = res3.result[0].amountdetails;

                      req.gst = amountdata.gstcharge;
                      req.price = amountdata.grandtotal;             
                      req.cus_address = address_data[0].address;
                      req.cus_lat = address_data[0].lat;
                      req.cus_lon = address_data[0].lon;
                      req.cus_address_title = address_data[0].address_title;
                      req.cus_locality = address_data[0].locality;
                      req.flatno = address_data[0].flatno;
                      req.landmark = address_data[0].landmark;
                      req.cus_pincode = address_data[0].pincode;
                      req.delivery_charge = amountdata.delivery_charge;

                      var Other_Item_list =  res3.result[0].item.concat(res3.result[0].subscription_item);

                      console.log("Other_Item_list0",Other_Item_list);
                      Order.OrderOnline(req,Other_Item_list,function(err,res){
                        if (err) {
                          result(err, null);
                        } else {
                          console.log("res",res);
                          result(null, res);
                        }
                      });
                    }
                  }
                });
 }
  
    } else {
      
      let resobj = {
        success: true,
        status: false,
        message: "Sorry! Please make a Payment via online, Currently we are not accepting COD orders"
      };
      result(null, resobj);

    }
  
  
  
};

Order.OrderOnline = async function OrderOnline(req,Other_Item_list,result) {

  
  var customerid = await Order.create_customerid_by_razorpay(req.userid);
  if (customerid.statusCode === 400) {
    let resobj = {
      success: true,
      status: false,
     message: customerid.error.description
      
      
    };
  result(null,resobj );
  return
}

  Order.OrderInsert(req, Other_Item_list,true,true,function(err,res){
    if (err) {
      result(err, null);
    } else {

     
      res.price=req.price;
      res.razer_customerid=customerid,
      result(null, res);
    }
  });
}

Order.OrderInsert = async function OrderInsert(req, Other_Item_list,isMobile,isOnlineOrder,result) {

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
        console.log(err);
        sql.rollback(function() {
          result(err, null); //result.send(err);
        });
      }else{
        var orderid = res1.insertId;

      //  console.log("Other_Item_list",Other_Item_list);
          for (var i = 0; i < Other_Item_list.length; i++) {
          var orderitem = {};
          orderitem.orderid = orderid;
          orderitem.pid = Other_Item_list[i].pid;
          orderitem.productname = Other_Item_list[i].Productname;
          orderitem.quantity = Other_Item_list[i].cartquantity;
          orderitem.price = Other_Item_list[i].amount;
          orderitem.deliverydate = Other_Item_list[i].deliverydate;
          orderitem.starting_date = Other_Item_list[i].starting_date || '';
          orderitem.no_of_deliveries = Other_Item_list[i].no_of_deliveries || 7; 
          orderitem.subscription = Other_Item_list[i].subscription || 0;
          orderitem.mon = Other_Item_list[i].mon || 0;
          orderitem.tue = Other_Item_list[i].tue || 0;
          orderitem.wed = Other_Item_list[i].wed || 0;
          orderitem.thur = Other_Item_list[i].thur || 0;
          orderitem.fri = Other_Item_list[i].fri || 0;
          orderitem.sat = Other_Item_list[i].sat || 0;
          orderitem.sun = Other_Item_list[i].sun || 0;
          

          var items = new orderproductModel(orderitem);
        
          orderproductModel.createOrderitems(items, function(err, res2) {
            if (err) { 
              sql.rollback(function() {
               
                result(err, null);
              });
            }
          });

         
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


Order.Customeridresponse = function Customeridresponse(req) {
  var new_req = new razer_customerid_responce(req);
  razer_customerid_responce.create_Customeridresponse(new_req, function(err, res) {
    if (err) return err;
    else return res;
  });
};
Order.create_customerid_by_razorpay = async function create_customerid_by_razorpay(userid) {

  const userinfo = await query("Select * from User where userid = '" + userid + "'");

  var customerid = userinfo[0].razer_customerid;
  var cust_email = userinfo[0].email;
  if(customerid) return customerid;

  var email=userinfo[0].email.trim();
  var name = userinfo[0].name;
  //  email = 
  var contact = userinfo[0].phoneno;
  var notes = "dailylocally";
  var fail_existing="0";
  var cuId = false;


  var req={};
    req.userid= userinfo[0].userid;
  return await instance.customers.create({name, email, contact, notes,fail_existing})
  .then((data) => {
    cuId=data.id;
    
  // console.log("data-->",data);
    
    req.razorpay_response = JSON.stringify(data);
    req.statuscode=1;
    Order.Customeridresponse(req);
    //  const updateforrazer_customerid = await query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " + req.userid +" ");
    // console.log("req1: ", req);
      sql.query("UPDATE User SET razer_customerid ='" +data.id+"'  where userid = " +userinfo[0].userid +" ", function(err, customerupdate) {
       if (err) {
        console.log("error: ", err);
          return false;
       } 
      });
      console.log("cuId:----- ", cuId);
       return cuId;
      }).catch((error) => {
        // console.log("error: ", error);
       

        req.razorpay_response = JSON.stringify(error);
        req.statuscode=2;
        // console.log("req2: ", req);
         Order.Customeridresponse(req);
        return error;
      })
};


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
  var orderUpdateQuery ="update Orders set payment_status = '" +order_place.payment_status +"',tsid='" + order_place.transactionid +"',transaction_status='"+transaction_status+"', transaction_time= '" +transaction_time +"' WHERE orderid = '" +
  order_place.orderid +
  "' ";

  //////////= Razorpay caption =////////// 
// if(order_place.payment_status === 1){
//   const getprice = await query("select price from Orders where orderid ='"+order_place.orderid+"'");
//   if (getprice.err) {
 
//   }else{
//     var paymentid  = order_place.transactionid;
//     var amount     = getprice[0].price*100;
//     instance.payments.capture(paymentid, parseInt(amount))
//     .then((data)=>{
//       captionupdate = "update Orders set captured_status=1 where transactionid='"+order_place.transactionid+"'";
//       sql.query(captionupdate, async function(err, captionresult) {
//         if (err) {
//           result(err, null);
//         }else{
//           console.log(captionresult);
//         }
//       });
//     }).catch((err)=>{
//       console.log(err);      
//     });
//   }
// }
///////////////////////////////////

  sql.query(orderUpdateQuery, async function(err, res1) {
    if (err) {
      result(err, null);
    } else {
      if (order_place.payment_status === 1) {
       
       

        // if (order_place.cid) {
        //   const orderdetailsquery = "select * from Orders where orderid ='" +order_place.orderid +"'";
        //   sql.query(orderdetailsquery, async function(err, orderdetails) {
        //     if (err) {
        //       result(err, null);
        //     }else{
        //       var new_createCouponUsed = new CouponUsed(order_place); 
        //       new_createCouponUsed.after_discount_cost = orderdetails[0].price
        //       new_createCouponUsed.order_cost = orderdetails[0].original_price
        //       new_createCouponUsed.userid = orderdetails[0].userid
          
        //       CouponUsed.createCouponUsed(new_createCouponUsed, function(err, res2) {
        //         if (err) {
        //           result(err, null);
        //           return;
        //         }
        //       });
        //     }
        //   });
        //  }
         
        var getordertypequery = "select us.phoneno from Orders as ord left join User as us on us.userid=ord.userid where ord.orderid="+order_place.orderid;
        var getordertype = await query(getordertypequery);
               
          sendsms.ordersuccess_send_sms(order_place.orderid,getordertype[0].phoneno);          
     

         let resobj = {
           success: true,
           status: true,
           message: "Your order placed successfully"
         };
         result(null, resobj);
     

       
      }else if (order_place.payment_status === 2) {
        let resobj = {
          success: true,
          message: "Sorry payment not yet be paid following order",
          status: false,
          orderid: order_place.orderid
        };
        result(null, resobj);
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

module.exports = Order;