"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant = require('../constant.js');

//Task object constructor
var SMS = function(Sms) {
  this.faqid = Sms.faqid;
  this.question = Sms.question;
  this.answer = Sms.answer;
  this.type = Sms.type;
  // this.created_at = new Date();
};




//////Order Success SMS TO Customers//////////////////////
SMS.ordersuccess_send_sms =async function ordersuccess_send_sms(orderid,phoneno, result){
  var otpurl = "";  
  // if(ordertype==1){    
  //   otpurl = "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=EATHOM&dest=" +phoneno+ "&msg=Your transaction has been successfully placed with Daily Locally. \n Due to the prevailing pandemic, we are facing brief delays in deliveries. However, for any queries about your order, please get in touch through the following link " +constant.virtual_order_sms_contact_number;    
  // }else{
    otpurl = "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=CHOICB&dest==" +phoneno+ "&msg=Your Daily Locally order id "+orderid+" is placed successfully. \n Kindly get in touch with us for any queries, from the Support option on our app.";    
  //  }

  // console.log(otpurl);
  request({
    method: "GET",
    rejectUnauthorized: false,
    url: otpurl
  },
  function(error, response, body) {
    if (error) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("response -->",response.statusCode, body);
      var responcecode = body.split("#");
      console.log("response -->",responcecode);        
    }
  }      
  );

};

SMS.community_send_sms =async function community_send_sms(type,phoneno, result){
  var otpurl = "";  
  // var phoneno = '9500313689';
   if(type==1){    
    //  otpurl = "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=EATHOM&dest=" +phoneno+ "&msg=Your transaction has been successfully placed with Daily Locally. \n Due to the prevailing pandemic, we are facing brief delays in deliveries. However, for any queries about your order, please get in touch through the following link " +constant.virtual_order_sms_contact_number; 
    var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    phoneno +
    "&senderId=BEATDM&message=Good news from Daily Locally!. Your community registration has been approved. Check out the Daily Locally app for an all new Exclusive experience. ";   
 }else{
    // otpurl = "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=CHOICB&dest==" +phoneno+ "&msg=Your Daily Locally order id "+orderid+" is placed successfully. \n Kindly get in touch with us for any queries, from the Support option on our app.";    
    var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    phoneno +
    "&senderId=BEATDM&message=Update from Daily Locally!. We regret to inform that your new community registration has been rejected. Kindly get in touch with our support on the Daily Locally app to know more. "; 
  }

  // console.log(otpurl);
  request({
    method: "GET",
    rejectUnauthorized: false,
    url: otpurl
  },
  function(error, response, body) {
    if (error) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("response -->",response.statusCode, body);
      var responcecode = body.split("#");
      console.log("response -->",responcecode);        
    }
  }      
  );

};

module.exports = SMS;
