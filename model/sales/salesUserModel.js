"user strict";
var sql = require("../db.js");
var request = require("request");
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var constant = require("../constant.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var Salesuser = function(salesuser) {
  this.name = salesuser.name;
  this.email = salesuser.email;
  this.phoneno = salesuser.phoneno;
  this.address = salesuser.address;
  this.job_type = salesuser.job_type;
  this.referalcode = salesuser.referalcode;
  this.localityid = salesuser.localityid;
  this.password = salesuser.password;
  //  this.created_at = new Date();
  this.id_proof = salesuser.id_proof;
  this.add_proof = salesuser.add_proof;
  this.birth_cer = salesuser.birth_cer;
};

Salesuser.createUser = function createUser(newUser, result) {
  sql.query(
    "Select * from Sales_QA_employees where phoneno = '" +
      newUser.phoneno +
      "' OR email= '" +
      newUser.email +
      "' ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        if (res.length == 0) {
          sql.query("INSERT INTO Sales_QA_employees set ?", newUser, function(
            err,
            res1
          ) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              console.log(res.insertId);
              let sucobj = true;
              let message = "Registration Successfully";
              let resobj = {
                success: sucobj,
                message: message
              };

              result(null, resobj);
            }
          });
        } else {
          let sucobj = true;
          let message =
            "Following user already Exist! Please check it mobile number / email";
          let resobj = {
            success: sucobj,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Salesuser.getUserById = function getUserById(userId, result) {
  sql.query("Select id,name,address,phoneno,job_type,email,referalcode,localityid,id_proof,add_proof,birth_cer,pushid_android from Sales_QA_employees where id = ? ", userId, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Salesuser.getMakeitkitchenInfo = function getMakeitkitchenInfo(userId, result) {
  sql.query(
    "Select brandname,hometownid,gender,food_type,bank_account_no,bank_holder_name,bank_name,branch_name,ifsc from MakeitUser where userid = ? ",
    userId,
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

Salesuser.getMakeitUserDocument = function getMakeitUserDocument(
  userId,
  result
) {
  sql.query(
    "Select doc.url,doc.did,doc.type,doc.image_type from Documents_Sales as docs left join Documents as doc on doc.docid=docs.docid where docs.makeit_userid = '" +
      userId +
      "' and type NOT IN (1,2)",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let resobj = {
          success: sucobj,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};
Salesuser.getMakeitPackingDetails = function getMakeitPackingDetails(
  userId,
  result
) {
  sql.query(
    "Select boxtype,count from Packaging_Boxs where makeit_userid = '" +
      userId +
      "'",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let status = res.length!==0 ? true : false;
        let resobj = {
          success: true,
          status:status,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};




Salesuser.getMakeitKitchenDocument = function getMakeitKitchenDocument(
  userId,
  result
) {
  sql.query(
    "Select doc.url,doc.did,doc.type,doc.image_type from Documents_Sales as docs left join Documents as doc on doc.docid=docs.docid where docs.makeit_userid = '" +
      userId +
      "' and type IN (1,2)",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        var newResult = null;
        var kitchanimage = [];
        var kitchan_application_image = [];
        if (res.length !== 0) {
          newResult = {};
          for (var i = 0; i < res.length; i++) {
            if (res[i].type === 1) kitchanimage.push(res[i]);
            if (res[i].type === 2) kitchan_application_image.push(res[i]);
          }
          newResult.kitchanimage = kitchanimage;
          newResult.kitchan_application_image = kitchan_application_image;
        }

        Salesuser.getMakeitPackingDetails(userId, function(err, packingdetail) {
          if (err) {
            console.log("error: ", err);
            result(err, null);
          } else {
           
            if(packingdetail.status){
                if (!newResult) newResult = {};
                newResult.packagingdetails = packingdetail.result;
            }
            let status = newResult ? true : false;
            let resobj = {
              success: true,
              status: status,
              result: newResult
            };
            result(null, resobj);
          }
        });
      }
    }
  );
};

Salesuser.getAllUser = function getAllUser(result) {
  sql.query("Select * from Sales_QA_employees", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("User : ", res);

      result(null, res);
    }
  });
};

Salesuser.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Sales_QA_employees SET task = ? WHERE userid = ?",
    [task.task, id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

Salesuser.remove = function(id, result) {
  sql.query("DELETE FROM Sales_QA_employees WHERE userid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Salesuser.checkLogin = function checkLogin(req, result) {
  var reqs = [req.phoneno, req.password];
  sql.query(
    "Select * from Sales_QA_employees where phoneno = ? and password = ?",
    reqs,
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        let resobj = {
          success: true,
          status: false,
          message: "Sorry! unfortunately stopped.",
          result: err
        };
        result(resobj, null);
      } else {
        if (res.length !== 0) {
              
          let token = jwt.sign({username: req.phoneno},
            config.secret
            // ,
            // { //expiresIn: '24h' // expires in 24 hours
            // }
           );

           let resobj = {
            success: true,
            status : true,
            token :token,
            result: res
           };
        result(null, resobj);
      }else{
        let resobj = {
          success: true,
          status : false,
          message : "Please check your username and password",
          
         };
      result(null, resobj);
        }
      }
    }
  );
};

Salesuser.getAllsalesSearch = function getAllsalesSearch(req, result) {
  var today = new Date();
  var listlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * listlimit;

  //  var query = "Select * from Sales_QA_employees ";

  // var query = "Select se.id,se.name,se.address,se.phoneno,COUNT(al.sales_emp_id) totalassigned from Sales_QA_employees se left join Allocation al on se.id = al.sales_emp_id ";
  var query =
    "Select se.id,se.name,se.address,se.email,se.password,se.phoneno,COUNT(al.sales_emp_id) totalassigned from Sales_QA_employees se left join Allocation al on se.id = al.sales_emp_id and DATE(al.assign_date) = CURDATE()";
  if (req.search && req.search !== "") {
    query = query + "where se.phoneno LIKE  '%" + req.search + "%' or se.email LIKE  '%" +req.search +"%' or se.name LIKE  '%" +req.search+ "%'  or se.id LIKE  '%" + req.search +"%'";
  }
  
//   var searchquery =
//     "us.phoneno LIKE  '%" +
//     req.search +
//     "%' OR us.email LIKE  '%" +
//     req.search +
//     "%' or us.name LIKE  '%" +
//     req.search +
//     "%'  or od.orderid LIKE  '%" +
//     req.search +
//     "%'";

  query = query + " group by se.id";
  //DATE(al.assign_date) = CURDATE()
  var limitquery = query +" limit " +startlimit +"," +listlimit;

  sql.query(query+";"+limitquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = true;
      let resobj = {
        success: sucobj,
        pageLimt:listlimit,
        total_list_count:res[0].length,
        result: res[1]
      };

      result(null, resobj);
    }
  });
};

Salesuser.edit_sales_users = function(req, result) {
  if (req.email || req.password || req.phoneno) {
    let sucobj = true;
    let message = "You can't to be Edit email / password/ phoneno";
    let resobj = {
      success: sucobj,
      message: message
    };

    result(null, resobj);
  } else {
    var staticquery = "UPDATE Sales_QA_employees SET  ";
    var column = "";
    for (const [key, value] of Object.entries(req)) {
      console.log(`${key} ${value}`);

      if (key !== "userid") {
        // var value = `=${value}`;
        column = column + key + "='" + value + "',";
      }
    }

    var query = staticquery + column.slice(0, -1) + " where id = " + req.id;

    sql.query(query, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let sucobj = true;
        let message = "Updated successfully";
        let resobj = {
          success: sucobj,
          message: message
        };

        result(null, resobj);
      }
    });
  }
};

Salesuser.update_pushid = function(req, result) {
  var staticquery = "";
  if (req.pushid_android && req.userid) {
    staticquery =
      "UPDATE Sales_QA_employees SET pushid_android ='" +
      req.pushid_android +
      "'   where id = " +
      req.userid +
      " ";
  } else if (req.pushid_ios && req.userid) {
    staticquery =
      "UPDATE Sales_QA_employees SET pushid_ios ='" +
      req.pushid_ios +
      "'  where id = " +
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
    console.log("staticquery: ", staticquery);
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



Salesuser.Salesuser_send_otp_byphone = function Salesuser_send_otp_byphone(newUser,result) {
  sql.query(
    "Select * from Sales_QA_employees where phoneno = '" + newUser.phoneno + "'",
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



Salesuser.sales_user_otpverification = function sales_user_otpverification( req,result) {

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
        console.log(res[0]);
        console.log("OTP FAILED");
        let message = "OTP is not valid!, Try once again";
        let sucobj = true;

        let resobj = {
          success: sucobj,
          status: false,
          message: message
        };

        result(null, resobj);
      }
    }
  });
};


Salesuser.sales_app_version_check_vid= async function sales_app_version_check_vid(req,result) { 
 
  var updatestatus = {};
  var versionstatus = false;
  var salesforceupdatestatus =false;

  if (req.salesversioncode < constant.salesversionforceupdate) {
      
      versionstatus = true;
      salesforceupdatestatus = true;

  }else if(req.salesversioncode < constant.salesversioncodenew){

    versionstatus = true;
    salesforceupdatestatus = false;
    
  }else{
    versionstatus = false;
    salesforceupdatestatus = false;
  }


  updatestatus.versionstatus = versionstatus;
  updatestatus.salesforceupdatestatus = salesforceupdatestatus;

      let resobj = {
          success: true,
          status:true,
          result:updatestatus
      };

      result(null, resobj);


};


Salesuser.Salesuser_logout = async function Salesuser_logout(req, result) { 
  sql.query("select * from Sales_QA_employees where id = "+req.userid+" ",async function(err,userdetails) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {

      if (userdetails.length !==0) {
        
        updatequery = await query("Update Sales_QA_employees set pushid_android = 'null' where id = '"+req.userid+"'");


        let resobj = {
          success: true,
           status: true,
          // message:mesobj,
          message: 'Logout Successfully!'  
        };
  
        result(null, resobj);
      }else{

        let resobj = {
          success: true,
           status: false,
          // message:mesobj,
          message: 'Please check userid'  
        };
  
        result(null, resobj);
      }     
    }
  });   
 
};

//Sales Customer Support
Salesuser.sales_app_customer_support= async function sales_app_customer_support(req,result) { 
  let resobj = {
      success: true,
      status:true,
      customer_support : constant.sales_customer_support
  };
  result(null, resobj);
};

module.exports = Salesuser;