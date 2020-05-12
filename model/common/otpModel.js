"user strict";
var sql = require("../db.js");

  var OTP = function(otp) {
    // this.orderid = refund.orderid;
    // this.original_amt = refund.original_amt;
    // this.refund_amt = refund.refund_amt ;
    // this.active_status = refund.active_status;
    // this.userid =refund.userid;
    // this.payment_id =refund.payment_id;
  };



  OTP.send_otp_byphone = function send_otp_byphone(newUser,result) {
    sql.query(
      "Select * from Sales_QA_employees where phoneno = '" + newUser.phoneno + "'",
      function(err, res1) {
        if (err) {
          result(err, null);
        } else {
          if (res1.length == 0) {
            var OTP = Math.floor(Math.random() * 90000) + 10000;
            var otpurl =
            "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
            newUser.phoneno +
            "&senderId=EATHOM&message=Your EAT App OTP is " +
            OTP +
            ". Note: Please DO NOT SHARE this OTP with anyone.";
            request({
              method: "GET",
              rejectUnauthorized: false,
              url: otpurl
            },
            function(error, response, body) {
              if (error) {
                result(err, null);
              } else {
                var responcecode = body.split("#");
                if (responcecode[0] === "0") {
                  sql.query(
                    "insert into Otp(phone_number,apptype,otp)values('" +
                      newUser.phoneno +
                      "',4,'" +
                      OTP +
                      "')",
                    function(err, res2) {
                      if (err) {
                        result(null, err);
                      } else {
                        let resobj = {
                        success: true,
                        status: true,
                        message: responcecode[1],
                        oid: res2.insertId
                        };
  
                        result(null, resobj);
                      }
                    }
                  );
                } else {
                  let resobj = {
                    success: true,
                    status: false,
                    message: responcecode[1],
                    passwordstatus: passwordstatus,
                    otpstatus: otpstatus,
                    genderstatus: genderstatus
                  };
  
                  result(null, resobj);
                }
              }
            }
  
            );
          } else {
            let resobj = {
              success: true,
              status: true,
              message: "Following user already Exist! Please check it mobile number"
            };
  
            result(null, resobj);
          }
        }
      }
    );
  };
  
  
  
  OTP.sales_user_otpverification = function sales_user_otpverification( req,result) {

    sql.query("Select * from Otp where oid = '" + req.oid + "'", function(err,res) {
      if (err) {
        result(err, null);
      } else {
        if (res[0].otp == req.otp) {
                  let resobj = {
                    success: true,
                    status: true,
                    message: "OTP verified successfully"
                  };
                  result(null, resobj);
                
        } else {
          let resobj = {
            success: true,
            status: false,
            message:"OTP is not valid!, Try once again"
          };
          result(null, resobj);
        }
      }
    });
  };

  module.exports = OTP;