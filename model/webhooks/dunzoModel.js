'user strict';
var sql = require('../db.js');
var dunzoconst = require('../../model/dunzo_constant');
var request = require('request');
const https = require('https');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var Dunzoresponce = require("../../model/common/dunzoresponceModel");
var Dunzomoveitdetails = require("../../model/common/dunzomoveitdetailsModel");
var moment = require("moment");
var Notification = require("../../model/common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");







//Task object constructor
var Dunzo = function(dunzo){
    this.makeit_userid = dunzo.makeit_userid;
    this.rating = dunzo.rating;
};

Dunzo.testingapi = function testingapi(req, result) {
    //console.log(dunzoconst);
    switch(req.state){
        case dunzoconst.created:
            console.log("created");
            break;
        case dunzoconst.queued:
            console.log("queued");
            break;
        case dunzoconst.runner_accepted:
            console.log("runner_accepted");
            break;
        case dunzoconst.runner_cancelled:
            console.log("runner_cancelled");
            break;
        case dunzoconst.reached_for_pickup:
            console.log("reached_for_pickup");
            break; 
        case dunzoconst.pickup_complete:
            console.log("pickup_complete");
            break;
        case dunzoconst.started_for_delivery:
            console.log("started_for_delivery");
            break;
        case dunzoconst.reached_for_delivery:
            console.log("reached_for_delivery");
            break;
        case dunzoconst.delivered:
            console.log("delivered");
            break;
        case dunzoconst.cancelled:
            console.log("cancelled");
            break;         
        default:
            console.log("No State");
    }
    result(null, req);
};

//controller for create_Dunzoresponce
Dunzo.create_Dunzoresponce = function create_Dunzoresponce(dunzo_responce) {
   var new_Dunzoresponce = new Dunzoresponce(dunzo_responce);
  // new_Dunzoresponce.task_id= dunzo_responce[0];
  Dunzoresponce.create_Dunzoresponce(new_Dunzoresponce, function(err, res) {
    if (err) return err;
    else return res;
  });
};




// controller for moveit details
Dunzo.create_Dunzomoveitdetails = function create_Dunzomoveitdetails(Dunzomoveitdetails_data) {
  var new_Dunzomoveitdetails = new Dunzomoveitdetails(Dunzomoveitdetails_data);
 // new_Dunzoresponce.task_id= dunzo_responce[0];
 Dunzomoveitdetails.create_Dunzomoveitdetails(new_Dunzomoveitdetails, function(err, res) {
   if (err) return err;
   else return res;
 });
};

//Dunzo next state update
// Dunzo.dunzo_nex_state_update_by_taskid =async function dunzo_nex_state_update_by_taskid(req, result) {

//   var dunzo_data = {};
//   //dunzo_responce.task_id = req.task_id;
//  // dunzo_responce.push(req);
//  dunzo_data.task_id = req.task_id;
//  dunzo_data.dunzo_responce = JSON.stringify(req);
// //store dunzo all request
//  Dunzo.create_Dunzoresponce(dunzo_data);
//  const orderdetails = await query("select * from Orders where dunzo_taskid ='" +req.task_id+ "'");

//   switch(req.state){
//       case dunzoconst.created:
//           console.log("created");
//           let created_response = {
//             success: true,
//             status: true,
//             status_code : 200,
//             message: "task created successfully."
//           };
//           result(null, created_response);

//           break;
//       case dunzoconst.queued:
//           console.log("queued");
//           let queued_response = {
//             success: true,
//             status: true,
//             status_code : 200,
//             message: "queued_response successfully."
//           };
//           result(null, queued_response);

//           break;
//       case dunzoconst.runner_accepted:
//           console.log("runner_accepted");
//           //store dunzo moveit details
//           var Dunzomoveitdetails_data =  {};
//           Dunzomoveitdetails_data.task_id = req.task_id;
//           Dunzomoveitdetails_data.runner_state = req.state;
//           Dunzomoveitdetails_data.runner_name = req.runner.name;
//           Dunzomoveitdetails_data.runner_phone_number = req.runner.phone_number;
//           Dunzomoveitdetails_data.runner_lat = req.runner.location.lat;
//           Dunzomoveitdetails_data.runner_lng = req.runner.location.lat;
//           Dunzomoveitdetails_data.runner_eta_pickup_min = req.eta.pickup;
//           Dunzomoveitdetails_data.runner_eta_dropoff_min = req.eta.dropoff;
//           Dunzomoveitdetails_data.active_status = 1

//           Dunzo.create_Dunzomoveitdetails(Dunzomoveitdetails_data);

//            //   if (orderdetails.length !== 0) {
                
//                   var orderaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
               
//                   updatequery ="UPDATE Orders SET moveit_status = 1 ,moveit_accept_time= '" + orderaccepttime +"' WHERE orderid ='" +orderdetails[0].orderid +"'";
//                   const updatestatus = await query(updatequery);

//                   let response = {
//                     success: true,
//                     status: true,
//                     status_code : 200,
//                     message: "Order accepted successfully."
//                   };
                 
//                   result(null, response);
               
           
//               // } else {
//               //   let response = {
//               //     success: true,
//               //     status: false,
//               //     status_code : 400,
//               //     message: "Order is not available!"
//               //   };
//               //   result(null, response);
//               // }
//           //  };
//           break;
//       case dunzoconst.runner_cancelled:
//           console.log("runner_cancelled");
//          // var order_queue_update = await query("");
//           var order_queue_update ="update Dunzo_moveit_details set active_status = 0 where task_id ='" +req.task_id+"'";
        
//           const runner_cancelled_updatestatus = await query(order_queue_update);
//           let runner_cancelled = {
//             success: true,
//             status:true,
//             status_code : 200,
//             message: "runner_cancelled successfully"
//           };
         
//        result(null, runner_cancelled);
//           break;
//       case dunzoconst.reached_for_pickup:
//           console.log("reached_for_pickup");
//           console.log(orderdetails[0].orderid);
//          // Order.moveit_kitchen_reached_status = function(req, result) {
//             var kitchenreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
//             updatequery ="UPDATE Orders  SET moveit_reached_time = '" +kitchenreachtime +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
//             const updatekitchenreachtime = await query(updatequery);

           
//                   let resobj1 = {
//                     success: true,
//                     status:true,
//                     status_code : 200,
//                     message: "kitchen reached successfully"
//                   };
                 

//              result(null, resobj1);

//           break; 
//       case dunzoconst.pickup_complete:
          

//           console.log("pickup_complete");
//           console.log(orderdetails[0].orderid);
//          // Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser( req,kitchenqualitylist,result) {
//             var order_pickup_time = moment().format("YYYY-MM-DD HH:mm:ss");
//             var twentyMinutesLater = moment().add(0, "seconds").add(req.eta.dropoff, "minutes").format("YYYY-MM-DD HH:mm:ss");
         
            
//                 updatequery ="UPDATE Orders  SET orderstatus = 5 ,moveit_pickup_time = '" +order_pickup_time+"',moveit_expected_delivered_time = '" +twentyMinutesLater +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
//                 const updatestatuspickup = await query(updatequery);
//               var pickup = req.eta.pickup || 0;
//               var dropoff = req.eta.dropoff || 0;
              
//                update_pickup_eta ="UPDATE Dunzo_moveit_details SET runner_eta_pickup_min = '" +  pickup +"' ,runner_eta_dropoff_min= '" + dropoff +"' WHERE task_id ='" +req.task_id+"'";
//                const update_pickup_eta_by_dunzo = await query(update_pickup_eta);

//                       let resobj = {
//                         success: true,
//                         status: true,
//                         status_code : 200,
//                         message: "Order Pickedup successfully"
//                       };
                     
//                       await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
       
//                  result(null, resobj);
        
        
        
//           break;
//       case dunzoconst.started_for_delivery:
//           console.log("started_for_delivery");
//           let started_for_delivery = {
//             success: true,
//             status:true,
//             status_code : 200,
//             message: "started_for_delivery successfully"
//           };
         

//      result(null, started_for_delivery);
         
//           break;
//       case dunzoconst.reached_for_delivery:
//           console.log("reached_for_delivery");

//           var customerlocationreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
          
//           updatequery ="UPDATE Orders SET moveit_customerlocation_reached_time  = '" +customerlocationreachtime +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
//           const updatecustomerlocationreachtime = await query(updatequery);
//                 let data = {
//                   success: true,
//                   status: true,
//                   status_code : 200,
//                   message: "Customer location reached successfully"
//                 };
//                // PushConstant.Pageid_eat_order_pickedup = 6;
//                 await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
//            result(null, data);

          
//           break;
//       case dunzoconst.delivered:
//           console.log("delivered");

//        //   Order.order_delivery_status_by_moveituser = async function(req, result) {
//             var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
           
//                 updatequery ="UPDATE Orders SET orderstatus = 6,moveit_actual_delivered_time = '" +order_delivery_time+"',payment_status=1,dunzo_price='"+req.price+"' WHERE orderid ='" +orderdetails[0].orderid +"'";
//                 const updatestatusdeliverd = await query(updatequery);
//                       let deliverd = {
//                         success: true,
//                         status: true,
//                         status_code : 200,
//                         message: "Order delivered successfully",
//                         orderdeliverystatus: true
//                       };

//                       //PushConstant.Pageid_eat_order_pickedup = 7;
//                       await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_delivered);
          
                     
//                  result(null, deliverd);

        
//           break;
//       case dunzoconst.cancelled:
//           console.log("cancelled");
//           var orderqueuequery  = await query("select * from  Orders_queue  where orderid =" +orderdetails[0].orderid+"");

//           if (orderqueuequery[0].status !=1) {
//           var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +orderdetails[0].orderid+"");
//           updatequery = await query("UPDATE Orders SET moveit_status = 0,delivery_vendor=0,dunzo_taskid=''  WHERE orderid ='" +orderdetails[0].orderid +"'");
//           }
          
//           let orderqueue = {
//             success: true,
//             message: "Order again pushed into queue.",
//             status_code : 200,
//             status:true
//           };
//           result(null, orderqueue);
//           break;         
//       default:
//           console.log("No State");
//           let no_state = {
//             success: true,
//             message: "No State.",
//             status_code : 400,
//             status:false
//           };
//           result(null, no_state);
//   }
//   //result(null, req);
// };


Dunzo.dunzo_nex_state_update_by_taskid =async function dunzo_nex_state_update_by_taskid(req, result) {

  var dunzo_data = {};
  //dunzo_responce.task_id = req.task_id;
 // dunzo_responce.push(req);
 dunzo_data.task_id = req.task_id;
 dunzo_data.dunzo_responce = JSON.stringify(req);
//store dunzo all request
 Dunzo.create_Dunzoresponce(dunzo_data);
 const orderdetails = await query("select * from Orders where dunzo_taskid ='" +req.task_id+ "'");


 if (orderdetails.length !=0) {
  switch(req.state){
    case dunzoconst.created:
        console.log("created");
        let created_response = {
          success: true,
          status: true,
          status_code : 200,
          message: "task created successfully."
        };
        result(null, created_response);

        break;
    case dunzoconst.queued:
        console.log("queued");
        let queued_response = {
          success: true,
          status: true,
          status_code : 200,
          message: "queued_response successfully."
        };
        result(null, queued_response);

        break;
    case dunzoconst.runner_accepted:
        console.log("runner_accepted");
        //store dunzo moveit details
        var Dunzomoveitdetails_data =  {};
        Dunzomoveitdetails_data.task_id = req.task_id;
        Dunzomoveitdetails_data.runner_state = req.state;
        Dunzomoveitdetails_data.runner_name = req.runner.name;
        Dunzomoveitdetails_data.runner_phone_number = req.runner.phone_number;
        Dunzomoveitdetails_data.runner_lat = req.runner.location.lat;
        Dunzomoveitdetails_data.runner_lng = req.runner.location.lat;
        Dunzomoveitdetails_data.runner_eta_pickup_min = req.eta.pickup;
        Dunzomoveitdetails_data.runner_eta_dropoff_min = req.eta.dropoff;
        Dunzomoveitdetails_data.active_status = 1

        Dunzo.create_Dunzomoveitdetails(Dunzomoveitdetails_data);
              
                var orderaccepttime = moment().format("YYYY-MM-DD HH:mm:ss");
             
                updatequery ="UPDATE Orders SET moveit_status = 1 ,moveit_accept_time= '" + orderaccepttime +"' WHERE orderid ='" +orderdetails[0].orderid +"'";
                const updatestatus = await query(updatequery);

                let response = {
                  success: true,
                  status: true,
                  status_code : 200,
                  message: "Order accepted successfully."
                };
               
                result(null, response);
          
        break;

    case dunzoconst.runner_cancelled:
        console.log("runner_cancelled");
       // var order_queue_update = await query("");
        var order_queue_update ="update Dunzo_moveit_details set active_status = 0 where task_id ='" +req.task_id+"'";
      
        const runner_cancelled_updatestatus = await query(order_queue_update);
        let runner_cancelled = {
          success: true,
          status:true,
          status_code : 200,
          message: "runner_cancelled successfully"
        };
       
     result(null, runner_cancelled);
        break;
    case dunzoconst.reached_for_pickup:
        console.log("reached_for_pickup");
        console.log(orderdetails[0].orderid);
       // Order.moveit_kitchen_reached_status = function(req, result) {
          var kitchenreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
          updatequery ="UPDATE Orders  SET moveit_reached_time = '" +kitchenreachtime +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
          const updatekitchenreachtime = await query(updatequery);

         
                let resobj1 = {
                  success: true,
                  status:true,
                  status_code : 200,
                  message: "kitchen reached successfully"
                };
               

           result(null, resobj1);

        break; 
    case dunzoconst.pickup_complete:
        

        console.log("pickup_complete");
        console.log(orderdetails[0].orderid);
       // Order.order_pickup_status_by_moveituser = function order_pickup_status_by_moveituser( req,kitchenqualitylist,result) {
          var order_pickup_time = moment().format("YYYY-MM-DD HH:mm:ss");
          var twentyMinutesLater = moment().add(0, "seconds").add(req.eta.dropoff, "minutes").format("YYYY-MM-DD HH:mm:ss");
       
          
              updatequery ="UPDATE Orders  SET orderstatus = 5 ,moveit_pickup_time = '" +order_pickup_time+"',moveit_expected_delivered_time = '" +twentyMinutesLater +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
              const updatestatuspickup = await query(updatequery);
            var pickup = req.eta.pickup || 0;
            var dropoff = req.eta.dropoff || 0;
            
             update_pickup_eta ="UPDATE Dunzo_moveit_details SET runner_eta_pickup_min = '" +  pickup +"' ,runner_eta_dropoff_min= '" + dropoff +"' WHERE task_id ='" +req.task_id+"'";
             const update_pickup_eta_by_dunzo = await query(update_pickup_eta);

                    let resobj = {
                      success: true,
                      status: true,
                      status_code : 200,
                      message: "Order Pickedup successfully"
                    };
                   
                    await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
     
               result(null, resobj);
      
      
      
        break;
    case dunzoconst.started_for_delivery:
        console.log("started_for_delivery");
        let started_for_delivery = {
          success: true,
          status:true,
          status_code : 200,
          message: "started_for_delivery successfully"
        };
       

   result(null, started_for_delivery);
       
        break;
    case dunzoconst.reached_for_delivery:
        console.log("reached_for_delivery");

        var customerlocationreachtime = moment().format("YYYY-MM-DD HH:mm:ss");
        
        updatequery ="UPDATE Orders SET moveit_customerlocation_reached_time  = '" +customerlocationreachtime +"'  WHERE orderid ='" +orderdetails[0].orderid +"'";
        const updatecustomerlocationreachtime = await query(updatequery);
              let data = {
                success: true,
                status: true,
                status_code : 200,
                message: "Customer location reached successfully"
              };
             // PushConstant.Pageid_eat_order_pickedup = 6;
              await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_pickedup);
         result(null, data);

        
        break;
    case dunzoconst.delivered:
        console.log("delivered");

     //   Order.order_delivery_status_by_moveituser = async function(req, result) {
          var order_delivery_time = moment().format("YYYY-MM-DD HH:mm:ss");
         
              updatequery ="UPDATE Orders SET orderstatus = 6,moveit_actual_delivered_time = '" +order_delivery_time+"',payment_status=1,dunzo_price='"+req.price+"' WHERE orderid ='" +orderdetails[0].orderid +"'";
              const updatestatusdeliverd = await query(updatequery);
                    let deliverd = {
                      success: true,
                      status: true,
                      status_code : 200,
                      message: "Order delivered successfully",
                      orderdeliverystatus: true
                    };

                    //PushConstant.Pageid_eat_order_pickedup = 7;
                    await Notification.orderEatPushNotification(orderdetails[0].orderid,null,PushConstant.Pageid_eat_order_delivered);
        
                   
               result(null, deliverd);

      
        break;
    case dunzoconst.cancelled:
        console.log("cancelled");
        var orderqueuequery  = await query("select * from  Orders_queue  where orderid =" +orderdetails[0].orderid+"");

        if (orderqueuequery[0].status !=1) {
        var order_queue_update = await query("update Orders_queue set status = 2 where orderid =" +orderdetails[0].orderid+"");
        updatequery = await query("UPDATE Orders SET moveit_status = 0,delivery_vendor=0,dunzo_taskid=''  WHERE orderid ='" +orderdetails[0].orderid +"'");
        }
        
        let orderqueue = {
          success: true,
          message: "Order again pushed into queue.",
          status_code : 200,
          status:true
        };
        result(null, orderqueue);
        break;         
    default:
        console.log("No State");
        let no_state = {
          success: true,
          message: "No State.",
          status_code : 400,
          status:false
        };
        result(null, no_state);
}
 } else {
   
  //console.log("No orders");
        let no_state = {
          success: true,
          message: "No orders",
          status_code : 200,
          status:false
        };
        result(null, no_state);
 }
  
  //result(null, req);
};

//task create
Dunzo.dunzo_task_create = async function dunzo_task_create(orderid,result) {
    //var url ='https://apis-staging.dunzo.in/api/v1/tasks?test=true';
   // var orderquery =  "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  where ors.orderid ="+orderid +" ";
   // order_details = await query(orderquery);
   var order_details = await query("SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid,'makeitimg',ms.img1,'landmark',ms.landmark,'flatno',ms.flatno,'pincode',ms.pincode,'locality',ms.locality,'virtualkey',ms.virtualkey) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('makeithub_name',mh.makeithub_name,'lat',mh.lat,'lon',mh.lon,'address',mh.address,'addressDetails',mh.addressDetails,'flat_no',mh.flat_no,'phone_number',mh.phone_number,'pincode',mh.pincode) as makeithubdetail,   JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'vegtype',pt.vegtype))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid  left join Makeit_hubs mh on mh.makeithub_id=ms.makeithub_id where ors.orderid ="+orderid +" ");
   var order_assign_time = moment().format("YYYY-MM-DD HH:mm:ss");
   var cuurent_time = moment().format("YYYY-MM-DD HH:mm:ss");

   if (order_details[0].userdetail) {
    order_details[0].userdetail = JSON.parse(order_details[0].userdetail);
  }

  if (order_details[0].makeitdetail) {
    order_details[0].makeitdetail = JSON.parse(order_details[0].makeitdetail);
  }
  if (order_details[0].moveitdetail) {
    order_details[0].moveitdetail = JSON.parse(order_details[0].moveitdetail);
  }
  if (order_details[0].makeithubdetail) {
    order_details[0].makeithubdetail = JSON.parse(order_details[0].makeithubdetail);
  }

  if (order_details[0].items) {
    var items = JSON.parse(order_details[0].items);
    order_details[0].items = items.item;
  }
  var pickup={};
  //if(order_details[0].makeitdetail.virtualkey==0 ? order_details[0].makeitdetail.lat : order_details[0].makeithubdetail.lat)
  if (order_details[0].makeitdetail.virtualkey==0) {
    pickup.lat = order_details[0].makeitdetail.lat;
    pickup.lng = order_details[0].makeitdetail.lon;
    pickup.phoneno = order_details[0].makeitdetail.phoneno;
    pickup.pincode = order_details[0].makeitdetail.pincode;
    pickup.name= order_details[0].makeitdetail.brandName;
    pickup.address= order_details[0].makeitdetail.address;
    

  } else {
    pickup.lat = order_details[0].makeithubdetail.lat;
    pickup.lng = order_details[0].makeithubdetail.lon;
    pickup.phoneno = order_details[0].makeithubdetail.phone_number;
    pickup.pincode = order_details[0].makeithubdetail.pincode;
    pickup.name= order_details[0].makeithubdetail.makeithub_name;
    pickup.address= order_details[0].makeithubdetail.addressDetails;
  }

  var items=order_details[0].items;


  if (items.length !=0) {
    
    for (let i = 0; i < items.length;i++) {
      var itemlist=[];
      itemlist.push(items[i].product_name);
      
    }
    var product_name = itemlist.toString();
  }
    //set form data
    var form = {
      request_id: order_details[0].orderid.toString(),
      pickup_details: {
        lat:  pickup.lat,//if(order_details[0].makeitdetail.virtualkey==0 ? order_details[0].makeitdetail.lat : order_details[0].makeithubdetail.lat);
        lng: pickup.lng,
        address: {
          apartment_address : order_details[0].makeitdetail.flatno,
          street_address_1: pickup.address,
          street_address_2: pickup.address,
          landmark: order_details[0].makeitdetail.landmark,
          city: "chennai",
          state: "tamilnadu",
          pincode: pickup.pincode,
          country: "India"
        }
      },
      drop_details: {
        lat: parseFloat(order_details[0].cus_lat),
        lng: parseFloat(order_details[0].cus_lon),
        address: {
          apartment_address : order_details[0].flatno,
          street_address_1: order_details[0].cus_address,
          street_address_2: order_details[0].cus_address,
          landmark: order_details[0].landmark,
          city: "chennai",
          state: "tamilnadu",
          pincode: order_details[0].cus_pincode,
          country: "India"
        }
      },
      sender_details: {
        name:  pickup.name,
        phone_number:   pickup.phoneno
      },
      receiver_details: {
        name: order_details[0].userdetail.name,
        phone_number: order_details[0].userdetail.phoneno
      },
     package_content: ["Documents | Books", "Clothes | Accessories", "Electronic Items"],
     // package_content: ["Food"],
      package_approx_value: order_details[0].price,
      //special_instructions: "Orderid : " + order_details[0].orderid.toString() + " ,Kitchen name : " +pickup.name+ " ,Kitchen address : " +pickup.address+ " ,phone no :" + pickup.phoneno+",product name : " +product_name,
      special_instructions: "Orderid : " + order_details[0].orderid.toString()

      
    }
  
  
    if (order_details[0].payment_type==0) {
      form.payment_method= "COD",
              form.payment_data= {
            amount: order_details[0].price
        }
    }

  //  console.log(form);

    var headers= {
      'Content-Type': 'application/json',
      'client-id': dunzoconst.dunzo_client_id,
      'Authorization' : dunzoconst.Authorization,
      'Accept-Language':'en_US'
    };
  
    //set request parameter
    request.post({headers: headers, url: dunzoconst.dunzo_create_url, json: form, method: 'POST'},async function (e, r, body) {
     
      console.log("--------------------------------------------body",body);
      dunzo_data={};
      dunzo_data.orderid = orderid;
      dunzo_data.dunzo_responce = JSON.stringify(body);
     //store dunzo all request
      Dunzo.create_Dunzoresponce(dunzo_data);
    if (body.state=="created") {
      console.log("created");

      var order_queue_update = await query("update Orders_queue set status = 1,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"'  where orderid =" +orderid+"");
      var order_update = await query("update Orders set moveit_status=1,dunzo_taskid ='"+body.task_id+"',delivery_vendor=1,order_assigned_time='"+order_assign_time+"'  where orderid =" +orderid+"");

    } else if (body.code=="unserviceable_location_error") {
      console.log("unserviceable_location_error 1");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");
    }else if (body.code=="duplicate_request") {
      console.log("duplicate_request");
        var order_queue_update = await query("update Orders_queue set status = 1,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"'  where orderid =" +orderid+"");
        var order_update = await query("update Orders set moveit_status=1,dunzo_taskid ='"+body.task_id+"',delivery_vendor=1,order_assigned_time='"+order_assign_time+"'  where orderid =" +orderid+"");

     // var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");
    }else if (body.code=="different_city_error") {
      console.log("different_city_error 3");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");
    }else if (body.code=="rain_error") {
      console.log("rain_error 4");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");
    }else if (body.code=="service_unavailable") {
      console.log("service_unavailable 5");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");
    }else if(body.code=="validation_failed") {
      console.log("validation_failed 6");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");

    }else if(body.code=="stock_out_error") {
      console.log("stock_out_error 7");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");

    }else if(body.code=="unauthorized") {
      console.log("unauthorized 8");

      var order_queue_update = await query("update Orders_queue set status = 2,dunzo_req_count= dunzo_req_count+1,updated_at='"+cuurent_time+"' where orderid =" +orderid+"");

    }       
    

      let resobj = {
        success: true,
        status: true,
        status_code : 200,
        message : body.message,
        result: body
      };
      result(null, resobj);
    });
 
};

////task cancel
Dunzo.dunzo_task_cancel = async function dunzo_task_cancel(req,result) {
  //var url ='https://apis-staging.dunzo.in/api/v1/tasks/'+dunzo_taskid+'/_cancel?test=true'

  var url = dunzoconst.dunzo_cancel_url+'/'+ req.dunzo_taskid+'/_cancel'

  //set form data
  var form = {
    cancellation_reason: req.cancellation_reason
  }
  //console.log(form);
  //console.log("parse-------",JSON.parse(form));
  //console.log("Str----",JSON.stringify(form));
  var headers= {
    'Content-Type': 'application/json',
    'client-id': dunzoconst.dunzo_client_id,
    'Authorization' : dunzoconst.Authorization,
    'Accept-Language':'en_US'
  };

  //set request parameter
  request.post({headers: headers, url: url, json: form, method: 'POST'},async function (e, r, body) {
  


  });
};


////task status
Dunzo.dunzo_track_status = async function dunzo_track_status(req) {

  var url =dunzoconst.dunzo_cancel_url+'/'+req.task_id+'/status'

  var headers= {
    'Content-Type': 'application/json',
    'client-id': dunzoconst.dunzo_client_id,
    'Authorization' : dunzoconst.Authorization,
    'Accept-Language':'en_US'
  };

  const options = {
    url: url,
    method: 'GET',
    headers: headers
};

request(options, function(err, res, body) {
    let json = JSON.parse(body);
  //  console.log(json);
  console.log("json------------------->",json);

  return json;
    // let resobj = {
    //   success: true,
    //   status: true,
    //   message : json.message,
    //   result: json
    // };
    // result(null, resobj);
});

   
   //return body;

  
};



module.exports= Dunzo;