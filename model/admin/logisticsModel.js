"user strict";
var sql     = require('../db.js');
const util  = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant= require('../constant.js');
var request = require('request');
let jwt     = require('jsonwebtoken');
let config  = require('../config.js');
var moment  = require('moment');
var QACheckList = require('../tableModels/qachecklistTableModel.js');
var ProductLive = require('../tableModels/productliveTableModel.js');
var MoveitUser = require('../tableModels/moveituserTableModel.js');
var MoveitTrip = require('../tableModels/moveittripTableModel.js');
var MoveitTripHistory = require('../tableModels/moveitriphistoryTableModel.js');
var DunzoTrip = require('../tableModels/dunzotripTableModel.js');
var DunzoTripHistory = require('../tableModels/dunzotriphistoryTableModel.js');
var Notification = require('../common/notificationModel.js');
var DayOrderComment = require('../admin/orderCommentsModel.js');
var PushConstant = require('../../push/PushConstant.js');
var ClusterCategoryMapping = require("../tableModels/clustercategorymappingTableModel.js");
var MoveitUserModel = require("../moveit/moveitUserModel.js");

var Logistics = function(stockkeeping) {};

//////////show Stockkeeping Open List///////////
Logistics.ready_to_dispatch_list =async function ready_to_dispatch_list(req,result) {
    if(req.zoneid){        
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;
        
        var wherecon = "";
        if(req.from_date && req.to_date){
            wherecon = wherecon+" and (date(dayo.date) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.doid){
            wherecon = wherecon+" and dayo.id='"+req.doid+"' ";
        }
        if(req.order_status){
            wherecon = wherecon+" and dayo.dayorderstatus="+req.order_status+" ";
        }
        if(req.user_search){
            wherecon = wherecon+" and (us.name like '%"+req.user_search+"%' or us.phoneno like '%"+req.user_search+"%') ";
        }
        if(req.moveit_search){
            wherecon = wherecon+" and (mu.name like '%"+req.moveit_search+"%' or mu.phoneno like '%"+req.moveit_search+"%') ";
        }
        if(req.slot){
            if(req.slot==1){
                wherecon = wherecon+" and HOUR(time(dayo.order_place_time))<=19 ";
            }else if(req.slot==2){
                wherecon = wherecon+" and HOUR(time(dayo.order_place_time))>=19 ";
            }            
        }
        if(req.trip_search){
            if(req.trip_search=="dunzo"){
                wherecon = wherecon+" and dayo.moveit_type=2 ";
            }else{
                wherecon = wherecon+" and mt.tripid='"+req.trip_search+"' ";
            }            
        }  

        var readytodispatchlistquery = "select dayo.id,dayo.userid,us.name,us.phoneno,dayo.date,dayo.created_at,dayo.city as area,dayo.cus_pincode,sum(dop.received_quantity) as total_quantity,CONCAT(if(HOUR(time(dayo.created_at))>=19,'10 AM','07 AM'),' ',DAY(dayo.date),' ',MONTHNAME(dayo.date)) as eta,dayo.order_place_time,if(HOUR(time(dayo.order_place_time))>=19,'slot 2','slot 1') as slot,dayo.moveit_type,dayo.trip_id,dayo.dayorderstatus, case when dayo.dayorderstatus=5 then 'QC' when dayo.dayorderstatus=6 then 'QA' when dayo.dayorderstatus=7 then 'Moveit Assigned' when dayo.dayorderstatus=8 then 'Moveit Pickup' when dayo.dayorderstatus=9 then 'Moveit Delivered' when dayo.dayorderstatus=10 then 'Completed' when dayo.dayorderstatus=11 then 'Cancel' when dayo.dayorderstatus=12 then 'return' end as dayorderstatus_msg,'0' as trip_status,'0' as qachecklist, JSON_ARRAYAGG(JSON_OBJECT('dopid',dop.id,'vpid',dop.vpid,'productname',dop.productname,'quantity',dop.quantity,'received_quantity',dop.received_quantity,'actival_weight',(dop.quantity*dop.product_weight),'received_weight',(dop.received_quantity*dop.product_weight))) AS products,'0' as actival_weight,'0' as received_weight from Dayorder as dayo left join User as us on us.userid=dayo.userid left join Dayorder_products as dop on dop.doid=dayo.id left join Moveit_trip as mt on mt.tripid=dayo.trip_id left join MoveitUser as mu on mu.userid=mt.moveit_id where dayo.dayorderstatus IN(5,6,7,8,9) "+wherecon+" and dayo.zoneid="+req.zoneid+" group by dayo.id order by dayo.id desc limit " +startlimit +"," +pagelimit +" ";
        var readytodispatchlist = await query(readytodispatchlistquery);

        var getcountquery = "select dayo.id as totalcount from Dayorder as dayo left join User as us on us.userid=dayo.userid left join Dayorder_products as dop on dop.doid=dayo.id left join Moveit_trip as mt on mt.tripid=dayo.trip_id left join MoveitUser as mu on mu.userid=mt.moveit_id where dayo.dayorderstatus IN(5,6,7,8,9) "+wherecon+" and dayo.zoneid="+req.zoneid+" group by dayo.id order by dayo.id desc";
        var getcount = await query(getcountquery);
        if(readytodispatchlist.length > 0){
            for (let i = 0; i < readytodispatchlist.length; i++) {
                if(readytodispatchlist[i].dayorderstatus>6 && readytodispatchlist[i].moveit_type==1){
                    readytodispatchlist[i].trip_status = readytodispatchlist[i].trip_id;
                }else if(readytodispatchlist[i].dayorderstatus>6 && readytodispatchlist[i].moveit_type==1){
                    readytodispatchlist[i].trip_status = 'Donzo';
                }

                readytodispatchlist[i].products = JSON.parse(readytodispatchlist[i].products); 
                var qachecklistquery = "select qac.*,qat.name from QA_check_list as qac left join QA_types as qat on qat.qaid=qac.qaid where qac.doid="+readytodispatchlist[i].id;
                var qachecklist = await query(qachecklistquery);
                if(qachecklist.length>0){
                    readytodispatchlist[i].qachecklist = qachecklist;
                }

                var productlist = readytodispatchlist[i].products;
                for (let j = 0; j < productlist.length; j++) {
                    readytodispatchlist[i].actival_weight = parseInt(readytodispatchlist[i].actival_weight)+parseInt(productlist[j].actival_weight);
                    readytodispatchlist[i].received_weight =parseInt(readytodispatchlist[i].received_weight)+parseInt(productlist[j].received_weight);
                }             
            }
            var totalcount = getcount.length;
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: readytodispatchlist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount:0,
                message: "no data found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount:0,
            message: "check your post values"
        };
        result(null, resobj);
    }  
};

/////////Get QC Type List///////////
Logistics.qa_type_list =async function qa_type_list(req,result) {
    var qachecklistquery = "select * from QA_types";
    var qachecklist = await query(qachecklistquery);
    if(qachecklist.length > 0){            
        let resobj = {
            success: true,
            status: true,
            result: qachecklist
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "no data found"
        };
        result(null, resobj);
    }
};

/////////Save QA Check List Not Used ///////////
Logistics.save_qa_checklist =async function save_qa_checklist(req,result) {
    if(req.zoneid && req.doid && req.qa_checklist.length>0){
        for (let i = 0; i < req.qa_checklist.length; i++) {
            var insert_data = [];
            insert_data.push({"doid":req.doid,"qaid":req.qa_checklist[i]});
            var checkqachecklistquery = "select * from QA_check_list where doid="+req.doid+" and qaid="+req.qa_checklist[i]+" and delete_status=0";
            var checkqachecklist = await query(checkqachecklistquery);
            if(checkqachecklist.length>0){
                var deleteqachecklistquery = "update QA_check_list set delete_status=1 where qacid="+checkqachecklist[0].qacid;
                var deleteqachecklist = await query(deleteqachecklistquery);
                QACheckList.createQACheckList(insert_data, function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                            result(err, null);
                        });
                    }
                });
            }else{
                QACheckList.createQACheckList(insert_data, function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                            result(err, null);
                        });
                    }
                });  
            }
        }
        var update_dayorderquery = "update Dayorder set qa_check_status=1 where id="+req.doid;
        var update_dayorder = await query(update_dayorderquery);
        if(update_dayorder.affectedRow>0){
            let resobj = {
                success: true,
                status: true,
                message: "QA Checklist Submitted Successfully"
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "something went wrong plz try again"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "please check post values"
        };
        result(null, resobj);
    } 
};

/////////Submit QA Check List///////////
Logistics.submit_qa_checklist =async function submit_qa_checklist(req,result) {
    if(req.zoneid && req.doid && req.qa_checklist.length>0){
        var checkqachecklistquery = "select * from QA_check_list where doid="+req.doid;
        var checkqachecklist = await query(checkqachecklistquery);
        if(checkqachecklist.length==0){
            for (let i = 0; i < req.qa_checklist.length; i++) {
                var insert_data = [];
                insert_data.push({"doid":req.doid,"qaid":req.qa_checklist[i].qaid,"qavalue":req.qa_checklist[i].qavalue});
                QACheckList.createQACheckList(insert_data[0], function(err, res2) {
                    if (err) { 
                        sql.rollback(function() {                     
                            result(err, null);
                        });
                    }
                });
            }

            var updatedayorderquery = "update Dayorder set dayorderstatus=6 where id="+req.doid;
            var updatedayorder = await query(updatedayorderquery);
            if(updatedayorder.affectedRows>0){
                ////////Create Day order Log ////////////
                var insertlogdata = [];
                insertlogdata.push({"comments":"QC Completed","done_by":req.done_by,"doid":req.doid,"type":1,"done_type":1});
                DayOrderComment.create_OrderComments_crm(insertlogdata);  
                let resobj = {
                    success: true,
                    status: true,
                    message: "QA Checklist Submitted Successfully"
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went wrong plz try again"
                };
                result(null, resobj);
            }            
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "already exist"
            };
            result(null, resobj);
        }        
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "please check post values"
        };
        result(null, resobj);
    }
};

/////////Add Moveit//////////
Logistics.moveit_add =async function moveit_add(req,result) {
    if(req){
        req.email="";
            var checkmobilequery = "select * from MoveitUser where phoneno='"+req.phoneno+"'";
            var checkmobile = await query(checkmobilequery);
            if(checkmobile.length==0){
                await MoveitUser.createMoveitUser(req,async function(err,moveituserres){
                    if(moveituserres.status==true){
                        let resobj = {
                            success: true,
                            status: true,
                            message: "moveit user added successfully"
                        };
                        result(null, resobj);
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "something went wrong plz try again"
                        };
                        result(null, resobj);
                    }
                });
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "mobile number exist"
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

/////////View Moveit//////////
Logistics.moveit_view =async function moveit_view(req,result) {
    if(req.userid){
        var moveituserquery = "select mu.*,zo.Zonename from MoveitUser as mu left join Zone as zo on zo.id=mu.zone where userid="+req.userid;
        var moveituser = await query(moveituserquery);
        if(moveituser.length > 0){
            let resobj = {
                success: true,
                status: true,
                result: moveituser
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no data found"
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

/////////Edit Moveit//////////
Logistics.moveit_edit =async function moveit_edit(req,result) {
    if(req.userid){
        var checkemailquery = "select * from MoveitUser where email='"+req.email+"' and userid NOT IN("+req.userid+")";
        var checkemail = await query(checkemailquery);
        if(checkemail.length==0){
            var checkmobilequery = "select * from MoveitUser where phoneno='"+req.phoneno+"' and userid NOT IN("+req.userid+")";
            var checkmobile = await query(checkmobilequery);
            if(checkmobile.length==0){
                await MoveitUser.updateMoveitUser(req,async function(err,moveituserres){
                    if(moveituserres.status==true){
                        let resobj = {
                            success: true,
                            status: true,
                            message: "moveit user updated successfully"
                        };
                        result(null, resobj);
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "something went wrong plz try again"
                        };
                        result(null, resobj);
                    }
                });
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "mobile number exist"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "emailid already exist"
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

/////////Moveit List//////////
Logistics.moveit_list =async function moveit_list(req,result) {
    if(req){
        var wherecon = "";
        if(req.zoneid && req.zoneid!=''){
            wherecon = wherecon+" and mu.zone='"+req.zoneid+"' ";
        }
        if(req.livestatus && req.livestatus!=''){
            wherecon = wherecon+" and mu.online_status='"+req.livestatus+"' ";
        }        
        if(req.moveit_search){
            wherecon = wherecon+" and (mu.userid like '%"+req.userid+"%' or mu.name like '%"+req.moveit_search+"%' or mu.phoneno like '%"+req.moveit_search+"%') ";
        }
        var moveitlistquery = "select *,mu.phoneno as phoneno from MoveitUser as mu left join Zone as zo on zo.id=mu.zone where mu.userid!='' "+wherecon+" ";
        var moveitlist = await query(moveitlistquery);
        if(moveitlist.length>0){
            let resobj = {
                success: true,
                status: true,
                result: moveitlist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no data found"
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

/////////Trip Temp List//////////
Logistics.trip_temp_list =async function trip_temp_list(req,result) {
    if(req.zoneid && req.doid.length>0){
        var dayorders = req.doid;
        var resultdata = [];
        var getdayorderlistquery = "select * from Dayorder where id IN("+dayorders+") and dayorderstatus IN(5,6,7,8) and zoneid="+req.zoneid;
        var getdayorderlist = await query(getdayorderlistquery);
        if(getdayorderlist.length>0){
            for (let i = 0; i < getdayorderlist.length; i++) {
                resultdata.push({"doid":getdayorderlist[i].id,"doid_name":"orderid "+getdayorderlist[i].id,"Locality":getdayorderlist[i].city,"pincode":getdayorderlist[i].cus_pincode,"order_status":"(selected order)","tripid":""});
            }
        }

        if(req.moveit_id){
            var getmoveitordersquery ="select * from Dayorder where dayorderstatus IN(5,6,7,8) and trip_id IN((select tripid from Moveit_trip where trip_status=0 and moveit_id="+req.moveit_id+")) and zoneid="+req.zoneid;
            var getmoveitorders = await query(getmoveitordersquery);
            if(getmoveitorders.length>0){
                for (let j = 0; j < getmoveitorders.length; j++) {
                    resultdata.push({"doid":getmoveitorders[j].id,"doid_name":"orderid "+getmoveitorders[j].id,"Locality":getmoveitorders[j].city,"pincode":getmoveitorders[j].cus_pincode,"order_status":"(live trip "+getmoveitorders[j].trip_id+")","tripid":getmoveitorders[j].trip_id});                    
                }                
            }
        }

        let resobj = {
            success: true,
            status: true,
            result:resultdata
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }
};

///////// Moveit Send OTP by admin /////////////
Logistics.Moveituser_send_otp_byphone = function Moveituser_send_otp_byphone(newUser,result) {
    sql.query("Select * from MoveitUser where phoneno = '" + newUser.phoneno + "'", function(err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            if (res.length == 0) {
                var OTP = Math.floor(Math.random() * 90000) + 10000;  
                var otpurl =
                "https://www.instaalerts.zone/SendSMS/sendmsg.php?uname=EATotp1&pass=abc321&send=CHOICB&dest=" +
                newUser.phoneno +
                "&msg=<%23>Your DailyLocally App OTP is " +
                OTP +
                ". Note: Please DO NOT SHARE this OTP with anyone. " +
                newUser.otpcode +
                " "; 
                
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
                        console.log("response.statusCode, body==>",response.statusCode, body);
                        var responcecode = body.split("#");
                    
                        if (body) {
                            sql.query("insert into Otp(phone_number,apptype,otp)values('"+newUser.phoneno+"',5,'" +OTP+"')",function(err, res1) {
                                if (err) {
                                  console.log("error: ", err);
                                  result(null, err);
                                } else {
                                  let resobj = {
                                    success: true,
                                    status: true,
                                    message: "message sent successfully",
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
                              message: "message not sent successfully"
                            };          
                            result(null, resobj);
                          }
                    }
                });
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
  
/////////Moveit OTP Verify////////// 
Logistics.Moveituser_otp_verification = function Moveituser_otp_verification( req,result) {  
    sql.query("Select * from Otp where oid = '" + req.oid + "'", function( err,res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        } else {
            //   console.log(res[0].otp);
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

////Admin force Logout////////////////
Logistics.admin_force_Moveituser_logout = async function admin_force_Moveituser_logout(req, result) { 
    orderdetails = await query("select * from Moveit_trip where trip_status=1 and moveit_id = "+req.userid+"");
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
            //   moveit_last_log = await query("select distinct moveit_userid,type  from Moveit_Timelog where moveit_userid="+req.userid+" order by mt_id desc limit 1");
            //   if(moveit_last_log[0].type==1){
            //     req.type    = 0;
            //     req.moveit_userid = req.userid;
            //     req.action  = 5;              
            //     // await Moveituser.create_createMoveitTimelog(req);  
            //   }
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

/////////Get Moveit List///////////
Logistics.moveit_list_trip =async function moveit_list_trip(req,result) {
    if(req.zoneid){
        var resultdata = [];
        var getdetails = [];
        // var getmoveittripquery = "select mu.userid,mu.name,mt.tripid,mt.trip_status,case when mt.trip_status=0 then mt.tripid end as before_start_tripid,case when mt.trip_status=1 then mt.tripid end as after_start_tripid from MoveitUser as mu left join Moveit_trip as mt on mt.moveit_id=mu.userid where mu.online_status=1 and mu.zone="+req.zoneid+" group by mu.userid";
        // var getmoveittrip = await query(getmoveittripquery);

        var getmoveitquery = "select mu.userid,mu.name,'' as moveittripid,'0' as action from MoveitUser as mu where mu.zone="+req.zoneid+" and mu.online_status=1 group by mu.userid";
        var getmoveit = await query(getmoveitquery);
        if(getmoveit.length > 0){
            for (let i = 0; i < getmoveit.length; i++) {
                // if(getmoveittrip[i].after_start_tripid>0){ }else{
                //     var username="";
                //     if(getmoveittrip[i].tripid>0 && getmoveittrip[i].trip_status==0){
                //         username = getmoveittrip[i].name+"(Live trip - "+getmoveittrip[i].tripid+")";
                //     }else{
                //         username = getmoveittrip[i].name+"(New trip)";
                //         getmoveittrip[i].tripid='';
                //     }
                //     resultdata.push({"userid":getmoveittrip[i].userid,"name":username,"tripid":getmoveittrip[i].tripid});
                // } 
                
                var getmoveittripquery = "select * from Moveit_trip where moveit_id="+getmoveit[i].userid+" order by tripid desc limit 1";
                var getmoveittrip = await query(getmoveittripquery);
                if(getmoveittrip.length>0){
                    var username = "";
                    var moveittrip = "";
                    if(getmoveittrip[0].trip_status==0){
                        getmoveit[i].name = getmoveit[i].name+"(Live trip - "+getmoveittrip[0].tripid+")";
                    }else if(getmoveittrip[0].trip_status==1){                        
                        getmoveit[i].name = getmoveit[i].name+"(New trip)";
                        getmoveit[i].moveittripid ='';
                        getmoveit[i].action ='1';
                    }else {                        
                        getmoveit[i].name = getmoveit[i].name+"(New trip)";
                        getmoveit[i].moveittripid ='';
                    }
                }else{
                    getmoveit[i].name = getmoveit[i].name+"(New trip)";
                    getmoveit[i].moveittripid ='';
                }

                resultdata.push({"userid":getmoveit[i].userid,"name":getmoveit[i].name,"tripid":getmoveit[i].moveittripid,"action":getmoveit[i].action});
            }
            var  resultdata = resultdata.filter(item => item.action == 0);
            if(resultdata.length>0){
                let resobj = {
                    success: true,
                    status: true,
                    result: resultdata
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "no data found"
                };
                result(null, resobj);
            }        
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "no data found"
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

///////// Create Moveit Trip //////////
Logistics.trip_create =async function trip_create(req,result) {
    if(req.zoneid && req.doid.length>0 && req.moveit_id && req.done_by){
        var dayorderids = req.doid;
        var moveittripdata = [];
        if(req.trip_id){
            var getoldordersquery = "select * from Dayorder where trip_id="+req.trip_id;
            var getoldorders = await query(getoldordersquery); 
            var oldorders = [];
            for (let k = 0; k < getoldorders.length; k++) {
                oldorders.push(getoldorders[k].id);                
            }

            var updatedayorderquery = "update Dayorder set trip_id="+req.trip_id+",moveit_type=1,dayorderstatus=7,zoneid="+req.zoneid+" where id IN("+dayorderids+")";
            var updatedayorder = await query(updatedayorderquery);  
            if(updatedayorder.affectedRows>0){
                var updatedonebyquery = "update Moveit_trip set done_by="+req.done_by+" where tripid="+req.trip_id;
                var updatedoneby = await query(updatedonebyquery);
                
                for (let i = 0; i < dayorderids.length; i++) {
                    var historydata = [];
                    historydata.push({"doid":dayorderids[i],"tripid":req.trip_id,"type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                    await MoveitTripHistory.createMoveitTripHistory(historydata[0],async function(err,historyres){ }); 
                    ////////Create Day order Log ////////////
                    var insertlogdata = [];
                    insertlogdata.push({"comments":"Moveit Assigned","done_by":req.done_by,"doid":dayorderids[i],"type":1,"done_type":1});
                    DayOrderComment.create_OrderComments_crm(insertlogdata);                
                }

                var difforderid = dayorderids.filter(x => oldorders.indexOf(x) === -1);
        
                var getmoveitdetailsquery = "select * from MoveitUser where userid="+req.moveit_id;
                var getmoveitdetails = await query(getmoveitdetailsquery);
                if(getmoveitdetails.length>0){
                    console.log("moveit Send Notification add orders to trip ================> 2");
                    await Notification.orderMoveItPushNotification(req.trip_id,PushConstant.pageidMoveit_Order_Assigned,getmoveitdetails[0],difforderid);
                }

                
                let resobj = {
                    success: true,
                    status: true,
                    message: "trip created Successfully 1"
                };
                result(null, resobj);
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "something went wrong plz try again"
                };
                result(null, resobj); 
            }
        }else{
            var checktripquery = "select * from Moveit_trip where moveit_id="+req.moveit_id+" and trip_status IN (0,1)";
            var checktrip = await query(checktripquery);
            if(checktrip.length ==0){
                moveittripdata.push({"moveit_id":req.moveit_id,"done_by":req.done_by,"zoneid":req.zoneid});
                await MoveitTrip.createMovietTrip(moveittripdata[0],async function(err,moveittripres){
                    if(moveittripres.status==true){                
                        for (let i = 0; i < dayorderids.length; i++) {
                            var updatedayorderquery = "update Dayorder set trip_id="+moveittripres.result.insertId+",moveit_type=1,dayorderstatus=7 where id="+dayorderids[i];
                            var updatedayorder = await query(updatedayorderquery);    
                            
                            var historydata = [];
                            historydata.push({"doid":dayorderids[i],"tripid":moveittripres.result.insertId,"type":1,"zoneid":req.zoneid,"created_by":req.done_by});
                            await MoveitTripHistory.createMoveitTripHistory(historydata[0],async function(err,historyres){ });

                            ////////Create Day order Log ////////////
                            var insertlogdata = [];
                            insertlogdata.push({"comments":"Moveit Assigned","done_by":req.done_by,"doid":dayorderids[i],"type":1,"done_type":1});
                            DayOrderComment.create_OrderComments_crm(insertlogdata);  
                        }

                        ////// Send Notification //////////
                        var getmoveitdetailsquery = "select * from MoveitUser where userid="+req.moveit_id;
                        var getmoveitdetails = await query(getmoveitdetailsquery);
                        if(getmoveitdetails.length>0){
                            console.log("moveit Send Notification For New Trip Created ================> 1");
                            await Notification.orderMoveItPushNotification(moveittripres.result.insertId,PushConstant.pageidMoveit_Trip_Assigned,getmoveitdetails[0],0);
                        }

                        let resobj = {
                            success: true,
                            status: true,
                            message: "trip created Successfully 2"
                        };
                        result(null, resobj);
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "something went wrong plz try again"
                        };
                        result(null, resobj);
                    }
                });
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "already moveit have trip, completed and try again"
                };
                result(null, resobj);
            }            
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

/////////Unassign Moveit Trip//////////
Logistics.trip_unassign =async function trip_unassign(req,result) {
    if(req.zoneid && req.done_by && req.doid.length>0){
        var dayorders = req.doid;
        var updatedids = [];
        var errorids = [];
        for (let i = 0; i < dayorders.length; i++) {
            var checkdayorderquery = "select dayo.*,mt.tripid,mt.moveit_id from Dayorder as dayo left join Moveit_trip as mt on mt.tripid=dayo.trip_id where dayo.id="+dayorders[i]+" and dayo.dayorderstatus IN(7,8) and dayo.moveit_type=1";
            var checkdayorder = await query(checkdayorderquery);
            if(checkdayorder.length>0){
                var updatedayorderquery = "update Dayorder set dayorderstatus=6, trip_id=NULL,moveit_type=NULL where id="+dayorders[i];
                var updatedayorder = await query(updatedayorderquery);

                ///////check trip status for close //////////
                await MoveitUserModel.updatetripstatus(checkdayorder[0].trip_id);
                
                var historydata = [];
                historydata.push({"doid":dayorders[i],"tripid":checkdayorder[0].trip_id,"type":2,"zoneid":req.zoneid,"created_by":req.done_by});
                await MoveitTripHistory.createMoveitTripHistory(historydata[0],async function(err,historyres){ }); 

                ////////Create Day order Log ////////////
                var insertlogdata = [];
                insertlogdata.push({"comments":"Moveit Un-Assigned","done_by":req.done_by,"doid":dayorders[i],"type":1,"done_type":1});
                DayOrderComment.create_OrderComments_crm(insertlogdata);  

                if(updatedayorder.affectedRows>0){
                    ////// Send Notification //////////
                    var getmoveitdetailsquery = "select * from MoveitUser where userid="+checkdayorder[0].moveit_id;
                    var getmoveitdetails = await query(getmoveitdetailsquery);
                    if(getmoveitdetails.length>0){
                        console.log("moveit Send Notification For unassign============> 1");
                        await Notification.orderMoveItPushNotification(checkdayorder[0].trip_id,PushConstant.pageidMoveit_Order_unassign,getmoveitdetails[0],dayorders[i]);
                    }
                    ///////////////////////////////////
                    updatedids.push(dayorders[i]);
                }else{
                    errorids.push(dayorders[i]);
                }
            }else{
                errorids.push(dayorders[i]);
            }            
        }

        var sucdata = "";
        if(updatedids.length>0){
            sucdata = "Order id "+updatedids+" unassign successfully";
        }

        var errdata = "";
        if(errorids.length>0){
            errdata = "Order id "+errorids+" status not updated, please check order status";
        }
        
        let resobj = {
            success: true,
            status: true,
            success_data: sucdata,
            error_data: errdata
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }
};

/////Trip Status Update///////////////////
Logistics.trip_status_update =async function trip_status_update(tripid,result) {
    if(tripid){
        var gettripordersquery = "select count(id) as totalordercount from Dayorder where trip_id="+tripid;
        var gettriporders = await query(gettripordersquery);
        if(gettriporders.length>0){
            if(gettriporders[0].totalordercount==0){
                var currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
                var updatetripquery = "update Moveit_trip set trip_status=3,cancel_time='"+currentdate+"' where tripid="+tripid;
                var updatetrip = await query(updatetripquery);
                if(updatetrip.affectedRows>0){
                    let resobj = {
                        success: true,
                        status: true,
                        message: "unassign successfully 1"
                    };
                    result(null, resobj);
                }else{
                    let resobj = {
                        success: true,
                        status: true,
                        message: "unassign successfully 1"
                    };
                    result(null, resobj); 
                }
            }else{
                let resobj = {
                    success: true,
                    status: true,
                    message: "unassign successfully 2"
                };
                result(null, resobj);                
            }
        }else{            
            let resobj = {
                success: true,
                status: true,
                message: "unassign successfully 3"
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
}

/////////Trip Moveit Filters//////////
Logistics.trip_moveit_filters =async function trip_moveit_filters(req,result) {
    var moveitlistquery = "select mt.moveit_id,mu.name from Moveit_trip as mt left join MoveitUser as mu on mu.userid=mt.moveit_id";
    var moveitlist = await query(moveitlistquery);
    var triplistquery = "select tripid from Moveit_trip";
    var triplist = await query(triplistquery);

    let resobj = {
        success: true,
        status: true,
        moveitlist: moveitlist,
        triplist: triplist
    };
    result(null, resobj);
};

/////////Moveit Trip List//////////
Logistics.trip_list =async function trip_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var wherecon="";
        if(req.moveit_id){
            wherecon = wherecon+" and (mt.moveit_id='"+req.moveit_id+"' or mu.name='"+req.moveit_id+"' )";
        }
        if(req.tripid){
            wherecon = wherecon+" and (dayo.trip_id='"+req.tripid+"' or mu.name='"+req.tripid+"' )";
        }
        if(req.from_date && req.to_date){
            wherecon = wherecon+" and (date(dayo.date) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.order_status){
            wherecon = wherecon+" and dayo.dayorderstatus="+req.order_status+" ";
        }
        var moveittriplistquery = "select dayo.*,if(HOUR(time(dayo.order_place_time))>=19,'slot 2','slot 1') as slot,case when dayo.dayorderstatus=5 then 'QC' when dayo.dayorderstatus=6 then 'QA' when dayo.dayorderstatus=7 then 'Moveit Assigned' when dayo.dayorderstatus=8 then 'Moveit Pickup' when dayo.dayorderstatus=9 then 'Moveit Delivered' when dayo.dayorderstatus=10 then 'Completed' when dayo.dayorderstatus=11 then 'Cancel' when dayo.dayorderstatus=12 then 'return' end as dayorderstatus_msg,mu.name,mt.moveit_id,au.name as assigned_by,mt.created_at assigned_datetime from Dayorder as dayo left join Moveit_trip as mt on mt.tripid=dayo.trip_id left join MoveitUser as mu on mu.userid=mt.moveit_id left join Admin_users as au on au.admin_userid=mt.done_by where dayo.moveit_type=1 "+wherecon+" and mt.zoneid="+req.zoneid+" order by dayo.id desc limit " +startlimit +"," +pagelimit +" ";
        var moveittriplist = await query(moveittriplistquery);

        var totalcountquery = "select dayo.id from Dayorder as dayo left join Moveit_trip as mt on mt.tripid=dayo.trip_id left join MoveitUser as mu on mu.userid=mt.moveit_id left join Admin_users as au on au.admin_userid=mt.done_by where dayo.moveit_type=1 "+wherecon+" and mt.zoneid="+req.zoneid+" order by dayo.id desc";
        var total_count = await query(totalcountquery);

        if(moveittriplist.length > 0){ 
            var totalcount = total_count.length;           
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: moveittriplist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no data found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount: 0,
            message: "check post values"
        };
        result(null, resobj);
    }    
};

/////////Dunzo Order List//////////
Logistics.dunzo_order_list =async function dunzo_orders_list(req,result) {
    if(req.zoneid){
        var pagelimit = 20;
        var page = req.page || 1;
        var startlimit = (page - 1) * pagelimit;

        var wherecon="";
        if(req.moveit_id){
            wherecon = wherecon+" and (mt.moveit_id='"+req.moveit_id+"' or mu.name='"+req.moveit_id+"' )";
        }
        if(req.tripid){
            wherecon = wherecon+" and (dayo.trip_id='"+req.tripid+"' or mu.name='"+req.tripid+"' )";
        }
        if(req.from_date && req.to_date){
            wherecon = wherecon+" and (date(dayo.date) between '"+req.from_date+"' and  '"+req.to_date+"') ";
        }
        if(req.order_status){
            wherecon = wherecon+" and dayo.dayorderstatus="+req.order_status+" ";
        }
        var moveittriplistquery = "select dayo.*,if(HOUR(time(dayo.order_place_time))>=19,'slot 2','slot 1') as slot,case when dayo.dayorderstatus=5 then 'QC' when dayo.dayorderstatus=6 then 'QA' when dayo.dayorderstatus=7 then 'Moveit Assigned' when dayo.dayorderstatus=8 then 'Moveit Pickup' when dayo.dayorderstatus=9 then 'Moveit Delivered' when dayo.dayorderstatus=10 then 'Completed' when dayo.dayorderstatus=11 then 'Cancel' when dayo.dayorderstatus=12 then 'return' end as dayorderstatus_msg,au.name as assigned_by,dt.created_at assigned_datetime from Dayorder as dayo left join Dunzo_trip as dt on dt.doid=dayo.id left join Admin_users as au on au.admin_userid=dt.assigned_by where dayo.moveit_type=2 "+wherecon+" and dt.zoneid="+req.zoneid+" order by dayo.id desc limit " +startlimit +"," +pagelimit +" ";
        var moveittriplist = await query(moveittriplistquery);

        var totalcountquery = "select dayo.id from Dayorder as dayo left join Dunzo_trip as dt on dt.doid=dayo.id left join Admin_users as au on au.admin_userid=dt.assigned_by where dayo.moveit_type=2 "+wherecon+" and dt.zoneid="+req.zoneid+" order by dayo.id desc";
        var total_count = await query(totalcountquery);

        if(moveittriplist.length > 0){ 
            var totalcount = total_count.length;           
            let resobj = {
                success: true,
                status: true,
                totalcount: totalcount,
                pagelimit: pagelimit,
                result: moveittriplist
            };
            result(null, resobj);
        }else{
            let resobj = {
                success: true,
                status: false,
                totalcount: 0,
                message: "no data found"
            };
            result(null, resobj);
        }
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount: 0,
            message: "check post values"
        };
        result(null, resobj);
    }   
};

/////////Dunzo Assign//////////
Logistics.dunzo_assign =async function dunzo_assign(req,result) {
    if(req.zoneid && req.doid && req.done_by){
        var getdayorderquery = "select * from Dayorder where id="+req.doid;
        var getdayorder = await query(getdayorderquery);
        if(getdayorder.length>0){
            if(getdayorder[0].dayorderstatus==6){
                if(!getdayorder[0].moveit_type){
                    var updatedayorderquery = "update Dayorder set moveit_type=2,dayorderstatus=7 where id="+req.doid;
                    var updatedayorder = await query(updatedayorderquery);
                    if(updatedayorder.affectedRows>0){
                        var currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
                        var dunzodata = [];
                        dunzodata.push({"doid":req.doid,"assigned_by":req.done_by,"assigned_at":currentdate,"zoneid":req.zoneid});
                        await DunzoTrip.createDunzoTrip(dunzodata[0],async function(err,dunzodatares){ 
                            if(dunzodatares.status==true){
                                var dunzohistorydata = [];
                                dunzohistorydata.push({"doid":req.doid,"type":1,"created_by":req.done_by,"zoneid":req.zoneid});
                                await DunzoTripHistory.createDunzoTripHistory(dunzohistorydata[0],async function(err,dunzohistorydatares){ });
                                let resobj = {
                                    success: true,
                                    status: true,
                                    message: "Order successfully assigned to dunzo"
                                };
                                result(null, resobj);
                            }else{
                                let resobj = {
                                    success: true,
                                    status: false,
                                    message: "something went wrong plz try again 1"
                                };
                                result(null, resobj);
                            }
                        });                        
                    }else{
                        let resobj = {
                            success: true,
                            status: false,
                            message: "something went wrong plz try again 2"
                        };
                        result(null, resobj);
                    }
                }else{
                    let resobj = {
                        success: true,
                        status: false,
                        message: "already moveit assigned"
                    };
                    result(null, resobj);
                }
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "plz check day order status"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "invalid doid"
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

////////Dunzo Pickup//////////////
Logistics.dunzo_pickup =async function dunzo_pickup(req,result) {
    if(req.zoneid && req.doid.length>0 && req.done_by){
        var dayorders = req.doid;
        var updatedids = [];
        var errorids = [];
        for (let i = 0; i < dayorders.length; i++) {
            var checkdayorderquery = "select * from Dayorder where id="+dayorders[i]+" and dayorderstatus=7 and moveit_type=2";
            var checkdayorder = await query(checkdayorderquery);
            if(checkdayorder.length>0){
                var currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
                var updatedayorderquery = "update Dayorder set dayorderstatus=8,moveit_pickup_time='"+currentdate+"' where id="+dayorders[i];
                var updatedayorder = await query(updatedayorderquery);
                if(updatedayorder.affectedRows>0){
                    var updatedunzquery = "update Dunzo_trip set pickup_by="+req.done_by+",pickup_at='"+currentdate+"' where doid="+dayorders[i];
                    var updatedunz = await query(updatedunzquery);

                    var dunzohistorydata = [];
                    dunzohistorydata.push({"doid":req.doid,"type":3,"created_by":req.done_by,"zoneid":req.zoneid});
                    await DunzoTripHistory.createDunzoTripHistory(dunzohistorydata[0],async function(err,dunzohistorydatares){ });
                    updatedids.push(dayorders[i]);
                }else{
                    errorids.push(dayorders[i]);
                }
            }else{
                errorids.push(dayorders[i]);
            }            
        }

        var sucdata = "";
        if(updatedids.length>0){
            sucdata = "Order id "+updatedids+" status updated successfully";
        }

        var errdata = "";
        if(errorids.length>0){
            errdata = "Order id "+errorids+" status not updated, please check order status";
        }

        let resobj = {
            success: true,
            status: true,
            success_data: sucdata,
            error_data: errdata
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }
};

////////Dunzo Delivered//////////////
Logistics.dunzo_delivered =async function dunzo_delivered(req,result) {
    if(req.zoneid && req.doid.length>0 && req.done_by){
        var dayorders = req.doid;
        var updatedids = [];
        var errorids = [];
        for (let i = 0; i < dayorders.length; i++) {
            var checkdayorderquery = "select * from Dayorder where id="+dayorders[i]+" and dayorderstatus=8 and moveit_type=2";
            var checkdayorder = await query(checkdayorderquery);
            if(checkdayorder.length>0){
                var currentdate = moment().format("YYYY-MM-DD HH:mm:ss");
                var updatedayorderquery = "update Dayorder set dayorderstatus=10,moveit_actual_delivered_time='"+currentdate+"' where id="+dayorders[i];
                var updatedayorder = await query(updatedayorderquery);
                if(updatedayorder.affectedRows>0){
                    var updatedunzquery = "update Dunzo_trip set delivered_by="+req.done_by+",delivered_at='"+currentdate+"' where doid="+dayorders[i];
                    var updatedunz = await query(updatedunzquery);
                    var dunzohistorydata = [];
                    dunzohistorydata.push({"doid":req.doid,"type":4,"created_by":req.done_by,"zoneid":req.zoneid});
                    await DunzoTripHistory.createDunzoTripHistory(dunzohistorydata[0],async function(err,dunzohistorydatares){ });
                    updatedids.push(dayorders[i]);
                }else{
                    errorids.push(dayorders[i]);
                }
            }else{
                errorids.push(dayorders[i]);
            }            
        }

        var sucdata = "";
        if(updatedids.length>0){
            sucdata = "Order id "+updatedids+" status updated successfully";
        }

        var errdata = "";
        if(errorids.length>0){
            errdata = "Order id "+errorids+" status not updated, please check order status";
        }

        let resobj = {
            success: true,
            status: true,
            success_data: sucdata,
            error_data: errdata
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "check your post values"
        };
        result(null, resobj);
    }
};

module.exports = Logistics;