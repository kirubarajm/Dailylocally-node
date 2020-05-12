"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var SMS = function(Sms) {
  this.faqid = Sms.faqid;
  this.question = Sms.question;
  this.answer = Sms.answer;
  this.type = Sms.type;
  // this.created_at = new Date();
};


SMS.send_sms_makeit =async function send_sms_makeit(orderid, result) {
  
    var phonenumber = '';
    var get_phone_number =await query("select mk.phoneno,mk.virtualkey,mh.phone_number from Orders ors join MakeitUser mk on mk.userid=ors.makeit_user_id join Makeit_hubs mh on mh.makeithub_id=mk.makeithub_id  where orderid="+orderid+" ");
    
    if (get_phone_number[0].virtualkey==0) {
      phonenumber= get_phone_number[0].phoneno;

      var otpurl =
      "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
      phonenumber +
      "&senderId=EATHOM&message=You have received an order from EAT. orderid "+orderid+" -. Please check EAT Home app for further details. ";
  
      console.log(otpurl);
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
             console.log(response.statusCode, body);
             var responcecode = body.split("#");
             console.log(responcecode);
  
            
     
            }
          }
        
      );


    }else{
      
      phonenumber= get_phone_number[0].phone_number;
    }
   
};



module.exports = SMS;
