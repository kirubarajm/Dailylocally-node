"user strict";
var sql = require("../db.js");
var Notification = require("../../model/common/notificationModel.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Allocation = function(allocation) {
  this.makeit_userid = allocation.makeit_userid;
  this.sales_emp_id = allocation.sales_emp_id;
  this.assign_date = allocation.assign_date;
  this.assignedby = allocation.assignedby;
  this.status = allocation.status ||0;
  // this.created_at = new Date();
  this.booking_date_time = allocation.booking_date_time;
};

Allocation.createAllocation =async function createAllocation(req, result) {

  var getlist = await query("select * from Allocation where makeit_userid='"+req.makeit_userid+"'");
  if (getlist.length==0) {
    sql.query("INSERT INTO Allocation set ?", req, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res.insertId);
  
        sql.query(
          "UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?",
          req.makeit_userid,
          function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            }
          }
        );
  
        // let sucobj = true;
        // let message = "Booking time updated successfully";
        let resobj = {
          success: true,
          status:true,
          message: "Booking time updated successfully",
          result: res.insertId
        };
        result(null, resobj);
      }
    });
  }else{
    let resobj = {
      success: true,
      status:false,
      message: "Sorry appointment already exist! "
     
    };
    result(null, resobj);
  }
 
};

Allocation.updateAllocation = async function updateAllocation(req, result) {
  var allocation_data=await Allocation.getAllocationDataByMakeit(req.makeit_userid,req.aid);
  sql.query(
    "update Allocation set sales_emp_id = ?, assignedby = ?, assign_date = ?, status = ? where makeit_userid = ? and aid = ? ",
    [
      req.sales_emp_id,
      req.assignedby,
      new Date(),
      req.status,
      req.makeit_userid,
      req.aid
    ],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        sql.query(
          "UPDATE MakeitUser SET appointment_status = 2 WHERE userid = ?",
          req.makeit_userid,
          function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              Notification.sales_PushNotification(req.sales_emp_id,req.makeit_userid,allocation_data.booking_date_time,req.status);
              let sucobj = true;
              let message = "Appointment assign successfully";
              let resobj = {
                success: sucobj,
                status: true,
                message: message
              };
              result(null, resobj);
            }
          }
        );
      }
    }
  );
};

Allocation.getAllocationDataByMakeit = async function getAllocationDataByMakeit(mk_userId,aid) {
  var res=await query("Select * from Allocation where makeit_userid="+mk_userId+" and aid ="+aid);
  return res[0];
}

Allocation.getAllocationById = function getAllocationById(userId, result) {
  sql.query("Select * from Allocation where aid = ? ", userId, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Allocation.getAllocationBySalesEmpId = function getAllocationBySalesEmpId( userid,result) {
  //  sql.query("Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = ? ", userId, function (err, res) {
  //Select alc.aid,alc.sales_emp_id,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = '" + userid +"' and DATE(alc.booking_date_time) = CURDATE() and alc.status !=1 
  sql.query(" Select alc.aid,alc.sales_emp_id,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = "+userid+"  and alc.status !=1 and alc.status !=6 and date(alc.booking_date_time) > CURDATE() order by alc.booking_date_time ASC",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let status = res.length===0?false:true;
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

Allocation.tasklistSalesId = function tasklistSalesId( userid,result) {
  //  sql.query("Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = ? ", userId, function (err, res) {
  //Select alc.aid,alc.sales_emp_id,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = '" + userid +"' and DATE(alc.booking_date_time) = CURDATE() and alc.status !=1 
  sql.query("Select alc.aid,alc.sales_emp_id,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = " + userid +" and DATE(alc.booking_date_time) = CURDATE() and alc.status !=1 and alc.status !=6",function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let status = res.length===0?false:true;
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


Allocation.getAllAllocation = function getAllAllocation(result) {
  sql.query("Select * from Allocation", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Allocation : ", res);

      result(null, res);
    }
  });
};

Allocation.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Allocation SET task = ? WHERE aid = ?",
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

Allocation.remove = function(id, result) {
  sql.query("DELETE FROM Allocation WHERE aid = ?", [id], function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

Allocation.update_a_followupstatus = function(req, result) {
  var status = parseInt(req.status)
  var statusquery =
    "UPDATE Allocation SET status = " +
    status +
    " WHERE aid ='" +
    req.aid +
    "'";

  

  if (req.scheduledate && (status === 2 || status === 4)) {
    statusquery =
      "UPDATE Allocation SET status = '" +
      status +
      "',booking_date_time = '" +
      req.scheduledate +
      "' WHERE aid  = '" +
      req.aid +
      "' ";
  }



  sql.query(statusquery, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = true;
      let mesobj = "Follow up status updated successfully";
      let resobj = {
        success: sucobj,
        message: mesobj
      };
      Notification.appointment_makeit_PushNotification(req.makeit_userid,req.status,req.sales_emp_id,req.scheduledate);
      result(null, resobj);
    }
  });
};



Allocation.getHistoryBySalesEmpId = function getHistoryBySalesEmpId( userid,result) {
  //  sql.query("Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = ? ", userId, function (err, res) {

 var  historyquery = "Select alc.aid,alc.sales_emp_id,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.branch_name,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid where  alc.sales_emp_id = "+userid+" and (alc.status =1 or alc.status =6)  order by alc.info_completed_ts";
  sql.query(historyquery,function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        let status = res.length===0?false:true;
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



Allocation.list_all_allocation_by_admin = function list_all_allocation_by_admin( req,result) {
  //  sql.query("Select * from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid  where  sales_emp_id = ? ", userId, function (err, res) {
    var allocationlimit = 20;
    var page = req.page || 1;
    var startlimit = (page - 1) * allocationlimit;
    var  allocationquery = "Select alc.aid,alc.sales_emp_id,sa.name as salesname,alc.makeit_userid,alc.status,alc.booking_date_time,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.lat,mu.lon,mu.appointment_status,mu.locality,mu.phoneno,mu.address,mu.verified_status from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid left join Sales_QA_employees sa on alc.sales_emp_id=sa.id";
    if (req.appointmentstatus) {
      allocationquery = allocationquery +" where alc.status ="+req.appointmentstatus+""
    }
    console.log(req.date);
    if(req.date){
      var qu=req.appointmentstatus?" and Date(alc.booking_date_time) ='"+req.date+"'":" where Date(alc.booking_date_time) ='"+req.date+"'";
      allocationquery = allocationquery+qu;
    }

    if (req.search) {
      var squery=" (mu.phoneno LIKE  '%" + req.search + "%' or mu.email LIKE  '%" +req.search +"%' or mu.name LIKE  '%" +req.search+ "%'  or mu.userid LIKE  '%" + req.search +"%')";
      if(allocationquery.toLowerCase().includes('where'))  allocationquery = allocationquery + " and "+squery;
      else allocationquery = allocationquery + " where "+squery;
    }
    var limtquery = allocationquery +" order by alc.aid desc limit "+startlimit+"," +allocationlimit +" ";
    console.log(allocationquery);
    
    sql.query(limtquery,async function(err, res) {
      if (err) {
        result(err, null);
      } else {
        var orderdetails = await query(allocationquery);
        let status = res.length===0?false:true;
        let appointmentcount= orderdetails.length;
        let resobj = {
          success: true,
          status:status,
          appointmentcount:appointmentcount||0,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

module.exports = Allocation;
