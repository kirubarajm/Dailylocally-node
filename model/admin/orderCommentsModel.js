"user strict";
var sql = require("../db.js");
var emailService = require("../../model/common/emailServiceModel");
const util = require("util");
// const { query } = require("express");
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var OrderComments = function(ordercomments) {
  this.comments = ordercomments.comments;
  this.Img1 = ordercomments.Img1 || '';
  this.Img2 = ordercomments.Img2  || '';
  this.done_by = ordercomments.done_by ;
  this.type= ordercomments.type;
  this.doid = ordercomments.doid;
  this.done_type = ordercomments.done_type ;
};


OrderComments.create_OrderComments = function create_OrderComments(OrderComments,email_list, result) {
  // console.log(OrderComments);
  sql.query("INSERT INTO DayOrderComments set ?", OrderComments, function(err, res) {
    if (err) {
      console.log(err);
      result(err, null);
    } else {
      
      if (email_list&&email_list.length !=0) {
        emailService.send_commands_Mail(email_list,OrderComments);
      }

     
      let resobj = {
        success: true,
        status : true,
        message: "Day Order Comments Created successfully"
      };
      result(null, resobj);
    }
  });
};

OrderComments.create_OrderComments_crm = function create_OrderComments_crm(OrderComments, res) {
  sql.query("INSERT INTO DayOrderComments set ?", OrderComments, function(err, result) {
    if (err) {
      console.log(err);
      res(err, null);
    } else {
      
     
      // let resobj = {
      //   success: true,
      //   status : true,
      //   message: "Day Order Comments Created successfully"
      // };
      // res(null, resobj);
    }
  });
};


OrderComments.day_order_log_list = function day_order_log_list(req, result) {

  // var orderquery =  "SELECT iF(oc.type=1,'WAREHOUSE',iF(oc.type=2,'CRM ',iF(oc.type=3,'LOGISTICS','USER'))) AS Dashboard_type,JSON_ARRAYAGG(JSON_OBJECT('doid',oc.doid,'usertype',aur.usertype,'name', au.name,'comments',comments,'Img1',oc.Img1,'Img2',oc.Img2,'created_at',oc.created_at,'done_type',iF(oc.done_type=1,'Admin User','User'))) AS command_details from Dayorder as ors left join DayOrderComments oc on oc.doid=ors.id left join Admin_users au on au.admin_userid=oc.done_by left join Admin_user_roles aur on aur.userroleid=au.user_roleid where ors.id='"+req.doid+"' group by oc.type";

  var orderquery =  "SELECT iF(oc.type=1,'WAREHOUSE',iF(oc.type=2,'CRM ',iF(oc.type=3,'LOGISTICS',''))) AS Dashboard_type,oc.doid,aur.usertype, au.name,comments,oc.Img1,oc.Img2,oc.created_at,iF(oc.done_type=1,'Admin User',iF(oc.done_type=2,'Moveit','User'))as done_type,oc.done_type,oc.done_by from DayOrderComments oc  left join Dayorder as ors on oc.doid=ors.id left join Admin_users au on au.admin_userid=oc.done_by left join Admin_user_roles aur on aur.userroleid=au.user_roleid where ors.id='"+req.doid+"' order by oc.ocid  desc";

  sql.query(orderquery,async function(err, res1) {
      if (err) {
        result(err, null);
      } else {


        for (let i = 0; i < res1.length; i++) {
         
          console.log(res1[i].done_type);
          console.log(res1[i].done_by);
          if (res1[i].done_type==0) {

            let get_details = await query("select * from User where userid= '"+res1[i].done_by+"'");
             
            res1[i].usertype =  "User";
            if (get_details.length !=0) {
            
              res1[i].name= get_details[0].name || '';
            }
        

          } else  if (res1[i].done_type==1) {

            let get_details = await query(" select au.name,aur.usertype from Admin_users au left join Admin_user_roles aur on aur.userroleid=au.user_roleid where au.admin_userid='"+res1[i].done_by+"' ");

            
            if (get_details.length !=0) {
              res1[i].usertype =  get_details[0].usertype;
            res1[i].name= get_details[0].name;
            }
          }else{

            let get_details = await query("select * from MoveitUser where userid= '"+res1[i].done_by+"'");

            res1[i].usertype =  "Moveit"
            if (get_details.length !=0) {
            res1[i].name= get_details[0].name || '';
            }
          }
          
        }

        let resobj = {
          success: true,
          status: true,
          result: res1
        };

        result(null, resobj);  

      }
    }
  );
};
module.exports = OrderComments;
