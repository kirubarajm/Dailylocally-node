'user strict';
var sql = require('../db.js');
var request = require("request");
// var Documentmoveit = require('../../model/common/documentsMoveitModel.js');
var MoveitFireBase =require("../../push/Moveit_SendNotification")
var Constant =require("../constant")
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var constant = require('../constant.js');
var MoveitTimelog = require("../../model/moveit/moveitTimeModel");
var moment = require("moment");
var MoveitUnassign =require("../../model/moveit/moveitunassighistoryModel.js");
var MoveitStatus =require("../../model/moveit/moveitStatusModel.js");
var Notification = require("../../model/common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");

//Task object constructor
var Moveituser = function (moveituser) {
    this.name = moveituser.name;
    this.email = moveituser.email;
    this.phoneno = moveituser.phoneno;
    this.bank_account_no = moveituser.bank_account_no;
    this.vehicle_no = moveituser.vehicle_no;
    this.verified_status = moveituser.verified_status;
    this.online_status = moveituser.online_status;
    this.referalcode = moveituser.referalcode;
    this.password = moveituser.password;
  //  this.created_at = new Date();
    this.bank_name = moveituser.bank_name;
    this.ifsc = moveituser.ifsc;
    this.bank_holder_name = moveituser.bank_holder_name;
    this.moveit_hub = moveituser.moveit_hub;
    this.driver_lic = moveituser.driver_lic;
    this.vech_insurance = moveituser.vech_insurance;
    this.vech_rcbook = moveituser.vech_rcbook;
    this.photo = moveituser.photo;
    this.legal_document = moveituser.legal_document;
    this.branch = moveituser.branch;
    this.address = moveituser.address;
};

Moveituser.createUser = function createUser(newUser, result) {
    sql.query("Select * from MoveitUser where phoneno = '" + newUser.phoneno + "' OR email= '" + newUser.email + "' ", function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {

            if (res.length == 0) {

                sql.query("INSERT INTO MoveitUser set ?", newUser, function (err, res1) {

                    if (err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else {

                        //    newdocument.moveit_userid = res1.insertId;
                        //    console.log(newdocument);
                        //    newdocument = new Documentmoveit(newdocument);


                        //    Documentmoveit.createnewDocument(newdocument, function (err, result) {
                        //     if (err)
                        //     result.send(err);
                        //     // res.json(result);
                        // });


                   
                        let resobj = {
                            success: true,
                            status :true,
                            message: 'Moveit user created successfully',
                            id: res.insertId

                        };

                        result(null, resobj);

                    }
                });
            } else {

              
                let message = "Following user already Exist! Please check it mobile number / email";
                let resobj = {
                    success: true,
                    status : false,
                    message: message
                };

                result(null, resobj);
            }
        }
    });
};

////Moveit Login ///////////////////
Moveituser.checkLogin = function checkLogin(req, result) {
  var reqs = [req.phoneno, req.password];
  sql.query("Select * from MoveitUser where phoneno = ? and password = ?", reqs,async function (err, res) {
    if (err) {
      console.log("error: ", err);
      let resobj = {
        success : false,
        status  : false,
        result  : err
      };
      result(resobj, null);
    }else {
      if (res.length !== 0) {
        if (res[0].login_status === 3) {
          let resobj = {
            success : true,
            status  : false,
            message : "Please contact administrator!",                  
          };
          result(null, resobj);
        }else{
          var logintime =  moment().format("YYYY-MM-DD HH:mm:ss");
          updateloginstatus = await query("update MoveitUser set login_status = 1 ,login_time='"+logintime+"' where userid = "+res[0].userid+" ");
          let token = jwt.sign({username: req.phoneno}, config.secret
                  // ,
                  // { //expiresIn: '24h' // expires in 24 hours
                  // }
                 );
  
          let resobj = {
            success : true,
            status  : true,
            token   :token,
            result  : res
          };
          result(null, resobj);
        }
      }else{
        let resobj = {
          success : true,
          status  : false,
          message : "Please check your username and password",
        };
        result(null, resobj);
      }
    }
  });
};


Moveituser.getUserById = function getUserById(userId, result) {
    sql.query("Select userid,name,email,bank_account_no,phoneno,Vehicle_no,verified_status,online_status,referalcode,bank_name,ifsc,bank_holder_name,moveit_hub,driver_lic,vech_insurance,vech_rcbook,photo,legal_document,branch,pushid_android,address,pushid_ios From MoveitUser where userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            
            let resobj = {
                success: true,
                status :true,
                result: res
            };

            result(null, resobj);

        }
    });
};



Moveituser.admin_getUserById = function getUserById(userId, result) {
    sql.query("Select mu.*,mh.address as hubaddress,zo.Zonename,zo.boundaries From MoveitUser mu left join Makeit_hubs mh on mu.moveit_hub = mh.makeithub_id left join Zone zo on zo.id = mu.zone where mu.userid = ? ", userId, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                result: res
            };

            result(null, resobj);

        }
    });
};




Moveituser.getAllUser = function getAllUser(result) {
    sql.query("Select * from MoveitUser", function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            console.log('User : ', res);

            result(null, res);
        }
    });
};

Moveituser.updateById = function (id, user, result) {
    sql.query("UPDATE MoveitUser SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Moveituser.remove = function (id, result) {
    sql.query("DELETE FROM MoveitUser WHERE userid = ?", [id], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {

            result(null, res);
        }
    });
};



Moveituser.getAllmoveitSearch = function getAllmoveitSearch(req, result) {
    var query = "Select *,zo.xfactor as zonexfactor,mh.xfactor as hubxfactor,mh.address as hubaddress from MoveitUser left join Zone zo on zo.id=zone left join Makeit_hubs mh on mh.makeithub_id=moveit_hub ";
    if(req.online_status===0){
      query = query + " where online_status=" +req.online_status
      if (req.search) {
        query = query + " and (name LIKE  '%" + req.search + "%'  or userid LIKE  '%" + req.search +"%')";
      }
    }else if(req.online_status===1){
      query= "select *,zo.xfactor as zonexfactor,mh.xfactor as hubxfactor,mh.address as hubaddress from MoveitUser left join Zone zo on zo.id=zone left join Makeit_hubs mh on mh.makeithub_id=moveit_hub where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1";
      if (req.search) {
        query = query + " and (name LIKE  '%" + req.search  + "%'  or userid LIKE  '%" + req.search +"%')";
      }
    }else if(req.online_status===-2){
      query= "select *,zo.xfactor as zonexfactor,mh.xfactor as hubxfactor,mh.address as hubaddress from MoveitUser left join Zone zo on zo.id=zone left join Makeit_hubs mh on mh.makeithub_id=moveit_hub where userid IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1";
      if (req.search) {
        query = query + " and (name LIKE  '%" + req.search  + "%'  or userid LIKE  '%" + req.search +"%')";
      }
    }else if (req.search) {
      query = query + "where name LIKE  '%" + req.search  + "%'  or userid LIKE  '%" + req.search +"%'";
    }

    sql.query(query, function (err, res) {
        if (err) {
            result(err, null);
        }else{
          let resobj = {
              success: true,
              status:true,
              result: res
          };
        result(null, resobj);
        }
    });
};

////Moveit Time Log//////////////
Moveituser.create_createMoveitTimelog = function create_createMoveitTimelog(req) {
  //console.log("create_createMoveitTimelog ===============>",req);
  var new_MoveitTimelog = new MoveitTimelog(req);
  MoveitTimelog.createMoveitTimelog(new_MoveitTimelog, function(err, new_MoveitTimelog) {
    if (err) return err;
    else return new_MoveitTimelog;     
  }); 
};

////Moveit Online & Offline/////////////
Moveituser.update_online_status =async function (req, result) {
  var userdetails = await query("select * from MoveitUser where userid = "+req.userid+"");
  var zone_id     = 0;
  var zone_name   = "";
  var boundaries  = "";
  var iszone      = false;
  if (userdetails.length !==0) {    
    if(userdetails[0].online_status != req.online_status){
      if (userdetails[0].login_status == 1) {        
        if(constant.zone_control == false){
          var zoneDetail = await query("select * from Zone where id = "+userdetails[0].zone+"");
          if(zoneDetail&&zoneDetail.length>0&&zoneDetail[0].boundaries){
            zone_id   = zoneDetail[0].id;
            zone_name = zoneDetail[0].Zonename;
            boundaries= JSON.parse(zoneDetail[0].boundaries);
            iszone    = true;
          }
        }    
        
        //and DATE(order_delivery_day) = CURDATE()
        var orderdetails = await query("select dors.* from Dayorder dors left join Moveit_trip mt on mt.tripid=dors.trip_id where dors.dayorderstatus < 9 and mt.moveit_id = "+req.userid+"");
        if (orderdetails.length == 0) {
          sql.query("UPDATE MoveitUser SET online_status = ? WHERE userid = ?", [req.online_status, req.userid],async function (err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            }else {
              if (req.online_status == 1) {
                key   = "Moved online";
                key1  = true;                
              } else {
                key = "Moved offline";
                key1 = false;                
              }
              req.type    = req.online_status;
              req.moveit_userid = req.userid;

              ///////////////Moveit Time Log History///////////
              if (!req.action) {
                req.action  = 1;              
              }
              await Moveituser.create_createMoveitTimelog(req);
              //////////////////////////////////////////////////

              let resobj = {
                success   : true,
                status    : true,
                message   : key,
                onlinestatus: key1,
                zone_id   : zone_id,
                zone_name : zone_name,
                boundaries: boundaries || null,
                iszone    :iszone,
                forcelogout : 1
              };
              result(null, resobj);
            }
          });
        }else{
          let resobj = {
            success   : true,
            status    : false,
            forcelogout   : 1, 
            onlinestatus  : true,
            message: "Sorry you can't go offline, Orders is assigned to you!"  
          };
          result(null, resobj);
        }  
      }else if(userdetails[0].login_status == 2){
        let resobj = {
          success   : true,
          status    : false,
          forcelogout   : 2,
          onlinestatus  : false,
          message   : "Please login"
        };
        result(null, resobj);
      }else if(userdetails[0].login_status == 3){
        let resobj = {
          success   : true,
          status    : false,
          forcelogout   : 3,
          onlinestatus  : false,
          message   : "Please contact Administrator"
        };
        result(null, resobj);
      }
    }else{
      if(req.online_status==1){
        var text = "online";
      }else{
        var text = "off-line";
      }      
      let resobj = {
        success : true,
        status  : false,
        message : "User already in "+text
      };
      result(null, resobj);
    }
  }else{    
    let resobj = {
      success : true,
      status  : false,
      message : "User not found!"
    };
    result(null, resobj);
  }
};

Moveituser.get_a_hub_navigation = function get_a_hub_navigation(req, result) {
    sql.query("select userid,name,mh.* from MoveitUser mu join Zone mh on mh.id=mu.zone where mu.userid  = ? ", req.userid, function (err, res) {
        if (err) {
          let error = {
            success: true,
            status:false,
        };
            result(error, null);
        }
        else {
            let sucobj = true;
            let resobj = {
                success: sucobj,
                status:true,
                result: res
            };

            result(null, resobj);

        }
    });
};

Moveituser.get_a_nearby_moveit = async function get_a_location_user(req, result) {
  MoveitFireBase.geoFireGetKeyByGeo(req.geoLocation,Constant.makeit_nearby_moveit_radius,function(err, make_it_id) {
    if (err) {
      let error = {
        success: true,
        status:false,
    };
        result(error, null);
    }
    else{
      var query= "select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid IN ("+make_it_id+") and userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status= 1 ORDER BY FIELD(userid,"+make_it_id+")";
     // console.log("query-->"+query);
      if (req.search) {
        query = query + " and name LIKE  '%" + req.search + "%'";
    }
      sql.query(query, function (err, res) {
          if (err) {
            let error = {
              success: true,
              status:false,
          };
              result(error, null);
          }
          else {
              let resobj = {
                  success: true,
                  status:true,
                  result: res
              };
              result(null, resobj);
          }
      });
    }
  });
};

Moveituser.get_a_nearby_moveit_V2 = async function get_a_location_user(req, result) {
  if(constant.zone_control&&req.zone){
  //getInsideZoneMoveitList
  var query= "select zo.boundaries,zo.Zonename,zone,moveit_hub,name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser left join Zone as zo on zo.id = zone where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1 and zone = "+req.zone;
  }else{
    var query= "select name,Vehicle_no,address,email,phoneno,userid,online_status from MoveitUser where userid NOT IN(select moveit_user_id from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE()) and online_status = 1";
  }
  
  if (req.search) {
    query = query + " and name LIKE  '%" + req.search + "%'";
  }
  sql.query(query, function (err, res) {
    if (err) {
      let error = {
        success: true,
        status:false,
    };
        result(error, null);
    }
    else {
      if(res.length===0){
        let resobj = {
          success: true,
          status:false,
          message:"No Move-it found,please try after some time"
        };
        result(null, resobj);
      }else{
        if(constant.zone_control&&req.zone){
          MoveitFireBase.getInsideZoneMoveitList(req.geoLocation,res,function(err, make_it_id) {
            if (err) {
              let error = {
                success: true,
                status:false,
                message:"No Move-it found,please after some time"
              };
              result(error, null);
            }else{

        
              let resobj = {
                success: true,
                status: true,
                result: make_it_id
              };
            result(null, resobj);
            }
          });
        }else{
          MoveitFireBase.geoFireGetKeyByGeoMakeit(req.geoLocation,res,function(err, make_it_id) {
            if (err) {
              let error = {
                success: true,
                status:false,
                message:"No Move-it found,please after some time"
              };
              result(error, null);
            }else{

        
              let resobj = {
                success: true,
                status: true,
                result: make_it_id
              };
            result(null, resobj);
            }
          });
        }
     }
        
    }
});
};

Moveituser.admin_moveit_current_location = async function admin_moveit_current_location(req, result) {
  var query= "select mou.name,mou.zone,mou.Vehicle_no,mou.address,mou.email,mou.phoneno,mou.userid,mou.online_status,mou.moveit_hub,mkh.color,mkh.address as mkhaddress from MoveitUser mou join Makeit_hubs as mkh on mkh.makeithub_id=mou.moveit_hub where mou.online_status = 1";
  sql.query(query, function (err, res) {
    if (err) {
      let error = {
        success: true,
        status:false,
    };
        result(error, null);
    }
    else {
      if(res.length===0){
        let resobj = {
          success: true,
          status:false,
          message:"No Move-it found,please try after some time"
        };
        result(null, resobj);
      }else{
        MoveitFireBase.geoFireGetMoveitLocation(res,function(err, make_it_id) {
          if (err) {
            let error = {
              success: true,
              status:false,
              message:"No Move-it found,please after some time"
            };
            result(error, null);
          }else{
            let resobj = {
              success: true,
              status: true,
              result: make_it_id
            };
            result(null, resobj);
          }
        });
     }
        
    }
});
};


Moveituser.edit_moveit_user = function (req, result) {
    if (req.email || req.password || req.phoneno) {

        let sucobj = true;
        let message = "You can't to be Edit email / password/ phoneno";
        let resobj = {
            success: sucobj,
            message: message
        };

        result(null, resobj);
    } else {

         var staticquery = "UPDATE MoveitUser SET ";
         var column = '';
        for (const [key, value] of Object.entries(req)) {
            //  console.log(`${key} ${value}`); 

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }


        }
       var query = staticquery + column.slice(0, -1) + " where userid = " + req.userid;
        //console.log(query);
        sql.query(query, function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            } else {
                let sucobj = true;
                let message = "Updated successfully"
                let resobj = {
                    success: sucobj,
                    status : true,
                    message: message
                };

                result(null, resobj);
            }

        });
    }
};


Moveituser.update_pushid = function(req, result) {
    var staticquery = "";
    if (req.pushid_android && req.userid) {
      staticquery =
        "UPDATE MoveitUser SET pushid_android ='" +
        req.pushid_android +
        "'   where userid = " +
        req.userid +
        " ";
    } else if (req.pushid_ios && req.userid) {
      staticquery =
        "UPDATE MoveitUser SET pushid_ios ='" +
        req.pushid_ios +
        "'  where userid = " +
        req.userid +
        " ";
    }
  
    if (staticquery.length === 0) {
      let sucobj = true;
      let message = "There no valid data";
      let resobj = {
        success: sucobj,
        status: false,
        message: message
      };
  
      result(null, resobj);
    } else {
      sql.query(staticquery, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          let sucobj = true;
          let message = "Updated successfully";
          let resobj = {
            success: sucobj,
            status: true,
            message: message
          };
  
          result(null, resobj);
        }
      });
    }
  };




  Moveituser.Moveituser_send_otp_byphone = function Moveituser_send_otp_byphone(newUser,result) {
    sql.query(
      "Select * from MoveitUser where phoneno = '" + newUser.phoneno + "'",
      function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          if (res.length == 0) {
            var OTP = Math.floor(Math.random() * 90000) + 10000;
  
            var otpurl =
            "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
            newUser.phoneno +
            "&senderId=EATHOM&message=Your EAT App OTP is " +
            OTP +
            ". Note: Please DO NOT SHARE this OTP with anyone.";
  
            
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
                
                if (responcecode[0] === "0") {
                  sql.query("insert into Otp(phone_number,apptype,otp)values('" +newUser.phoneno +"',4,'" +OTP +"')",
                    function(err, res1) {
                      if (err) {
                        console.log("error: ", err);
                        result(null, err);
                      } else {
                        let resobj = {
                        success: true,
                        status: true,
                        message: responcecode[1],
                        oid: res1.insertId
                        };
  
                        result(null, resobj);
                      }
                    }
                  );
                } else {
                  let resobj = {
                    success: true,
                    status: false,
                    message: responcecode[1]
                  };
  
                  result(null, resobj);
                }
              }
            }
  
            );
          } else {
            let sucobj = true;
            let message =
              "Following user already Exist! Please check it mobile number";
            let resobj = {
              success: sucobj,
              status: false,
              message: message,
              result:res
            };
  
            result(null, resobj);
          }
        }
      }
    );
  };
  
  
  
  Moveituser.Moveituser_otp_verification = function Moveituser_otp_verification( req,result) {
  
    sql.query("Select * from Otp where oid = '" + req.oid + "'", function( err,res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        //  console.log(res[0].otp);
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
            message: "OTP is not valid!, Try once again"
          };
  
          result(null, resobj);
        }
      }
    });
  };

  //////////Moveit Logout///////////////////
  Moveituser.Moveituser_logout = async function Moveituser_logout(req, result) {
    var orderdetails = await query("select dors.* from Dayorder dors left join Moveit_trip mt on mt.tripid=dors.trip_id where dors.dayorderstatus < 9 and mt.moveit_id = "+req.userid+"");
    if (orderdetails.length == 0) {      
      sql.query("select * from MoveitUser where userid = "+req.userid+" ",async function(err,userdetails) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {   
          console.log("userdetails =========>",userdetails);
          if (userdetails.length !==0) { 
            if(userdetails[0].login_status!=2){
              var logouttime =  moment().format("YYYY-MM-DD HH:mm:ss");
              updatequery = await query("Update MoveitUser set online_status = 0,pushid_android = 'null',login_status = 2,logout_time='"+logouttime+"'  where userid = '"+req.userid+"'");
              
              ///////Moveit Log History/////////
              moveit_last_log = await query("select distinct moveit_userid,type  from Moveit_Timelog where moveit_userid="+req.userid+" order by mt_id desc limit 1");
              if(moveit_last_log[0].type==1){
                req.type    = 0;
                req.moveit_userid = req.userid;
                req.action  = 5;              
                await Moveituser.create_createMoveitTimelog(req);  
              }
              /////////////////////////////////
              let resobj = {
                success : true,
                status  : true,
                message : 'Logout Successfully!'  
              };      
              result(null, resobj);  
            }else{
              let resobj = {
                success : true,
                status  : true,
                message : 'user are already in Logout!'  
              };      
              result(null, resobj); 
            }                      
          }else{    
            let resobj = {
              success : true,
              status  : false,
              message : 'Please check userid'  
            };      
            result(null, resobj);
          } 
        }
      });   
    }else{
      let resobj = {
        success : true,
        status  : false,
        message : "Sorry you can't logout , Currently Order is assigned to you!"  
      };
      result(null, resobj);
    }   
  };

////Admin force Logout////////////////
  Moveituser.admin_force_Moveituser_logout = async function admin_force_Moveituser_logout(req, result) { 
    console.log("Admin force logout 2222222222222");
    orderdetails = await query("select * from Orders where orderstatus < 6 and DATE(ordertime) = CURDATE() and moveit_user_id = "+req.userid+"");
    if (orderdetails.length == 0) {     
      sql.query("select * from MoveitUser where userid = "+req.userid+" ",async function(err,userdetails) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {            
          if (userdetails.length !==0) {
            if(userdetails[0].login_status!=2){
              var logouttime =  moment().format("YYYY-MM-DD HH:mm:ss");
              updatequery = await query("Update MoveitUser set online_status = 0,pushid_android = 'null',login_status = "+req.login_status+",logout_time='"+logouttime+"'  where userid = '"+req.userid+"'");
              var logoutstatusMessage='Force logout and disable Successfully!'
              if(req.login_status===3) logoutstatusMessage= 'Enable Successfully.Please login after use.'
              
              ///////Moveit Log History/////////
              moveit_last_log = await query("select distinct moveit_userid,type  from Moveit_Timelog where moveit_userid="+req.userid+" order by mt_id desc limit 1");
              if(moveit_last_log[0].type==1){
                req.type    = 0;
                req.moveit_userid = req.userid;
                req.action  = 5;              
                await Moveituser.create_createMoveitTimelog(req);  
              }
              /////////////////////////////////

              let resobj = {
                success: true,
                status: true,
                message: logoutstatusMessage  
              };      
              result(null, resobj);
            }else{
              let resobj = {
                success : true,
                status  : true,
                message : 'user are already in Logout!'  
              };      
              result(null, resobj); 
            }
          }else{    
            let resobj = {
              success: true,
              status: false,
              message: 'Please check userid'  
            };      
            result(null, resobj);
          }     
        }
      });   
    }else{
      let resobj = {
        success: true,
        status: false,
        // message:mesobj,
        message: "Sorry can't logout, Order is assigned following user!"  
      };
      result(null, resobj);
    }
  };

  Moveituser.moveit_app_version_check_vid= async function moveit_app_version_check_vid(req,result) { 
 
    var updatestatus = {};
    var versionstatus = false;
    var moveitforceupdatestatus =false;

    var moveitversioncode = constant.moveitversioncode;
    var moveitforceupdate = constant.moveitforceupdate;
    

    // if (req.moveitversioncode < moveitversioncode) {
      
    //   versionstatus = true;
    //   moveitforceupdatestatus = true;
    // }

    if (req.moveitversioncode < constant.moveitversionforceupdate) {
        
      versionstatus = true;
      moveitforceupdatestatus = true;
    }else if(req.moveitversioncode < constant.moveitversioncodenew){
      versionstatus = true;
      moveitforceupdatestatus = false;
    }else{
      versionstatus = false;
      moveitforceupdatestatus = false;
    }



    updatestatus.versionstatus = versionstatus;
    updatestatus.moveitforceupdatestatus = moveitforceupdatestatus;

        let resobj = {
            success: true,
            status:true,
            result:updatestatus
        };
  
        result(null, resobj);

  
  };


Moveituser.moveit_online_status_byid= async function moveit_online_status_byid(req,result) { 
 
 var Moveitstatus = await query("select userid,online_status,login_status,pushid_ios,pushid_android  from MoveitUser where userid = "+req.userid+" ");

    if (Moveitstatus.length !==0) {
      let resobj = {
        success: true,
        status:true,
        result:Moveitstatus
    };

    result(null, resobj);

    }else{
      let resobj = {
        success: true,
        status: false,
        result:Moveitstatus
    };

    result(null, resobj);
    }
       
  
  };

  //Moveit Customer Support
  Moveituser.moveit_app_customer_support= async function moveit_app_customer_support(req,result) { 
    let resobj = {
        success: true,
        status:true,
        customer_support : constant.moveit_customer_support
    };
    result(null, resobj);
  };

  Moveituser.getNearByMoveit_auto_assign_moveit_V2 = async function getNearByMoveit_auto_assign_moveit_V2(req, result) {

    var geoLocation = [];;
    geoLocation.push(req.lat);
    geoLocation.push(req.lon);
  
    MoveitFireBase.geoFireGetKeyByGeomoveitbydistance(geoLocation,Constant.nearby_moveit_radius,async function(err, move_it_id) {
      if (err) {
        let error = {
          success: true,
          status:false,
          message:"No Move-it found,please after some time"
        };
        result(error, null);
      }else{
   
      
       // console.log("test3"+move_it_id);
        let resobj = {
          success: true,
          status: true,
          result: move_it_id
        };
      result(null, resobj);
      }
    })
  };

////////////Get Working Dates
Moveituser.getworking_dates = async function getworking_dates(req, result) {
  var getdates = await query("select moveit_userid as moveit_id,date(logtime) as date,0 as TotalOrders,0 as CompletedOrders,0 as InCompletedOrders, '00:00:00' as AvgAcceptTime, '00:00:00' as AvgDeliveryTime,'00:00:00' as AvgKitchenReachTime,'00:00:00' as AvgOrderTime from Moveit_Timelog where moveit_userid="+req.moveit_id+" group by date(logtime) desc");

  for(var i=0; i<getdates.length; i++){
    requestdata = {"moveit_id":getdates[i].moveit_id,"date":getdates[i].date};
    await Moveituser.daywise_moveit_records(requestdata, async function(err, res) {
      if (err) {
        //result(err, null);
        console.log(err);
      } else {
        console.log(res);
        getdates[i].TotalOrders         = res.TotalOrders;
        getdates[i].CompletedOrders     = res.CompletedOrders;
        getdates[i].InCompletedOrders   = res.InCompletedOrders;
        getdates[i].AvgAcceptTime       = res.AvgAcceptTime;
        getdates[i].AvgDeliveryTime     = res.AvgDeliveryTime;
        getdates[i].AvgKitchenReachTime = res.AvgKitchenReachTime;
        getdates[i].AvgOrderTime        = res.AvgOrderTime;
      } 
    });
  } 

  if(getdates.length>0){
    let resobj = {
      success: true,
      status : true,
      result : getdates
    };
    result(null, resobj);
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status : false
    };
    result(null, resobj);
  }
};

////////////Day Wise Moveit History
  Moveituser.daywise_moveit_records = async function daywise_moveit_records(req, result) {
    //console.log(req);
    var getorderlist = await query("select mu.userid,ord.orderid,ord.ordertime,time(ord.order_assigned_time) as order_assigned_time,time(ord.moveit_notification_time) as moveit_notification_time,time(ord.moveit_accept_time) as moveit_accept_time,time(ord.moveit_reached_time) as moveit_reached_time,time(ord.moveit_pickup_time) as moveit_pickup_time,time(ord.moveit_expected_delivered_time) as moveit_expected_delivered_time,time(ord.moveit_customerlocation_reached_time) as moveit_customerlocation_reached_time,time(ord.moveit_actual_delivered_time) as moveit_actual_delivered_time,ord.moveit_status,CASE WHEN ord.orderstatus=0 then 'Order put' WHEN ord.orderstatus=1 then 'Order Accept' WHEN ord.orderstatus=2 then 'Order Preparing' WHEN ord.orderstatus=3 then 'Order Prepared' WHEN ord.orderstatus=4 then 'Kitchen reached' WHEN ord.orderstatus=5 then 'Order Pickedup' WHEN ord.orderstatus=6 then 'Order Delivered' WHEN ord.orderstatus=7 then 'Order Cancel' WHEN ord.orderstatus=8 then 'Order missed by kitchen' WHEN ord.orderstatus=9 then 'Incomplete online order reject' END as status,ord.orderstatus,TIMEDIFF(time(ord.moveit_accept_time),time(ord.order_assigned_time)) as avg_accept_time,TIMEDIFF(time(ord.moveit_actual_delivered_time),time(ord.moveit_pickup_time)) as avg_delivery_time,TIMEDIFF(time(ord.moveit_reached_time),time(ord.moveit_accept_time)) as avg_kitchen_reach_time,TIMEDIFF(time(ord.moveit_actual_delivered_time),time(ord.order_assigned_time)) as avg_order_time,ord.cus_lat,ord.cus_lon,mau.lat,mau.lon,ord.distance_makeit_to_eat from MoveitUser as mu left join Orders as ord on ord.moveit_user_id=mu.userid left join MakeitUser as mau on mau.userid=ord.makeit_user_id where ord.moveit_user_id="+req.moveit_id+" and date(ord.ordertime)='"+req.date+"' order by ord.orderid desc");
       
    var TotalOrders         = 0;
    var CompletedOrders     = 0;
    var InCompletedOrders   = 0;
    var AvgAcceptTime       = "00:00:00";
    var AvgDeliveryTime     = "00:00:00";
    var AvgKitchenReachTime = "00:00:00";
    var AvgOrderTime        = "00:00:00";
    var DistanceMitter   = 0;
    var AvgDistance         = 0;

    for(var i=0; i<getorderlist.length; i++){
      ////Total Orders Calculation
      TotalOrders = TotalOrders+1;
      ////Completed and InCompleted Order Calculation
      if(getorderlist[i].orderstatus == 6){
        CompletedOrders   = CompletedOrders+1;
      }else{
        InCompletedOrders = InCompletedOrders+1;
      }
      ////Sum Accept Time Calculation
      var aahms         = getorderlist[i].avg_accept_time || "00:00:00";   
      var aaa           = aahms.split(':'); 
      var aaseconds     = (+aaa[0]) * 60 * 60 + (+aaa[1]) * 60 + (+aaa[2]); 
      AvgAcceptTime = moment(AvgAcceptTime, 'HH:mm:ss').add(aaseconds,'s').format('HH:mm:ss');
      ////Sum Delivery Time Calculation
      var adhms         = getorderlist[i].avg_delivery_time || "00:00:00";   
      var ada           = adhms.split(':'); 
      var adseconds     = (+ada[0]) * 60 * 60 + (+ada[1]) * 60 + (+ada[2]); 
      AvgDeliveryTime = moment(AvgDeliveryTime, 'HH:mm:ss').add(adseconds,'s').format('HH:mm:ss');
      ////Sum Kitchen Reached Time Calculation
      var akhms         = getorderlist[i].avg_kitchen_reach_time || "00:00:00";   
      var aka           = akhms.split(':'); 
      var akseconds     = (+aka[0]) * 60 * 60 + (+aka[1]) * 60 + (+aka[2]); 
      var AvgKitchenReachTime = moment(AvgKitchenReachTime, 'HH:mm:ss').add(akseconds,'s').format('HH:mm:ss');
      ////Sum Order Time Calculation
      var aohms         = getorderlist[i].avg_order_time || "00:00:00";   
      var aoa           = aohms.split(':'); 
      var aoseconds     = (+aoa[0]) * 60 * 60 + (+aoa[1]) * 60 + (+aoa[2]); 
      AvgOrderTime  = moment(AvgOrderTime, 'HH:mm:ss').add(aoseconds,'s').format('HH:mm:ss');

      ////Sum Calculation 
      DistanceMitter = DistanceMitter+parseFloat(getorderlist[i].distance_makeit_to_eat || 0);
      getorderlist[i].distance_makeit_to_eat = (parseFloat(getorderlist[i].distance_makeit_to_eat)/1000.0 || 0).toFixed(2);
      
    }
    ////Average Accept Time Calculation
    var AATS      = AvgAcceptTime || "00:00:00";  
    var AATSec    = moment(AATS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var AATimesec = AATSec/getorderlist.length;
    AvgAcceptTime = moment().startOf('day').seconds(AATimesec).format('H:mm:ss');
    ////Average Delivery Time Calculation
    var ADTS      = AvgDeliveryTime || "00:00:00";  
    var ADTSec    = moment(ADTS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var ADTimesec = ADTSec/getorderlist.length;
    AvgDeliveryTime  = moment().startOf('day').seconds(ADTimesec).format('H:mm:ss');
    ////Average Kitchen Reached Time Calculation
    var AkTS      = AvgKitchenReachTime || "00:00:00";  
    var AkTSec    = moment(AkTS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var AkTimesec = AkTSec/getorderlist.length;
    AvgKitchenReachTime  = moment().startOf('day').seconds(AkTimesec).format('H:mm:ss');
    ////Average Order Time Calculation
    var AOTS      = AvgOrderTime || "00:00:00";  
    var AOTSec    = moment(AOTS, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');
    var AOTimesec = AOTSec/getorderlist.length;
    AvgOrderTime  = moment().startOf('day').seconds(AOTimesec).format('H:mm:ss');
    ////Average Distance calculation
    DistanceMitter = DistanceMitter/getorderlist.length;
    AvgDistance    = DistanceMitter/1000.0;

    if(getorderlist.length>0){
      let resobj = {
        success: true,
        status : true,
        TotalOrders       : TotalOrders,
        CompletedOrders   : CompletedOrders,
        InCompletedOrders : InCompletedOrders,
        AvgAcceptTime     : AvgAcceptTime,
        AvgDeliveryTime   : AvgDeliveryTime,
        AvgKitchenReachTime:AvgKitchenReachTime,
        AvgOrderTime      : AvgOrderTime,
        AvgDistance       : AvgDistance.toFixed(2),
        result : getorderlist,
      };
     
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status : false
      };
      result(null, resobj);
    }
  };
  

  Moveituser.check_map_boundaries = function check_map_boundaries(req,result) {
    //console.log(req);
    sql.query("Select * from Zone", function( err,res) {
      if (err) {
        console.log(err);
        result(err, null);
      } else {
        console.log(res);
        var isZone=false;
        var zoneName='';
        if(res.length>0){
          for(var i=0; i<res.length; i++){
            var polygon=JSON.parse(res[i].boundaries);
            if(Moveituser.pointInPolygon(polygon,{lat:req.lat,lng:req.lng})){
              zoneName=res[i].Zonename;
              isZone=true;
              break;
            }
          }
          
        }
        if(isZone){
          let resobj = {
            success: true,
            status : true,
            message: zoneName,
            zone_id:res[i].id
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : true,
            message: 'No Zone Available.'
          };
          result(null, resobj);
        }
      }
    });
  };

  Moveituser.pointInPolygon=function pointInPolygon(polygonPath, coordinates){
    let numberOfVertexs = polygonPath.length - 1;
    let inPoly = false;
    let { lat, lng } = coordinates;

    let lastVertex = polygonPath[numberOfVertexs];
    let vertex1, vertex2;

    let x = lat, y = lng;

    let inside = false;
    for (var i = 0, j = polygonPath.length - 1; i < polygonPath.length; j = i++) {
        let xi = polygonPath[i].lat, yi = polygonPath[i].lng;
        let xj = polygonPath[j].lat, yj = polygonPath[j].lng;

        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }

    return inside;
}

////////////User Wise Moveit Report
Moveituser.firstmile_userwise_moveitreport = async function firstmile_userwise_moveitreport(req, result) {
 if(req.fromdate && req.todate){
    var DayWiseQuery ="Select date(ord.ordertime) as date,ord.moveit_user_id,mu.name,count(date(ord.created_at)) from Orders as ord left join MoveitUser as mu on mu.userid = ord.moveit_user_id where ord.moveit_accept_time IS NOT NULL and ord.moveit_reached_time IS NOT NULL and ord.moveit_actual_delivered_time IS NOT NULL and ord.moveit_pickup_time IS NOT NULL and ord.orderid NOT IN (select orderid from Force_delivery_logs) and  ord.orderstatus=6 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' group by mu.userid,date(ord.created_at) order by ord.moveit_user_id asc";

    var MovieitWiseQuery = "Select ord.moveit_user_id,mu.name,count(ord.orderid)as order_count, SEC_TO_TIME(AVG(TIME_TO_SEC(ADDTIME(TIMEDIFF(moveit_reached_time,moveit_accept_time),TimeDiff(moveit_actual_delivered_time,moveit_pickup_time))))) as Avg_time from Orders as ord left join MoveitUser as mu on mu.userid = ord.moveit_user_id where ord.moveit_accept_time IS NOT NULL and ord.moveit_reached_time IS NOT NULL and ord.moveit_actual_delivered_time IS NOT NULL and ord.moveit_pickup_time IS NOT NULL   and ord.orderid NOT IN (select orderid from Force_delivery_logs) and ord.orderstatus=6 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' group by mu.userid";

    var DayWise = await query(DayWiseQuery);
    var MovieitWise = await query(MovieitWiseQuery);

    if(MovieitWise.length>0){
      for(var i=0; i<MovieitWise.length; i++){
        var daycount = 0;
        for(var j=0; j<DayWise.length; j++){      
          if(MovieitWise[i].moveit_user_id == DayWise[j].moveit_user_id){
            daycount = daycount + 1; 
          }
        }
        MovieitWise[i].daycount = daycount;    
        MovieitWise[i].OrdersDayAvg = (MovieitWise[i].order_count/daycount).toFixed(2);
      }
      let resobj = {
        success: true,
        status : true,
        result : MovieitWise
      };
      result(null, resobj);
      
    }else{
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status : false
      };    
      result(null, resobj);
    }    
  }else{
    let resobj = {
      success: true,
      message: "please Check the Request",
      status : false
    };
    result(null, resobj);
  }
};

////////////Orders Wise Moveit Report
Moveituser.firstmile_orderwise_moveitreport = async function firstmile_orderwise_moveitreport(req, result) {
  if(req.fromdate && req.todate){
     var OrderMoveitReportQuery ="Select ord.orderid,ord.ordertime,time(ord.order_assigned_time) as Assigned_time,time(ord.moveit_accept_time) as Accept_time, time(ord.moveit_reached_time) as Moveit_reach_time,time(ord.moveit_pickup_time) as Pickup_time,time(ord.moveit_actual_delivered_time) as Delivery_time, ord.moveit_user_id,mu.name,TIMEDIFF(moveit_reached_time,moveit_accept_time) as Moveit_Accept_time,TimeDiff(moveit_actual_delivered_time,moveit_pickup_time) as Moveit_delivered_time, ADDTIME(TIMEDIFF(moveit_reached_time,moveit_accept_time),TimeDiff(moveit_actual_delivered_time,moveit_pickup_time)) as Totaltime from Orders as ord left join MoveitUser as mu on mu.userid = ord.moveit_user_id where ord.moveit_accept_time IS NOT NULL and ord.order_assigned_time IS NOT NULL and ord.moveit_actual_delivered_time IS NOT NULL and ord.moveit_pickup_time IS NOT NULL and ord.orderid NOT IN (select orderid from Force_delivery_logs) and ord.orderstatus=6 and Date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' order by ord.orderid desc";
 
    var OrderMoveitReport = await query(OrderMoveitReportQuery);
    if(OrderMoveitReport.length>0){
      let resobj = {
        success: true,
        status : true,
        result : OrderMoveitReport
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status : false
      };
      result(null, resobj);
    }          
  }else{
     let resobj = {
       success: true,
       message: "please Check the Request",
       status : false
     };
     result(null, resobj);
  }
};

////////////Orders Wise Moveit Report
Moveituser.orderwise_moveitreport = async function orderwise_moveitreport(req, result) {
  
  if(req.fromdate && req.todate){
    var OrderMoveitReportQuery ="select mu.userid,mu.name,ord.orderid,ord.ordertime,time(ord.order_assigned_time) as order_assigned_time,time(ord.moveit_notification_time) as moveit_notification_time,time(ord.moveit_accept_time) as moveit_accept_time, time(ord.moveit_reached_time) as moveit_reached_time,time(ord.moveit_pickup_time) as moveit_pickup_time,time(ord.moveit_expected_delivered_time) as moveit_expected_delivered_time, time(ord.moveit_customerlocation_reached_time) as moveit_customerlocation_reached_time,time(ord.moveit_actual_delivered_time) as moveit_actual_delivered_time,ord.moveit_status,  CASE WHEN ord.orderstatus=0 then 'Order put' WHEN ord.orderstatus=1 then 'Order Accept' WHEN ord.orderstatus=2 then 'Order Preparing' WHEN ord.orderstatus=3 then 'Order Prepared' WHEN ord.orderstatus=4 then 'Kitchen reached' WHEN ord.orderstatus=5 then 'Order Pickedup' WHEN ord.orderstatus=6 then 'Order Delivered' WHEN ord.orderstatus=7 then 'Order Cancel' WHEN ord.orderstatus=8 then 'Order missed by kitchen' WHEN ord.orderstatus=9 then 'Incomplete online order reject' END as status,ord.orderstatus,TIMEDIFF(time(ord.moveit_accept_time), time(ord.order_assigned_time)) as accept_time,TIMEDIFF(time(ord.moveit_actual_delivered_time),time(ord.moveit_pickup_time)) as delivery_time,TIMEDIFF(time(ord.moveit_reached_time),      time(ord.moveit_accept_time)) as kitchen_reach_time,TIMEDIFF(time(IFNULL(ord.moveit_actual_delivered_time,0)),time(IFNULL(ord.created_at,0))) as order_time,ord.cus_lat,ord.cus_lon,mau.lat,mau.lon,ord.moveit_assign_lat,ord.moveit_assign_long, ord.moveit_accept_lat,ord.moveit_accept_long,ord.moveit_kitchen_reached_lat,ord.moveit_kitchen_reached_long,ord.moveit_Pickup_lat,ord.moveit_Pickup_long,ord.moveit_customer_location_reached_lat,ord.moveit_customer_location_reached_long,ord.moveit_delivery_lat,ord.moveit_delivery_long from MoveitUser as mu left join Orders as ord on ord.moveit_user_id=mu.userid left join MakeitUser as mau on mau.userid=ord.makeit_user_id where ord.ordertime IS NOT NULL and ord.moveit_actual_delivered_time IS NOT NULL and ord.orderid NOT IN (select orderid from Force_delivery_logs) and date(ord.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' order by ord.orderid desc";
  
    var OrderMoveitReport = await query(OrderMoveitReportQuery);
    if(OrderMoveitReport.length>0){
      let resobj = {
        success: true,
        status : true,
        result : OrderMoveitReport
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        message: "Sorry! no data found.",
        status : false
      };
      result(null, resobj);
    }          
  }else{
    let resobj = {
      success: true,
      message: "please Check the Request",
      status : false
    };
    result(null, resobj);
  }
};


//Moveit zone data

Moveituser.moveit_zone_data =async function moveit_zone_data(req, result) {

  var userdetails = await query("select * from MoveitUser where userid = "+req.userid+"");
  var zone_id=0;
  var zone_name="";
  var boundaries="";
  var iszone=false;
    if (userdetails.length !==0) {
      if(constant.zone_control==false){
  
        var zoneDetail = await query("select * from Zone where id = "+userdetails[0].zone+"");
        console.log(zoneDetail);
        if(zoneDetail&&zoneDetail.length>0&&zoneDetail[0].boundaries){
          zone_id=zoneDetail[0].id;
          zone_name=zoneDetail[0].Zonename;
          boundaries=JSON.parse(zoneDetail[0].boundaries);
          iszone=true;
        }
      }
              
        let resobj = {
          success: true,
          status:iszone,
          zone_id:zone_id,
          zone_name:zone_name,
          boundaries:boundaries ||null,
          iszone:iszone
      };

      result(null, resobj);
      
    }else{
      
      let resobj = {
          success: true,
          status: false,
          message: "User not found!"
      };
  
      result(null, resobj);
    }
  };

  ////Zone Wise Free Moveit List///////////
  Moveituser.zone_free_moveitlist =async function zone_free_moveitlist(req, result) {
    var getmoveitlistquery = "select userid,name,phoneno,zone,moveit_hub,zo.Zonename  from MoveitUser mu left join Zone zo on mu.zone=zo.id where login_status=1 and online_status=1 and order_assign_status=0 and userid NOT IN (select moveit_userid from Moveit_trip where date(created_at)=CURDATE() and (trip_status=0 or trip_status=1))";
    var getmoveitlist = await query(getmoveitlistquery);
      
    if(req.zone){
      getmoveitlistquery =getmoveitlistquery+" and zone= "+ req.zone;
    }

    if(getmoveitlist.length>0){
      let resobj = {
        success: true,
        status : true,
        result : getmoveitlist
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "sorry moveit's not avaliable"
      };
      result(null, resobj);
    }       
  };

  ////Zone Wise yesterday Orders List/////////
  Moveituser.zonewise_yesterday_orderslist =async function zonewise_yesterday_orderslist(req, result) {
    
      var getyesterdayorderlistquery = "select ord.*,zo.Zonename from Orders as ord left join MakeitUser as mu on mu.userid=ord.makeit_user_id left join Zone zo on zo.id=mu.zone where ord.orderstatus=3 and ord.payment_type=1 and ord.payment_status=1 and moveit_user_id=0 and trip_id=0 and ord.delivery_vendor!=1 and date(ord.order_delivery_day)<=CURDATE()";
      if(req.zone){
        getyesterdayorderlistquery=getyesterdayorderlistquery+" and mu.zone="+req.zone;
      }

      getyesterdayorderlistquery=getyesterdayorderlistquery+" order by ord.orderid";

      //console.log(getyesterdayorderlistquery);
      var getyesterdayorderlist = await query(getyesterdayorderlistquery);

      if(getyesterdayorderlist.length>0){
        let resobj = {
          success: true,
          status : true,
          result : getyesterdayorderlist
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "Sorry no orders found"
        };
        result(null, resobj);
      }
        
  };

  ////Assign Moveit to Orders/////////
  Moveituser.assign_moveitto_orders =async function assign_moveitto_orders(req, result) {
    if(req.moveit_id && req.orders){
      var curtime =  moment().format("YYYY-MM-DD HH:mm:ss");
      var triparray = {"moveit_userid":req.moveit_id,"trip_assigned_time":curtime};
      var checkmoveitquery = "select moveit_userid from Moveit_trip where moveit_userid="+req.moveit_id+" and date(created_at)=CURDATE() and (trip_status=0 or trip_status=1)";
      sql.query(checkmoveitquery,async function (err, checkmoveit) {
        if (err) {
          console.log("error: ", err);
        } else {
          console.log("checkmoveit-->",checkmoveit);
          if(checkmoveit.length>0){
            let resobj = {
              success : true,
              status  : false,
              message : "This moveit already in a trip"
            };
            result(null, resobj);
          }else{
            sql.query("INSERT INTO Moveit_trip set ?", triparray,async function (err, tripresult) {
              if (err) {
                console.log("error: ", err);
              } else {
                var tripid= tripresult.insertId;
                var updatemoveitidquery = "update Orders set order_assigned_time='"+curtime+"',moveit_user_id="+req.moveit_id+",trip_id="+tripid+" where orderid IN("+req.orders+")";

                ////////Moveit status insert/////
                for(let i=0; i<req.orders.length; i++){                  
                  var new_MoveitStatus = new Array();
                  new_MoveitStatus.push({"orderid":req.orders[i],"moveitid":req.moveit_id,"status":1});
                  await MoveitStatus.createMoveitStatus(new_MoveitStatus, function(err, res) {
                    if (err) return err;
                    else return res;
                  });
                }

                
                sql.query(updatemoveitidquery,async function(err,updateorders){
                  if(updateorders.affectedRows>0){

              
                    req.tripid=tripid;
                    req.moveitid = req.moveit_id;
                
                    // await Notification.trip_MoveIt_PushNotification(trip,PushConstant.pageidMoveit_Order_Assigned,req.moveit_id);

                    await Notification.trip_MoveIt_PushNotification(req,PushConstant.pageidMoveit_Order_Assigned,req.moveitid);
                    // req.state=1;
                    // Order.update_moveit_lat_long(req);

                    let resobj = {
                      success : true,
                      status  : true,
                      message : "Orders Assigned Successfully"
                    };
                    result(null, resobj);
                  }else{
                    let resobj = {
                      success : true,
                      status  : false,
                      message : "sorry no update"
                    };
                    result(null, resobj);
                  }
                });
              }
            });
          }        
        }
      });
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "sorry no trip today"
      };
      result(null, resobj);
    }    
  };

  ////Admin Moveit Trip List/////////
  Moveituser.admin_moveit_trip_list =async function admin_moveit_trip_list(req, result) {
    var pagelimt = 20;
    var page = req.page || 1;
    var startlimit = (page - 1) * pagelimt;

      var wherecas = "";
      if(req.type==2){
         wherecas = " where date(mt.created_at)=DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
      }else if(req.type==1){
         wherecas = " where date(mt.created_at)=CURDATE() ";
      }
      
      var getadmintriplistquery = "select mt.id as trip_id,mt.moveit_userid,mu.name as moveit_user_name, COUNT(orderid) as order_count, SUM(ord.price) as total_amount,SUM(ord.total_weight) as total_weigth,CASE WHEN mt.trip_status=0 THEN 'Waiting' WHEN mt.trip_status=1 THEN 'Started' WHEN mt.trip_status=2 THEN 'End' WHEN mt.trip_status=3 THEN 'Cancel' END as trip_status from Moveit_trip as mt left join MoveitUser as mu on mu.userid=mt.moveit_userid left join Orders as ord on ord.trip_id=mt.id "+wherecas+" group by mt.id";

      var getadmintriplistcount = "select count(*) as total_count from Moveit_trip as mt"+wherecas;

      var limitquery =getadmintriplistquery +" order by mt.id DESC limit " +startlimit +"," +pagelimt;

      var getadmintriplist = await query(limitquery);
      if(getadmintriplist.length>0 && getadmintriplist[0].trip_id){
        var getadmintriplist_count = await query(getadmintriplistcount);
        let resobj = {
          success: true,
          status : true,
          pagelimt:pagelimt,
          total_count:getadmintriplist_count.length>0?getadmintriplist_count[0].total_count:0,
          result : getadmintriplist
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "sorry no trip"
        };
        result(null, resobj);
      }
       
  };

  ////Moveit Trip List/////////
  Moveituser.moveit_trip_list =async function moveit_trip_list(req, result) {
    if(req.moveit_userid){
      var gettriplistquery = "select mt.tripid as trip_id,mt.moveit_id,mu.name as moveit_user_name, COUNT(ord.id) as order_count, mt.trip_status, CASE WHEN mt.trip_status=0 THEN 'Trip not started' WHEN mt.trip_status=1 THEN 'trip started' WHEN mt.trip_status=2 THEN 'trip completed' WHEN mt.trip_status=3 THEN 'trip canceled' END as trip_status_msg from Moveit_trip as mt left join MoveitUser as mu on mu.userid=mt.moveit_id left join Dayorder as ord on ord.trip_id=mt.tripid where date(mt.created_at)=CURDATE() and mt.moveit_id="+req.moveit_userid+" group by mt.tripid order by mt.trip_status";
      var gettriplist = await query(gettriplistquery);
      if(gettriplist.length>0){
        let resobj = {
          success: true,
          status : true,
          result : gettriplist
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "sorry no trip today"
        };
        result(null, resobj);
      }
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }   
  };

  ////Moveit Trip Details/////////
  Moveituser.moveit_trip_details =async function moveit_trip_details(req, result) {
    if(req.moveit_userid && req.tripid){
      var gettripdetailsquery = "select ord.id,COUNT(dp.vpid) as item_count,ord.trip_id,mt.trip_status,CASE WHEN mt.trip_status=0 THEN 'Trip not started' WHEN mt.trip_status=1 THEN 'trip started' WHEN mt.trip_status=2 THEN 'trip completed' WHEN mt.trip_status=3 THEN 'trip canceled' END as trip_status_msg,mkh.*,ord.*,us.name as cus_name,us.phoneno as cus_phoneno from Dayorder as ord left join User as us on us.userid=ord.userid left join Dayorder_products as dp on ord.id=dp.doid left join Moveit_trip as mt on mt.tripid=ord.trip_id left join MoveitUser as mu on mu.userid=mt.moveit_id left join Zone as mkh on mkh.id=mu.zone where mt.moveit_id='"+req.moveit_userid+"' and ord.trip_id='"+req.tripid+"' order by ord.id";
        console.log(gettripdetailsquery);
      var gettripdetails = await query(gettripdetailsquery);      

      if(gettripdetails.length>0 ){
        for(let i=0; i<gettripdetails.length; i++){
          var moveitstatusquery ="select * from Moveit_status  where doid = " +gettripdetails[i].id +" order by id desc limit 1";
          var statuslist = await query(moveitstatusquery);
          if (statuslist.length !==0 ) {
            gettripdetails[i].status = statuslist[0].status || 0;
          }

          var itemsquery = "select * from Dayorder_products  where doid="+gettripdetails[i].id;
          var items = await query(itemsquery);
          gettripdetails[i].itemlistcount = items.length;
          gettripdetails[i].itemlist = items;
  
        }

        let resobj = {
          success: true,
          status : true,
          trip_id: gettripdetails[0].trip_id,
          result : gettripdetails
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "sorry no trip today"
        };
        result(null, resobj);
      }
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }    
  };

  ////Moveit Order Details/////////
  Moveituser.moveit_order_details =async function moveit_order_details(Dayorder, result) {
    if(Dayorder.id){
      var getdayorderquery = "select drs.*,us.name,us.phoneno,us.email,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('scm_status',orp.scm_status,'id',orp.id,'quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'scm_status_msg',iF(orp.scm_status=6,'Ready to Dispatch',IF (orp.scm_status=11,'Product cancel',IF (orp.scm_status=10,'deliverd',IF(orp.scm_status=12,'Return','Inprogress') ))))) AS Products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' when drs.dayorderstatus=12 then 'return' when drs.dayorderstatus=11 then 'cancel' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id  left join User us on us.userid=drs.userid  where drs.id="+Dayorder.id+" group by drs.id,drs.userid";
      // console.log(getdayorderquery);
      var getdayorder = await query(getdayorderquery);
      if(getdayorder.length>0){
        for (let i = 0; i < getdayorder.length; i++) {
          getdayorder[i].Products = JSON.parse(getdayorder[i].Products);
        }        
        let resobj = {
          success: true,
          status: true,
          result: getdayorder
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status: false,
          message: "no data"
        };
        result(null, resobj);
      }      
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "check your post values"
      };
      result(null, resobj);
    }   
  };

  ////Moveit Trip Start/////////
  Moveituser.moveit_trip_start =async function moveit_trip_start(req, result) {
    if(req.moveit_userid && req.tripid){
      var tripstatuscheckquery = "select * from Moveit_trip where tripid="+req.tripid+" and moveit_id="+req.moveit_userid;
      var tripstatuscheck = await query(tripstatuscheckquery);

      if(tripstatuscheck.length>0 && tripstatuscheck[0].trip_status==0){
        var curtime =  moment().format("YYYY-MM-DD HH:mm:ss");
        var updatetripstatusquery = "update Moveit_trip set start_time='"+curtime+"', trip_status=1 where tripid="+req.tripid+" and moveit_id="+req.moveit_userid;
        var updatetripstatus = await query(updatetripstatusquery);
        if(updatetripstatus.affectedRows>0){
          let resobj = {
            success: true,
            status : true,
            message : "trip status updated successfully"
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : false,
            message : "sorry no update"
          };
          result(null, resobj);
        }
      }else if(tripstatuscheck.length>0 && tripstatuscheck[0].trip_status==1){
        let resobj = {
          success: true,
          status : false,
          message : "this trip already started"
        };
        result(null, resobj);
      }else if(tripstatuscheck.length>0 && tripstatuscheck[0].trip_status==2){
        let resobj = {
          success: true,
          status : false,
          message : "this trip already end"
        };
        result(null, resobj);
      }      
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }    
  };

  ////Moveit Trip End/////////
  Moveituser.moveit_trip_end =async function moveit_trip_end(req, result) {
    if(req.moveit_userid && req.tripid){
      var chekordersquery = "select COUNT(id)as total_orders,COUNT(CASE WHEN dayorderstatus=10 THEN id END) as completed_orders from Dayorder where trip_id="+req.tripid+" ";
      var chekorders = await query(chekordersquery);
      if(chekorders>0 && chekorders[0].total_orders == chekorders[0].completed_orders){
        var curtime =  moment().format("YYYY-MM-DD HH:mm:ss");
        var updatetripstatusquery = "update Moveit_trip set end_time='"+curtime+"', trip_status=2 where tripid="+req.tripid+" and moveit_id="+req.moveit_userid;
        var updatetripstatus = await query(updatetripstatusquery);
        if(updatetripstatus.affectedRows>0){
          let resobj = {
            success: true,
            status : true,
            message : "trip status updated successfully"
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : false,
            message : "sorry no update"
          };
          result(null, resobj);
        }
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "please complete all order"
        };
        result(null, resobj);
      }      
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }    
  };

  ////Update Order Pickup Image/////////
  Moveituser.update_orderpickup_img =async function update_orderpickup_img(req, result) {
    if(req.moveit_userid && req.tripid && req.id && req.imgurl){
      var updateorderpickupimgquery = "update Dayorder set order_pickup_img='"+req.imgurl+"' where id="+req.id+" and trip_id="+req.tripid+" ";
      var updateorderpickupimg = await query(updateorderpickupimgquery);
      if(updateorderpickupimg.affectedRows>0){
        let resobj = {
          success: true,
          status : true,
          message : "order pickup img updated successfully"
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "sorry no update"
        };
        result(null, resobj);
      }
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }    
  };

  ////Re-Assign Moveit to Orders/////////
  Moveituser.reassign_moveitto_orders =async function reassign_moveitto_orders(req, result) {
    if(req.moveit_id && req.trip_id && req.reason){
      var checktripquery = "select * from Moveit_trip where id="+req.trip_id;
      var checktrip = await query(checktripquery);

      if(checktrip && checktrip[0].trip_status==0){
        var updatetripquery = "update Moveit_trip set moveit_userid="+req.moveit_id+" where id="+req.trip_id;
        var updatetrip = await query(updatetripquery);

        var updateorderquery = "update Orders set moveit_user_id="+req.moveit_id+" where trip_id="+req.trip_id;
        var updateorder = await query(updateorderquery);

        var unassignarray = new Array();
        unassignarray.push({'moveit_userid':checktrip[0].moveit_userid,'to_moveit_userid':req.moveit_id,'trip_id':req.trip_id,'reason':req.reason});
        var moveitunassignlog = await MoveitUnassign.createMoveitUnassign(unassignarray);
        
        if(updatetrip && updateorder){
          let resobj = {
            success: true,
            status : true,
            message : "order reassigned successfully"
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : false,
            message : "something went wrong plz try again"
          };
          result(null, resobj);
        }      
      }else if(checktrip && checktrip[0].trip_status==1){
        let resobj = {
          success: true,
          status : false,
          message : "sorry your trip already started"
        };
        result(null, resobj);
      }else if(checktrip && checktrip[0].trip_status==2){
        let resobj = {
          success: true,
          status : false,
          message : "sorry your trip already completed"
        };
        result(null, resobj);
      }    
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "please check your post values"
      };
      result(null, resobj);
    }    
  };

  ////Remove Orders From Trip/////////
  Moveituser.remove_orders_trip =async function remove_orders_trip(req, result) {
    console.log(req.orderid +" tid "+req.trip_id+" reason "+req.reason)
    if(req.orderid && req.trip_id && req.reason){
      var checkorderquery = "select orderstatus,moveit_user_id from Orders where orderid="+req.orderid+" and trip_id="+req.trip_id;
      var checkorder = await query(checkorderquery);

      if(checkorder.length > 0 && checkorder[0].orderstatus != 6){
        var updateorderquery = "update Orders set moveit_user_id=0,trip_id=0 where orderid="+req.orderid+" and trip_id="+req.trip_id;
        var updateorder = await query(updateorderquery);

        var unassignarray = new Array();
        unassignarray.push({'moveit_userid':checkorder[0].moveit_user_id,'trip_id':req.trip_id,'orderid':req.orderid,'orderstatus':checkorder[0].orderstatus,'reason':req.reason});
        var moveitunassignlog = MoveitUnassign.createMoveitUnassign(unassignarray);

        if(updateorder.affectedRows>0){
          await Moveituser.updatetripstatus(req.trip_id);

          var trip = {};
          trip.tripid=req.trip_id;
          trip.orderid=req.orderid;
          await Notification.trip_MoveIt_PushNotification(trip,PushConstant.pageidMoveit_Order_unassign,checkorder[0].moveit_user_id);

          
          let resobj = {
            success: true,
            status : true,
            message : "order removed from trip"
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : false,
            message : "something went wrong plz try again"
          };
          result(null, resobj);
        }      
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "cant removed check order status"
        };
        result(null, resobj);
      }    
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "please check your post values"
      };
      result(null, resobj);
    }    
  };

  ////Unlive Moveit/////////
  Moveituser.moveit_unlive =async function moveit_unlive(req, result) {
    if(req.moveit_id){
      var checkorderquery = "select orderstatus from Orders where moveit_user_id="+req.moveit_id+" and orderstatus<6";
      var checkorder = await query(checkorderquery);

      if(checkorder.length>0){
        let resobj = {
          success: true,
          status : true,
          message : "moveit need to complete pending orders"
        };
        result(null, resobj);            
      }else {
        var curtime =  moment().format("YYYY-MM-DD HH:mm:ss");
        var updatetripstatusquery = "update Moveit_trip set end_time='"+curtime+"', trip_status=2 where id="+req.tripid+" and moveit_userid="+req.moveit_id;
        var updatetripstatus = await query(updatetripstatusquery);
        if(updatetripstatus.affectedRows>0){
          var updatemoveitlogquery = "update MoveitUser set online_status=0 where userid="+req.moveit_id;
          var updatemoveitlog = await query(updatemoveitlogquery);

          let resobj = {
            success: true,
            status : true,
            message : "trip status updated successfully"
          };
          result(null, resobj);
        }else{
          let resobj = {
            success: true,
            status : false,
            message : "sorry no update"
          };
          result(null, resobj);
        }
      }    
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "please check your post values"
      };
      result(null, resobj);
    }    
  };

  ////Moveit Trip History/////////
  Moveituser.moveit_trip_history =async function moveit_trip_history(req, result) {
    req.moveit_userid = parseInt(req.moveit_userid);
    req.trip_status = parseInt(req.trip_status);
    if(req.moveit_userid){
      var wherecon = "";
      if(req.from_date && req.to_date){
        var wherecon = wherecon+" and date(created_at) between '"+req.from_date+"' and '"+req.to_date+"' ";
      }
      if(req.trip_status){
        var wherecon = wherecon+" and trip_status="+req.trip_status+" ";
      }

      // var gettriphistoryquery = "select tripid,trip_status,case when trip_status=0 then 'waiting for trip start' when trip_status=1 then 'trip started' when trip_status=2 then 'trip completed' when trip_status=3 then 'trip canceled' end as trip_status_msg,start_time,end_time,cancel_time,0 order_list,0 order_count from Moveit_trip where moveit_id="+req.moveit_userid+" "+wherecon+" ";
      var gettriphistoryquery = "select tripid,trip_status,case when trip_status=0 then 'Trip not started' when trip_status=1 then 'trip started' when trip_status=2 then 'trip completed' when trip_status=3 then 'trip canceled' end as trip_status_msg,start_time,end_time,cancel_time,0 order_list,0 order_count from Moveit_trip where moveit_id="+req.moveit_userid+" "+wherecon+" ";   
   
      var gettriphistory = await query(gettriphistoryquery);
      
      if(gettriphistory.length>0){
        for(let i=0; i<gettriphistory.length; i++){
          var ordersquery = " select * from Dayorder where  trip_id= "+gettriphistory[i].tripid+" " ;
          var orders = await query(ordersquery);
          gettriphistory[i].order_count = orders.length;
          gettriphistory[i].order_list = orders;  
        }
        let resobj = {
          success: true,
          status : true,
          result : gettriphistory
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "sorry no trip"
        };
        result(null, resobj);
      }
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }    
  };

  ////Moveit Trip History/////////
  Moveituser.moveit_trip_detail =async function moveit_trip_detail(req, result) {
    if(req.trip_id){
      var gettriphistoryquery = "select * from Moveit_trip where id="+req.trip_id;
      var gettriphistory = await query(gettriphistoryquery);

      if(gettriphistory.length>0){
         let resobj = {
          success: true,
          status : true,
          result : gettriphistory
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "sorry no trip"
        };
        result(null, resobj);
      }
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);
    }   
  }; 

  ////check and update Trip Status////////
  Moveituser.updatetripstatus =async function updatetripstatus(trip_id) {
    if(trip_id){
      console.log("trip ")
      var checktripquery = "select if(count(id),count(id),0) as order_count,if(count(CASE WHEN dayorderstatus<10 THEN id END),count(CASE WHEN dayorderstatus<10 THEN id END),0) as last_order from Dayorder where trip_id="+trip_id;
      var checktrip = await query(checktripquery);
      var curtime =  moment().format("YYYY-MM-DD HH:mm:ss");
      if(checktrip[0].last_order==0 && checktrip[0].order_count==0){
        var updatretripquery = "update Moveit_trip set trip_status=3,cancel_time='"+curtime+"' where tripid="+trip_id;
        var updatretrip = await query(updatretripquery);
        if(updatretrip.affectedRows>0){
          return 3;
        }        
      }else if(checktrip[0].last_order==0 && checktrip[0].order_count!=0){      
        var updatretripquery = "update Moveit_trip set trip_status=2,end_time='"+curtime+"' where tripid="+trip_id;
        var updatretrip = await query(updatretripquery);
        if(updatretrip.affectedRows>0){
          return 2;
        }          
      }else{
        var gettripstatusquery = "select trip_status from Moveit_trip where tripid="+trip_id;
        var gettripstatus = await query(gettripstatusquery);
        if(gettripstatus.length>0){
          return gettripstatus[0].trip_status;
        }        
      }
    }
  };
   
  ////Admin add new order into old trip/////////
  Moveituser.admin_addorder_trip =async function admin_addorder_trip(req, result) {
    console.log("123");
    if(req.orders && req.moveit_id && req.trip_id){
      var checktripstatusquery = "select * from Moveit_trip where moveit_userid="+req.moveit_id+" and id="+req.trip_id;
      var checktripstatus = await query(checktripstatusquery);
      if(checktripstatus.length>0){
        if(checktripstatus[0].trip_status==0){
          for(let i=0; i<req.orders.length; i++){ 
            var checkzonequery = "select ma.zone as makeit_zone,(select mu.zone from MoveitUser as mu where mu.userid="+req.moveit_id+") as moveit_zone from Orders as ord left join MakeitUser as ma on ma.userid=ord.makeit_user_id where ord.orderid="+req.orders[i];
            var checkzone = await query(checkzonequery);
            if(checkzone.length>0){
              if(checkzone[0].makeit_zone == checkzone[0].moveit_zone){
                var updateorderquery = "update Orders set moveit_user_id="+req.moveit_id+",trip_id="+req.trip_id+" where orderid="+req.orders[i];
                var updateorder = await query(updateorderquery);
                if(updateorder.affectedRows>0){
                  let resobj = {
                    success: true,
                    status : true,
                    message : "order added successfully"
                  };
                  result(null, resobj);
                }else{
                  let resobj = {
                    success: true,
                    status : false,
                    message : "something wend wrong plz try again"
                  };
                  result(null, resobj);
                }
              }else{
                let resobj = {
                  success: true,
                  status : false,
                  message : "different zone"
                };
                result(null, resobj);
              }
            }else{
              let resobj = {
                success: true,
                status : false,
                message : "No zone available"
              };
              result(null, resobj);
            }
          }
        }else {
          let resobj = {
            success: true,
            status : false,
            message : "trip already started"
          };
          result(null, resobj);
        }
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "no trip"
        };
        result(null, resobj);
      }
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "please check your post values"
      };
      result(null, resobj);
    }    
  };

  ////Moveit Trip History/////////
  Moveituser.push_notification =async function push_notification(req, result) {
    console.log("-----------------------------");
    if(req.tripid){
      console.log(req);
      // var gettriphistoryquery = "select * from Moveit_trip where id="+req.trip_id;
      // var gettriphistory = await query(gettriphistoryquery);
      // var moveitid=5;
      await Notification.trip_MoveIt_PushNotification(req,PushConstant.pageidMoveit_Order_Assigned,req.moveitid);

      
      let resobj = {
        success: true,
        status : false,
        message : "check post values"
      };
      result(null, resobj);

    }else{
      let resobj = {
        success: true,
        status : false,
        message : "please check your post values"
      };
      
      result(null, resobj);
    }    
  };

  Moveituser.order_assign_to_dunzo =async function order_assign_to_dunzo(req,result) {
    var checktripquery = "update Orders set delivery_vendor=1 where orderid="+req.orderid;
    var message="Order move to dunzo successfully.";
    if(req.removetodunzo==1){
      checktripquery = "update Orders set delivery_vendor=0 where orderid="+req.orderid;
      message="Order remove to dunzo successfully.";
    }
    var checktrip = await query(checktripquery);
    let resobj = {
      success: true,
      status : true,
      message : "Order move to dunzo successfully.",
      message : message
    };
    result(null, resobj);
};

Moveituser.order_delivery_time_update =async function order_delivery_time_update(req,result) {
  var curtime =  moment().format("YYYY-MM-DD HH:mm:ss");
  console.log()
  var checktripquery = "update Orders set order_delivery_day = '"+curtime+"' where orderid="+req.orderid;
  var checktrip = await query(checktripquery);
  let resobj = {
    success: true,
    status : true,
    message : "Order delivery date updated successfully."
  };
  result(null, resobj);
};

///////Order Pickup to Accept////////
Moveituser.pickup_to_accept_order =async function pickup_to_accept_order(req, result) {
  if(req.orderid){
    var checkorderquery = "select orderstatus,moveit_user_id,trip_id from Orders where orderid="+req.orderid;
    var checkorder = await query(checkorderquery);
    
    if(checkorder.length > 0 && checkorder[0].orderstatus <=6){
      var unassignarray = new Array();
      unassignarray.push({'moveit_userid':checkorder[0].moveit_user_id,'trip_id':checkorder[0].trip_id,'orderid':req.orderid,'orderstatus':checkorder[0].orderstatus,'to_orderstatus':1});
      var moveitunassignlog = MoveitUnassign.createMoveitUnassign(unassignarray);

      var updateorderquery = "update Orders set orderstatus=1,moveit_user_id=0,trip_id=0 where orderid="+req.orderid;
      var updateorder = await query(updateorderquery);      

      if(updateorder.affectedRows>0){
        if(checkorder[0].trip_id>0){
          await Moveituser.updatetripstatus(req.trip_id);

          var trip = {};
          trip.tripid=checkorder[0].trip_id;
          trip.orderid=req.orderid;
          await Notification.trip_MoveIt_PushNotification(trip,PushConstant.pageidMoveit_Order_unassign,checkorder[0].moveit_user_id);
        }        

        
        
        let resobj = {
          success: true,
          status : true,
          message : "order moved to accept"
        };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "something went wrong plz try again"
        };
        result(null, resobj);
      }      
    }else{
      let resobj = {
        success: true,
        status : false,
        message : "can't move chek order status"
      };
      result(null, resobj);
    }   
  }else{
    let resobj = {
      success: true,
      status : false,
      message : "please check your post values"
    };
    result(null, resobj);
  }    
};

Moveituser.check_latlng_boundaries = function check_latlng_boundaries(req,result) {
  var latlng=[];
  sql.query("Select * from Zone", function( err,res) {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      var isZone=false;
      var zoneName='';
      if(res.length>0){
         latlng=req.latlng;
        for(var j=0;j<latlng.length;j++){
          for(var i=0; i<res.length; i++){
            //console.log("res[i].boundaries-->",res[i].boundaries);
            var polygon=JSON.parse(res[i].boundaries);
            if(polygon&&Moveituser.pointInPolygon(polygon,{lat:latlng[j].lat,lng:latlng[j].lng})){
              latlng[j].zoneName=res[i].Zonename;
              latlng[j].isZone=true;
              break;
            }else{
              latlng[j].isZone=false;
            }
          }
        }
      }
        let resobj = {
          success: true,
          status : true,
          latlng:latlng
        };
        result(null, resobj);
    }
  });
};


Moveituser.moveit_trip_day_order_list =async function moveit_trip_day_order_list(req,result) {
  // var ordersquery = " select * from Dayorder where  trip_id= "+req.tripid+" " ;

  var tripstatuscheckquery = "select *,CASE WHEN trip_status=0 THEN 'Trip not started' WHEN trip_status=1 THEN 'trip started' WHEN trip_status=2 THEN 'trip completed' WHEN trip_status=3 THEN 'trip cancelled' END as trip_status_msg from Moveit_trip where trip_status <=1 and moveit_id="+req.moveit_userid;
  var tripstatuscheck = await query(tripstatuscheckquery);

  if (tripstatuscheck.length !=0) {
    var ordersquery = "select drs.*,us.name as cus_name,us.phoneno as cus_phoneno,us.email as cus_email,ze.Zonename,ze.phoneno as zone_phoneno,ze.address as zone_address,ze.lon as zone_lon,ze.lat as zone_lat,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus < 6 then 'SCM In-Progress' when drs.dayorderstatus  < 10 then 'Ready to Dispatch' when drs.dayorderstatus=10 then 'Delivered' when drs.dayorderstatus=11 then 'cancelled' when drs.dayorderstatus=12 then 'returned' end as dayorderstatus_msg ,mt.trip_status, CASE WHEN mt.trip_status=0 THEN 'Trip not started' WHEN mt.trip_status=1 THEN 'trip started' WHEN mt.trip_status=2 THEN 'trip completed' WHEN mt.trip_status=3 THEN 'trip canceled' END as trip_status_msg,if(drs.payment_status=1,'Paid','Not paid')  as payment_status_msg   from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid left join Moveit_trip mt on mt.tripid=drs.trip_id left join Zone ze on ze.id=drs.zoneid where drs.trip_id= "+tripstatuscheck[0].tripid+"  group by drs.id,drs.userid order by drs.id desc " ;
    var orders = await query(ordersquery);
    
  
  if(orders.length>0 ){
    for(let i=0; i<orders.length; i++){
      var moveitstatusquery ="select *,if(status=1,'order accept',if(status=2,'Warehouse reached',if(status=3,'order pickup',if(status=5,'Customer location reached',if(status=7,'Delivery Order',if(status=8,'Return Order','Returned to Hub')))))) as moveit_status_msg from Moveit_status  where doid = " +orders[i].id +" order by id desc limit 1";
      var statuslist = await query(moveitstatusquery);
      orders[i].moveit_status = 0;
      orders[i].moveit_status_msg = '';
      if (statuslist.length !==0 ) {
        orders[i].moveit_status = statuslist[0].status || 0;
        orders[i].moveit_status_msg = statuslist[0].moveit_status_msg  ;
        // console.log(orders[i].moveit_status_msg);
      }

      var itemsquery = "select * from Dayorder_products  where doid="+orders[i].id;
      var items = await query(itemsquery);
      orders[i].itemlistcount = items.length;
      orders[i].itemlist = items;

    }

    let resobj = {
      success: true,
      status : true,
      trip_id: orders[0].trip_id,
      trip_details:tripstatuscheck,
      result : orders
    };
    result(null, resobj);

  }else{
    let resobj = {
      success: true,
      status : false,
      message : "sorry no trip today"
    };
    result(null, resobj);
  }
  }else{
    let resobj = {
      success: true,
      status : false,
      message : 'Trip Not Found'
    };
    result(null, resobj);
  }

  

    // let resobj = {
    //   success: true,
    //   status : true,
    //   result : orders
    // };
    // result(null, resobj);
};


Moveituser.trip_order_details =async function trip_order_details(req,result) {
  // var ordersquery = " select * from Dayorder where  trip_id= "+req.tripid+" " ;

  // var tripstatuscheckquery = "select *,CASE WHEN trip_status=0 THEN 'Trip not started' WHEN trip_status=1 THEN 'trip started' WHEN trip_status=2 THEN 'trip completed' WHEN trip_status=3 THEN 'trip cancelled' END as trip_status_msg from Moveit_trip where trip_status <=1 and moveit_id="+req.moveit_userid;
  // var tripstatuscheck = await query(tripstatuscheckquery);

  if (req.tripid) {
    var ordersquery = "select drs.*,us.name as cus_name,us.phoneno as cus_phoneno,us.email as cus_email,ze.Zonename,ze.phoneno as zone_phoneno,ze.address as zone_address,ze.lon as zone_lon,ze.lat as zone_lat,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus < 6 then 'SCM In-Progress' when drs.dayorderstatus  < 10 then 'Ready to Dispatch' when drs.dayorderstatus=10 then 'Delivered' when drs.dayorderstatus=11 then 'cancelled' when drs.dayorderstatus=12 then 'returned' end as dayorderstatus_msg ,mt.trip_status, CASE WHEN mt.trip_status=0 THEN 'Trip not started' WHEN mt.trip_status=1 THEN 'trip started' WHEN mt.trip_status=2 THEN 'trip completed' WHEN mt.trip_status=3 THEN 'trip canceled' END as trip_status_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid left join Moveit_trip mt on mt.tripid=drs.trip_id left join Zone ze on ze.id=drs.zoneid where drs.trip_id= "+req.tripid+"  group by drs.id,drs.userid order by drs.id desc " ;
    var orders = await query(ordersquery);
    
  
  if(orders.length>0 ){
    for(let i=0; i<orders.length; i++){
      var moveitstatusquery ="select *,if(status=1,'order accept',if(status=2,'Warehouse reached',if(status=3,'order pickup',if(status=5,'Customer location reached',if(status=7,'Delivery Order',if(status=8,'Return Order','Returned to Hub')))))) as moveit_status_msg from Moveit_status  where doid = " +orders[i].id +" order by id desc limit 1";
      var statuslist = await query(moveitstatusquery);
      orders[i].moveit_status = 0;
      orders[i].moveit_status_msg = '';
      if (statuslist.length !==0 ) {
        orders[i].moveit_status = statuslist[0].status || 0;
        orders[i].moveit_status_msg = statuslist[0].moveit_status_msg  ;
        
      }

      var itemsquery = "select * from Dayorder_products  where doid="+orders[i].id;
      var items = await query(itemsquery);
      orders[i].itemlistcount = items.length;
      orders[i].itemlist = items;

    }

    let resobj = {
      success: true,
      status : true,
      trip_id: orders[0].trip_id,
      result : orders
    };
    result(null, resobj);

  }else{
    let resobj = {
      success: true,
      status : false,
      message : "sorry no trip today"
    };
    result(null, resobj);
  }
  }else{
    let resobj = {
      success: true,
      status : false,
      message : 'Trip Not Found'
    };
    result(null, resobj);
  }

  

    // let resobj = {
    //   success: true,
    //   status : true,
    //   result : orders
    // };
    // result(null, resobj);
};

Moveituser.moveit_trip_history__day_order_list =async function moveit_trip_history__day_order_list(req,result) {
  // var ordersquery = " select * from Dayorder where  trip_id= "+req.tripid+" " ;
  let total_cod_price = 0;
  var tripstatuscheckquery = "select *,CASE WHEN trip_status=0 THEN 'Trip not started' WHEN trip_status=1 THEN 'trip started' WHEN trip_status=2 THEN 'trip completed' WHEN trip_status=3 THEN 'trip cancelled' END as trip_status_msg from Moveit_trip where  moveit_id="+req.moveit_userid+" and  trip_status!=1";
  var tripstatuscheck = await query(tripstatuscheckquery);

  if (tripstatuscheck.length !=0) {


    for(let i=0; i<tripstatuscheck.length; i++){
      // var ordersquery = " select * from Dayorder where  trip_id= "+tripstatuscheck[i].tripid+" and  dayorderstatus=10  " ;
      // var orders = await query(ordersquery);


      var yesterdaycodquery = " select sum(cod_price) as total_cod_price from Dayorder where  trip_id= "+tripstatuscheck[i].tripid+" and  dayorderstatus=10  " ;
      var yesterdaycod = await query(yesterdaycodquery);

      total_cod_price = total_cod_price + yesterdaycod[0].total_cod_price;
      var ordersquery = "select drs.*,us.name as cus_name,us.phoneno as cus_phoneno,us.email as cus_email,ze.Zonename,ze.phoneno as zone_phoneno,ze.address as zone_address,ze.lon as zone_lon,ze.lat as zone_lat,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus < 6 then 'SCM In-Progress' when drs.dayorderstatus  < 10 then 'Ready to Dispatch' when drs.dayorderstatus=10 then 'Delivered' when drs.dayorderstatus=11 then 'cancelled' when drs.dayorderstatus=12 then 'returned' end as dayorderstatus_msg ,mt.trip_status, CASE WHEN mt.trip_status=0 THEN 'Trip not started' WHEN mt.trip_status=1 THEN 'trip started' WHEN mt.trip_status=2 THEN 'trip completed' WHEN mt.trip_status=3 THEN 'trip canceled' END as trip_status_msg,if(drs.payment_status=1,'Paid','Not paid')  as payment_status_msg   from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid left join Moveit_trip mt on mt.tripid=drs.trip_id left join Zone ze on ze.id=drs.zoneid where drs.trip_id= "+tripstatuscheck[i].tripid+"  group by drs.id,drs.userid order by drs.id desc " ;
      var orders = await query(ordersquery);

  
      tripstatuscheck[i].order_count = orders.length;
      tripstatuscheck[i].order_list = orders;  

      for(let j=0; j<orders.length; j++){
        
        var moveitstatusquery ="select * from Moveit_status  where doid = " +orders[j].id +" order by id desc limit 1";
        var statuslist = await query(moveitstatusquery);
        orders[j].moveit_status = 0;
        if (statuslist.length !==0 ) {
          orders[j].moveit_status = statuslist[0].status || 0;
        }
  
        var itemsquery = "select * from Dayorder_products  where doid="+orders[j].id;
        var items = await query(itemsquery);
        orders[j].itemlistcount = items.length;
        orders[j].itemlist = items;
  
      }
    }

  
    
    let resobj = {
      success: true,
      status : true,
      total_cod_price:total_cod_price,
      result : tripstatuscheck
    };
    result(null, resobj);

  }else{
    let resobj = {
      success: true,
      status : false,
      message : 'Trip Not Found'
    };
    result(null, resobj);
  }

  

    // let resobj = {
    //   success: true,
    //   status : true,
    //   result : orders
    // };
    // result(null, resobj);
};


module.exports = Moveituser;