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
var request = require('request');
//Task object constructor
var ZendeskWebhook = function(zendeskWebhook){
    this.payment_id = zendeskWebhook.payment_id || 0;
    this.orderid = zendeskWebhook.orderid || 0;
    this.razorpay_response = zendeskWebhook.razorpay_response;
    this.amount = zendeskWebhook.amount || 0;
    this.payment_type = zendeskWebhook.payment_type || 0;
};


ZendeskWebhook.zendeskWebhookSendNotification =async function zendeskWebhookSendNotification(req, result) {

    console.log("req-->",req);
    await Notification.zendeskPushNotification(
        req,
        PushConstant.Pageid_eat_zendesk_notification
      );

      let resobj = {
        success: true,
        message: "Notication send successfully",
        status:true
      };
      
      
      ////////////////////////////
      result(null, resobj);


};




ZendeskWebhook.ZendeskController_webhooks_tickets =async function ZendeskController_webhooks_tickets(req, result) {
    var ticketid = req.tid;
    var getUrl="api/v2/tickets/"+ticketid+".json"
    var ticketURL=constant.zendesk_url+getUrl;
    console.log("ticketURL-->",ticketURL);

    //var auth = "Basic " + new Buffer(constant.Username + ":" + constant.Password).toString("base64");
    // var headers= {
    //   'Content-Type': 'application/json',
    //   'Authorization':"Basic dG92b2xvZ2llc0BnbWFpbC5jb206VGVtcHRvdm8="
    // };
    
  var auth = "Basic " + Buffer.from(constant.Username + ":" + constant.Password).toString("base64");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization': auth,
   };
   if(!ticketid){
        var resobj={
          success:true,
          status:false,
        }
        result(null, resobj);
   }else{
    request.get({headers: headers,url:ticketURL,method: 'GET'},async function (e, r, body) {
      console.log("e--",e);
      //console.log("body--",body);
      var data = body;
      try {
         data = JSON.parse(body);
      } catch (e) {
          console.log("e--",e);
      }
     
      var isResponse=false;
      if(data.ticket){
        var zendesk_userid=data.ticket.requester_id;
        console.log("zendesk_userid-->",zendesk_userid);
        var get_zendesk_chat_query="select id,orderid,issueid,type from Zendesk_chat_requests where zendeskuserid= "+zendesk_userid +" order by id desc LIMIT 1";
        var get_zendesk_chat=await query(get_zendesk_chat_query);
        console.log("get_zendesk_chat_query-->",get_zendesk_chat);
        if(get_zendesk_chat.length>0){
         
          var updateTicketQuery="update Zendesk_chat_requests set ticketid= "+ticketid+" where id= "+get_zendesk_chat[0].id; 
          console.log("updateTicketQuery-->",updateTicketQuery);
          var update_ticket=await query(updateTicketQuery);

          var updateOrderQuery="update Orders set zendesk_ticketid= "+ticketid+" where orderid= "+get_zendesk_chat[0].orderid; 
          var update_orders=await query(updateOrderQuery);
          console.log("updateOrderQuery-->",updateOrderQuery);

           var select_tags_query= "select zt.tag_name from Zendesk_issues zi left join Zendesk_tag zt on zt.tid=zi.tid where id ="+get_zendesk_chat[0].issueid
           var select_tags= await query(select_tags_query);

           console.log("select_tags e--",select_tags);

           if(select_tags.length>0){
            var type =get_zendesk_chat[0].type;
            var tags_type= type==1?"currentOrder":"oldOrder"
            var tags=[];
            tags.push(tags_type);
            tags.push("order_id_"+get_zendesk_chat[0].orderid);
            //console.log("model select_tags[0].tag_name--",select_tags[0].tag_name.replace(/\s+/g,"_"));
            tags.push(select_tags[0].tag_name.replace(/\s+/g,"_"));
            console.log("select_tags-->",tags);
             var userdetails={
                 ticket:{
                   tags: tags
                 }
             }
            request.put({headers: headers, url:ticketURL, json: userdetails,method: 'PUT'},async function (e, r, body) {
                console.log("tags e--",e);
                console.log("tags body--",body);
            });
          }
          
          isResponse=true;
        }
        
      }
        
        var resobj={
          success:true,
          status:isResponse,
        }

        result(null, resobj);
      
      
    });
  }

};

module.exports= ZendeskWebhook;