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
var dayorder = require("../../model/common/dayorderModel");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");



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
  this.city = order.city;
  this.flat_house_no = order.flat_house_no;
  this.plot_house_no = order.plot_house_no;
  this.cus_pincode = order.cus_pincode ||0;
  this.landmark = order.landmark;
  this.app_type = order.app_type || 0;
  this.payment_type = order.payment_type;
  this.google_address = order.google_address;
  this.complete_address = order.complete_address;
  this.floor = order.floor;
  this.block_name = order.block_name;
  this.city = order.city;
  this.apartment_name = order.apartment_name;
  this.zoneid=order.zoneid;
  this.address_type=order.address_type;

  
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
                      req.delivery_charge = amountdata.delivery_charge;
                      req.zoneid =  res3.result[0].id;

                      req.google_address = address_data[0].google_address;
                      req.complete_address = address_data[0].complete_address;
                      req.flat_house_no = address_data[0].flat_house_no;
                      req.plot_house_no = address_data[0].plot_house_no;
                      req.floor = address_data[0].floor;
                      req.block_name = address_data[0].block_name;
                      req.city = address_data[0].city;
                      req.cus_lat = address_data[0].lat;
                      req.cus_lon = address_data[0].lon;
                      req.landmark = address_data[0].landmark;
                      req.cus_pincode = address_data[0].pincode;
                      req.apartment_name = address_data[0].apartment_name;
                      req.address_type = address_data[0].address_type;


                      var Other_Item_list =  res3.result[0].item.concat(res3.result[0].subscription_item);

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

        console.log("Other_Item_list",Other_Item_list);
          for (var i = 0; i < Other_Item_list.length; i++) {
         
          var orderitem = {};
          orderitem.orderid = orderid;
          orderitem.vpid = Other_Item_list[i].vpid;
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

      sql.query(orderUpdateQuery, async function(err, res1) {
        if (err) {
          result(err, null);
        } else {
          if (order_place.payment_status === 1) {         
            var getordertypequery = "select us.phoneno,us.userid from Orders as ord left join User as us on us.userid=ord.userid where ord.orderid="+order_place.orderid;
            var getordertype = await query(getordertypequery);
            order_place.userid=getordertype[0].userid;
            order_place.zoneid=orderdetails[0].zoneid;
            sendsms.ordersuccess_send_sms(order_place.orderid,getordertype[0].phoneno);     
            
            var getproductdetails = "select op.id,op.vpid,op.orderid,op.productname,op.quantity,op.price,op.deliverydate,op.starting_date,op.no_of_deliveries,op.subscription,op.mon,op.tue,op.wed,op.thur,op.fri,op.sat,op.sun,op.status,op.created_at,pm.hsn_code,pm.Productname,pm.image,pm.brand,pm.mrp,pm.basiccost,pm.targetedbaseprice,pm.discount_cost,pm.gst,pm.scl1_id,pm.scl2_id,pm.subscription as subscription1,pm.weight,pm.uom,pm.packetsize,pm.vegtype,pm.tag,pm.short_desc,pm.productdetails,pm.Perishable from Orderproducts as op left join Product_live as pl on pl.vpid=op.vpid left join ProductMaster as pm on pm.pid=pl.pid  where status=0 and orderid="+order_place.orderid;
            var getproduct = await query(getproductdetails);
            console.log("getproduct==========>",getproduct);
            dayorder.checkdayorder(order_place,getproduct);

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




Order.live_order_list_byuserid = async function live_order_list_byuserid(req,result) {



  var orderdetails = await query(" select ors.* from Dayorder ors join Dayorder_products drp on drp.doid = ors.id where ors.userid ='" +req.userid +"' and ors.dayorderstatus  = 6   order by ors.id desc limit 1");

  if (orderdetails.length !== 0) {

    orderdetails[0].rating = false;
    orderdetails[0].showrating = false;
    
  if (orderdetails[0].rating_skip < constant.max_order_rating_skip) {
              
    var orderratingdetails = await query("select * from day_order_rating where orderid ='" +orderdetails[0].id +"'");
   
    var today = moment();
    var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
    var diffMs  = (today - moveit_actual_delivered_time);
    var diffDays = Math.floor(diffMs / 86400000); 
    var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
    var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);

    if (orderratingdetails.length !== 0) orderdetails[0].rating = true;
    if (diffDays || diffHrs || diffMins > 0) orderdetails[0].showrating = true;

  }
  }
  // or payment_status !=3)
  liveorderquery ="select dr.userid,dr.date,dr.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('quantity', op.quantity,'vpid',op.vpid,'price',op.price,'product_name',op.productname)) AS items from Dayorder dr left join Dayorder_products dp on dp.doid=dr.id left join Orderproducts op on op.orderid=dp.orderid and op.vpid=dp.vpid where dr.userid ='"+req.userid+"' and dr.dayorderstatus < 6  group by dr.id order by dr.date ";

               
  sql.query(liveorderquery,async function(err, res1) {
    if (err) {
      result(err, null);
    } else {
 
   

      for (let i = 0; i < res1.length; i++) {
   
        if (res1[i].items) {
          res1[i].items = JSON.parse(res1[i].items);
          // console.log("items",items);
          // res1[i].items = items.item;
        }
      }

     
  
    
          let resobj = {
            success: true,
            status: true,
            orderdetails: orderdetails,
            result: res1
          };

          result(null, resobj);  



    }
  });
 




};


Order.order_skip_count = async function order_skip_count(req,result) {

  var orderdetails = await query("select * from Dayorder where orderid = '"+req.doid+"'");

  if (orderdetails.length !==0) {
    
    rating_skip =  orderdetails[0].rating_skip + 1;

    var skipupdatequery = await query("update Dayorder set rating_skip = "+rating_skip+"  where orderid = '"+req.doid+"'");
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


Order.day_order_view_by_user = function day_order_view_by_user(req, result) {

  var orderquery =  "select dr.userid,dr.date,dr.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('quantity', op.quantity,'vpid',op.vpid,'price',op.price,'product_name',op.productname)) AS items from Dayorder dr left join Dayorder_products dp on dp.doid=dr.id left join Orderproducts op on op.orderid=dp.orderid and op.vpid=dp.vpid where dr.id ='"+req.doid+"'  group by dr.id order by dr.date" ;//and dm.active_status=1
  sql.query(orderquery,async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "Order not found!",
            result: []
          };
          result(null, resobj);
        } else {

               
              

              

              

                if (res1[0].items) {
                  var items = JSON.parse(res1[0].items);
                  res1[0].items = items.item;
                }

          
            


                  let resobj = {
                    success: true,
                    status: true,
                    result: res1
                  };
  
                  result(null, resobj);  
  
                  
        }
      }
    }
  );
};


Order.day_orderlist_user = async function day_orderlist_user(req,result) {

  var query = "select dr.userid,dr.date,dr.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('quantity', op.quantity,'vpid',op.vpid,'price',op.price,'product_name',op.productname)) AS items from Dayorder dr left join Dayorder_products dp on dp.doid=dr.id left join Orderproducts op on op.orderid=dp.orderid and op.vpid=dp.vpid where dr.userid ='"+req.userid+"'   group by dr.id order by dr.date";
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
           for (let i = 0; i < history_list.length; i++) {

             if (history_list[i].items) {
               var items = JSON.parse(history_list[i].items);
               history_list[i].items = items;
             }

            
           }

           
           let resobj = {
             success: true,
             status: true,
             result: history_list
           };

           result(null, resobj);

        
        }
      }
    }
  );
};


Order.order_list_calendar_by_month_wise = async function order_list_calendar_by_month_wise(req,result) {

  var query = "select dr.userid,dr.date,dr.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('dayorderpid',op.id,'quantity', op.quantity,'vpid',op.vpid,'price',op.price,'product_name',op.productname,'unit',um.name,'brandname',br.brandname,'weight',dp.product_weight*1000,'quantity_info',dp.quantity)) AS items from Dayorder dr left join Dayorder_products dp on dp.doid=dr.id left join Orderproducts op on op.orderid=dp.orderid and op.vpid=dp.vpid left join UOM um on um.uomid=dp.product_uom left join Fav faa on faa.vpid = dp.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=dp.product_brand where dr.userid ='"+req.userid+"' AND YEAR(dr.date) = '"+req.year+"' AND MONTH(dr.date) = '"+req.month+"' group by dr.id order by dr.date";

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
           for (let i = 0; i < history_list.length; i++) {

          

             if (history_list[i].items) {
               var items = JSON.parse(history_list[i].items);
               history_list[i].items = items;
             }

            
           }

           
           let resobj = {
             success: true,
             status: true,
             result: history_list
           };

           result(null, resobj);

        
        }
      }
    }
  );
};


Order.order_list_calendar_by_day_wise = async function order_list_calendar_by_day_wise(req,result) {

  var query = "select dr.userid,dr.date,dr.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('doid',dr.id,'dayorderpid',op.id,'quantity', op.quantity,'vpid',op.vpid,'price',op.price,'product_name',op.productname,'unit',um.name,'brandname',br.brandname,'weight',dp.product_weight*1000,'quantity_info',dp.quantity)) AS items from Dayorder dr left join Dayorder_products dp on dp.doid=dr.id left join Orderproducts op on op.orderid=dp.orderid and op.vpid=dp.vpid left join UOM um on um.uomid=dp.product_uom left join Fav faa on faa.vpid = dp.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=dp.product_brand where dr.userid ='"+req.userid+"' and DATE(dr.date) = '"+req.date+"'  group by dr.id order by dr.date";
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
           for (let i = 0; i < history_list.length; i++) {

            history_list[i].dayorderstatus=10

            history_list[i].rating_status = false;
            if (history_list[i].dayorderstatus = 10) {
              history_list[i].rating_status = true;
            }

             if (history_list[i].items) {
               var items = JSON.parse(history_list[i].items);
               history_list[i].items = items;
             }

            
           }

           
           let resobj = {
             success: true,
             status: true,
             result: history_list
           };

           result(null, resobj);

        
        }
      }
    }
  );
};


Order.order_transaction_order_list = async function order_transaction_order_list(req,result) {

  var query = "select ors.*,JSON_LENGTH(JSON_ARRAYAGG(JSON_OBJECT('quantity', ops.quantity,'vpid',ops.vpid,'price',ops.price,'product_name',ops.productname,'product_name',ops.productname))) AS items from Orders ors left join Orderproducts ops on ops.orderid=ors.orderid where ors.userid ='"+req.userid+"' and ors.payment_status=1 group by ors.orderid order by ors.created_at desc  " ;
  sql.query(query,async function(err, res) {
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
           
           
           let resobj = {
             success: true,
             status: true,
             result: res
           };

           result(null, resobj);

        
        }
      }
    }
  );
}


Order.day_order_transaction_view_by_user = function day_order_transaction_view_by_user(req, result) {
//,JSON_ARRAYAGG(JSON_OBJECT('quantity_info',dp.quantity+'pkts','quantity', dp.quantity,'vpid',dp.vpid,'price',dp.price,'product_name',dp.productname,'product_name',dp.productname,'unit',um.name,'brandname',br.brandname,'weight',pm.weight*1000,'dayorderstatus',dor.dayorderstatus,'Cancel_available',IF(dp.scm_status <=5,true,false),'product_date',IF(dp.scm_status <=5,dor.date,IF(dp.scm_status =10,dp.delivery_date,IF(dp.scm_status =11,dp.product_cancel_time,dor.date))),'scm_status',dp.scm_status,'scm_status_name',IF(dp.scm_status <=5,'inprogress',IF(dp.scm_status =10 ,'Deliverd',IF(dp.scm_status =11 ,'cancelled','Waiting for delivery')))  )) AS items
  // var orderquery =  "select ors.*,JSON_ARRAYAGG(JSON_OBJECT('quantity', dp.quantity,'vpid',dp.vpid,'price',dp.price,'product_name',dp.productname,'product_name',dp.productname,'unit',um.name,'brandname',br.brandname,'weight',pm.weight*1000,'dayorderstatus',dor.dayorderstatus )) AS items from Orders ors left join Dayorder_products dp on dp.orderid=ors.orderid left join Dayorder dor on dor.id=dp.doid left join Product_live pl on pl.vpid=dp.vpid left join ProductMaster pm on pm.pid=pl.vpid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pm.brand where ors.orderid  ='"+req.orderid+"' " ;//and dm.active_status=1

  var orderquery =  "select ors.*,JSON_ARRAYAGG(JSON_OBJECT('quantity_info',dp.quantity+'pkts','quantity', dp.quantity,'vpid',dp.vpid,'price',dp.price,'product_name',dp.productname,'product_name',dp.productname,'unit',um.name,'brandname',br.brandname,'weight',pm.weight*1000,'dayorderstatus',dor.dayorderstatus,'Cancel_available',IF(dp.scm_status <=5,true,false),'product_date',IF(dp.scm_status <=5,dor.date,IF(dp.scm_status =10,dp.delivery_date,IF(dp.scm_status =11,dp.product_cancel_time,dor.date))),'scm_status',dp.scm_status,'scm_status_name',IF(dp.scm_status <=5,'inprogress',IF(dp.scm_status =10 ,'Deliverd',IF(dp.scm_status =11 ,'cancelled','Waiting for delivery')))  )) AS items from Orders ors left join Dayorder_products dp on dp.orderid=ors.orderid left join Dayorder dor on dor.id=dp.doid left join Product_live pl on pl.vpid=dp.vpid left join ProductMaster pm on pm.pid=pl.vpid left join UOM um on um.uomid=pm.uom left join Fav faa on faa.vpid = pl.vpid and faa.userid = 3 left join Brand br on br.id=pm.brand where ors.orderid='"+req.orderid+"' " ;//and dm.active_status=1
  sql.query(orderquery,async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "Order not found!",
            result: []
          };
          result(null, resobj);
        } else {



     
                if (res1[0].items) {
                  var items = JSON.parse(res1[0].items);
                  res1[0].items = items;
                   res1[0].itemscount = items.length;
                }

          
                var cartdetails = [];
                var totalamountinfo = {};
                var couponinfo = {};
                var gstinfo = {};
                var deliverychargeinfo = {};
                var other_charges_info = {};
                deliverychargeinfo.low_cost_status=false//show low cost 30
                deliverychargeinfo.default_cost_status = false;//default cost 30
                deliverychargeinfo.infostatus = true;
                deliverychargeinfo.infodetails = [];
      
                //var grandtotalinfo = {};
      
                totalamountinfo.title = "Total Amount";
                totalamountinfo.charges = res1[0].price;
                totalamountinfo.status = true;
                totalamountinfo.infostatus = false;
                totalamountinfo.color_code = "#ff444444";
                totalamountinfo.low_cost_status = false;
                totalamountinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
                totalamountinfo.default_cost=constant.convenience_charge;
                totalamountinfo.default_cost_status=false;
                totalamountinfo.infodetails = [];            
                cartdetails.push(totalamountinfo);
      
                if (res1[0].coupon) {
                  couponinfo.title = "Discount (-)";
                  couponinfo.charges = coupon_discount_amount;
                  couponinfo.status = true;
                  couponinfo.infostatus = false;
                  couponinfo.color_code = "#129612";
                  couponinfo.low_cost_status = false;
                  couponinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
                  couponinfo.default_cost=constant.convenience_charge;
                  couponinfo.default_cost_status=false;
                  couponinfo.infodetails = [];
                  cartdetails.push(couponinfo);
                }
      
                if (res1[0].gst !==0) {
                  gstinfo.title = "Taxes ";//gst modified taxes 13-jan-2020
                gstinfo.charges = res1[0].gst;
                gstinfo.status = true;
                gstinfo.infostatus = false;
                gstinfo.color_code = "#ff444444";
                gstinfo.low_cost_status = false;
                gstinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
                gstinfo.default_cost=constant.convenience_charge;
                gstinfo.default_cost_status=false;
                gstinfo.infodetails = [];
                cartdetails.push(gstinfo);
                }
                
      
                // //this code is modified 23-09-2019
                if (res1[0].delivery_charge !==0) {
                 
                  deliverychargeinfo.title = "Delivery charge";
                  deliverychargeinfo.charges = res1[0].delivery_charge;
                  deliverychargeinfo.status = true;
                  cartdetails.push(deliverychargeinfo);
                }    
                
               
      
                res1[0].cartdetails=cartdetails;
                  let resobj = {
                    success: true,
                    status: true,
                    result: res1
                  };
  
                  result(null, resobj);  
  
                  
        }
      }
    }
  );
};


Order.payment_check = function payment_check(orderid, result) {

  var orderquery =  "select * from Orders where orderid='"+orderid+"' ";
  sql.query(orderquery,async function(err, res1) {
      if (err) {
        result(err, null);
      } else {
        if (res1.length === 0) {
          let resobj = {
            success: true,
            status: false,
            message: "Order not found!",
            result: []
          };
          result(null, resobj);
        } else {

              

                  let resobj = {
                    success: true,
                    status: true,
                    result: res1
                  };
  
                  result(null, resobj);  
  
                  
        }
      }
    }
  );
};

module.exports = Order;