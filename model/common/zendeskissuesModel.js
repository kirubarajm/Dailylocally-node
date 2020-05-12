"user strict";
var sql = require("../db.js");

//Task object constructor
var Zendeskissues = function(zendeskissues) {
  this.active_status = zendeskissues.active_status;
  this.issues = zendeskissues.issues;
  this.type = zendeskissues.type;
  this.department = zendeskissues.department;
  this.tid = zendeskissues.tid;
};

Zendeskissues.createZendeskissues = function createZendeskissues(req, result) {
  sql.query("INSERT INTO Zendesk_issues  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Region created successfully"
      };
      result(null, resobj);
    }
  });
};

Zendeskissues.getZendeskissuesDetails = function getZendeskissuesDetails(req,result) {
    sql.query("Select zi.id,zi.issues,zi.type,zi.department,zi.tid,zt.tag_name from Zendesk_issues zi join Zendesk_tag zt on zt.tid=zi.tid where zi.active_status=1 and zi.id='"+req.id+"'", function(err, res) {
      if (err) {
        result(err, null);
      } else {

        var note = '';
        // if (req.orderid) {
        //     note = "orderdetails :https://eatalltime.global/eatadmin/vieworder/"+req.orderid+" ,"
        // }

        // if (req.userid) {
        //   note = note +' userdetails :https://eatalltime.global/eatadmin/vieweatuser/'+req.userid
        // }

        if (req.userid) {
          note = note +' userid :'+req.userid+" ,"
          }

        if (req.orderid) {
          note = note + "orderid :"+req.orderid+" ,"
        }

       

        if (req.type==1) {
          console.log("-------------->",req.type);
          note = note +'\n'+"Current order, "+res[0].tag_name;
        }else{
          note = note +'\n'+"Old order, "+res[0].tag_name;
        }


        // if (req.userid) {
        // note = note +'\n '+res[0].tag_name
        // }

       
      
        res[0].note = note;
        res[0].department_name = "eat";

        
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    });
  };

Zendeskissues.getZendeskissues = function getZendeskissues(req,result) {
  sql.query("Select zi.id,zi.issues,zi.type,zi.department,zi.tid,zt.tag_name from Zendesk_issues zi join Zendesk_tag zt on zt.tid=zi.tid where zi.active_status=1 and zi.type='"+req.type+"'", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};



module.exports = Zendeskissues;
