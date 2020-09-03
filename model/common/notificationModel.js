"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var FCM_Moveit = require("../../push/Moveit_SendNotification.js");
var FCM_DL = require("../../push/Dl_SendNotification.js");
var FCM_ADMIN = require("../../push/Admin_SendNotification.js");

var PushConstant = require("../../push/PushConstant.js");

var Notification = function(notification) {
  this.title = notification.title;
  this.message = notification.message;
};

Notification.getPushOrderDetail_old = async function(orderid) {
  var orders = await query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail"+
    "from Orders as ors "+
    "left join User as us on ors.userid=us.userid "+
    "where ors.orderid ='" +orderid +"'"
  );
  return orders[0];
};

Notification.getPushOrderDetail = async function(orderid) {
  
  var orders = await query("select mt.tripid as orderid,dayo.id as price,dayo.complete_address as cus_address,mt.moveit_id as moveit_user_id,us.pushid_android,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail from Moveit_trip as mt left join Dayorder as dayo on dayo.trip_id=mt.tripid left join User as us on us.userid=dayo.userid where mt.tripid="+orderid+" group by mt.tripid");
  // console.log("orders[0]==>",orders[0]);
  return orders[0];
};

Notification.getPushtripDetail = async function(tripid) {
  var tripdetailsquery = "select Count(id) as order_count,trip_id from Dayorder where trip_id="+tripid;
  var trip = await query(tripdetailsquery);
  //  console.log("trip[0]==>",trip[0]);
  return trip[0];
};

Notification.getVirtualMakeitPushId = async function(makeit_id) {
  var vMkPushId = await query("SELECT au.push_token from MakeitUser mu left join Admin_users au on au.makeit_hubid=mu.makeithub_id where userid ='" +makeit_id +"'"
  );
  return vMkPushId[0];
};


Notification.getEatUserDetail = async function(userid) {
  var EatUser = await query("SELECT * FROM User where userid = " + userid);
  return EatUser[0];
};

Notification.getMovieitDetail = async function(userid) {
  var MoveitUser = await query("SELECT * FROM MoveitUser where userid = " + userid);
  return MoveitUser[0];
};



Notification.orderdlPushNotification = async function(orders,userid,pageid) {
  // if (orderid) {
    // var orders = await Notification.getPushOrderDetail(orderid);

    // console.log(orders);
    // var user = JSON.parse(orders.userdetail);
    // var makeituser = JSON.parse(orders.makeitdetail);
    // var moveituser = JSON.parse(orders.moveitdetail);
  // }else{
  //   var userdetails = await Notification.getEatUserDetail(userid.userid);
  //   var user = {};
  //   user.pushid_android=userdetails.pushid_android
  //   user.pushid_ios=userdetails.pushid_ios
  // }


  var data = null;
  switch (pageid) {
    case PushConstant.Pageid_dl_order_post:
      data = {
        title: "Order Post",
        message: "Hi! your Order posted successful.",
        pageid: "" + pageid,
        app: "Dl",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_dl_order_accept:
      var mk_username=makeituser.brandName||""
      mk_username=mk_username?" by "+mk_username :""
      data = {
        title: "Your order has been accepted "+mk_username,
        message: "Your order will be delivered in approximately 30 minutes",
        pageid: "" + pageid,
        app: "Dl",
        notification_type: "2"
      };
      break;

    case PushConstant.masteridOrder_Prepared:
      var mk_username=makeituser.brandName||""
      mk_username=mk_username?" by "+mk_username :""
      data = {
        title: "Your order has been prepared "+mk_username,
        message: "Your order will be delivered in approximately 30 minutes.",
        pageid: "" + pageid,
        app: "Dl",
        notification_type: "2"
      };
      break;

    case PushConstant.Pageid_dl_order_pickedup:
        // var mo_username=moveituser.name||""
        // mo_username=mo_username?" by "+mo_username :""
      data = {
        title: "Your order has been picked up ",
        message: "Call our delivery executive for further information.",
        pageid: "" + pageid,
        app: "Dl",
        notification_type: "2"
      };
      break;

    case PushConstant.Pageid_dl_order_reached:
      data = {
        title: "Your order has reached your location!",
        message: "Fresh products are waiting for you. Our delivery partner might try to get in touch with you! Request you to assist us in serving you best, by picking up your phone.",
        pageid: "" +9,
        date:orders[0].date,
        app: "Dl",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_dl_order_delivered:
      data = {
        title: "Your order #"+orders[0].id+" has been delivered.",
        message: "Your order has been delivered successfully. We request you to share your valuable feedback or complains through the feedback pop up on your app!",
        pageid: "" +9,
        date:orders[0].date,
        app: "Dl",
        notification_type: "1"
      };
      break;

      case PushConstant.Pageid_dl_return_notification:
        data = {
          title: "Your order #"+orders[0].id+" could not be delivered and is returning back to our warehouse.",
          message: "Apologies! Your order could not be delivered and is returning back to our warehouse. Kindly get in touch with us through our chat support for knowing more. ",
          pageid: "" +29,
          date:orders[0].date,
          app: "Dl",
          notification_type: "1"
        };
        break;

    case PushConstant.Pageid_dl_order_cancel:
        data = {
        title: "Your Order #"+orders[0].id+" has been cancelled!.",
        message: "Apologies! Your order has been cancelled due to the following reason " + orders[0].product_cancel_reason,
        pageid: "" +29,
        date:orders[0].date,
        app: "Dl",
        notification_type: "2"
      };

      break;

      case PushConstant.Pageid_dl_reorder_notification:
        data = {
        title: "Re-delivery has been booked for your order #"+orders[0].id,
        message: "Your new order number is #"+orders[0].id+". Your redelivery will be completed by  "+orders[0].date+". Kindly get in touch with us through our chat support to know more",
        pageid: "" +9,
        date:orders[0].date,
        app: "Dl",
        notification_type: "2"
      };

      break;
    case PushConstant.Pageid_eat_send_notification:
        data = {
          title: userid.title,
          message:userid.user_message,
          pageid: "" + pageid,
         
      //    image : "https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1580901027983-promotion_ff.jpg",
          app: "Dl",
          notification_type: "1"
        };
        if (userid.image) {
          data.image=userid.image;
         }
        break;
    case PushConstant.Pageid_dl_trip_assigned_notification:
      data = {
        title: "Your order has been dispatched from our warehouse!",
        message: "Your fresh products are on way. Our delivery partner will reach out to you in case needed. We would like you to collect the order yourself to ensure freshness!",
        pageid: "" +9,
        date: "" +orders[0].date,
        userid: "" +orders[0].userid,
        orderid: "" +orders[0].id,
        timeofdelivery: "" +orders[0].timeofdispatch,
        app: "Dl",
        notification_type: "1"
      };
      break;
    case PushConstant.Pageid_dl_ready_at_wherehouse_notification:
      var msg = "";
      if(orders[0].missingproducts.length>0){
        msg = msg+ "We regret to inform you that we will not be able to deliver these products today. ";
        for (let i = 0; i < orders[0].missingproducts.length; i++) {
          msg = msg+ " "+orders[0].missingproducts[i].productname+" - "+orders[0].missingproducts[i].missingqty+" ";          
        }
        msg = msg+ " Refund will be initiated for these products immediately. Kindly get in touch with our support for more assistance ";
      }else{
        msg = "Each product is locally sourced and packed with care in our Daily Locally's footprinted boxes.";
      }
      data = {
        title: "Your order is ready at our warehouse!",
        message: "" +msg,
        pageid: "" +29,
        date: "" +orders[0].date,
        userid: "" +orders[0].userid,
        orderid: "" +orders[0].id,
        qcchecklistfilledup: "" +orders[0].timeofqc,
        app: "Dl",
        notification_type: "1"
      };
      break;
    case PushConstant.Pageid_dl_dispatched_after_qa_notification:
      data = {
        title: "Your order is dispatched after our QA Proceess",
        message: "We ensure a 3 step Quality Assurance process to ensure footprint packaging and seamless transportation. Our packaging is designed to make sure that there is no spoilage during transit. Looking forward to the smile on your face :)",
        pageid: "" +9,
        date: "" +orders[0].date,
        userid: "" +orders[0].userid,
        orderid: "" +orders[0].id,
        qachecklistfilledup: ""+orders[0].timeofqa,
        app: "Dl",
        notification_type: "1"
      };
      break;

      case PushConstant.Pageid_dl_refund_create:
        data = {
          title: "Refund of Rs"+orders[0].original_amt+" Initiated for Order " +orders[0].id,
          message: "Your refund request has been raised and will be completed within 7 bank working days",
          pageid: "" +29,
          userid: "" +orders[0].userid,
          orderid: "" +orders[0].id,
          refund_amount:""+orders[0].original_amt,
          app: "Dl",
          notification_type: "1"
        };
        break;
      
        case PushConstant.Pageid_dl_refund_repayment:
          data = {
            title: "Yay! Your refund request of Rs."+orders[0].original_amt+" for Order " +orders[0].doid+ " has been approved",
            message: " Your refund request has been raised and will be completed within 5-7 bank working days ",
            pageid: "" +29,
            userid: "" +orders[0].userid,
            orderid: "" +orders[0].doid,
            refund_amount:""+orders[0].original_amt,
            app: "Dl",
            date :orders[0].date,
            notification_type: "1"
          };
          break;
        
          case PushConstant.Pageid_dl_Refund_unapproved_notification:
            data = {
              title: "Your refund request of Rs."+orders[0].original_amt+" for Order " +orders[0].doid+ " has been rejected",
              message: " Our customer support will get in touch with you with the details. In case of urgency, we request you to get in touch with us through our in app chat support ",
              pageid: "" +29,
              userid: "" +orders[0].userid,
              orderid: "" +orders[0].doid,
              refund_amount:""+orders[0].original_amt,
              date :orders[0].date,
              app: "Dl",
              notification_type: "1"
            };
            break;
  }
  if (data == null) return;

 
  //const user = await Notification.getEatUserDetail(userid);
   console.log("data->", data);
  if (orders[0].pushid_android) {
    FCM_DL.sendNotificationAndroid(orders[0].pushid_android, data,1 );
  }
 
  if (orders[0].pushid_ios) {
    FCM_DL.sendNotificationAndroid(orders[0].pushid_ios, data,2);
  }
};


Notification.dlBulkPushNotification = async function(orderid,userid,pageid) {
 

  var data = null;
  switch (pageid) {
 
      case PushConstant.Pageid_dl_bulk_notification:
        data = {
          title: userid.title,
          message:userid.user_message,
          pageid: "" + pageid,
         
      //    image : "https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1580901027983-promotion_ff.jpg",
          app: "Dl",
          notification_type: "1"
        };

        if (userid.image) {
          data.image=userid.image;
         }
        break;
  }
  if (data == null) return;

 
  //const user = await Notification.getEatUserDetail(userid);
  console.log("admin notification data->", data);
  if (userid.pushid_android) {
    FCM_DL.sendNotificationAndroid(userid.pushid_android, data,1 );
  }
 
  if (userid.pushid_ios) {
    FCM_DL.sendNotificationAndroid(userid.pushid_ios, data,2);
  }
  
};




Notification.orderMoveItPushNotification = async function(orderid,pageid,move_it_user_detail,otherfields) {
  console.log("moveit send notification file ----2");
  const orders = await Notification.getPushOrderDetail(orderid);
  const trip = await Notification.getPushtripDetail(orderid);
  // console.log("trip ============>",trip);
  // const moveitdetails = await Notification.getMovieitDetail()
  var Eatuserdetail = JSON.parse(orders.userdetail);
  var data = ""; 

  switch (pageid) {
    case PushConstant.pageidMoveit_Trip_Assigned:
      // Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      data = {
        title: "New Trip "+  trip.trip_id +" assigned",
        message: "Your trip contains " + trip.order_count + " orders.",
        pageid: "" + pageid,
        tripid: "" + trip.trip_id,
        orderid: "0",
        ordercount: "" + trip.order_count,
        app: "Move-it",
        notification_type: "1"
      };
      break;
    case PushConstant.pageidMoveit_Order_Assigned:
      // console.log("pageidMoveit_Order_Assigned ========>");
      // Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      data = {
        title: "Order " +otherfields+ " has been added to trip "+trip.trip_id,
        message: "Order " +otherfields+ " has been added to trip "+trip.trip_id,
        pageid: "" + pageid,
        tripid: "" + trip.trip_id,
        orderid: "" + otherfields,
        ordercount: "" + trip.order_count,
        app: "Move-it",
        notification_type: "1"
      };
      // console.log("pageidMoveit_Order_Assigned data========>",data);
      break;
    case PushConstant.pageidMoveit_Order_Cancel:
      // Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      data = {
        title: "Order Cancel",
        message:
          "Sorry! your current orders is canceled. OrderID is#" + orderid,
        pageid: "" + pageid,
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,
        app: "Move-it",
        notification_type: "1"
      };
      break;
    case PushConstant.pageidMoveit_Order_Prepared:
      data = {
        title: "Order is Prepared",
        message: "Hi! Your current order is prepared.",
        pageid: "" + pageid,
        app: "Move-it",
        notification_type: "1"
      };
      break;
    case PushConstant.pageidMoveit_Order_Reassign:
      data = {
        title: "Order Re-assigned",
        message: "Your order has been assigned to another moveit.",
        pageid: "" + pageid,
        app: "Move-it",
        notification_type: "1",
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,     
      };
      break;
    case PushConstant.pageidMoveit_Order_unassign:
      data = {
        title: "Order un-assigned",
        message: "Your order has been un-assigned.",
        pageid: "" + pageid,
        tripid: "" + trip.trip_id,
        orderid: "" + otherfields,
        ordercount: "" +1,
        app: "Move-it",
        notification_type: "1"
      };
      break;
    case PushConstant.pageidMoveit_return_book:
      data = {
        title: "Return booked for Order "+ otherfields,
        message: "Kindly return this order back to the hub. Do NOT Deliver it to the customer",
        pageid: "" + pageid,
        tripid: "" + trip.trip_id,
        orderid: "" + otherfields,
        ordercount: "1",
        app: "Move-it",
        notification_type: "1"
      };  
      break;
  }
// console.log("data ====>",data);
  if (data == null) return;

  if (!move_it_user_detail) {
    move_it_user_detail = await query("SELECT * FROM MoveitUser where userid = " + orders.moveit_user_id);
    move_it_user_detail = move_it_user_detail[0];
  }

  if (move_it_user_detail && move_it_user_detail.pushid_android) {
    FCM_Moveit.sendNotificationAndroid(move_it_user_detail.pushid_android,data);
  }
};


Notification.queries_answers_PushNotification = async function(userid,qid,answer,type) {
  var Userdetails = null;
  var userTable = "";
  var FCM_Obj = null;
  var appname = "";
  var pageid = "0";
  var ID = "";
  console.log("type--->",type);
  if (type === 1) {
    userTable = "MakeitUser";
    ID = "userid";
    FCM_Obj = FCM_Makeit;
    appname = "Makeit";
    pageid = "" + PushConstant.pageidMakeit_Replies;
  } else if (type === 2) {
    userTable = "MoveitUser";
    ID = "userid";
    FCM_Obj = FCM_Moveit;
    appname = "Moveit";
    pageid = "" + PushConstant.pageidMoveit_Replies;
  } else if (type === 3) {
    userTable = "Sales_QA_employees";
    ID = "id";
    FCM_Obj = FCM_Sales;
    appname = "Sales";
    pageid = "4";
  } else if (type === 4) {
    userTable = "User";
    ID = "userid";
    FCM_Obj = FCM_DL;
    appname = "Eat";
    pageid = "" + PushConstant.Pageid_eat_query_replay;
  }

  var data = null;
  data = {
    title: "Queries Replied",
    message: answer,
    pageid: pageid, //Need to change depends on type
    app: appname,
    notification_type: "1"
  };

  Userdetails = await query(
    "SELECT * FROM " + userTable + " where " + ID + " = " + userid
  );

  if (Userdetails && Userdetails[0].pushid_ios) {
    data.app_type=2;
    FCM_DL.sendNotificationAndroid(Userdetails[0].pushid_ios, data);
  }

  if (Userdetails && Userdetails[0].pushid_android && data) {
    data.app_type=1;
    FCM_Obj.sendNotificationAndroid(Userdetails[0].pushid_android, data);
  }
};


Notification.zendeskPushNotification = async function(req,pageid) {

  var data = null;
  switch (pageid) {
    case PushConstant.Pageid_eat_zendesk_notification:
      data = {
        title: req.notification.title,
        message: req.notification.body,
        ticket_id: "" + req.notification.ticket_id,
        app: "Eat",
        notification_type: "1"
      };
      break;

  }
  if (data == null) return;

 
  //const user = await Notification.getEatUserDetail(userid);
   console.log("data->", data);
  

   for (let i = 0; i < req.devices.length; i++) {
    if (req.devices[i].type=='android') {
    
      FCM_DL.sendNotificationAndroid(req.devices[i].identifier, data,1 );
    }
   
    if (req.devices[i].type=='ios') {
      
      FCM_DL.sendNotificationAndroid(req.devices[i].identifier, data,2);
    }
     
   }

};

module.exports = Notification;
