"user strict";
var sql = require("../db.js");
var request = require("request");
let jwt = require("jsonwebtoken");
let config = require("../config.js");
var constant = require("../constant.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var AdminUser = function(adminuser) {
  this.name = adminuser.name;
  this.email = adminuser.email;
  this.password = adminuser.password;
  this.user_roleid = adminuser.user_roleid;
  this.push_token = adminuser.push_token;
};

AdminUser.createUser = function createUser(newUser, result) {
  sql.query(
    "Select * from Admin_users where email = '" + newUser.email + "'",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        if (res.length == 0) {
          sql.query("INSERT INTO Admin_users set ?", newUser, function(
            err,
            res1
          ) {
            if (err) {
              result(err, null);
            } else {
              let resobj = {
                success: true,
                status: true,
                message: "Registration Successfully"
              };
              result(null, resobj);
            }
          });
        } else {
          let resobj = {
            success: true,
            status: false,
            message:
              "Following user already Exist! Please check it mobile number / email"
          };
          result(null, resobj);
        }
      }
    }
  );
};

AdminUser.getUserById = function getUserById(userId, result) {
  sql.query(
    "Select * from Admin_users where admin_userid = ? ",
    userId,
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status: true,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

AdminUser.getAllUser = function getAllUser(result) {
  sql.query("Select * from Admin_users", function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };
      result(null, resobj);
    }
  });
};

AdminUser.updatePushidByToken = function(req, result) {
  //console.log("req_push--->"+req.push_token);
  sql.query(
    "UPDATE Admin_users SET push_token = ? WHERE admin_userid = ?",
    [req.push_token, req.admin_userid],
    function(err, res) {
      if (err) {
        let resobj = {
          success: true,
          status: true,
          error:err
        };
        result(resobj,null);
      } else {
        let resobj = {
          success: true,
          status: true,
        };
        result(null, resobj);
      }
    }
  );
};

AdminUser.remove = function(id, result) {
  sql.query("DELETE FROM Admin_users WHERE admin_userid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

AdminUser.login = function login(req, result) {
  var reqs = [req.email, req.password];
  sql.query("Select * from Admin_users where email = ? and password = ?", reqs,
    function(err, res) {
      if (err) {
        let resobj = {
          success: true,
          status: false,
          message: "Sorry! please enter correct login detail",
          result: err
        };
        result(resobj, null);
      } else {
        if (res.length !== 0) {
          var req_push={admin_userid:res[0].admin_userid,push_token:req.push_token}
          if(req.push_token){
          AdminUser.updatePushidByToken(req_push, function(err, res2) {
            if (err) {
              let resobj = {
                success: true,
                status: false,
                message: "Sorry! please enter correct login detail",
                result: err
              };
              result(resobj, null);
            }else{
              res[0].push_token=req_push.push_token
              let resobj = {
                success: true,
                status: true,
                message: res[0].name+" Login Successfully",
                result: res
              };
              result(null, resobj);
            }
          })
         }else{
          let resobj = {
            success: true,
            status: true,
            message: res[0].name+" Login Successfully",
            result: res
          };
          result(null, resobj);
         }
        } else {
          let resobj = {
            success: true,
            status: false,
            message: "Please check your email and password",
            result: res
          };
          result(null, resobj);
        }
      }
    }
  );
};

AdminUser.logout = function logout(req, result) {
  sql.query(
    "UPDATE Admin_users SET push_token = ? WHERE admin_userid = ?",
    ['', req.admin_userid],
    function(err, res) {
      if (err) {
        let resobj = {
          success: true,
          status: true,
          error:err
        };
        result(resobj,null);
      } else {
        let resobj = {
          success: true,
          status: true,
          message:"Logout Successfully"
        };
        result(null, resobj);
      }
    }
  );
};

module.exports = AdminUser;
