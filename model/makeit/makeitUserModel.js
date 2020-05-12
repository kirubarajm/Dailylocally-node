"user strict";
var sql = require("../db.js");
var constant = require("../constant.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var request = require("request");
var moment = require("moment");
let jwt = require('jsonwebtoken');
let config = require('../config.js');
//var OrderModel = require("../../model/common/orderModel");
var Cusinemakeit = require("../../model/makeit/cusinemakeitModel");
var MakeitImages = require("../../model/makeit/makeitImagesModel");
var MakeitBadges = require("../../model/makeit/makeitbadgesmappingModel");
var PushConstant = require("../../push/PushConstant.js");
var Notification = require("../../model/common/notificationModel.js");
var ZoneModel    = require("../../model/common/zoneModel.js");
var PackageInvetoryTracking = require('../../model/makeit/packageInventoryTrackingModel');
var Makeittimelog    = require("../../model/common/makeittimelogModel");

//Task object constructor
var Makeituser = function(makeituser) {
  this.name = makeituser.name;
  this.email = makeituser.email;
  this.phoneno = makeituser.phoneno;
  this.bank_account_no = makeituser.bank_account_no;
  this.verified_status = makeituser.verified_status || "0";
  this.appointment_status = makeituser.appointment_status || 0;
  this.referalcode = makeituser.referalcode;
  this.localityid = makeituser.localityid;
  this.lat = makeituser.lat;
  this.lon = makeituser.lon;
  this.password = makeituser.password;
  this.brandname = makeituser.brandname || "";
  //  this.created_at = new Date();
  this.bank_name = makeituser.bank_name;
  this.ifsc = makeituser.ifsc;
  this.bank_holder_name = makeituser.bank_holder_name;
  this.address = makeituser.address;
  this.virtualkey = makeituser.virtualkey || 0;
  this.rating = makeituser.rating;
  this.regionid = makeituser.regionid;
  this.costfortwo = makeituser.costfortwo;
  this.landmark = makeituser.landmark;
  this.locality = makeituser.locality;
  this.flatno = makeituser.flatno;
  this.pincode = makeituser.pincode;
  this.hometownid = makeituser.hometownid;
  this.img1 = makeituser.img1;
  this.gender = makeituser.gender;
  this.food_type = makeituser.food_type;
  this.member_type = makeituser.member_type;
  this.about = makeituser.about;
  this.virutal_rating_count = makeituser.virutal_rating_count;
  this.ka_status = makeituser.ka_status || 0;
  this.unservicable = makeituser.unservicable || 0;
  this.zone =makeituser.zone || 0;
  this.referredby=makeituser.referredby;
  this.pushid_ios=makeituser.pushid_ios;
  this.makeit_type=makeituser.makeit_type;
};

Makeituser.createUser = function createUser(newUser,isAdmin,result) {
  sql.query(
    "Select * from MakeitUser where phoneno = '" +
      newUser.phoneno +
      "' OR email= '" +
      newUser.email +
      "' ",
    async function(err, res2) {
      if (err) {
        result(err, null);
      } else {
        if (res2.length == 0) {
          if(!isAdmin){
            newUser.makeit_type=0;
            Makeituser.user_register(newUser,result);
          }else{
          ZoneModel.check_map_boundaries(newUser,async function(err,res){
            if(err||res.status===false) {
              let resobj = {
                success: true,
                status: false,
                error:err,
                message:"Sorry this makeit loaction not in the inside of the zone location.",
              };

              result(null, resobj);
            }else{
              if(res.status){
                newUser.zone= res.zone_id;
                Makeituser.user_register(newUser,result);
              }
            }
          })
        }
        } else {
          let sucobj = true;
          let message =
            "Following user already Exist! Please check it mobile number / email";
          let resobj = {
            success: sucobj,
            status: false,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.user_register = function user_register(newUser,result){
  sql.query("INSERT INTO MakeitUser set ?", newUser, function(
    err,
    res3
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      var referalcode = "MAKEITWELL" + res3.insertId;

      sql.query(
        "Select userid,name,email,bank_account_no,phoneno,appointment_status from MakeitUser where userid = ? ",
        res3.insertId,
        function(err, res4) {
          if (err) {
            console.log("error: ", err);
            result(err, null);
          } else {
            sql.query(
              "Update MakeitUser set referalcode = '" +
                referalcode +
                "' where userid = ? ",
              res3.insertId,
              function(err, res5) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {

                  let token = jwt.sign({username: newUser.phoneno},
                    config.secret
                   );
               
                  let resobj = {
                    success: true,
                    status: true,
                    token : token,
                    message: "Registration Successfully",
                    result: res4
                  };

                  result(null, resobj);
                }
              }
            );
          }
        }
      );
    }
  });
}

Makeituser.getUserById = async function getUserById(userId, result) {
  //var query1 = "select mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey from MakeitUser as mu join Documents_Sales as ds on mu.userid = ds.makeit_userid join Documents as st on ds.docid = st.docid where mu.userid = '"+userId+"'";
  //var query1 = "Select * from MakeitUser where userid = '" + userId + "'";
  // JSON_OBJECT('img1',mk.img1,'img2',mk.img2,'img3',mk.img3,'img4',mk.img4) As Images
  var query1 =
    "select mk.userid,mk.makeit_type,mk.zone,zn.Zonename,mk.ka_status,mk.pincode, mk.commission,mk.name, mk.email,bank_account_no, mk.phoneno, mk.lat, mk.brandname, mk.lon, mk.localityid, mk.appointment_status, mk.verified_status, mk.referalcode, mk.created_at, mk.bank_name, mk.ifsc, mk.bank_holder_name, mk.address, mk.virtualkey,mk.unservicable, mk.img1,mk.regionid, mk.costfortwo, mk.pushid_android, mk.updated_at, mk.branch_name, mk.rating, mk.hometownid,ht.hometownname,re.regionname,mk.food_type,mk.member_type,mk.about,mk.virutal_rating_count,mkh.makeithub_id,mkh.address as makeithub_address,mkh.makeithub_name,mk.unservicable, JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cu.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk  join Cuisine_makeit cm on cm.makeit_userid=mk.userid left join Hometown ht on ht.hometownid=mk.hometownid left join Zone zn on zn.id=mk.zone left join Region re on re.regionid=ht.regionid join Cuisine cu on cu.cuisineid=cm.cuisineid left join Makeit_hubs mkh on mkh.makeithub_id=mk.makeithub_id where userid = '" +
    userId +
    "'";
  sql.query(query1, async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res.length; i++) {
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }
      }

      const specialitems = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 3 limit 4"
      );
      const kitcheninfoimage = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 2 limit 4"
      );
      const kitchenmenuimage = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 4 limit 4"
      );
      const Signature = await query(
        "select img_id,img_url,type from Makeit_images where makeitid=" +
          userId +
          " and type = 1 limit 1"
      );

      const foodbadge = await query(
        "select mbm.id,mbm.id,mb.url as badges from Makeit_badges_mapping mbm join  Makeit_badges mb on mbm.id = mb.id where mbm.makeit_id=" +
          userId +
          ""
      );

      const images = await query(
        "select st.url,st.docid,st.type from Documents_Sales as ds join Documents as st on ds.docid = st.docid where ds.makeit_userid = '" +
          userId +
          "'"
      );
      // var special = await query("select * from Makeit_images ");
      res[0].Specialitiesfood = specialitems;
      res[0].kitcheninfoimage = kitcheninfoimage;
      res[0].kitchenmenuimage = kitchenmenuimage;
      // res[0].Signature =[]
      // if (Signature.length !== 0) {
      res[0].Signature = Signature;
      // }

      res[0].foodbadge = foodbadge;
      res[0].gallery = images;

      sql.query(
        "select st.url,st.docid,st.type from Documents_Sales as ds join Documents as st on ds.docid = st.docid where ds.makeit_userid = '" +
          userId +
          "'",
        function(err, images) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          } else {
            res[0].gallery = images;
            let sucobj = true;
            let resobj = {
              success: sucobj,
              result: res
            };

            result(null, resobj);
          }
        }
      );
    }
  });
};

Makeituser.getAllUser = function getAllUser(result) {
  //  sql.query("Select * from MakeitUser", function (err, res) {

  var query =
    "select mk.userid, mk.name, mk.email,bank_account_no, mk.phoneno, mk.lat, mk.brandname, mk.lon, mk.localityid, mk.appointment_status, mk.verified_status, mk.referalcode, mk.created_at, mk.bank_name, mk.ifsc, mk.bank_holder_name, mk.address, mk.virtualkey, mk.img1, mk.regionid, mk.costfortwo, mk.pushid_android, mk.updated_at, mk.branch_name, mk.rating, JSON_OBJECT('cuisines', JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cu.cuisineid,'cuisinename',cu.cuisinename))) AS cuisines from MakeitUser mk  left join Cuisine_makeit cm on cm.makeit_userid=mk.userid  left join Cuisine cu on cu.cuisineid=cm.cuisineid";

  sql.query(query, function(err, res) {
    // sql.query("select concat('[',GROUP_CONCAT(CONCAT('{"url :"', st.url,'"}')),']') url ,mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey  from MakeitUser as mu join Documents_Sales as ds on mu.userid = ds.makeit_userid join Documents as st on ds.docid = st.docid where mu.userid = 1 group by mu.userid,mu.name,mu.email,mu.bank_account_no,mu.phoneno,mu.lat,mu.brandname,mu.lon,mu.localityid,mu.appointment_status,mu.verified_status,mu.referalcode,mu.created_at,mu.bank_name,mu.ifsc,mu.bank_holder_name,mu.address,mu.virtualkey ", function (err, res) {
    //  sql.query("SELECT JSON_OBJECT('Orderid', ci.orderid,'Item', JSON_ARRAYAGG(JSON_OBJECT('Quantity', ci.quantity,'Productid', ci.productid))) AS ordata FROM Orders co JOIN OrderItem ci ON ci.orderid = co.orderid GROUP BY co.orderid", function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < res.length; i++) {
        if (res[i].cuisines) {
          res[i].cuisines = JSON.parse(res[i].cuisines);
        }
      }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Makeituser.getAllUserByAppointment = function getAllUserByAppointment(result) {
  //  sql.query("Select * from MakeitUser where appointment_status=1 order by created_at DESC", function (err, res) {
  sql.query(
    " Select alc.*,mu.address,mu.brandname,mu.email,mu.flatno,mu.appointment_status,mu.name,mu.phoneno,mu.pincode,mu.userid from Allocation as alc left join MakeitUser as mu on alc.makeit_userid=mu.userid where mu.appointment_status = 1 and alc.status!=6",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("User : ", res);

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

Makeituser.updateById = function(id, user, result) {
  sql.query(
    "UPDATE MakeitUser SET task = ? WHERE userid = ?",
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

Makeituser.remove = function(id, result) {
  sql.query("DELETE FROM MakeitUser WHERE userid = ?", [id], function(
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

Makeituser.checkLogin = function checkLogin(req, result) {
  var reqs = [req.phoneno, req.password];
  sql.query(
    "Select * from MakeitUser where phoneno = ? and password = ?",
    reqs,
    function(err, res) {
      if (err) {
        console.log("error: ", err);

        let resobj = {
          success: "false",
          result: err
        };
        result(resobj, null);
      } else {
        if (res.length !== 0) {
          if (res[0].virtualkey === 0) {  
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
          
          } else {
            let resobj = {
              success: true,
              message: "Sorry wrong password!",
              status: false
            };

            result(null, resobj);
          }
        } else {
          let resobj = {
            success: true,
            message: "Sorry your not a valid user!",
            status: false
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.update_makeit_users_bankaccount = function(user, result) {
  var query =
    "UPDATE MakeitUser SET bank_name = '" +
    user.bank_name +
    "', ifsc='" +
    user.ifsc +
    "', bank_account_no='" +
    user.bank_account_no +
    "', bank_holder_name='" +
    user.bank_holder_name +
    "',branch_name='" +
    user.branch_name +
    "' WHERE userid = '" +
    user.userid +
    "'";
  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      // result(null, err);
      returnResponse(400, false, "error", err);
    } else {
      //result(null, res);
      returnResponse(true, true, "Payment Registration Succdessfully");
    }
  });

  function returnResponse(success, status, message) {
    result({
      success: success,
      status: status,
      message: message
    });
  }
};

Makeituser.createAppointment = function createAppointment(req, result) {
  sql.query(
    "INSERT INTO Bookingtime (makeit_userid, date_time) values (?,?) ",
    [req.makeit_userid, req.date_time],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        sql.query(
          "UPDATE MakeitUser SET appointment_status = 1 WHERE userid = ?",
          req.makeit_userid,
          function(err, res) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            }

            sql.query(
              "Select userid,name,email,bank_account_no,phoneno,appointment_status from MakeitUser where userid = ? ",
              req.makeit_userid,
              function(err, res) {
                if (err) {
                  console.log("error: ", err);
                  result(err, null);
                } else {
                  let sucobj = true;
                  let message = "Appointment Created Successfully";
                  let resobj = {
                    success: sucobj,
                    message: message,
                    result: res
                  };

                  result(null, resobj);
                }
              }
            );
          }
        );
      }
    }
  );
};

// Makeituser.orderviewbymakeituser = function (id, result) {
//     console.log(id.orderid);

//     var temp = [];
//     sql.query("select ot.productid,pt.product_name,ot.quantity,ot.price,ot.gst,ot.created_at,ot.orderid from OrderItem ot left outer join Product pt on ot.productid = pt.productid where ot.orderid = '" + id.orderid + "'", function (err, res) {

//         if (err) {
//             console.log("error: ", err);
//             result(null, err);
//         }
//         else {
//             // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
//             sql.query("select * from Orders where orderid = '" + id.orderid + "'", function (err, responce) {

//                 if (err) {
//                     console.log("error: ", err);
//                     result(null, err);
//                 }
//                 else {

//                     temp = responce;
//                     let sucobj = true;
//                     let resobj = {
//                         success: sucobj,
//                         result: res,
//                         data: temp
//                     };

//                     result(null, resobj);
//                 }
//             });

//         }
//     });
// };

Makeituser.orderviewbymakeituser = function(req, result) {
  sql.query(
    "select * from Orders where orderid =" + req.orderid + " ",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res.length === 0) {
          let sucobj = true;
          let message = "Order not found!";
          let resobj = {
            success: sucobj,
            status: false,
            message: message,
            result: res
          };

          result(null, resobj);
        } else {
          // sql.query("select userid,ordertime,locality,delivery_charge,orderstatus from Orders where orderid = '" + id.orderid +"'", function (err, responce) {
          sql.query(
            "SELECT dm.*,ors.*,ms.makeit_type,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_OBJECT('item', JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name,'package_items',coalesce((SELECT JSON_ARRAYAGG(JSON_OBJECT('productid', pp.product_id,'package_name', pb.name,'package_id',pp.package_id,'package_count',(pp.count*ci.quantity))) from ProductPackaging pp left join PackagingBox pb on pb.id = pp.package_id where pp.product_id = ci.productid),json_array())))) AS items, ( 3959 * acos( cos( radians(ors.cus_lat) ) * cos( radians( ms.lat ) )  * cos( radians( ms.lon ) - radians(ors.cus_lon) ) + sin( radians(ors.cus_lat) ) * sin(radians(ms.lat)) ) ) AS distance from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid left join Dunzo_moveit_details dm on dm.task_id=ors.dunzo_taskid where ors.orderid =" +req.orderid +" ",
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                for (let i = 0; i < res.length; i++) {
                 // eta = 15 + 3 * res[i].distance;
                  var eta = constant.foodpreparationtime + constant.onekm * res[i].distance;
                  //15min Food Preparation time , 3min 1 km
                  res[i].eta = Math.round(eta) + " mins";

                  if (res[i].userdetail) {
                    res[i].userdetail = JSON.parse(res[i].userdetail);
                  }

                  if (res[i].makeitdetail) {
                    res[i].makeitdetail = JSON.parse(res[i].makeitdetail);
                  }
                  if (res[i].moveitdetail) {
                    res[i].moveitdetail = JSON.parse(res[i].moveitdetail);
                  }

                  if (res[i].items) {
                    var items = JSON.parse(res[i].items);
                    res[i].items = items.item;
                  }
                }

                let sucobj = true;
                let status = true;
                let resobj = {
                  success: sucobj,
                  status: status,
                  result: res
                };

                result(null, resobj);
              }
            }
          );
        }
      }
    }
  );
};

Makeituser.orderlistbyuserid = function(id, result) {
  if (id) {
    var query =
      "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid WHERE ors.makeit_user_id  = '" +
      id +
      "' and ors.lock_status = 0 and ors.payment_status < 2  and DATE(ors.ordertime) = CURDATE() group by orderid order by orderid  desc";
  } else {
    var query = "select * from Orders order by orderid desc";
  }

  sql.query(query, function(err, res1) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < res1.length; i++) {

        if (res1[i].userdetail) {
          res1[i].userdetail = JSON.parse(res1[i].userdetail);
        }

        if (res1[i].makeitdetail) {
          res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
        }
        
        if (res1[i].moveitdetail) {
          res1[i].moveitdetail = JSON.parse(res1[i].moveitdetail);
        }

        if (res1[i].items) {
          var items = JSON.parse(res1[i].items);
          res1[i].items = items;
        }
      }

      let resobj = {
        success: true,
        status: true,
        result: res1
      };

      result(null, resobj);
    }
  });
};

Makeituser.orderhistorybyuserid = function(id, result) {
  if (id) {
    var query =
      "SELECT ors.*,JSON_OBJECT('userid',us.userid,'name',us.name,'phoneno',us.phoneno,'email',us.email,'locality',us.Locality) as userdetail,JSON_OBJECT('userid',ms.userid,'name',ms.name,'phoneno',ms.phoneno,'email',ms.email,'address',ms.address,'lat',ms.lat,'lon',ms.lon,'brandName',ms.brandName,'localityid',ms.localityid) as makeitdetail,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no,'localityid',ms.localityid) as moveitdetail,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join User as us on ors.userid=us.userid left join MakeitUser ms on ors.makeit_user_id = ms.userid left join MoveitUser mu on mu.userid = ors.moveit_user_id left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid WHERE makeit_user_id  = '" +
      id +
      "' and (ors.orderstatus = 6 or ors.orderstatus = 7 and payment_status > 2) group by orderid order by orderid  desc";
  } else {
    var query = "select * from Orders order by orderid desc";
  }

  sql.query(query, function(err, res1) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].userdetail) {
          res1[i].userdetail = JSON.parse(res1[i].userdetail);
        }

        if (res1[i].makeitdetail) {
          res1[i].makeitdetail = JSON.parse(res1[i].makeitdetail);
        }
        if (res1[i].moveitdetail) {
          res1[i].moveitdetail = JSON.parse(res1[i].moveitdetail);
        }

        if (res1[i].items) {
          var items = JSON.parse(res1[i].items);
          res1[i].items = items;
        }
      }

      let resobj = {
        success: true,
        status: true,
        result: res1
      };

      result(null, resobj);
    }
  });
};

Makeituser.all_order_list = function(result) {
  var query = "select * from Orders order by orderid desc";

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
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

Makeituser.appointment_info = function(makeit_id, result) {
  var query =
    "select alc.status,alc.booking_date_time,su.name as sales_name from Allocation as alc left join Sales_QA_employees as su on su.id=alc.sales_emp_id where alc.makeit_userid='" +
    makeit_id +
    "' order by aid desc";

  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = true;
      res[0].statusInfo =
        res[0].status === 2
          ? "Info session"
          : res[0].status === 4
          ? "Sales Appointment"
          : res[0].status === 0
          ? "Wating for Sales man"
          : "Sales man reached.";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

Makeituser.all_order_list_bydate = function(req, result) {
  console.log(req.body);
  sql.query(
    "select * from Orders WHERE ordertime BETWEEN '" +
      req.startdate +
      "' AND '" +
      req.enddate +
      "' order by orderid desc",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("User : ", res);

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

Makeituser.orderstatusbyorderid = async function(req, result) {
  var orderdetails = await query(
    "select ors.makeit_user_id from Orders ors join MakeitUser mk on mk.userid = ors.makeit_user_id where ors.orderid ='" +
      req.orderid +
      "'"
  );
  var transaction_time = moment().format("YYYY-MM-DD HH:mm:ss");
  sql.query(
    "UPDATE Orders SET orderstatus = ?,makeit_actual_preparing_time='" +
      transaction_time +
      "' WHERE orderid = ?",
    [req.orderstatusid, req.orderid],
    async function(err, res) {
      if (err) {
        result(null, err);
      } else {
        await Notification.orderEatPushNotification(
          req.orderid,
          null,
          PushConstant.masteridOrder_Prepared
        );
        req.makeit_userid=orderdetails[0].makeit_user_id;
        Makeituser.makeit_quantity_check(req);
        await Notification.orderMoveItPushNotification(req.orderid,PushConstant.pageidMoveit_Order_Prepared,null);
        let sucobj = true;
        let mesobj = "Status Updated Successfully";
        let resobj = {
          success: sucobj,
          status: sucobj,
          message: mesobj
        };
        ////Package Inventory tracking////
        PackageInvetoryTracking.orderbasedpackageTracking(req.orderid,orderdetails[0].makeit_user_id, function(err,res4){
          if (err) {
            result(err, null);
          } else {
          }
        });
        ////////////////////////////
        result(null, resobj);
      }
    }
  );
};

Makeituser.get_admin_list_all_makeitusers = function(req, result) {
  req.appointment_status = req.appointment_status || "all";
  req.virtualkey = req.virtualkey;

  //    rsearch = req.search || ''

  //  var query = "select mk.userid, mk.name, mk.email,bank_account_no, mk.phoneno, mk.lat, mk.brandname, mk.lon, mk.localityid, mk.appointment_status, mk.verified_status, mk.referalcode, mk.created_at, mk.bank_name, mk.ifsc, mk.bank_holder_name, mk.address, mk.virtualkey, mk.img, mk.region, mk.costfortwo, mk.pushid_android, mk.updated_at, mk.branch_name, mk.rating,JSON_OBJECT('cuisines', JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cu.cuisineid,'cuisinename',cu.cuisinename))) AS cuisines from MakeitUser mk  join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid";
  var query = "select mk.* from MakeitUser mk";
  var searchquery = "(mk.name LIKE  '%" + req.search + "%' or mk.brandname LIKE  '%" + req.search + "%')";

  if(req.active_status){
    query = query + " LEFT JOIN Product p on p.makeit_userid=mk.userid where p.active_status=1" ;
  }

  if(req.appointment_status!=="all"){
    if(query.toLowerCase().includes('where')) query =query +" and mk.appointment_status  = '" + req.appointment_status+"'"
    else query =query +" where mk.appointment_status  = '" + req.appointment_status+"'"
  }

  if(req.virtualkey!=="all"){
    if(query.toLowerCase().includes('where'))
    query =query +" and mk.virtualkey  = '" + req.virtualkey+"'"
    else query =query +" where mk.virtualkey  = '" + req.virtualkey+"'"
  }

  if(req.search){
    if(query.toLowerCase().includes('where'))
    query =query +" and "+searchquery
    else query =query +" where "+searchquery
  }

  if(req.active_status){
    query = query + " group by userid" ;
  }

  // if (
  //   req.appointment_status !== "all" &&
  //   req.virtualkey !== "all" &&
  //   !req.search
  // ) {
  //   query =
  //     query +
  //     " WHERE appointment_status  = '" +
  //     req.appointment_status +
  //     "' and virtualkey  = '" +
  //     req.virtualkey +
  //     "'";
  // } else if (req.virtualkey !== "all" && !req.search) {
  //   query = query + " WHERE virtualkey  = '" + req.virtualkey + "'";
  // } else if (req.appointment_status !== "all" && !req.search) {
  //   query =
  //     query + " WHERE appointment_status  = '" + req.appointment_status + "'";
  // } else if (
  //   req.appointment_status !== "all" &&
  //   req.virtualkey !== "all" &&
  //   req.search
  // ) {
  //   query =
  //     query +
  //     " WHERE appointment_status  = '" +
  //     req.appointment_status +
  //     "' and virtualkey  = '" +
  //     req.virtualkey +
  //     "' and " +
  //     searchquery;
  // } else if (req.virtualkey !== "all" && req.search) {
  //   query =
  //     query + " WHERE virtualkey  = '" + req.virtualkey + "'and " + searchquery;
  // } else if (req.appointment_status !== "all" && req.search) {
  //   query =
  //     query +
  //     " WHERE appointment_status  = '" +
  //     req.appointment_status +
  //     "'and " +
  //     searchquery;
  // } else if (req.search) {
  //   query = query + " where " + searchquery;
  // }

  

  console.log(query);
  sql.query(query, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      // for (let i = 0; i < res.length; i++) {

      //    if (res[i].cuisines) {
      //     res[i].cuisines = JSON.parse(res[i].cuisines)
      //    }

      // }

      let sucobj = true;
      let resobj = {
        success: sucobj,
        result: res
      };

      result(null, resobj);
    }
  });
};

Makeituser.admin_get_unapproved_makeitlist = function(req, result) {
  var query = "select * from MakeitUser where ka_status=1";
  var searchquery =
    " and (name LIKE  '%" +
    req.search +
    "%' OR us.brandname LIKE '%" +
    req.search +
    "%')";
  if (req.search) {
    query = query + searchquery;
  }
  console.log(query);
  sql.query(query, function(err, res) {
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
  });
};

Makeituser.updatemakeit_user_approval = function(req, result) {

  req.ka_status = parseInt(req.ka_status);
  var appointment_status = req.ka_status === 1 ? 3 : 2;
  sql.query(
    "UPDATE MakeitUser SET appointment_status = '" +
      appointment_status +
      "' ,ka_status = '" +
      req.ka_status +
      "' WHERE userid = ?",
    req.makeit_userid,
    async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        await update_allocation(req.makeit_userid, req.sales_emp_id);

        let message =
          req.ka_status === 1
            ? "Kitchen approved successfully."
            : "Kitchen decline successfully.";
        let resobj = {
          success: true,
          status: true,
          message: message
          //result: res
        };

        result(null, resobj);
      }
    }
  );
};

function update_allocation(makeit_userid, sales_emp_id) {
  sql.query(
    "UPDATE Allocation SET status = 1 WHERE makeit_userid = ? and sales_emp_id = ?",
    [makeit_userid, sales_emp_id],
    function(err, res) {
      if (err) {
        return false;
      } else {
        return true;
      }
    }
  );
}

Makeituser.update_makeit_followup_status = function(
  makeitfollowupstatus,
  result
) {
  sql.query(
    "UPDATE MakeitUser SET appointment_status = ? WHERE makeit_userid = ? ",
    [makeitfollowupstatus.status, makeitfollowupstatus.makeit_userid],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      }
    }
  );
};

//cart details for ear user
Makeituser.read_a_cartdetails_makeitid = async function read_a_cartdetails_makeitid(req,orderitems,isMobile,result) {
  if(constant.zone_control){
    var getzone = await ZoneModel.check_boundaries({lat:req.lat,lon:req.lon});
    var userzoneid = getzone.zone_id;
    var zoneName=getzone.zone_name;
    var distance=0;
  }
  //console.log("122",userzoneid+","+zoneName);
  var tempmessage = "";
  var makeit_error_message = "";
  var coupon__error_message = "";
  var refundcoupon__error_message = "";
  var gst = constant.gst;
  var delivery_charge = constant.deliverycharge;
  const productdetails = [];
  var totalamount = 0;
  var product_orginal_price = 0;
  var amount = 0;
  var refund_coupon_adjustment = 0;
  var coupon_discount_amount = 0;
  var refund_balance = 0;
  var refundlist = [];
  var isAvaliableItem = true;
  var calculationdetails = {};
  var couponstatus = true;
  var refundcouponstatus = true;
  var isAvaliablekitchen = true;
  var makeit_earnings = 0;
  var total_commission_cost  = 0;
  var breatfastcycle = constant.breatfastcycle;
  var dinnercycle = constant.dinnercycle;
  var lunchcycle = constant.lunchcycle;
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  var currenthour  = moment(day).format("HH");
  var productquery="breakfast";
  var convenience_charge = 0;
  var first_tunnel_status = false;
  var product_cost_limit_status = true;
  
  
 
  //  if (currenthour <= 12) {
  //    productquery = " breakfast";
  //  }else
    if(currenthour >= lunchcycle && currenthour < dinnercycle){
    productquery =  "lunch";
    }else if( currenthour >= dinnercycle){
    productquery = "dinner";
    }
  
  var orderlist = await query("Select * From Orders where userid = '" +req.userid +"' and orderstatus >= 6");
  var ordercount = orderlist.length;
  var userdetails = await query("Select * From User where userid = '" +req.userid +"'");

  if (userdetails.length !==0) {   
   // if (userdetails[0].first_tunnel == 0) {
      if (userdetails[0].first_tunnel == 0) {
        first_tunnel_status=true;
      }
 

   

      for (let i = 0; i < orderitems.length; i++) {
        const res1 = await query("Select pt.*,cu.cuisinename From Product pt left join Cuisine cu on cu.cuisineid = pt.cuisine where pt.productid = '" +orderitems[i].productid +"'  ");
      
        if (res1[0].quantity < orderitems[i].quantity) {
          res1[0].availablity = false;
          tempmessage = tempmessage + res1[0].product_name + ",";
          isAvaliableItem = false;
        }else if (res1[0].approved_status != 2) {
          console.log("approved_status");
          res1[0].availablity = false;
          tempmessage = tempmessage + res1[0].product_name + ",";
          isAvaliableItem = false;
        }else if (res1[0].delete_status !=0) {
          console.log("delete_status");
          res1[0].availablity = false;
          tempmessage = tempmessage + res1[0].product_name + ",";
          isAvaliableItem = false;
        }else if (res1[0].active_status != 1) {
          console.log("active_status");
          res1[0].availablity = false;
          tempmessage = tempmessage + res1[0].product_name + ",";
          isAvaliableItem = false;
        }else if (res1[0][productquery] !== 1) {
      
          res1[0].availablity = false;
          tempmessage = tempmessage + res1[0].product_name + ",";
          isAvaliableItem = false;
        }   else {
          res1[0].availablity = true;
        }

        ///get amount each product
        amount = res1[0].price * orderitems[i].quantity;
      
        ///get makeit earning each product
        var order_makeit_earnings = res1[0].original_price * orderitems[i].quantity;
        ///single product commission cost
        var commission_cost = amount - order_makeit_earnings;
        ///get total commission cost
        total_commission_cost = total_commission_cost + commission_cost;
        //console.log(total_commission_cost);    
        // console.log(res1[0].total_commission_cost);
        res1[0].amount = amount;
        res1[0].makeit_earnings = order_makeit_earnings;
        res1[0].cartquantity = orderitems[i].quantity;
        //total product cost
        totalamount = totalamount + amount;
        
        makeit_earnings = makeit_earnings + order_makeit_earnings;
        productdetails.push(res1[0]);
      }
      // console.log(productdetails);
      // This query is to get the makeit details and cuisine details
      var query1 ="Select mk.makeit_type,mk.userid as makeituserid,mk.zone as makeitzone,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.regionid,mk.unservicable,re.regionname,ly.localityname,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid=" +
    req.userid +
    " left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid where mk.userid =" +
    req.makeit_user_id;

      // var query1 = 'call cart_makeituser_details(?,?)';
      sql.query(query1,async function(err,res2) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
         
          if (res2[0].makeituserid === null) {
            let resobj = {
              success: true,
              status: false,
              message: "There is no data available!, Kindly check the Makeituser id"
            };
            result(null, resobj);
          }else{
            if(isMobile){
              // eat delivery avalibility check
              var makeitavailability = await query(
                "Select distinct mk.userid,mk.brandname,mk.unservicable,mk.lat,mk.lon,( 3959 * acos( cos( radians(" +
                req.lat +
                  ") ) * cos( radians( mk.lat ) )  * cos( radians( mk.lon ) - radians(" +
                  req.lon +
                  ") ) + sin( radians(" +
                  req.lat +
                  ") ) * sin(radians(mk.lat)) ) ) AS distance from MakeitUser mk where mk.userid ='" +
                  req.makeit_user_id +
                  "' and mk.appointment_status = 3 and mk.verified_status = 1 and mk.ka_status = 2"
              );
              //  makeitavailability[0].distance = makeitavailability[0].distance * constant.onemile;
              //makeitavailability[0].distance = makeitavailability[0].distance.toFixed(2) ;
           
              distance=makeitavailability[0].distance;   
              var eta = constant.foodpreparationtime + (constant.onekm * makeitavailability[0].distance);        
              if (makeitavailability[0].unservicable == 1) {
                isAvaliablekitchen = false;
              }else{
                if(userzoneid && res2[0].makeitzone && res2[0].makeitzone == userzoneid){
                  isAvaliablekitchen = true;
                }else if (makeitavailability[0].distance > constant.radiuslimit) {
                  isAvaliablekitchen = false;
                  makeit_error_message = makeitavailability[0].brandname;
                }
              } 
              //15min Food Preparation time , 3min 1 km
            }
            res2[0].isAvaliablekitchen = isAvaliablekitchen;
            if (first_tunnel_status ==false) {
              res2[0].first_tunnel = 1;
            }else{

              res2[0].first_tunnel = 0;
            }
            
            for (let i = 0; i < res2.length; i++) {
              if (res2[i].cuisines) {
                res2[i].cuisines = JSON.parse(res2[i].cuisines);
              }
            }
            product_orginal_price = totalamount;


            ///convenience charge algrorithm
            if (constant.convenience_charge_status) {
              if (totalamount < 30) {
                product_cost_limit_status = false;//if false don't show message an eat app
                convenience_charge = 0;
                delivery_charge=0;
              }else if(totalamount >= 30 && totalamount < 40 ) {
                convenience_charge = constant.cart_demand_value - (delivery_charge + totalamount);
            
              }else if(totalamount >= 40 && totalamount < 50){
            
                convenience_charge = 10;
              }else if(totalamount >= 50 && totalamount < 70){
                convenience_charge = 0;
              }else{
                delivery_charge=0;
              }
            }
              
  
              //offer coupon amount detection algorithm
              if (req.cid) {
                var couponlist = await query("Select * From Coupon where cid = '" +req.cid +"' and active_status = 1 and expiry_date >= CURDATE()" );
            
                if (couponlist.length != 0) {
                  var maxdiscount = couponlist[0].maxdiscount;
                  var numberoftimes = couponlist[0].numberoftimes;
                  var discount_percent = couponlist[0].discount_percent;
                  var minprice_limit = couponlist[0].minprice_limit
                  var CouponsUsedlist = await query("Select * From CouponsUsed where cid = '" +req.cid +"' and userid = '" +req.userid +"' and active_status = 1");
                  var couponusedcount = CouponsUsedlist.length;
  
                  if (totalamount >=minprice_limit) {                
                    minprice_limit_status = true
                    if (couponusedcount < numberoftimes) {                
                      var discount_amount = (totalamount / 100) * discount_percent;
                      discount_amount = Math.round(discount_amount);                            
                      if (discount_amount >= maxdiscount) {
                        discount_amount = maxdiscount;
                      }
  
                      if (totalamount >= discount_amount) {                  
                        totalamount = totalamount - discount_amount;
                        coupon_discount_amount = discount_amount;
                      }else{
                        couponstatus = false;
                        coupon__error_message = "coupon amount is too high";
                      }
                    }else{
                      couponstatus = false;
                      coupon__error_message = "coupon has been expired";
                    }
                  }else{
                    couponstatus = false;
                    coupon__error_message = "Product value should be "+ minprice_limit+" to apply this coupons " ;
                  }
                }else{
                  couponstatus = false;
                  coupon__error_message = "Coupon is not available";
                }
              }
            //  var gstcharge = (totalamount / 100) * gst;  // this code commanded due to gst percentage modifications 06/09/2019
            //*this code is commaned due to business  23-09-2019
            // var foodgstcharge = (totalamount / 100) * constant.food_gst;
            // var total_commission_delivery_cost = total_commission_cost + delivery_charge;
            // var food_commission_gst = (total_commission_delivery_cost / 100) * constant.food_commission_cost;
            // var gstcharge = foodgstcharge + food_commission_gst;
            // gstcharge = Math.round(gstcharge);
            // var original_price = gstcharge+product_orginal_price+delivery_charge;
            // var grandtotal = gstcharge+totalamount+delivery_charge;
            //*this code is commaned due to business
  
            //new gst implemented 14-jan-2019
      
           
              var othercharges = delivery_charge + convenience_charge ;
              var home_gst= (othercharges * constant.home_gst)/100;
        
       
              if (res2[0].makeit_type !=0) {
                var cater_gst = (totalamount / 100) * constant.gst;
                var gstcharge= Math.round(home_gst + cater_gst);
             
              }else{
           
                var gstcharge=Math.round(home_gst);
                
              }

           // var gstcharge = (totalamount / 100) * constant.gst;
          //  gstcharge = Math.round(gstcharge);
            var original_price = gstcharge + product_orginal_price + delivery_charge;//this is real amount of this orders
            var grandtotal = gstcharge + totalamount + delivery_charge + convenience_charge;


            
            

  
            //refund coupon amount detection algorithm 
            if (req.rcid) {
              refundlist = await query(
                "Select * From Refund_Coupon where rcid = '" +
                  req.rcid +
                  "' and active_status = 1"
              );
              if (refundlist.length !== 0) {          
                // get refund amount
                if (grandtotal >= refundlist[0].refundamount) {
                  refund_coupon_adjustment = refundlist[0].refundamount;
                } else if (grandtotal < refundlist[0].refundamount) {
                  refund_balance = refundlist[0].refundamount - grandtotal;
                  refund_coupon_adjustment = grandtotal;
                }
      
                //get price
                grandtotal = grandtotal - refundlist[0].refundamount;
                //if grandtotal is lesser then 0 define grandtotal is 0
                if (grandtotal < 0) grandtotal = 0;
                calculationdetails.refundamount = refundlist[0].refundamount;
              }else{
                refundcouponstatus = false;
                refundcoupon__error_message = "refundcoupon is not available";
              }
            }
            
            calculationdetails.grandtotaltitle = "To Pay";
            calculationdetails.grandtotal = grandtotal;
            calculationdetails.original_price = original_price;
            calculationdetails.refund_balance = refund_balance;
            calculationdetails.gstcharge = gstcharge;
            calculationdetails.delivery_charge = delivery_charge;
            calculationdetails.refund_coupon_adjustment = refund_coupon_adjustment;
            calculationdetails.product_orginal_price = product_orginal_price;
            calculationdetails.makeit_earnings = makeit_earnings;
            calculationdetails.totalamount = totalamount;
            calculationdetails.coupon_discount_amount = coupon_discount_amount;
            calculationdetails.total_commission_cost = total_commission_cost;
            calculationdetails.couponstatus = false;
            calculationdetails.refundcouponstatus = false;     
            calculationdetails.convenience_charge = convenience_charge;
            calculationdetails.product_cost_limit_status = product_cost_limit_status;
            calculationdetails.product_cost_limit_message = constant.product_cost_limit_message;
            calculationdetails.product_cost_limit_short_message = constant.product_cost_limit_short_message+constant.minimum_cart_value;
     
  
            if (req.cid && couponstatus) {
              calculationdetails.couponstatus = couponstatus;
              calculationdetails.cid = req.cid;
            }
            if (req.rcid && refundcouponstatus) {
              calculationdetails.refundcouponstatus = refundcouponstatus;
            }
  
            var cartdetails = [];
            var totalamountinfo = {};
            var couponinfo = {};
            var gstinfo = {};
            var deliverychargeinfo = {};
            deliverychargeinfo.low_cost_status=false//show low cost 30
            deliverychargeinfo.default_cost_status = false;//default cost 30
            deliverychargeinfo.infostatus = true;
            deliverychargeinfo.infodetails = [];
            var refundinfo = {};
            var convenience_chargeinfo  = {};
            var other_charges_info = {};
            var convenience_other_charges_info = {};;
            //var grandtotalinfo = {};



            totalamountinfo.title = "Total Amount";
            totalamountinfo.charges = product_orginal_price;
            totalamountinfo.status = true;
            totalamountinfo.infostatus = false;
            totalamountinfo.color_code = "#ff444444";
            totalamountinfo.low_cost_status = false;
            totalamountinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
            totalamountinfo.default_cost=constant.convenience_charge;
            totalamountinfo.default_cost_status=false;
            totalamountinfo.infodetails = [];            
            cartdetails.push(totalamountinfo);
  
            if (req.cid && couponstatus) {
              couponinfo.title = "Discount (-)";
              couponinfo.charges = coupon_discount_amount;
              couponinfo.status = true;
              couponinfo.infostatus = false;
              couponinfo.color_code = "#129612";
              couponinfo.low_cost_status = false;
              couponinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
              couponinfo.default_cost=constant.convenience_charge;
              couponinfo.default_cost_status=false;
              couponinfo.infodetails = [];
              cartdetails.push(couponinfo);
            }
  
            if (gstcharge !==0) {
              gstinfo.title = "Taxes ";//gst modified taxes 13-jan-2020
            gstinfo.charges = gstcharge;
            gstinfo.status = true;
            gstinfo.infostatus = false;
            gstinfo.color_code = "#ff444444";
            gstinfo.low_cost_status = false;
            gstinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
            gstinfo.default_cost=constant.convenience_charge;
            gstinfo.default_cost_status=false;
            gstinfo.infodetails = [];
            cartdetails.push(gstinfo);
            }
            
            
           // tax_charges_info.gstcharge=gstcharge;
            // //this code is modified 23-09-2019
            // if (delivery_charge !==0) {
             
            //   deliverychargeinfo.title = "Handling charge";
            //   deliverychargeinfo.charges = delivery_charge;
            //   deliverychargeinfo.status = true;
            //   cartdetails.push(deliverychargeinfo);
            // }       
  
            //     //this code is modified 23-09-2019
            // if (convenience_charge !==0) {           
            //   convenience_chargeinfo.title = "convenience_charge";
            //   convenience_chargeinfo.charges = convenience_charge;
            //   convenience_chargeinfo.status = true;
            //       cartdetails.push(convenience_chargeinfo);
            // }
  


            //cart changes

             //this code is modified 23-09-2019
             if (constant.convenience_charge_status) {
             if (product_orginal_price >= constant.minimum_cart_value) {             
               deliverychargeinfo.title = "Other charges";
               deliverychargeinfo.charges = delivery_charge + convenience_charge;
               deliverychargeinfo.status = true;
               deliverychargeinfo.infostatus = true;
               deliverychargeinfo.color_code = "#ff444444";

              if (product_orginal_price < constant.cart_demand_value) {
                deliverychargeinfo.low_cost_status = true;//status showing message
              }


              deliverychargeinfo.low_cost_note = "No delivery charges for order values of more than Rs.70";
              if (product_orginal_price >= constant.cart_demand_value) {
                deliverychargeinfo.default_cost_status = true;
                deliverychargeinfo.infostatus = false;
              }

              deliverychargeinfo.default_cost=constant.convenience_charge;
              cartdetails.push(deliverychargeinfo);
             }       
                        
            if (delivery_charge) {      
              other_charges_info.name="Delivery charge";
              other_charges_info.price=delivery_charge;
              deliverychargeinfo.infodetails.push(other_charges_info);
            }
            
            if (convenience_charge) {
              convenience_other_charges_info.name="Convenience charge";
              convenience_other_charges_info.price=convenience_charge; 
              deliverychargeinfo.infodetails.push(convenience_other_charges_info);    
            }
          }
            // if (other_charges_info.delivery_charge || other_charges_info.convenience_charge) {
            //   deliverychargeinfo.infodetails.push(other_charges_info);
            // }
           

            if (req.rcid && refundcouponstatus) {
              refundinfo.title = "Refund adjustment (-)";
              refundinfo.charges = refund_coupon_adjustment;
              refundinfo.status = true;
              refundinfo.infostatus = false;
              refundinfo.low_cost_status = false;
              refundinfo.low_cost_note = "Np delivery charges for order values of more than Rs.70";
              refundinfo.color_code = "#ff444444";
              refundinfo.default_cost=constant.convenience_charge;
              refundinfo.default_cost_status = false;
              cartdetails.push(refundinfo);
            }
  
            // grandtotalinfo.title = "Grand total";
            // grandtotalinfo.grandtotal = grandtotal;
            // grandtotalinfo.status = true;
            // cartdetails.push(grandtotalinfo);        
            res2[0].amountdetails = calculationdetails;
            res2[0].item = productdetails;
            res2[0].ordercount = ordercount;
            res2[0].cartdetails = cartdetails;
            res2[0].first_tunnel = userdetails[0].first_tunnel;
            // res2[0].other_charges_info = other_charges_info;
            // res2[0].tax_charges_info=tax_charges_info;

            let resobj = {
              success: true,
              status: isAvaliableItem,
              zoneId:userzoneid,
              zoneName:zoneName,
              distance:distance,
            };
      
            if(!refundcouponstatus){
              resobj.message = refundcoupon__error_message;
              resobj.status = refundcouponstatus
            }
        
            if(!couponstatus){
              resobj.message = coupon__error_message;
              resobj.status = couponstatus
            }
  
            if (!isAvaliableItem){
              resobj.message = tempmessage.slice(0, -1) + " is not avaliable.Change quantity/product";
              resobj.status = isAvaliableItem
            }
  
            if (!isAvaliablekitchen){
              resobj.message = makeit_error_message.slice(0, -1) + " kitchen service is not available! for your following address";
              resobj.status = isAvaliablekitchen
            }
            if (!product_cost_limit_status){
              resobj.message = constant.product_cost_limit_short_message+constant.minimum_cart_value;
              resobj.status = product_cost_limit_status
            }
  
            resobj.result = res2; 
            result(null, resobj);
            //}
            
        } 
        }
      });
    // }else if (userdetails[0].first_tunnel == 1 || userdetails[0].first_tunnel == 2) { 
    //     console.log("tunnel flow");
    //     for (let i = 0; i < orderitems.length; i++) {
    //       const res1 = await query("Select pt.*,cu.cuisinename From Product pt left join Cuisine cu on cu.cuisineid = pt.cuisine where pt.productid = '" +orderitems[i].productid +"'  ");     
        
    //       res1[0].availablity = true;
    //       ///get amount each product
    //       amount = res1[0].price * orderitems[i].quantity;
    //       ///get makeit earning each product
    //       var order_makeit_earnings = res1[0].original_price * orderitems[i].quantity;
    //       ///single product commission cost
    //       var commission_cost = amount - order_makeit_earnings;
    //       ///get total commission cost
    //       total_commission_cost = total_commission_cost + commission_cost;
    //       //console.log(total_commission_cost);
    //       // console.log(res1[0].total_commission_cost);
    //       res1[0].amount = amount;
    //       res1[0].makeit_earnings = order_makeit_earnings;
    //       res1[0].cartquantity = orderitems[i].quantity;
    //       //total product cost
    //       totalamount = totalamount + amount;
    //       makeit_earnings = makeit_earnings + order_makeit_earnings;
    //       productdetails.push(res1[0]);
    //     }

    //     var query1 =
    //     "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.regionid,mk.unservicable,re.regionname,ly.localityname,mk.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk left join Fav fa on fa.makeit_userid = mk.userid and fa.eatuserid=" +
    //     req.userid +
    //     " left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid where mk.userid =" +
    //     req.makeit_user_id;

    //     // var query1 = 'call cart_makeituser_details(?,?)';

    //     sql.query(query1,async function(err,res2) {
    //       if (err) {
    //         console.log("error: ", err);
    //         result(err, null);
    //       } else {      
    //         res2[0].first_tunnel = 1;
    //         res2[0].isAvaliablekitchen = isAvaliablekitchen;
    //         for (let i = 0; i < res2.length; i++) {
    //           if (res2[i].cuisines) {
    //             res2[i].cuisines = JSON.parse(res2[i].cuisines);
    //           }
    //         }
    //         product_orginal_price = totalamount;
    //         //offer coupon amount detection algorithm
    //         if (req.cid) {
    //           var couponlist = await query("Select * From Coupon where cid = '" +req.cid +"' and active_status = 1 and expiry_date >= CURDATE()");
    //           if (couponlist.length != 0) {       
    //             var maxdiscount = couponlist[0].maxdiscount;
    //             var numberoftimes = couponlist[0].numberoftimes;
    //             var discount_percent = couponlist[0].discount_percent;
    //             var minprice_limit = couponlist[0].minprice_limit
    //             var CouponsUsedlist = await query("Select * From CouponsUsed where cid = '" +req.cid +"' and userid = '" +req.userid +"' and active_status = 1");
    //             var couponusedcount = CouponsUsedlist.length;

    //             if (totalamount >=minprice_limit) {            
    //               minprice_limit_status = true;
    //               if (couponusedcount < numberoftimes) {             
    //                 var discount_amount = (totalamount / 100) * discount_percent;
    //                 discount_amount = Math.round(discount_amount);                         
    //                 if (discount_amount >= maxdiscount) {
    //                   discount_amount = maxdiscount;
    //                 }
    //                 if (totalamount >= discount_amount) {
                     
    //                   totalamount = totalamount - discount_amount;
    //                   coupon_discount_amount = discount_amount;
    //                 }else{
    //                   couponstatus = false;
    //                   coupon__error_message = "coupon amount is too high";
    //                 }
    //               }else{
    //                 couponstatus = false;
    //                 coupon__error_message = "coupon has been expired";
    //               }
    //             }else{
    //               couponstatus = false;
    //               coupon__error_message = "Product value should be "+ minprice_limit+" to apply this coupons " ;
    //             }
    //           }else{
    //             couponstatus = false;
    //             coupon__error_message = "Coupon is not available";
    //           }
    //         }      
            
    //         var gstcharge = (totalamount / 100) * constant.gst;
    //         gstcharge = Math.round(gstcharge);
    //         var original_price = gstcharge + product_orginal_price + delivery_charge;
    //         var grandtotal = gstcharge + totalamount +delivery_charge;
    //         //refund coupon amount detection algorithm           
    //         calculationdetails.grandtotaltitle = "Grand Total";
    //         calculationdetails.grandtotal = grandtotal;
    //         calculationdetails.original_price = original_price;
    //         calculationdetails.refund_balance = refund_balance;
    //         calculationdetails.gstcharge = gstcharge;
    //         calculationdetails.delivery_charge = delivery_charge;
    //         calculationdetails.refund_coupon_adjustment = refund_coupon_adjustment;
    //         calculationdetails.product_orginal_price = product_orginal_price;
    //         calculationdetails.makeit_earnings = makeit_earnings;
    //         calculationdetails.totalamount = totalamount;
    //         calculationdetails.coupon_discount_amount = coupon_discount_amount;
    //         calculationdetails.total_commission_cost = total_commission_cost;
    //         calculationdetails.couponstatus = false;
    //         calculationdetails.refundcouponstatus = false;          

    //         if (req.cid && couponstatus) {
    //           calculationdetails.couponstatus = couponstatus;
    //           calculationdetails.cid = req.cid;
    //         }
    //         // if (req.rcid && refundcouponstatus) {
    //         // calculationdetails.refundcouponstatus = refundcouponstatus;
    //         // }
    //         var cartdetails = [];
    //         var totalamountinfo = {};
    //         var couponinfo = {};
    //         var gstinfo = {};
    //         var deliverychargeinfo = {};
    //         var refundinfo = {};
    //         //var grandtotalinfo = {};

    //         totalamountinfo.title = "Total Amount";
    //         totalamountinfo.charges = product_orginal_price;
    //         totalamountinfo.status = true;
    //         cartdetails.push(totalamountinfo);

    //         if (req.cid && couponstatus) {
    //           couponinfo.title = "Coupon adjustment (-)";
    //           couponinfo.charges = coupon_discount_amount;
    //           couponinfo.status = true;
    //           cartdetails.push(couponinfo);
    //         }

    //         gstinfo.title = "GST ";
    //         gstinfo.charges = gstcharge;
    //         gstinfo.status = true;
    //         cartdetails.push(gstinfo);
              
    //         //this code is modified 23-09-2019
    //         if (delivery_charge !==0) {
    //           deliverychargeinfo.title = "Handling charge";
    //           deliverychargeinfo.charges = delivery_charge;
    //           deliverychargeinfo.status = true;
    //           cartdetails.push(deliverychargeinfo);
    //         }        

    //         // if (req.rcid && refundcouponstatus) {
    //         //   refundinfo.title = "Refund adjustment (-)";
    //         //   refundinfo.charges = refund_coupon_adjustment;
    //         //   refundinfo.status = true;
    //         //   cartdetails.push(refundinfo);
    //         // }
    //         // grandtotalinfo.title = "Grand total";
    //         // grandtotalinfo.grandtotal = grandtotal;
    //         // grandtotalinfo.status = true;
    //         // cartdetails.push(grandtotalinfo);          
    //         res2[0].amountdetails = calculationdetails;
    //         res2[0].item = productdetails;
    //         res2[0].ordercount = ordercount;
    //         res2[0].cartdetails = cartdetails;
            
    //         let resobj = {
    //           success: true,
    //           status: isAvaliableItem
    //         };  
        
    //         if (!couponstatus){
    //           resobj.message = coupon__error_message;
    //           resobj.status = couponstatus
    //         }  
    //         resobj.result = res2; 
    //         result(null, resobj);
    //       // } 
    //     }
    //     });

    // }
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "user is not found"
    };
    result(null, resobj);
  } 
};

Makeituser.admin_check_cartdetails = async function admin_check_cartdetails(req,orderitems,result) {
  var tempmessage = "";
  var gst = constant.gst;
  var delivery_charge = constant.deliverycharge;
  const productdetails = [];
  var totalamount = 0;
  var amount = 0;
  var isAvaliableItem = true;
  var calculationdetails = {};

  for (let i = 0; i < orderitems.length; i++) {
    const res1 = await query(
      "Select * From Product where productid = '" +
        orderitems[i].productid +
        "'"
    );
    if (res1[0].quantity < orderitems[i].quantity) {
      res1[0].availablity = false;
      tempmessage = tempmessage + res1[0].product_name + ",";
      isAvaliableItem = false;
    } else {
      res1[0].availablity = true;
    }
    amount = res1[0].price * orderitems[i].quantity;
    res1[0].amount = amount;
    res1[0].cartquantity = orderitems[i].quantity;
    totalamount = totalamount + amount;
    productdetails.push(res1[0]);
  }
  var query1 =
    "Select mk.userid as makeituserid,mk.name as makeitusername,mk.brandname as makeitbrandname,mk.regionid,re.regionname,ly.localityname,mk.img1 as makeitimg,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename,'cid',cm.cid)) AS cuisines from MakeitUser mk  left join Region re on re.regionid = mk.regionid left join Locality ly on mk.localityid=ly.localityid join Cuisine_makeit cm on cm.makeit_userid=mk.userid  join Cuisine cu on cu.cuisineid=cm.cuisineid where mk.userid =" +
    req.makeit_user_id;

  sql.query(query1, function(err, res1) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      for (let i = 0; i < res1.length; i++) {
        if (res1[i].cuisines) {
          res1[i].cuisines = JSON.parse(res1[i].cuisines);
        }
      }

      if (res1.length !== 0) {
        var gstcharge = (totalamount / 100) * gst;

        gstcharge = Math.round(gstcharge);

        const grandtotal = +gstcharge + +totalamount + +delivery_charge;

        calculationdetails.grandtotal = grandtotal;
        calculationdetails.gstcharge = gstcharge;
        calculationdetails.totalamount = totalamount;
        calculationdetails.delivery_charge = delivery_charge;
        res1[0].amountdetails = calculationdetails;
        res1[0].item = productdetails;
        let resobj = {
          success: true,
          status: isAvaliableItem
        };
        if (!isAvaliableItem)
          resobj.message = tempmessage.slice(0, -1) + " is not avaliable";
        (resobj.result = res1), result(null, resobj);
      } else {
        let sucobj = true;
        let status = false;
        message = "There is no data available!, Kindly check the Makeituser id";
        let resobj = {
          success: sucobj,
          status: status,
          message: message
        };

        result(null, resobj);
      }
    }
  });
};

Makeituser.edit_makeit_users = async function(req, cuisines, isAdmin,result) {
  try {
    //get regionid using homedown id
    if (req.hometownid) {
      const hometown = await query(
        "Select * from Hometown where hometownid=" + req.hometownid
      );
      console.log(hometown);
      req.regionid = hometown[0].regionid;
    }

    //mailid ,password/phone numer can't be edit check validation
    if (req.email || req.password || req.phoneno) {
      let message = "You can't to be Edit email / password/ phoneno";
      let resobj = {
        success: true,
        status: false,
        message: message
      };
      result(null, resobj);
    } else {
      if(isAdmin){
      ZoneModel.check_map_boundaries({lat:req.lat,lon:req.lon},async function(err,zoneres){
        if(err||zoneres.status===false) {
          let resobj = {
            success: true,
            status: false,
            error:err,
            message:"Sorry this makeit loaction not in the inside of the zone location.",
          };
          result(null, resobj);
        }else{
          if(zoneres.status){
            req.zone=zoneres.zone_id;
            Makeituser.update_makeit_user(req,cuisines,result);
          }
        } 
      });
    }else {
      Makeituser.update_makeit_user(req,cuisines,result);
    }
  }
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};

Makeituser.update_makeit_user = async function update_makeit_user(req ,cuisines, result){
    var removecuisines = req.removecuisines || [];
    var removeimages = req.removeimages || [];
    var kitcheninfoimage = req.kitcheninfoimage || [];
    var kitchenmenuimage = req.kitchenmenuimage || [];
    var Specialitiesfood = req.Specialitiesfood || [];
    var Signature = req.Signature || [];
    var badges = req.badges || [];
    var removebadges = req.removebadges || [];
    var cuisinesstatus = false;
    var removecuisinesstatus = false;
    var column = "";
    var editquery = "";

    var staticquery = "UPDATE MakeitUser SET ";
            for (const [key, value] of Object.entries(req)) {
              if (
                key !== "userid" &&
                key !== "cuisines" &&
                key !== "region" &&
                key !== "rating" &&
                key !== "removecuisines" &&
                key !== "kitcheninfoimage" &&
                key !== "kitchenmenuimage" &&
                key !== "Specialitiesfood" &&
                key !== "Signature" &&
                key !== "removeimages" &&
                key !== "badges" &&
                key !== "removebadges"
              ) {
                column = column + key + "='" + value + "',";
              } else if (key === "rating") {
                column = column + key + "= " + value + ",";
              }
            }
            editquery =staticquery + column.slice(0, -1) + " where userid = " + req.userid;
          
            sql.query(editquery, function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(err, null);
              } else {
                if (cuisines !== undefined) {
                  if (cuisines.length !== 0) {
                    cuisinesstatus = true;
                    cuisines_temp = 0;
                    for (let i = 0; i < cuisines.length; i++) {
                      var new_cuisine = new Cusinemakeit(cuisines[i]);
                      new_cuisine.makeit_userid = req.userid;
                      Cusinemakeit.createCusinemakeit(new_cuisine, function(
                        err,
                        res2
                      ) {
                        if (err) {
                          console.log("error: ", err);
                          result(err, null);
                        } else {
                          cuisines_temp++;
                        }
                      });
                    }
                  }
                }

                if (removecuisines.length !== 0) {
                  removecuisinesstatus = true;

                  for (let i = 0; i < removecuisines.length; i++) {
                    var new_cid = removecuisines[i].cid;

                    Cusinemakeit.remove(new_cid, function(err, res3) {
                      if (err) {
                        console.log("error: ", err);
                        result(err, null);
                      } else {
                        // remove_temp++;
                      }
                    });
                  }
                }

                if (removeimages.length !== 0) {
                  removeimagesstatus = true;

                  MakeitImages.remove(removeimages, function(err, res3) {
                    if (err) {
                      console.log("error: ", err);
                      result(err, null);
                    } else {
                      // remove_temp++;
                    }
                  });
                }

                if (removebadges.length !== 0) {
                  removebadgesstatus = true;

                  MakeitBadges.remove(removebadges, function(err, res3) {
                    if (err) {
                      console.log("error: ", err);
                      result(err, null);
                    } else {
                      // remove_temp++;
                    }
                  });
                }

                if (kitcheninfoimage.length !== 0) {
                  kitcheninfoimagestatus = true;

                
                  for (let i = 0; i < kitcheninfoimage.length; i++) {
                    var new_kitcheninfoimage = new MakeitImages(kitcheninfoimage[i]);
                    new_kitcheninfoimage.makeitid = req.userid;
                    MakeitImages.createMakeitImages(new_kitcheninfoimage, function(
                      err,
                      createMakeitImages
                    ) {
                      if (err) {
                        console.log("error: ", err);
                        result(err, null);
                      } else {
                        //cuisines_temp++;
                      }
                    });
                  }
                }

                if (kitchenmenuimage.length !== 0) {
                  kitchenmenuimagestatus = true;

              

                  for (let i = 0; i < kitchenmenuimage.length; i++) {
                    var new_kitchenmenuimage = new MakeitImages(kitchenmenuimage[i]);
                    new_kitchenmenuimage.makeitid = req.userid;
                    MakeitImages.createMakeitImages(new_kitchenmenuimage, function(
                      err,
                      createMakeitImages
                    ) {
                      if (err) {
                        console.log("error: ", err);
                        result(err, null);
                      } else {
                        //cuisines_temp++;
                      }
                    });
                  }
                }

                if (Specialitiesfood.length !== 0) {
                  Specialitiesfoodstatus = true;

                  for (let i = 0; i < Specialitiesfood.length; i++) {
                    var new_Specialitiesfood = new MakeitImages(Specialitiesfood[i]);
                    new_Specialitiesfood.makeitid = req.userid;
                    MakeitImages.createMakeitImages(new_Specialitiesfood, function(
                      err,
                      createMakeitImages
                    ) {
                      if (err) {
                        console.log("error: ", err);
                        result(err, null);
                      } else {
                        //cuisines_temp++;
                      }
                    });
                  }
                }

                if (Signature.length !== 0) {
                  Signaturestatus = true;

                  for (let i = 0; i < Signature.length; i++) {
                    var new_Signature = new MakeitImages(Signature[i]);
                    new_Signature.makeitid = req.userid;
                    MakeitImages.createMakeitImages(new_Signature, function(
                      err,
                      createMakeitImages
                    ) {
                      if (err) {
                        console.log("error: ", err);
                        result(err, null);
                      } else {
                        //cuisines_temp++;
                      }
                    });
                  }
                }

                if (badges.length !== 0) {
                  badgesstatus = true;

                  for (let i = 0; i < badges.length; i++) {
                    var new_badges = new MakeitBadges(badges[i]);
                    new_badges.makeit_id = req.userid;
                    MakeitBadges.createMakeitBadges(new_badges, function(
                      err,
                      createMakeitImages
                    ) {
                      if (err) {
                        console.log("error: ", err);
                        result(err, null);
                      } else {
                        //cuisines_temp++;
                      }
                    });
                  }
                }

                let message = "Updated successfully";

                let resobj = {
                  success: true,
                  status: true,
                  message: message
                };

                result(null, resobj);
              }
            });
}

Makeituser.update_makeit_regionid = async function(req, result) {
  console.log(req);

  const updatestatus = await query(
    "UPDATE MakeitUser SET regionid = '" +
      req.regionid +
      "' WHERE userid = '" +
      req.userid +
      "' "
  );
  // sql.query("UPDATE MakeitUser SET regionid = '"+req.regionid+"' WHERE userid = '"+req.userid+"' ",function(err, res) {
  //     if (err) {
  //       console.log("error: ", err);
  //       result(null, err);
  //     }else{

  let resobj = {
    success: true,
    status: true
  };
  result(null, resobj);
  //     }
  //   }
  // );
};

Makeituser.makeituser_user_referral_code = function makeituser_user_referral_code(req,headers,result) {

 
  sql.query(
    "select referalcode from MakeitUser where userid = '" + req.userid + "'",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        console.log(res[0]);
        if (res[0] === undefined) {
          let message = "User is not available";
          let resobj = {
            success: true,
            status: false,
            message: message
          };

          result(null, resobj);
        } else {

          // makeit_applink: "http://bit.ly/2ZcGL95",
          // makeit_iosapplink: "https://apple.co/2lna3n9",
          // makeit_refferalcontent:"Welcome to EAT. Click the link to download the EAT app from play store"

          if (headers.apptype === '1' || headers.apptype === 1) {
        
            res[0].applink = constant.makeit_refferalcontent+" "+constant.makeit_applink +". Use Refferal Code :"+ res[0].referalcode
           
              
            }else if (headers.apptype === '2' || headers.apptype === 2) {
              res[0].applink = constant.makeit_refferalcontent+" "+constant.makeit_iosapplink +". Use Refferal Code :"+ res[0].referalcode
      
            }else{
              res[0].applink = constant.makeit_refferalcontent+" "+constant.makeit_applink +". Use Refferal Code :"+ res[0].referalcode
            }


          // res[0].applink =
          //   "https://play.google.com/store/apps/details?id=com.eat.makeit&referrer=utm_source%3Dreferral%26utm_medium%3D" +
          //   res[0].referalcode +
          //   "%26utm_campaign%3Dreferral";

          // https://play.google.com/store/apps/details?id=com.tovo.eat&referrer=utm_source%3Dreferral%26utm_medium%3Deat001%26utm_campaign%3Dreferral
          // console.log("TEST: ",  referralcode);

          let resobj = {
            success: true,
            status: true,
            result: res
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.makeit_user_send_otp_byphone = function makeit_user_send_otp_byphone(newUser,result) {
  sql.query("Select * from MakeitUser where phoneno = '" + newUser.phoneno + "'",function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
        if (res1.length == 0) {
          var OTP = Math.floor(Math.random() * 90000) + 10000;

          // var otpurl =
          //   "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
          //   newUser.phoneno +
          //   "&senderId=EATHOM&message=Your EAT App OTP is " +
          //   OTP +
          //   ". Note: Please DO NOT SHARE this OTP with anyone.";

          if (newUser.otpcode) {
            var otpurl =
            "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
            newUser.phoneno +
            "&senderId=EATHOM&message=<%23>Your EAT App OTP is " +
            OTP +
            ". Note: Please DO NOT SHARE this OTP with anyone. " +
            newUser.otpcode +
            " ";
          }else{
        
            var otpurl =
            "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
            newUser.phoneno +
            "&senderId=EATHOM&message=Your EAT App OTP is " +
            OTP +
            ". Note: Please DO NOT SHARE this OTP with anyone. ";
          }
        
          request(
            {
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
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};

Makeituser.makeit_user_otpverification = function makeit_user_otpverification(req,result) {
  var otp = 0;
  var passwordstatus = false;
  var otpstatus = false;
  var genderstatus = false;

  sql.query("Select * from Otp where oid = '" + req.oid + "'", function(err,res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      //  console.log(res[0].otp);
      if (res[0].otp == req.otp) {
        sql.query("Select * from MakeitUser where phoneno = '" + req.phoneno + "'",function(err, res1) {
            if (err) {
              console.log("error: ", err);
              result(err, null);
            } else {
              if (res1.length == 1) {
           

                let resobj = {
                  success: true,
                  status: true,
                  message:  "OTP verified successfully",
                  userid: res1[0].userid
                };

                result(null, resobj);
              } else {
           

                let resobj = {
                  success: true,
                  status: true,
                  message: "OTP verified successfully"
                };

                result(null, resobj);
              }
            }
          }
        );
      } else {
       
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

Makeituser.makeituser_logout = async function makeituser_logout(req,headers, result) { 
  sql.query("select * from MakeitUser where userid = "+req.userid+" ",async function(err,userdetails) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
       
      if (userdetails.length !==0) {

        var orders = await query("select  * from Orders WHERE makeit_user_id  = '"+req.userid+"' and lock_status = 0 and payment_status < 2  and orderstatus < 6 and DATE(created_at) = CURDATE()");
        
        if (orders.length ==0) {
          
          
        var liveproduct = await query("Select * from Product where active_status = 1 and delete_status !=1 and makeit_userid = " +req.userid+"");
        
        
        if (liveproduct.length ==0) {
          if (headers.apptype==1) {
            updatequery = await query("Update MakeitUser set pushid_android = 'null' where userid = '"+req.userid+"'");
          }else{
            updatequery = await query("Update MakeitUser set pushid_ios = 'null' where userid = '"+req.userid+"'");
          }
          
         


          let resobj = {
            success: true,
             status: true,
            // message:mesobj,
            message: 'Logout Successfully!'  
          };
    
          result(null, resobj);
        } else {
          let resobj = {
            success: true,
             status: false,
            // message:mesobj,
            message: 'Sorry you have a liveproduct'  
          };
    
          result(null, resobj);
        }
       

        }else{

          let resobj = {
            success: true,
             status: false,
            // message:mesobj,
            message: 'Sorry you have a order'  
          };
    
          result(null, resobj);

        }
        
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

Makeituser.makeit_user_forgot_password_update = function makeit_user_forgot_password_update(newUser,result) {
  sql.query(
    "UPDATE MakeitUser SET password = '" +
      newUser.password +
      "'  where userid = '" +
      newUser.userid +
      "'",
    function(err, res1) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        let resobj = {
          success: true,
          status: true,
          message: "Password Updated successfully"
        };

        result(null, resobj);
      }
    }
  );
};

Makeituser.makeit_user_forgot_password_send_otp = function makeit_user_forgot_password_send_otp(newUser,result) {
  var OTP = Math.floor(Math.random() * 90000) + 10000;

  if (newUser.otpcode) {
    var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    newUser.phoneno +
    "&senderId=EATHOM&message=<%23>Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone. " +
    newUser.otpcode +
    " ";
  }else{

    var otpurl =
    "https://bulksmsapi.vispl.in/?username=tovootp1&password=tovootp1@123&messageType=text&mobile=" +
    newUser.phoneno +
    "&senderId=EATHOM&message=Your EAT App OTP is " +
    OTP +
    ". Note: Please DO NOT SHARE this OTP with anyone. ";
  }


  request(
    {
      method: "GET",
      rejectUnauthorized: false,
      url: otpurl
    },
    function(error, response, body) {
      if (error) {
        console.log("error: ", err);
        result(null, err);
      } else {
        var responcecode = body.split("#");

        if (responcecode[0] === "0") {
          sql.query(
            "insert into Otp(phone_number,apptype,otp)values('" +
              newUser.phoneno +
              "',4,'" +
              OTP +
              "')",
            function(err, res) {
              if (err) {
                console.log("error: ", err);
                result(null, err);
              } else {
                let resobj = {
                  success: true,
                  status: true,
                  message: responcecode[1],
                  oid: res.insertId
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
};

Makeituser.sum_total_earnings_makeit = async function(makeit_userid, result) {
  
  // var query ="select SUM(makeit_earnings) as earnings from Orders where makeit_user_id = '" +makeit_userid +"' and orderstatus = 6 and payment_status = 1 and lock_status=0";

  // const  res = await query("select SUM(makeit_earnings) as earnings from Orders where makeit_user_id = '" +makeit_userid +"' and orderstatus = 6 and payment_status = 1 and lock_status=0");

  const res = await query(
    "select SUM(makeit_earnings) as earnings from Orders where makeit_user_id = '" +makeit_userid +"' and orderstatus = 6 and payment_status = 1 and lock_status= 0 ");
    
  const res1 = await query(
      "select SUM(makeit_earnings) as earnings,ordertime from Orders where makeit_user_id = '" +
      makeit_userid +
      "' and orderstatus = 6 and payment_status = 1 and lock_status=0 GROUP BY date(ordertime)  order by ordertime desc ");

  const res2 = await query(
      "select SUM(makeit_earnings) AS weeklyearnings , CONCAT(ordertime, '-', ordertime + INTERVAL 7 DAY) AS week FROM Orders where makeit_user_id = '" +
      makeit_userid +
      "' and orderstatus = 6 and payment_status = 1 and lock_status=0 GROUP BY week(ordertime)ORDER BY week(ordertime) desc ");

  const res3 = await query(
      "select count(ordertime) as totalmonth from Orders where  makeit_user_id = '" +
      makeit_userid +
      "' and orderstatus = 6 and payment_status = 1 and lock_status=0 GROUP BY month(ordertime)");
     
      
      if (res[0].earnings === null) {                   
        let resobj = {
          success: true,
          status: false,
          message: "Sorry there is no orders found!",
          result: res
        };

        result(null, resobj);
      } else {
       
        res[0].dayearnings = res1;
        res[0].weekearnings = res2;
        res[0].monthlyaverage = res[0].earnings / res3.length;

        let resobj = {
          success: true,
          status: true,
          message: "Total earnings",
          result: res
        };

        result(null, resobj);
      }      
};

Makeituser.makeit_document_store_by_userid = async function makeit_document_store_by_userid(
  newdocument,
  result
) {
  try {
    temp = 0;
    doclen = newdocument.length;
    if (newdocument) {
      for (let i = 0; i < newdocument.length; i++) {
        const documentstore = await query(
          "insert into Makeit_images (Makeit_images,makeit_userid)values('" +
            newdocument[i].Makeit_images +
            "','" +
            newdocument[i].makeit_userid +
            "')"
        );

        temp++;
      }
    }

    if (temp === doclen) {
      let resobj = {
        success: true,
        status: true,
        message: "Document uploaded succssfully"
      };
      result(null, resobj);
    }
  } catch (error) {
    var errorCode = 402;
    let sucobj = true;
    let status = false;
    let resobj = {
      success: sucobj,
      status: status,
      errorCode: errorCode
    };
    result(null, resobj);
  }
};

Makeituser.update_pushid = function(req, result) {
  var staticquery = "";
  if (req.pushid_android && req.userid) {
    staticquery =
      "UPDATE MakeitUser SET pushid_android ='" +
      req.pushid_android +
      "'   where userid = " +
      req.userid +
      " ";
  } else if (req.pushid_ios && req.userid) {
    staticquery =
      "UPDATE MakeitUser SET pushid_ios ='" +
      req.pushid_ios +
      "'  where userid = " +
      req.userid +
      " ";
  }

  if (staticquery.length === 0) {
  
    let resobj = {
      success: true,
      status: false,
      message: "There no valid data"
    };

    result(null, resobj);
  } else {
    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
       
        let resobj = {
          success: true,
          status: true,
          message: "Updated successfully"
        };

        result(null, resobj);
      }
    });
  }
};

Makeituser.edit_makeit_brand_identity_by_sales = async function(req,cuisines,result) {
  try {
    cuisinesstatus = false;
    removecuisinesstatus = false;
    var column = "";
    var editquery = "";

    if (req.hometownid) {
      const hometown = await query(
        "Select * from Hometown where hometownid=" + req.hometownid
      );

      req.regionid = hometown[0].regionid;
    }

    if (req.email || req.password || req.phoneno) {
      
      let resobj = {
        success: true,
        status :false,
        message: "You can't to be Edit email / password/ phoneno"
      };
      result(null, resobj);
    } else {
      staticquery = "UPDATE MakeitUser SET ";
      for (const [key, value] of Object.entries(req)) {
        if (
          key !== "makeit_userid" &&
          key !== "cuisines" &&
          key !== "region" &&
          key !== "rating" &&
          key !== "removecuisines"&&
          key !== "userid"
        ) {
          column = column + key + "='" + value + "',";
        } else if (key === "rating") {
          column = column + key + "= " + value + ",";
        }
      }

      editquery =
        staticquery +
        column.slice(0, -1) +
        " where userid = " +
        req.makeit_userid;

      sql.query(editquery, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
          if (cuisines !== undefined) {
            if (cuisines.length !== 0) {
              cuisinesstatus = true;
              cuisines_temp = 0;
              for (let i = 0; i < cuisines.length; i++) {
                var new_cuisine = new Cusinemakeit(cuisines[i]);
                new_cuisine.makeit_userid = req.makeit_userid;
                Cusinemakeit.createCusinemakeit(new_cuisine, function(
                  err,
                  res2
                ) {
                  if (err) {
                    console.log("error: ", err);
                    result(err, null);
                  } else {
                    cuisines_temp++;
                  }
                });
              }
            }
          }

        
          let resobj = {
            success: true,
            status: true,
            message: "Updated successfully"
          };

          result(null, resobj);
        }
      });
    }
  } catch (error) {;
    let resobj = {
      success: true,
      status: false,
      message: error
    };
    result(null, resobj);
  }
};

Makeituser.admin_list_all_badges = function(req, result) {
  var query = "select * from Makeit_badges ";
  
 // console.log(query);
  sql.query(query, function(err, res) {
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
  });
};

Makeituser.makeit_app_version_check_vid= async function makeit_app_version_check_vid(req,result) { 
 
  var updatestatus = {};
  var versionstatus = false;
  var makeitforceupdatestatus =false;

  if (req.makeitversioncode < constant.makeitversionforceupdate) {
      
      versionstatus = true;
      makeitforceupdatestatus = true;

  }else if(req.makeitversioncode < constant.makeitversioncodenew){

    versionstatus = true;
    makeitforceupdatestatus = false;

  }else{
    versionstatus = false;
    makeitforceupdatestatus = false;
  }


  updatestatus.versionstatus = versionstatus;
  updatestatus.makeitforceupdatestatus = makeitforceupdatestatus;

      let resobj = {
          success: true,
          status:true,
          result:updatestatus
      };

      result(null, resobj);


};


Makeituser.admin_makeit_serviceable_status = function admin_makeit_serviceable_status(req,result) {

  sql.query("select unservicable from MakeitUser where userid = " + req.userid + " ",async function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
      
        if (res[0] === undefined) {
   
          let resobj = {
            success: true,
            status: false,
            message: "User is not available"
          };

          result(null, resobj);
        } else {
        
          var updatequery = await query("UPDATE MakeitUser SET unservicable = "+req.unservicable+"  where userid = " +req.userid+" ");

       
         if (req.unservicable == 0) {
         message = "Kitchen is servicable";
         }else if( req.unservicable == 1){
          message = "Kitchen is un-servicable";
         }


          let resobj = {
            success: true,
            status: true,
            message: message
          };

          result(null, resobj);
        }
      }
    }
  );
};


Makeituser.makeit_online_status_byid= async function makeit_online_status_byid(req,result) { 
 
  var Makeitstatus = await query("select userid,login_status,pushid_ios,pushid_android  from MakeitUser where userid = "+req.userid+" ");
 
     if (Moveitstatus.length !==0) {
       let resobj = {
         success: true,
         status:true,
         result:Makeitstatus
     };
 
     result(null, resobj);
 
     }else{
       let resobj = {
         success: true,
         status: false,
         result:Makeitstatus
     };
 
     result(null, resobj);
     }
        
   
};

Makeituser.makeituser_appointments_rescheduled= async function makeituser_appointments_rescheduled(req,result) { 
 
  var Allocationdetails = await query("select * from Allocation where aid = "+req.aid+" ");
     if (Allocationdetails.length !==0){
      var Updatedetails = await query("Update Allocation set booking_date_time= '"+req.booking_date_time+"' where aid = "+req.aid+" ");
       let resobj = {
         success: true,
         status: true,
         message:"Appointment updated successfully"
     };
     result(null, resobj);
     }else{
       let resobj = {
         success: true,
         status: false,
         message:"Appoinment not available!"

     };
 
     result(null, resobj);
     }
};

Makeituser.makeituser_appointments_cancel= async function makeituser_appointments_cancel(req,result) { 
 
  req.cancelled_reason = req.cancelled_reason || null;

  var Allocationdetails = await query("select * from Allocation where aid = "+req.aid+" ");
 
     if (Allocationdetails.length !==0) {

      var Updatedetails = await query("Update Allocation set status= '"+req.status+"',cancelled_reason= '"+req.cancelled_reason+"' where aid = "+req.aid+" ");

       let resobj = {
         success: true,
         status: true,
         message:"Appoinment cancel successfully"
     };
     result(null, resobj);
     }else{
       let resobj = {
         success: true,
         status: false,
         message:"Appoinment not available!"

     };
     result(null, resobj);
     }
};

//Makeit Customer Support
Makeituser.makeit_app_customer_support= async function makeit_app_customer_support(req,result) { 
   let resobj = {
      success: true,
      status:true,
      customer_support : constant.makeit_customer_support
  };
  result(null, resobj);
};

//Get Live Product Status Based on the Makeit
Makeituser.makeit_liveproduct_status= async function makeit_liveproduct_status(req,result) {
  if(req.makeit_id){
    var getmaxquantity = await query("select lph.makeit_id,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id where date(lph.created_at)=CURDATE()and lph.makeit_id="+req.makeit_id+" group by lph.product_id order by lph.product_id ASC");
  
    var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)=CURDATE() and ord.orderstatus<=6 and ord.payment_status<2 and ord.makeit_user_id="+req.makeit_id+" group by oi.productid order by oi.productid ASC");
    
    if(getmaxquantity.length !=0){
      var product_count = 0;
      for(var i=0; i<getmaxquantity.length; i++){
        product_count = parseInt(product_count) + parseInt(getmaxquantity[i].total_quantity);
        for(var j=0; j<getsoldquantity.length; j++){
          if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
            ////Set Soldout Quantity
            getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
            ////Calculation For Product Percentage
            getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100).toFixed(2);
          }
        }
      }
      let resobj = {
        success: true,
        message: "Success",
        product_count: product_count,
        status : true,
        result : getmaxquantity
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
      message: "Invalid Makeit_id",
      status : false
    };
    result(null, resobj);
  }
};

//Get Live Product Status Based on the Kitchen 
Makeituser.kitchen_liveproduct_status= async function kitchen_liveproduct_status(req,result) {
  if(req.makeit_id){
    var getmaxquantity = await query("select lph.makeit_id,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage,0 as kitchen_product_count_percentage,0 as kitchen_product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id where date(lph.created_at)=CURDATE() and lph.makeit_id="+req.makeit_id+" group by lph.product_id order by lph.product_id ASC");
  
    var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)=CURDATE() and ord.orderstatus<=6 and ord.payment_status<2 and ord.makeit_user_id="+req.makeit_id+" group by oi.productid order by oi.productid ASC");
    //result(null, getsoldquantity);
    var product_count = 0;
    var kitchen_percentage = 0;
    if(getmaxquantity.length !=0){
      ////Calculation For Product Count
      
      for(var i=0; i<getmaxquantity.length; i++){
        var quantity=getmaxquantity[i].total_quantity|| 0;
        product_count = parseInt(product_count) + parseInt(quantity);
      }

      for(var i=0; i<getmaxquantity.length; i++){
        for(var j=0; j<getsoldquantity.length; j++){
          if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
            ////Set Soldout Quantity
            getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
            ////Calculation For Product Percentage
            getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100);
            ////Calculation For Kitchen Product Percentage
            getmaxquantity[i].kitchen_product_count_percentage = ((getmaxquantity[i].total_quantity/product_count)*100);
            ////Calculation For Kitchen Percentage
            getmaxquantity[i].kitchen_product_percentage = (getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
            ////Calcualtion For kitchen percentage
            kitchen_percentage = kitchen_percentage+(getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
          }
        }
      }
      let resobj = {
        success: true,
        status : true,
        product_count: product_count,
        kitchen_percentage: kitchen_percentage.toFixed(2) || 0,
        result : getmaxquantity
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
      message: "Invalid Makeit_id",
      status : false
    };
    result(null, resobj);
  }
};

//Makeit List with  Live Product Status Based on the Kitchen
Makeituser.get_admin_list_all_makeitusers_percentage = function(req, result) {
  var kitchenlimit = 10;
  var page = req.page || 1;
  var startlimit = (page - 1) * kitchenlimit;
  

  req.appointment_status = req.appointment_status || "all";
  req.virtualkey = req.virtualkey;

  var query = "select mk.* from MakeitUser mk ";
  var searchquery = "(mk.name LIKE  '%" + req.search + "%' or mk.brandname LIKE  '%" + req.search + "%' or mk.userid LIKE  '%" + req.search + "%')";

  if(req.active_status){
    query = query + " LEFT JOIN Product p on p.makeit_userid=mk.userid where p.active_status=1" ;
  }

  if(query.toLowerCase().includes('where')) query = query +" and  mk.delete_status!=1"
  else query = query +" where  mk.delete_status!=1"

  if(req.appointment_status!=="all"){
    if(query.toLowerCase().includes('where')) query =query +" and mk.appointment_status  = '" + req.appointment_status+"'"
    else query =query +" where mk.appointment_status  = '" + req.appointment_status+"'"
  }

  if(req.virtualkey!=="all"){
    if(query.toLowerCase().includes('where'))
    query =query +" and mk.virtualkey  = '" + req.virtualkey+"'"
    else query =query +" where mk.virtualkey  = '" + req.virtualkey+"'"
  }

  if(req.search){
    if(query.toLowerCase().includes('where'))
    query =query +" and "+searchquery
    else query =query +" where "+searchquery
  }

  if(req.active_status){
    query = query + " group by userid";
  }

  limitquery = query +" order by userid ASC limit " +startlimit +"," +kitchenlimit;
  console.log("error: ", limitquery);
  sql.query(limitquery, async function(err, res) {
    if (err) {
      //console.log("error: ", err);
      result(null, err);
    } else {
      ////Get Kitchen Percentage////////
      for(var i=0; i<res.length; i++){
        res[i].makeit_id=res[i].userid;
        await Makeituser.kitchen_liveproduct_status(res[i],function(err,percentage){
          console.log(percentage)
          res[i].kitchen_percentage=percentage.kitchen_percentage || 0;
        });
      }
      //////////////////////////////////
      var totalcount = 0;
      sql.query(query, function(err, res1) {
        totalcount = res1.length;
        let resobj = {
          success: true,
          status:true,
          kitchenlimit:kitchenlimit,
          totalkitchencount: totalcount,
          result: res
        };
        result(null, resobj);
      });
    }
  });
};

//Report For Makeit List with  Live Product Status Based on the Kitchen
Makeituser.get_admin_list_all_makeitusers_percentage_report = function(req, result) {
  //req.appointment_status
  //req.active_status
  var virtualkey = req.virtualkey || 0;
  if(req.date){
    var query = "select mk.userid,mk.name,mk.brandname from MakeitUser mk LEFT JOIN Orders ord on ord.makeit_user_id=mk.userid where date(ord.created_at)='"+req.date+"' and mk.virtualkey  ="+ virtualkey+" group by mk.userid";

    sql.query(query, async function(err, res) {
      if (err) {
        //console.log("error: ", err);
        result(null, err);
      } else {
        ////Get Kitchen Percentage////////
        for(var i=0; i<res.length; i++){
          res[i].makeit_id=res[i].userid;
          res[i].date=req.date;
          await Makeituser.kitchen_liveproduct_status_report(res[i],function(err,percentage){
            percentage.kitchen_percentage=percentage.kitchen_percentage==="0.00"||percentage.kitchen_percentage==='NaN'?0:percentage.kitchen_percentage;
            res[i].kitchen_percentage=percentage.kitchen_percentage || 0;
          });
        }
        res.sort(
          (a, b) => parseFloat(b.kitchen_percentage) - parseFloat(a.kitchen_percentage)
        );
        //////////////////////////////////
        var totalcount = 0;
        sql.query(query, function(err, res1) {
          totalcount = res1.length;
          let resobj = {
            success: true,
            status:true,
            totalkitchencount: totalcount,
            result: res
          };
          result(null, resobj);
        });
      }
    });
  }else{
    let resobj = {
      success: true,
      message: "Sorry! no data found.",
      status : false
    };
    result(null, resobj);
  }
};

//Report For Get Live Product Status Based on the Kitchen 
Makeituser.kitchen_liveproduct_status_report= async function kitchen_liveproduct_status_report(req,result) {
  if(req.makeit_id && req.date){
    var getmaxquantity = await query("select lph.makeit_id,mu.name,mu.brandname,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage,0 as kitchen_product_count_percentage,0 as kitchen_product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id left join MakeitUser as mu on mu.userid=lph.makeit_id where date(lph.created_at)='"+req.date+"' and lph.makeit_id="+req.makeit_id+" group by lph.product_id order by lph.product_id ASC");
  
    var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)='"+req.date+"' and ord.orderstatus<=6 and ord.payment_status<2 and ord.makeit_user_id="+req.makeit_id+" group by oi.productid order by oi.productid ASC");
    //result(null, getsoldquantity);
    var product_count = 0;
    var kitchen_percentage = 0;
    if(getmaxquantity.length !=0){
      ////Calculation For Product Count
      
      for(var i=0; i<getmaxquantity.length; i++){
        var quantity=getmaxquantity[i].total_quantity|| 0;
        product_count = parseInt(product_count) + parseInt(quantity);
      }

      for(var i=0; i<getmaxquantity.length; i++){
        for(var j=0; j<getsoldquantity.length; j++){
          if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
            ////Set Soldout Quantity
            getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
            ////Calculation For Product Percentage
            getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100);
            ////Calculation For Kitchen Product Percentage
            getmaxquantity[i].kitchen_product_count_percentage = ((getmaxquantity[i].total_quantity/product_count)*100);
            ////Calculation For Kitchen Percentage
            getmaxquantity[i].kitchen_product_percentage = (getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
            ////Calcualtion For kitchen percentage
            kitchen_percentage = kitchen_percentage+(getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
          }
        }
      }
      getmaxquantity.sort(
        (a, b) => parseFloat(b.kitchen_product_percentage) - parseFloat(a.kitchen_product_percentage)
      );
      let resobj = {
        success: true,
        status : true,
        product_count: product_count,
        kitchen_percentage: kitchen_percentage.toFixed(2) || 0,
        result : getmaxquantity
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
      message: "Invalid Makeit_id and date",
      status : false
    };
    result(null, resobj);
  }
};

////Weekly Makeit Earnings/////////////
Makeituser.makeit_weekly_earnings= async function makeit_weekly_earnings(req,result) {
  //console.log(req);
  /////////////////////////////////////
  var FromDate    = new Date(req.fromdate);
  var ToDate      = new Date(req.todate);
  var CurrentDate = new Date();
  var timeDiff    = ToDate-FromDate;
  var daysDiff    = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  var makeit_incentives = 0;
  var incentive_status = false;

  if(req.makeit_id && req.fromdate && req.todate){
    /////Get First Order Date
    var getfirstmakeitorder = await query("select orderid,date(created_at) as firstorder from Orders where makeit_user_id="+req.makeit_id+" order by orderid asc");
    var FirstOrder = new Date(getfirstmakeitorder[0].firstorder);
    if(((FromDate < CurrentDate) && (ToDate < CurrentDate)) && (parseInt(daysDiff) <=7) && ((FromDate >= FirstOrder) && (ToDate >= FirstOrder))){
      var getweeklyearnings = await query("select ordertime,IFNULL(SUM(makeit_earnings),0) as makeit_earnings,COUNT(orderid) as ordercount,userid,makeit_user_id from Orders where date(ordertime) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"' and makeit_user_id="+req.makeit_id+" and orderstatus=6 and payment_status=1 and lock_status=0 group by date(ordertime) order by ordertime desc");

      var get_incentives = await query("select makeit_id,incentive_amount as incentive_amount from Makeit_incentive where date(from_date)='"+req.fromdate+"' AND date(to_date)='"+req.todate+"' and makeit_id="+req.makeit_id+" ");

      if (get_incentives.length !=0) {
        if (get_incentives[0].incentive_amount !=null && get_incentives[0].incentive_amount !=0) {
          incentive_status = true;
          makeit_incentives = get_incentives[0].incentive_amount;
        }       
      }
      
      var Newarray = [];      
        if(getweeklyearnings.length>0){
          var weekly_earnings=0;
          for(var i=0; i<getweeklyearnings.length; i++){
            weekly_earnings = weekly_earnings+getweeklyearnings[i].makeit_earnings;
            if(getweeklyearnings[i].makeit_earnings){
              Newarray.push(getweeklyearnings[i]);
            }
          }
          if(weekly_earnings==0){
            let resobj = {
              success: true,
              status : true,
              First_Order_date:getfirstmakeitorder[0].firstorder,
              weekly_earnings:weekly_earnings,
              makeit_incentives:makeit_incentives ,
              incentive_status:incentive_status,
              message : "Sorry! no data found"
            };
            result(null, resobj);
          }else{
            let resobj = {
              success: true,
              status : true,
              First_Order_date:getfirstmakeitorder[0].firstorder,
              weekly_earnings:weekly_earnings,
              makeit_incentives:makeit_incentives ,
              incentive_status:incentive_status,
              result : Newarray
            };
            result(null, resobj);
          }
          
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
          message: "Invalid Date Range",
          status : false
        };
        result(null, resobj);
      }
  }else{
    let resobj = {
      success: true,
      message: "Invalid post values",
      status : false
    };
    result(null, resobj);
  }
};

////Daywise Makeit Earnings/////////////
Makeituser.makeit_daywise_earnings= async function makeit_daywise_earnings(req,result) {
  if(req.makeit_id && req.date){
    var getdaywiseearnings = await query("Select o.orderid,o.makeit_earnings,ma.brandname,GROUP_CONCAT(p.product_name,' - ',oi.quantity SEPARATOR ',') as product,o.created_at,o.orderstatus from Orders as o left join OrderItem as oi on o.orderid=oi.orderid left join Product as p on p.productid = oi.productid left join MakeitUser as ma on o.makeit_user_id=ma.userid where o.orderstatus=6 and o.makeit_user_id="+req.makeit_id+" and Date(o.created_at)='"+req.date+"' and o.payment_status=1 GROUP BY o.orderid");
    if(getdaywiseearnings.length>0){
      let resobj = {
        success: true,
        status : true,
        result : getdaywiseearnings
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
      message: "Invalid post values",
      status : false
    };
    result(null, resobj);
  }
};

////Get First Order/////////////
Makeituser.makeit_get_firstorder= async function makeit_get_firstorder(req,result) {
    var getfirstmakeitorder = await query("select orderid,date(created_at) as firstorder from Orders where makeit_user_id="+req.makeit_userid+" order by orderid asc LIMIT 1");
    if(getfirstmakeitorder.length>0){
      let resobj = {
        success: true,
        status : true,
        First_Order_date : getfirstmakeitorder[0].firstorder,
        result : getfirstmakeitorder
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

////make-it assign zone id/////////////
Makeituser.makeit_zoneid_update= async function makeit_zoneid_update(req,result) {
    var makeit_latlng = await query("select * from MakeitUser where userid ="+req.userid);
    if(makeit_latlng.length>0){
      var latlng={lat:makeit_latlng[0].lat,lon:makeit_latlng[0].lon}
      ZoneModel.check_map_boundaries(latlng,async function(err,res){
        if(err||res.status===false) {
          let resobj = {
            success: true,
            status : false,
            message: "Zone update not successfully",
          };
          result(null, resobj);
        }else{
          if(res.status){
            var Updatedetails = await query("Update MakeitUser set zone= '"+res.zone_id+"' where userid ="+req.userid);
            let resobj = {
              success: true,
              status : true,
              message: "Zone update successfully",
            };
            result(null, resobj);
          }
          
        }
      })
      
    }else{
      let resobj = {
        success: true,
        message: "Zone update not successfully",
        status : false
      };
      result(null, resobj);
    }
};

//Get Live Product Status Based on the Kitchen 
Makeituser.kitchen_liveproduct_status_kpi= async function kitchen_liveproduct_status_kpi(req, date, result) {
  if(req.makeit_id){
    var getmaxquantity = await query("select lph.makeit_id,lph.product_id,p.product_name,MAX(lph.actual_quantity+lph.pending_quantity+lph.ordered_quantity) as total_quantity, 0 as sold_quantity,0 as product_percentage,0 as kitchen_product_count_percentage,0 as kitchen_product_percentage from Live_Product_History lph left join Product as p on p.productid=lph.product_id where date(lph.created_at)=CURDATE() and lph.makeit_id="+req.makeit_id+" group by lph.product_id order by lph.product_id ASC");
  
    var getsoldquantity = await query("select ord.makeit_user_id,oi.productid, SUM(oi.quantity) as sold_quantity from OrderItem as oi left join Orders ord on ord.orderid= oi.orderid where date(oi.created_at)=CURDATE() and ord.orderstatus<=6 and ord.payment_status<2 and ord.makeit_user_id="+req.makeit_id+" group by oi.productid order by oi.productid ASC");
    //result(null, getsoldquantity);
    var product_count = 0;
    var kitchen_percentage = 0;
    if(getmaxquantity.length !=0){
      ////Calculation For Product Count
      
      for(var i=0; i<getmaxquantity.length; i++){
        var quantity=getmaxquantity[i].total_quantity|| 0;
        product_count = parseInt(product_count) + parseInt(quantity);
      }

      for(var i=0; i<getmaxquantity.length; i++){
        for(var j=0; j<getsoldquantity.length; j++){
          if(getmaxquantity[i].product_id==getsoldquantity[j].productid){
            ////Set Soldout Quantity
            getmaxquantity[i].sold_quantity = getsoldquantity[j].sold_quantity;
            ////Calculation For Product Percentage
            getmaxquantity[i].product_percentage = ((getmaxquantity[i].sold_quantity/getmaxquantity[i].total_quantity)*100);
            ////Calculation For Kitchen Product Percentage
            getmaxquantity[i].kitchen_product_count_percentage = ((getmaxquantity[i].total_quantity/product_count)*100);
            ////Calculation For Kitchen Percentage
            getmaxquantity[i].kitchen_product_percentage = (getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
            ////Calcualtion For kitchen percentage
            kitchen_percentage = kitchen_percentage+(getmaxquantity[i].product_percentage*(getmaxquantity[i].kitchen_product_count_percentage/100));
          }
        }
      }
      let resobj = {
        success: true,
        status : true,
        product_count: product_count,
        kitchen_percentage: kitchen_percentage.toFixed(2) || 0,
        result : getmaxquantity
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
      message: "Invalid Makeit_id",
      status : false
    };
    result(null, resobj);
  }
};

////Home Successtion rate KPI Dashboard////
Makeituser.homesuccesstionrate_report = async function(req, result) {
  var makeit = await query("select DISTINCT lph.makeit_id,if(mu.virtualkey=1,'virtual','real') as Kitchen_type,mu.brandname from Live_Product_History as lph left join MakeitUser as mu on mu.userid = lph.makeit_id where date(lph.created_at)=CURDATE() ");
    if(makeit.length>0){
      ////Get Kitchen Percentage////////
      for(var i=0; i<makeit.length; i++){
        makeit[i].makeit_id=makeit[i].makeit_id;
        await Makeituser.kitchen_liveproduct_status_kpi(makeit[i],req.date,function(err,percentage){
          makeit[i].kitchen_percentage=percentage.kitchen_percentage || 0;
        });
      }
      //////////////////////////////////
      result(null, makeit);      
    }else{
      result(null, makeit);
    }
};

//// Moveit Avg First and Last Miles/////
Makeituser.moveitavgfirstandlastmile_report= async function moveitavgfirstandlastmile_report(req, result) {  
  var query="Select date(ord.ordertime) as date,ord.moveit_user_id,mu.name,count(ord.orderid)as order_count, SEC_TO_TIME(AVG(TIME_TO_SEC(TIMEDIFF(moveit_reached_time,moveit_accept_time)))) as first_mile, SEC_TO_TIME(AVG(TIME_TO_SEC(TimeDiff(moveit_actual_delivered_time,moveit_pickup_time)))) as second_mile, SEC_TO_TIME(AVG(TIME_TO_SEC(ADDTIME(TIMEDIFF(moveit_reached_time,moveit_accept_time),TimeDiff(moveit_actual_delivered_time,moveit_pickup_time))))) as Avg_time from Orders as ord left join MoveitUser as mu on mu.userid = ord.moveit_user_id where ord.moveit_user_id !=0 and ord.moveit_accept_time IS NOT NULL and ord.moveit_reached_time IS NOT NULL and ord.moveit_actual_delivered_time IS NOT NULL and ord.moveit_pickup_time IS NOT NULL and ord.orderid NOT IN (select orderid from Force_delivery_logs) and ord.orderstatus=6 and Date(ord.created_at) BETWEEN CURDATE()-6 AND  CURDATE() group by mu.userid,date(ord.ordertime) order by date(ord.ordertime),ord.moveit_user_id";
  //console.log("query-->",query);
  sql.query(query,async function(err, res) {
      if (err) {
        result(err, null);
      } else {        
        result(null, res);
      }
    }
  );
};


////Get Package Makeit User/////////////
Makeituser.get_makeit_package_user=  function get_makeit_package_user(req,result) {
    var getmakeituser ="select userid,brandname,makeit_type from MakeitUser where ka_status=2 and virtualkey=0";
    sql.query(getmakeituser, async function(err, res) {
      if(err){
        result(null, err);
      }else{
        let resobj = {
          success: true,
          status : true,
          result : res
        };
        result(null, resobj);
      }
    });
};

////Get Package Makeit User/////////////
Makeituser.makeit_delete= async function makeit_delete(req,result) {
  var makeit = await query("select * from Product where active_status = 1 and makeit_userid="+req.userid);
  if(makeit.length===0){
    var deleteMakeit ="Update MakeitUser set delete_status=1 where userid="+req.userid;
    sql.query(deleteMakeit, async function(err, res) {
      if(err){
        result(null, err);
      }else{
        let resobj = {
          success: true,
          status : true,
        };
        result(null, resobj);
      }
    });
  }else{
    let resobj = {
      success: true,
      status : false,
      message : "First remove the live products, after try again."
    };
    result(null, resobj);
  }
  
};

////Makeit Earnings report/////////////
Makeituser.makeit_earnings_report= async function makeit_earnings_report(req,result) {
  var date = new Date();
  if(req.monthandyear){
    date=new Date(req.monthandyear+" 04");
  }
  var curr_date = date.getDate();
  var curr_month = date.getMonth()+1;
  var curr_year = date.getFullYear();
  var reqDate =curr_year+"-"+curr_month+"-"+curr_date;
  reqDate=reqDate.toString();
  
  var makeit = "Select DATE_FORMAT(o.created_at,'%M %Y') as monthandyear ,mu.userid as kitchen_id,mu.brandname as kitchen_name,SUM(o.makeit_earnings) as MakeitEarnings,SUM(if(o.orderstatus=6,o.makeit_earnings,0)) as MakeitEarnings_Success_orders,SUM(if(o.orderstatus=7,o.makeit_earnings,0)) as MakeitEarnings_preparing_after_cancel from Orders as o join MakeitUser as mu on  mu.userid=o.makeit_user_id where MONTH(o.created_at) = MONTH('"+reqDate+"') AND YEAR(o.created_at) = YEAR('"+reqDate+"') and (o.orderstatus=6 or (o.orderstatus=7 and o.makeit_actual_preparing_time IS Not NULL))";

  if(req.virtualkey==0 || req.virtualkey==1){
    makeit=makeit +" and mu.virtualkey= "+req.virtualkey
  }

  makeit=makeit + ' group by o.makeit_user_id order by MakeitEarnings';

  sql.query(makeit, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      let resobj = {
        success: true,
        status : true,
        result : res
      };
      result(null, resobj);
    }
  });
  
};


////Makeit Cancellation report/////////////
Makeituser.makeit_cancellation_report= async function makeit_cancellation_report(req,result) {
  var curDate=new Date();
  curDate.setDate(curDate.getDate()-7);
  var todate =moment().format("YYYY-MM-DD");
  var fromdate=moment(curDate).format("YYYY-MM-DD");

  if(req.fromdate) fromdate=req.fromdate;
  if(req.todate) todate=req.todate;

  console.log(fromdate+","+todate);

  var makeit = "Select o.makeit_user_id,mu.brandname,count(orderid) as total_cancel_order_count from Orders as o join MakeitUser as mu on mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+fromdate+"' AND  '"+todate+"') and (o.orderstatus=7) and o.cancel_by=2";
  if(req.virtualkey==0 || req.virtualkey==1){
    makeit=makeit +" and mu.virtualkey= "+req.virtualkey
  }
  makeit=makeit + ' group by o.makeit_user_id order by total_cancel_order_count';

  sql.query(makeit, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      let resobj = {
        success: true,
        status : true,
        result : res
      };
      result(null, resobj);
    }
  });
};

////Makeit avg preparation report/////////////
Makeituser.makeit_avg_preparation_report= async function makeit_avg_preparation_report(req,result) {
  var curDate=new Date();
  curDate.setDate(curDate.getDate()-7);
  var todate =moment().format("YYYY-MM-DD");
  var fromdate=moment(curDate).format("YYYY-MM-DD");

  if(req.fromdate) fromdate=req.fromdate;
  if(req.todate) todate=req.todate;
  
  console.log(fromdate+","+todate);

  var makeit = "Select o.makeit_user_id,mu.brandname,count(*) as total_orders,sum(if(o.orderstatus=6,1,0)) as success_orders_count,sum(if(o.orderstatus!=6,1,0)) as cancel_orders_count,TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))), '%T') as success_order_preparation_time, TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))/sum(if(o.orderstatus=6,1,0))), '%T') as success_order_avg_preparation_time, TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus!=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))), '%T') as cancel_order_preparation_time,TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus!=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))/sum(if(o.orderstatus!=6,1,0))), '%T') as cancel_order_avg_preparation_time from Orders as o join MakeitUser as mu on mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+fromdate+"' AND  '"+todate+"') and o.makeit_actual_preparing_time is Not NULL";
  
  if(req.virtualkey==0 || req.virtualkey==1){
    makeit=makeit +" and mu.virtualkey= "+req.virtualkey
  }
  makeit=makeit + ' group by o.makeit_user_id order by o.makeit_user_id';

  sql.query(makeit, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      let resobj = {
        success: true,
        status : true,
        result : res
      };
      result(null, resobj);
    }
  });
    
  
};


////Get Quantity Check /////////////
Makeituser.makeit_quantity_check = async function makeit_quantity_check(req,result) {

        var breatfastcycle = constant.breatfastcycle;
        var dinnercycle = constant.dinnercycle;
        var lunchcycle = constant.lunchcycle;                              
        var day = moment().format("YYYY-MM-DD HH:mm:ss");
        var currenthour  = moment(day).format("HH");
        var productquery = '';

        if (currenthour < lunchcycle) {
          productquery = productquery + "pt.breakfast = 1";
        }else if(currenthour >= lunchcycle && currenthour < dinnercycle){        
          productquery = productquery + "pt.lunch = 1";        
        }else if( currenthour >= dinnercycle){        
          productquery = productquery + "pt.dinner = 1";
        }


  var makeitproductlist = await query("select pt.productid,pt.active_status from Product pt left join MakeitUser mk on mk.userid=pt.makeit_userid where pt.active_status = 1 and pt.quantity !=0 and mk.unservicable = 0 and pt.makeit_userid="+req.makeit_userid+" and "+productquery+" ");
  if(makeitproductlist.length===0){
    var new_Makeittimelog = {};
    new_Makeittimelog.type=0;
    new_Makeittimelog.makeit_id=req.makeit_userid;
    new_Makeittimelog.action = 1;
    Makeittimelog.createmakeittimelog(new_Makeittimelog);
  }else{
    var new_Makeittimelog = {};
    new_Makeittimelog.type=1;
    new_Makeittimelog.makeit_id=req.makeit_userid;
    new_Makeittimelog.action = 1;
    Makeittimelog.createmakeittimelog(new_Makeittimelog);
  }
  
};


Makeituser.total_lost_revenue= function total_lost_revenue(req, result) {

  staticquery ="select mtv.makeit_id,sum(mtv.expected_revenue) as expected_revenue,sum(mtv.total_makeit_earnings) as total_makeit_earnings,mk.name from Makeit_total_revenue mtv join MakeitUser mk on mk.userid=mtv.makeit_id where (Date(mtv.logtime) BETWEEN '"+req.startdate+"' AND  '"+req.enddate+"') group by mtv.makeit_id";

    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
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

Makeituser.total_makesuccessionrate= function total_makesuccessionrate(req, result) {

  staticquery ="select mtv.makeit_id,sum(mtv.total_makeit_earnings) as monthly_makeit_earnings,mk.name,sum(mi.incentive_amount) as  incentive_amount,sum(total_lost_revenue) as total_lost_revenue from Makeit_total_revenue mtv join MakeitUser mk on mk.userid=mtv.makeit_id left join Makeit_incentive mi on mi.makeit_id=mtv.makeit_id where (Date(mtv.logtime) BETWEEN '"+req.startdate+"' AND  '"+req.enddate+"') group by mtv.makeit_id";

    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
  
        if (res.length!=0) {
          
        for (let i = 0; i < res.length; i++) {
       
          var get_percetage = res[i].monthly_makeit_earnings / constant.Makeit_monthly_expect_earning*100;
          
          res[i].monthly_makeit_percetage= get_percetage;
        }
          
        }
        let resobj = {
          success: true,
          status: true,
          result: res
        };

        result(null, resobj);
      }
    });

};

Makeituser.total_makefinancedisplay= function total_makefinancedisplay(req, result) {

  staticquery ="select mtv.makeit_id,sum(distinct mtv.total_makeit_earnings) as monthly_makeit_earnings,mk.name,sum(mi.incentive_amount) as  incentive_amount,sum(distinct mtv.total_lost_revenue) as total_lost_revenue from Makeit_total_revenue mtv join MakeitUser mk on mk.userid=mtv.makeit_id left join Makeit_incentive mi on mi.makeit_id=mtv.makeit_id where (Date(mtv.logtime) BETWEEN '"+req.startdate+"' AND  '"+req.enddate+"') group by mtv.makeit_id";

    sql.query(staticquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(err, null);
      } else {
  
        if (res.length!=0) {
          
        for (let i = 0; i < res.length; i++) {
       
          var get_percetage = res[i].monthly_makeit_earnings / constant.Makeit_monthly_expect_earning*100;
          
          res[i].monthly_makeit_percetage= get_percetage;
        }
          
        }
        let resobj = {
          success: true,
          status: true,
          result: res
        };

        result(null, resobj);
      }
    });

};

////Makeit session wise activity report/////////////
Makeituser.makeit_session_wise_activity_report= async function makeit_session_wise_activity_report(req,result) {
  var curDate=new Date();
  curDate.setDate(curDate.getDate()-7);
  var todate =moment().format("YYYY-MM-DD");
  var fromdate=moment(curDate).format("YYYY-MM-DD");
  if(req.fromdate) fromdate=req.fromdate;
  if(req.todate) todate=req.todate;

  console.log(fromdate+","+todate);
  var makeit = "select mdr.makeit_id,mdr.date,mu.brandname,(TIME_TO_SEC(if(mdr.cycle1='00:00:00',mdr.cycle1,ADDTIME(mdr.cycle1,'00:05:00')))/TIME_TO_SEC('"+constant.cycle1_diff_hours+"')*100) as breakfast ,(TIME_TO_SEC(if(mdr.cycle2='00:00:00',mdr.cycle2,ADDTIME(mdr.cycle2,'00:05:00')))/TIME_TO_SEC('"+constant.cycle2_diff_hours+"')*100) as lunch,(TIME_TO_SEC(if(mdr.cycle3='00:00:00',mdr.cycle3,ADDTIME(mdr.cycle3,'00:05:00')))/TIME_TO_SEC('"+constant.cycle3_diff_hours+"')*100) as dinner from Makeit_daywise_report mdr left join MakeitUser as mu on mu.userid=mdr.makeit_id where (Date(mdr.created_at) BETWEEN '"+fromdate+"' AND  '"+todate+"') ";
  
  if(req.virtualkey==0 || req.virtualkey==1){
    makeit=makeit +" and mu.virtualkey= "+req.virtualkey
  }
  makeit=makeit + ' group by Date(mdr.created_at),makeit_id';
  console.log(makeit)

  sql.query(makeit, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      let resobj = {
        success: true,
        status : true,
        result : res
      };
      result(null, resobj);
    }
  });
}; 

////Makeit avg preparation report/////////////
Makeituser.makeit_avg_preparation_report= async function makeit_avg_preparation_report(req,result) {
  var makeit = "Select o.makeit_user_id,mu.brandname,count(*) as total_orders,sum(if(o.orderstatus=6,1,0)) as success_orders_count,sum(if(o.orderstatus!=6,1,0)) as cancel_orders_count,TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))), '%T') as success_order_preparation_time, TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))/sum(if(o.orderstatus=6,1,0))), '%T') as success_order_avg_preparation_time, TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus!=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))), '%T') as cancel_order_preparation_time,TIME_FORMAT(SEC_TO_TIME(SUM(if(o.orderstatus!=6,TIMESTAMPDIFF(SECOND,o.makeit_accept_time,o.makeit_actual_preparing_time),0))/sum(if(o.orderstatus!=6,1,0))), '%T') as cancel_order_avg_preparation_time from Orders as o join MakeitUser as mu on mu.userid=o.makeit_user_id where (Date(o.created_at) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"') and o.makeit_actual_preparing_time is Not NULL";
  
  if(req.virtualkey==0 || req.virtualkey==1){
    makeit=makeit +" and mu.virtualkey= "+req.virtualkey
  }
  makeit=makeit + ' group by o.makeit_user_id order by o.makeit_user_id';

  sql.query(makeit, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      let resobj = {
        success: true,
        status : true,
        result : res
      };
      result(null, resobj);
    }
  }); 
};

////Makeit avg preparation report/////////////
Makeituser.makeit_incentives= async function makeit_incentives(req,result) {
  var makeit_avg_list = "select cycle_count as complete_succession_count,cancel_order_count as cancel_order_count,dinner_count,lunch_count,breakfast_count from Makeit_daywise_report where (Date(date) BETWEEN '"+req.fromdate+"' AND  '"+req.todate+"')  AND makeit_id = '"+req.makeit_id+"'";
 
  sql.query(makeit_avg_list, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      var complete_succession_count = 0;
      var cancel_order_count        = 0;
      var averageproduct_count      = 0;
      var cycle_count               = 0;
      var product_count             = 0;

      for(let i=0; i<res.length; i++){
        complete_succession_count = complete_succession_count + res[i].complete_succession_count;
        cancel_order_count        = cancel_order_count + res[i].cancel_order_count;
        if(res[i].dinner_count !=0){
          cycle_count++;
          product_count = product_count+res[i].dinner_count;
        }
        if(res[i].lunch_count !=0){
          cycle_count++;
          product_count = product_count+res[i].lunch_count;
        }
        if(res[i].breakfast_count !=0){
          cycle_count++;
          product_count = product_count+res[i].breakfast_count;
        }
      }

      averageproduct_count = product_count/cycle_count;

      var Newarray = [];
      Newarray.push({"complete_succession_count":complete_succession_count,"cancel_order_count":cancel_order_count,"averageproduct_count":averageproduct_count});
      
      let resobj = {
        success: true,
        status : true,
        result : Newarray
      };
      result(null, resobj);
    }
  });  
};

////Makeit Live Session/////////////
Makeituser.makeit_live_session= async function makeit_live_session(req,result) {
  var makeit_live_session_query= "select date(date) as log_date,if(cycle1!='00:00:00',1,0) as cycle1_livestatus,if(cycle2!='00:00:00',1,0) as cycle2_livestatus,if(cycle3!='00:00:00',1,0) as cycle3_livestatus,breakfast_count as cycle1_product_count, lunch_count as cycle2_product_count,dinner_count as cycle3_product_count, cycle1, cycle2, cycle3 from Makeit_daywise_report where makeit_id='"+req.makeit_id+"' and date(date) between '"+req.fromdate+"' AND  '"+req.todate+"' group by date(date)";
  var makeit_live_session = await query(makeit_live_session_query);

  var makeit_cycle_sold_product_count_query = "select date(ord.created_at) as log_date,ord.makeit_user_id as makeit_id, COUNT(CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<'12:00:00' AND ord.orderstatus=7 AND ord.cancel_by=2 THEN ord.orderid END) as breakfast_canceled, COUNT(CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<'16:00:00' AND ord.orderstatus=7 AND ord.cancel_by=2 THEN ord.orderid END) as lunch_canceled, COUNT(CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=7 AND ord.cancel_by=2 THEN ord.orderid END) as dinner_canceled, CASE WHEN time(ord.created_at)>='08:00:00' AND time(ord.created_at)<'12:00:00' AND ord.orderstatus=6 THEN SUM(oi.quantity) END as cycle1_soldqty, CASE WHEN time(ord.created_at)>='12:00:00' AND time(ord.created_at)<'16:00:00' AND ord.orderstatus=6 THEN SUM(oi.quantity) END as cycle2_soldqty, CASE WHEN time(ord.created_at)>='16:00:00' AND time(ord.created_at)<='23:00:00' AND ord.orderstatus=6 THEN SUM(oi.quantity) END as cycle3_soldqty from Orders as ord left join OrderItem as oi on oi.orderid= ord.orderid where ord.makeit_user_id IN('"+req.makeit_id+"') and date(ord.created_at) between '"+req.fromdate+"' AND  '"+req.todate+"' and ord.makeit_user_id!=0 and (ord.orderstatus=6 or ord.orderstatus=7) group by ord.makeit_user_id,  date(ord.created_at) order by ord.makeit_user_id,date(ord.created_at)";
  var makeit_cycle_sold_product_count = await query(makeit_cycle_sold_product_count_query);

  for (let i = 0; i < makeit_live_session.length; i++) {
    for (let j = 0; j < makeit_cycle_sold_product_count.length; j++) {
      if(makeit_live_session[i].log_date == makeit_cycle_sold_product_count[j].log_date){
        makeit_live_session[i].breakfast_canceled= makeit_cycle_sold_product_count[j].breakfast_canceled ||0;
        makeit_live_session[i].lunch_canceled= makeit_cycle_sold_product_count[j].lunch_canceled ||0;
        makeit_live_session[i].dinner_canceled= makeit_cycle_sold_product_count[j].dinner_canceled ||0;
        makeit_live_session[i].cycle1_soldqty= makeit_cycle_sold_product_count[j].cycle1_soldqty ||0;
        makeit_live_session[i].cycle2_soldqty= makeit_cycle_sold_product_count[j].cycle2_soldqty ||0;
        makeit_live_session[i].cycle3_soldqty= makeit_cycle_sold_product_count[j].cycle3_soldqty ||0;
      }
    }
  } 

  var makeit_cycle_product_count = await Makeituser.makeit_cycle_product_count(req);

  for (let i = 0; i < makeit_live_session.length; i++) {
    for (let j = 0; j < makeit_cycle_product_count.length; j++) {
      if(makeit_live_session[i].log_date == makeit_cycle_product_count[j].log_date){
        makeit_live_session[i].cycle1_qty= makeit_cycle_product_count[j].cycle1_qty ||0;
        makeit_live_session[i].cycle2_qty= makeit_cycle_product_count[j].cycle2_qty ||0;
        makeit_live_session[i].cycle3_qty= makeit_cycle_product_count[j].cycle3_qty ||0;
      }
    }
  }

  for (let i = 0; i < makeit_live_session.length; i++) {
    makeit_live_session[i].cycle1_applicable_status= 0;
    if(makeit_live_session[i].cycle1 >= constant.cycle1totaltime && makeit_live_session[i].cycle1_product_count >= 4){
      makeit_live_session[i].cycle1_applicable_status= 1;
    }else if((makeit_live_session[i].cycle1_qty == makeit_live_session[i].cycle1_soldqty) && makeit_live_session[i].cycle1_product_count >= 4){
      makeit_live_session[i].cycle1_applicable_status= 1;
    }

    makeit_live_session[i].cycle2_applicable_status= 0;
    if(makeit_live_session[i].cycle2 >= constant.cycle2totaltime && makeit_live_session[i].cycle2_product_count >= 4){
      makeit_live_session[i].cycle2_applicable_status= 1;
    }else if((makeit_live_session[i].cycle2_qty == makeit_live_session[i].cycle2_soldqty) && makeit_live_session[i].cycle2_product_count >= 4){
      makeit_live_session[i].cycle2_applicable_status= 1;
    }

    makeit_live_session[i].cycle3_applicable_status= 0;
    if(makeit_live_session[i].cycle3 >= constant.cycle3totaltime && makeit_live_session[i].cycle3_product_count >= 4){
      makeit_live_session[i].cycle3_applicable_status= 1;
    }else if((makeit_live_session[i].cycle3_qty == makeit_live_session[i].cycle3_soldqty) && makeit_live_session[i].cycle3_product_count >= 4){
      makeit_live_session[i].cycle3_applicable_status= 1;
    }
  }

  let resobj = {
    success: true,
    status : true,
    result : makeit_live_session
  };
  result(null,resobj);
};

////Makeit cancel list/////////////
Makeituser.makeit_order_cancellist= async function makeit_order_cancellist(req,result) {
  var makeit_avg_list = "SELECT ors.*,JSON_ARRAYAGG(JSON_OBJECT('quantity', ci.quantity,'productid', ci.productid,'price',ci.price,'gst',ci.gst,'product_name',pt.product_name)) AS items  from Orders as ors left join OrderItem ci ON ci.orderid = ors.orderid left join Product pt on pt.productid = ci.productid where orderstatus = 7 and cancel_by=2 and makeit_user_id='"+req.makeit_id+"' and (Date(ors.created_at) BETWEEN '"+req.fromdate+"' AND '"+req.todate+"') group by ors.orderid order by ors.orderid desc";
 
  sql.query(makeit_avg_list, async function(err, res) {
    if(err){
      result(null, err);
    }else{
      for (let i = 0; i < res.length; i++) {       
        if (res[i].items) {
          var items = JSON.parse(res[i].items);
          res[i].items = items;
        }
      }      

      let resobj = {
        success: true,
        status : true,
        result : res
      };
      result(null, resobj);
    }
  });    
};

////Makeit Cycle Based Product Count///////
Makeituser.makeit_cycle_product_count = async function makeit_cycle_product_count(req) {
  var liveproductcountquery = "select date(created_at) as log_date, COUNT(distinct CASE WHEN time(created_at)>='08:00:00' AND time(created_at)<'12:00:00' THEN (product_id) END) as breakfast_count, COUNT(distinct CASE WHEN time(created_at)>='12:00:00' AND time(created_at)<'16:00:00' THEN (product_id) END) as lunch_count, COUNT(distinct CASE WHEN time(created_at)>='16:00:00' AND time(created_at)<='23:00:00' THEN (product_id) END) as dinner_count from Live_Product_History where makeit_id IN("+req.makeit_id+") and date(created_at) between '"+req.fromdate+"' and '"+req.todate+"' group by date(created_at)";
  var productcount = await query(liveproductcountquery);

  /////////Get Product Count////////
  var cycle1productcountquery = "select *,MAX(actual_quantity+pending_quantity+ordered_quantity) as qty, date(created_at) as log_date from Live_Product_History where date(created_at) between '"+req.fromdate+"' and '"+req.todate+"' and time(created_at)>='08:00:00' and time(created_at)<'12:00:00' and makeit_id IN("+req.makeit_id+") group by product_id,date(created_at)";

  
  var cycle1productcount = await query(cycle1productcountquery);
  
  for (let i = 0; i < productcount.length; i++) {
    var count = 0;
    for (let j = 0; j < cycle1productcount.length; j++) {
      if(productcount[i].log_date == cycle1productcount[j].log_date){
        count = count + cycle1productcount[j].qty;
      }    
    }  
    productcount[i].cycle1_qty=count;  
  }

  var cycle2productcountquery = "select *,MAX(actual_quantity+pending_quantity+ordered_quantity) as qty, date(created_at) as log_date from Live_Product_History where date(created_at) between '"+req.fromdate+"' and '"+req.todate+"' and time(created_at)>='12:00:00' and time(created_at)<'16:00:00' and makeit_id IN("+req.makeit_id+") group by product_id,date(created_at)";
  var cycle2productcount = await query(cycle2productcountquery);

  for (let i = 0; i < productcount.length; i++) {
    var count = 0;
    for (let j = 0; j < cycle2productcount.length; j++) {
      if(productcount[i].log_date == cycle2productcount[j].log_date){
        count = count + cycle2productcount[j].qty;
      }    
    }  
    productcount[i].cycle2_qty=count;  
  }

  var cycle3productcountquery = "select *,MAX(actual_quantity+pending_quantity+ordered_quantity) as qty, date(created_at) as log_date from Live_Product_History where date(created_at) between '"+req.fromdate+"' and '"+req.todate+"' and time(created_at)>='16:00:00' and time(created_at)<='23:00:00' and makeit_id IN("+req.makeit_id+") group by product_id,date(created_at)";
  var cycle3productcount = await query(cycle3productcountquery);

  for (let i = 0; i < productcount.length; i++) {
    var count = 0;
    for (let j = 0; j < cycle3productcount.length; j++) {
      if(productcount[i].log_date == cycle3productcount[j].log_date){
        count = count + cycle3productcount[j].qty;
      }    
    }  
    productcount[i].cycle3_qty=count;  
  }
  return productcount;
};


module.exports = Makeituser;