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
  var orders = await query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail,"+
    "from Orders as ors "+
    "left join User as us on ors.userid=us.userid "+
    "where ors.orderid ='" +orderid +"'"
  );
  return orders[0];
};

Notification.getPushOrderDetail = async function(orderid) {
  var orders = await query("select mt.tripid as orderid,dayo.id as price,dayo.complete_address as cus_address,mt.moveit_id as moveit_user_id,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail from Moveit_trip as mt left join Dayorder as dayo on dayo.trip_id=mt.tripid left join User as us on us.userid=dayo.userid where mt.tripid="+orderid+" group by mt.tripid");
  return orders[0];
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



Notification.orderdlPushNotification = async function(orderid,userid,pageid) {
  // if (orderid) {
    var orders = await Notification.getPushOrderDetail(orderid);
    var user = JSON.parse(orders.userdetail);
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
        title: "Your order near to me",
        message: "Your Order Waiting.Please picked up",
        pageid: "" + pageid,
        app: "Dl",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_dl_order_delivered:
      data = {
        title: "Order Delivered",
        message: "Hi! your Order Delivered successfully",
        pageid: "" + pageid,
        app: "Dl",
        notification_type: "1"
      };
      break;

    case PushConstant.Pageid_dl_order_cancel:
      var  message = "We apologise for the inconvenience caused. Explore our gold members for uninterrupted service. Kindly contact us for more details.";
      if(orders.payment_type==="1"){
        message = "We apologise for the inconvenience caused. Your payment will be refunded within 2 - 4 working days. Kindly contact us for more details. ";
      }
      //COD
      // Content - We apologise for the inconvenience caused. Explore our gold members for uninterrupted service. Kindly contact us for for more details."
      //online
      //Content - We apologise for the inconvenience caused. Your payment will be refunded within 2 - 4 working days. Kindly contact us for more details. "
      data = {
        title: "Your order has been cancelled due to unforeseen circumstances.",
        message: message,
        pageid: "" + pageid,
        payment_type:orders.payment_type,
        app: "Eat",
        notification_type: "2"
      };

      break;
    case PushConstant.Pageid_eat_send_notification:
        data = {
          title: userid.title,
          message:userid.user_message,
          pageid: "" + pageid,
         
      //    image : "https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1580901027983-promotion_ff.jpg",
          app: "Eat",
          notification_type: "1"
        };
        if (userid.image) {
          data.image=userid.image;
         }
        break;
  }
  if (data == null) return;

 
  //const user = await Notification.getEatUserDetail(userid);
   console.log("data->", data);
  if (user && user.pushid_android) {
    FCM_DL.sendNotificationAndroid(user.pushid_android, data,1 );
  }
 
  if (user && user.pushid_ios) {
    FCM_DL.sendNotificationAndroid(user.pushid_ios, data,2);
  }
};

// Notification.orderEatBulkPushNotification = async function(orderid,userid,pageid) {
//   if (orderid) {
//     var orders = await Notification.getPushOrderDetail(orderid);
//     var user = JSON.parse(orders.userdetail);
//     var makeituser = JSON.parse(orders.makeitdetail);
//     var moveituser = JSON.parse(orders.moveitdetail);
//   }else{
//     var userdetails = await Notification.getEatUserDetail(userid.userid);
//     var user = {};
//     user.pushid_android=userdetails.pushid_android
//     user.pushid_ios=userdetails.pushid_ios
//   }


//   var data = null;
//   switch (pageid) {
//     case PushConstant.Pageid_eat_order_post:
//       data = {
//         title: "Order Post",
//         message: "Hi! your Order posted successful.Your OrderID is#" + orderid,
//         pageid: "" + pageid,
//         app: "Eat",
//         notification_type: "1"
//       };
//       break;

//     case PushConstant.Pageid_eat_order_accept:
//       var mk_username=makeituser.brandName||""
//       mk_username=mk_username?" by "+mk_username :""
//       data = {
//         title: "Your order has been accepted "+mk_username,
//         message: "Your order will be delivered in approximately 30 minutes",
//         pageid: "" + pageid,
//         app: "Eat",
//         notification_type: "2"
//       };
//       break;

//       case PushConstant.masteridOrder_Prepared:
//       var mk_username=makeituser.brandName||""
//       mk_username=mk_username?" by "+mk_username :""
//       data = {
//         title: "Your order has been prepared "+mk_username,
//         message: "Your order will be delivered in approximately 30 minutes.",
//         pageid: "" + pageid,
//         app: "Eat",
//         notification_type: "2"
//       };
//       break;

//     case PushConstant.Pageid_eat_order_pickedup:
//         var mo_username=moveituser.name||""
//         mo_username=mo_username?" by "+mo_username :""
//       data = {
//         title: "Your order has been picked up "+mo_username,
//         message: "Call our delivery executive for further information.",
//         pageid: "" + pageid,
//         app: "Eat",
//         notification_type: "2"
//       };
//       break;

//     case PushConstant.Pageid_eat_order_reached:
//       data = {
//         title: "Your order near to me",
//         message: "Your Order Waiting.Please picked up",
//         pageid: "" + pageid,
//         app: "Eat",
//         notification_type: "1"
//       };
//       break;

//     case PushConstant.Pageid_eat_order_delivered:
//       data = {
//         title: "Order Delivered",
//         message: "Hi! your Order Delivered successfully",
//         pageid: "" + pageid,
//         app: "Eat",
//         notification_type: "1"
//       };
//       break;

//     case PushConstant.Pageid_eat_order_cancel:
//       var  message = "We apologise for the inconvenience caused. Explore our gold members for uninterrupted service. Kindly contact us for more details.";
//       if(orders.payment_type==="1"){
//         message = "We apologise for the inconvenience caused. Your payment will be refunded within 2 - 4 working days. Kindly contact us for more details. ";
//       }
//       //COD
//       // Content - We apologise for the inconvenience caused. Explore our gold members for uninterrupted service. Kindly contact us for for more details."
//       //online
//       //Content - We apologise for the inconvenience caused. Your payment will be refunded within 2 - 4 working days. Kindly contact us for more details. "
//       data = {
//         title: "Your order has been cancelled due to unforeseen circumstances.",
//         message: message,
//         pageid: "" + pageid,
//         payment_type:orders.payment_type,
//         app: "Eat",
//         notification_type: "2"
//       };

//       break;
//       case PushConstant.Pageid_eat_send_notification:
//         data = {
//           title: userid.title,
//           message:userid.user_message,
//           pageid: "" + pageid,
         
//       //    image : "https://eattovo.s3.amazonaws.com/upload/admin/makeit/product/1580901027983-promotion_ff.jpg",
//           app: "Eat",
//           notification_type: "1"
//         };
//         if (userid.image) {
//           data.image=userid.image;
//          }
//         break;
//   }
//   if (data == null) return;

 
//   //const user = await Notification.getEatUserDetail(userid);
//   console.log("admin notification data->", data);
//   if (user && user.pushid_android) {
//     FCM_DL.sendNotificationAndroid(user.pushid_android, data,1 );
//   }
  
// };




Notification.orderMoveItPushNotification = async function(orderid,pageid,move_it_user_detail) {
  console.log("moveit send notification file ----2");
  const orders = await Notification.getPushOrderDetail(orderid);
 // const moveitdetails = await Notification.getMovieitDetail()
  var Eatuserdetail = JSON.parse(orders.userdetail);
  var data = null;

  switch (pageid) {
    case PushConstant.pageidMoveit_Order_Assigned:
     // Eatuserdetail = await Notification.getEatUserDetail(Eatuserid);
      data = {
        title: "Order assign",
        message: "Order Assigned to you. OrderID is#" + orderid,
        pageid: "" + pageid,
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,
        app: "Move-it",
        notification_type: "1"
      };
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
        app: "Move-it",
        notification_type: "1",
        name: "" + Eatuserdetail.name,
        price: "" + orders.price,
        orderid: "" + orders.orderid,
        place: "" + orders.cus_address,
     
      };

      break;
  }

  if (data == null) return;

  if (!move_it_user_detail) {
    move_it_user_detail = await query(
      "SELECT * FROM MoveitUser where userid = " + orders.moveit_user_id
    );
    move_it_user_detail = move_it_user_detail[0];
  }

  if (move_it_user_detail && move_it_user_detail.pushid_android) {
    FCM_Moveit.sendNotificationAndroid(
      move_it_user_detail.pushid_android,
      data
    );
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
