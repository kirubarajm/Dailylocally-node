"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant = require('../constant.js');
var Notification = require("../../model/common/notificationModel.js");
var sendsms =  require("../common/smsModel");
var PushConstant = require("../../push/PushConstant.js");
var moment = require("moment");
var UserAddress = require("../../model/dluser/DlUserAddressModel.js");


//Task object constructor
var Community = function(Community) {
  this.communityname = Community.communityname;
  this.lat = Community.lat;
  this.lon = Community.lon;
  this.apartmentname = Community.apartmentname;
  this.image = Community.image;
  this.requested_userid=Community.requested_userid;
  this.no_of_apartments=Community.no_of_apartments;
  this.flat_no=Community.flat_no;
  this.floor_no=Community.floor_no;
  this.community_address=Community.community_address;
  this.area=Community.area;
  this.request_type=Community.request_type || 1;
  this.zoneid=Community.zoneid || 1;
};




//////community_search//////////////////////
Community.community_search =async function community_search(req, result){

  var search_community = await query("select *,if(status=1,'Live Mode','Offline')as status_msg,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from Community where communityname like '%"+req.search+"%' and status=1");

  if (search_community.length !=0) {

    
    if (search_community.length !=0) {


      for (let i = 0; i < search_community.length; i++) {
        search_community[i].distance= search_community[i].distance * 1.6;

        if (search_community[i].distance > 1) {
          search_community[i].distance_text = "KM";
          search_community[i].distance = search_community[i].distance.toFixed(1);
        }else{
          search_community[i].distance_text = "KM";
          // console.log(search_community[i].distance);
          search_community[i].distance = search_community[i].distance;
        }
        
      }

}

    let resobj = {
      success: true,
      status: true,
      result: search_community
    };
    result(null, resobj);
  }else{



    let resobj = {
      success: true,
      status: false,
      result: search_community
    };
    result(null, resobj);
  }
  

};

//

Community.community_list =async function community_list(req, result){

  //having distance <= 1
  var query1 = "select *,if(status=1,'Live Mode','Offline')as status_msg,FORMAT(( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ),2)  AS distance from Community where status=1  order by distance ";
  
  // console.log(query1);
  var search_community = await query(query1);

  if (search_community.length !=0) {


        for (let i = 0; i < search_community.length; i++) {
          search_community[i].distance= search_community[i].distance * 1.6;
          if (search_community[i].distance > 0.5) {
            search_community[i].distance_text = "KM";
            search_community[i].distance = search_community[i].distance.toFixed(1);
          }else{
            search_community[i].distance_text = "Meter";
            search_community[i].distance = search_community[i].distance;
          }
          
        }

  }
  

  
  let resobj = {
    success: true,
    status: true,
    result: search_community
  };
  result(null, resobj);
};

Community.join_new_community =async function join_new_community(req, result){

  //and comid='"+req.comid+"' 
  var join_community = await query("select * from join_community where userid='"+req.userid+"'  and status=1");

  if (join_community.length !=0) {

    if (join_community[0].status==0) {
      

      let resobj = {
        success: true,
        status: false,
        message: "Sorry, Already you request!"
      };
      result(null, resobj);

    } else if(join_community[0].status==1) {
      let resobj = {
        success: true,
        status: false,
        message: "Already Joined Community"
      };
      result(null, resobj);
    }else if(join_community[0].status==2) {
      let resobj = {
        success: true,
        status: false,
        message: "Already Your Request rejected."
      };
      result(null, resobj);
    }

    
  }else{

    var new_community = {};
    new_community.userid = req.userid;
    new_community.comid = req.comid;
    new_community.status = 1;
    new_community.profile_image = req.profile_image || "";
    new_community.flat_no = req.flat_no;
    new_community.floor_no=req.floor_no;
    // Community.join_new_community();
    var image =req.profile_image || '';
    var update_image = await query("update User set profile_image='"+new_community.profile_image+"' where userid = '"+new_community.userid+"'");

    sql.query("INSERT INTO join_community set ?", new_community,async function (err, res) {            
      if(err) {
          console.log("error: ", err);
          result(null, err);
      }
      else{

        // var join_community = await query("update Community set no_of_apartments=no_of_apartments+1 where  comid='"+req.comid+"' ");
         
     

        let resobj = {  
          success: true,
          status: true,
          message: "Thanks for your Request!"
          }; 
    
       result(null, resobj);
      }
      }); 

  }
  

};


Community.join_new_community_v2 =async function join_new_community_v2(req, result){


  let order_available = false;
  let alert_title = "";
  let alert_message = "";

  if (req.change_address ==false) {
    
    // let querycommunity = "select ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from Community where comid='"+req.comid+"'";
    // //    console.log("queryaddress",queryaddress);
    //     var community_details=  await query(querycommunity);

    //     if (community_details.length !=0) {

    //       community_details[0].distance  = community_details[0].distance  * 1.6;
    //       console.log(community_details[0].distance);
    //         if (community_details[0].distance < 0.5) {
    //           show_alert=true;
    //            alert_title = "Cannot complete registration as you have upcoming orders";
    //            alert_message = "Please cancel your upcoming orders or get in touch with our support to complete registration."
    //         }
    //     } 

        var orderslist = await query("SELECT * FROM Dayorder WHERE DATE(date) > CURDATE() and userid='"+req.userid+"'  and dayorderstatus < 10 ");

        if (orderslist.length !=0) {
          order_available=true;
          alert_title = "Cannot complete registration as you have upcoming orders";
          alert_message = "Please cancel your upcoming orders or get in touch with our support to complete registration."
    
        } else{
          alert_title = "Your delivery address will be changed";
          alert_message = "All your upcoming orders will be delivered to the registered apartment address."
        }


        let resobj = {
          success: true,
          status: false,
          alert_title : alert_title || '',
          alert_message:alert_message || '',
          order_available:order_available,
          show_alert:true
        };
        result(null, resobj);
    
  }else{


  //   var join_community = await query("select * from join_community where userid='"+req.userid+"'  and status=1");

  // if (join_community.length !=0) {

  //   if (join_community[0].status==0) {
      

  //     let resobj = {
  //       success: true,
  //       status: false,
  //       message: "Sorry, Already you request!"
  //     };
  //     result(null, resobj);

  //   } else if(join_community[0].status==2) {
  //     let resobj = {
  //       success: true,
  //       status: false,
  //       message: "Already Your Request rejected."
  //     };
  //     result(null, resobj);
  //   }

    
  // }else{


    var update_image = await query("update join_community set status=2 where userid = '"+req.userid+"'");

    var new_community = {};
    new_community.userid = req.userid;
    new_community.comid = req.comid;
    new_community.status = 1;
    new_community.profile_image = req.profile_image || "";
    new_community.flat_no = req.flat_no;
    new_community.floor_no=req.floor_no;
    var image =req.profile_image || '';


    var get_community_details = await query("select * from Community where comid='"+req.comid+"' and status=1");
    var get_address = await query("select * from Address where  userid = '"+req.userid+"' and address_default=1");
    var addressdetails = {};

    if (get_address.length !=0) {
      var update_image = await query("update User set profile_image='"+new_community.profile_image+"' where userid = '"+req.userid+"'");
      var update_address= await query("update Address set flat_house_no='"+req.flat_no+"',block_name='"+req.floor_no+"',pincode='"+get_community_details[0].pincode+"',lat='"+get_community_details[0].lat+"',lon='"+get_community_details[0].lon+"',landmark='"+get_community_details[0].communityname+"',address_type=1,address_default=1,city='"+get_community_details[0].area+"',google_address='"+get_community_details[0].area+"',complete_address='"+get_community_details[0].community_address+"',block_name='"+req.floor_no+"',apartment_name='"+get_community_details[0].communityname+"' where userid = '"+req.userid+"' and address_default=1 ");
    } else {
      addressdetails.lat= get_community_details[0].lat;
      addressdetails.lon= get_community_details[0].lon;
     // addressdetails.city=get_community_details[0].city;
      addressdetails.address_type= 1;
      addressdetails.delete_status=0;
      addressdetails.address_default=1;
      addressdetails.flat_house_no=req.flat_no;
      addressdetails.plot_house_no='';
      addressdetails.floor=req.floor_no;
      addressdetails.block_name=req.floor_no;
      addressdetails.apartment_name=get_community_details[0].communityname;
      addressdetails.google_address=get_community_details[0].community_address;
      addressdetails.complete_address=get_community_details[0].community_address
      addressdetails.landmark=get_community_details[0].communityname
      addressdetails.city=get_community_details[0].area
      addressdetails.userid=req.userid
      // console.log(addressdetails);
      //  getresult =  UserAddress.createUserAddress(addressdetails);

      UserAddress.createUserAddress(addressdetails,async function(err, user) {
        if (err){
          console.log(err);
        }else{
          var update_address = await query("update User set address_created=1 where userid = '"+req.userid+"'");

        }
      });
    }
    
    sql.query("INSERT INTO join_community set ?", new_community,async function (err, res) {            
      if(err) {
          console.log("error: ", err);
          result(null, err);
      }
      else{

        sql.query("Select * from User where userid = '"+req.userid+"' ",async function(err, userdetails) {
          if (err) {
            result(err, null);
          } else {
  

  
           var address_details = await query("Select * from Address where userid = '" +req.userid+"'  and delete_status=0");
 
           if (address_details.length !=0) {
             //  userdetails = userdetails.push(address_details[0]);
 
              userdetails[0].aid= address_details[0].aid;
              userdetails[0].lat= address_details[0].lat;
              userdetails[0].lon= address_details[0].lon;
              userdetails[0].city=address_details[0].city;
            userdetails[0].address_type= address_details[0].address_type;
            userdetails[0].delete_status=address_details[0].delete_status;
            userdetails[0].address_default=address_details[0].address_default;
            userdetails[0].flat_house_no=address_details[0].flat_house_no;
            userdetails[0].plot_house_no=address_details[0].plot_house_no;
            userdetails[0].floor=address_details[0].floor;
            userdetails[0].block_name=address_details[0].block_name;
            userdetails[0].apartment_name=address_details[0].apartment_name;
            userdetails[0].google_address=address_details[0].google_address;
            userdetails[0].complete_address=address_details[0].complete_address;
 
 
 

           }else{
             userdetails[0].aid=  0;
             userdetails[0].lat= 0.0;
             userdetails[0].lon= 0.0;
             userdetails[0].city='';
           userdetails[0].address_type= 0;
           userdetails[0].delete_status= 0;
           userdetails[0].address_default= 1;
           userdetails[0].flat_house_no='';
           userdetails[0].plot_house_no='';
           userdetails[0].floor='';
           userdetails[0].block_name='';
           userdetails[0].apartment_name='';
           userdetails[0].google_address='';
           userdetails[0].complete_address='';
   
 
            }
         
            var update_addr = await query("update User set address_created=1 where userid = '"+req.userid+"'");
  
 
            let resobj = {
              success: true,
              status: true,
              result : userdetails,
              message: "Thanks for your Request!"
            };
            result(null, resobj);
          }
        });
      }
        

      //   let resobj = {  
      //     success: true,
      //     status: true,
      //     message: "Thanks for your Request!"
      //     }; 
    
      //  result(null, resobj);

      }); 

  // }


  }

};

Community.join_new_community_approval=async function join_new_community_approval(req, result){

  var community = await query("select * from Community where  comid='"+req.comid+"' ");

  if (community.length ==0) {

    let resobj = {
      success: true,
      status: false,
      message: "No Request Found!"
    };
    result(null, resobj);

    
  }else{

    var communityupdate = await query("update Community set status='"+req.status+"' where   comid='"+req.comid+"' ");
    var join_community = await query("update join_community set status='"+req.status+"' where  comid='"+req.comid+"' ");

    if (req.status===1) {

      if (community[0].request_type=1) {
        var orders = await query("SELECT * from User where userid ='" +community[0].requested_userid+"'" );

        var get_community_details = await query("select * from Community where comid='"+req.comid+"' and status=1");


    var update_image = await query("update User set profile_image='"+new_community.profile_image+"' where userid = '"+req.userid+"'");
    var update_address= await query("update Address set flat_house_no='"+get_community_details[0].flat_no+"',block_name='"+get_community_details[0].floor_no+"',pincode='"+get_community_details[0].pincode+"',lat='"+get_community_details[0].lat+"',lon='"+get_community_details[0].lon+"',landmark='"+get_community_details[0].communityname+"',address_type=1,address_default=1,city='"+get_community_details[0].area+"',google_address='"+get_community_details[0].area+"',complete_address='"+get_community_details[0].community_address+"',block_name='"+req.floor_no+"',apartment_name='"+get_community_details[0].communityname+"' where userid = '"+req.userid+"' and address_default=1 ");


      await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_community_approval_notification);
      sendsms.community_send_sms(1,orders[0].phoneno);   
      }
       

      message= "Approval successfully";
    }else{
      if (community[0].request_type=1) {
        var orders = await query("SELECT * from User where userid ='" +community[0].requested_userid+"'" );

      await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_community_reject_notification);
      sendsms.community_send_sms(2,orders[0].phoneno);  
      }

      message= "Rejected successfully";
    }

    let resobj = {
      success: true,
      status: true,
      message: message
    };
    result(null, resobj);
  }
  

};


Community.join_new_community1 =async function join_new_community1(req, result){

  // console.log(req);
  var join_community = await query("select * from join_community where userid='"+req.userid+"' and comid='"+req.comid+"' ");

  if (join_community.length !=0) {

    if (join_community[0].status==0) {
      

      let resobj = {
        success: true,
        status: false,
        message: "Sorry, Already you request!"
      };
      result(null, resobj);

    } else if(join_community[0].status==1) {
      let resobj = {
        success: true,
        status: false,
        message: "Already Joined Community"
      };
      result(null, resobj);
    }else if(join_community[0].status==2) {
      let resobj = {
        success: true,
        status: false,
        message: "Already Your Request rejected."
      };
      result(null, resobj);
    }

    
  }else{

    // console.log(req.userid);
    var new_community = {};
    new_community.userid = req.userid;
    new_community.comid = req.comid;
    new_community.status = 0;
    new_community.profile_image = req.profile_image;
    new_community.flat_no = req.flat_no;
    new_community.floor_no=req.floor_no;
    // Community.join_new_community();
    var image =req.profile_image || '';



    var get_community_details = await query("select * from Community where comid='"+req.comid+"' and status=1");
    var get_address = await query("select * from Address where  userid = '"+req.userid+"' and address_default=1");
    var addressdetails = {};

    if (get_address.length !=0) {
      var update_image = await query("update User set profile_image='"+new_community.profile_image+"' where userid = '"+req.userid+"'");
      var update_address= await query("update Address set flat_house_no='"+req.flat_no+"',block_name='"+req.floor_no+"',pincode='"+get_community_details[0].pincode+"',lat='"+get_community_details[0].lat+"',lon='"+get_community_details[0].lon+"',landmark='"+get_community_details[0].communityname+"',address_type=1,address_default=1,city='"+get_community_details[0].area+"',google_address='"+get_community_details[0].area+"',complete_address='"+get_community_details[0].community_address+"',block_name='"+req.floor_no+"',apartment_name='"+get_community_details[0].communityname+"' where userid = '"+req.userid+"' and address_default=1 ");
    } else {
      addressdetails.lat= get_community_details[0].lat;
      addressdetails.lon= get_community_details[0].lon;
      addressdetails.city=get_community_details[0].city;
      addressdetails.address_type= 1;
      addressdetails.delete_status=0;
      addressdetails.address_default=1;
      addressdetails.flat_house_no=get_community_details[0].flat_no;
      addressdetails.plot_house_no=0;
      addressdetails.floor=get_community_details[0].floor_no;
      addressdetails.block_name=get_community_details[0].block_name;
      addressdetails.apartment_name=get_community_details[0].apartmentname;
      addressdetails.google_address=get_community_details[0].google_address;
      addressdetails.complete_address=get_community_details[0].complete_address
      addressdetails.landmark=get_community_details[0].apartmentname
      addressdetails.city=get_community_details[0].area
      addressdetails.userid=req.userid
      // console.log(addressdetails);
      //  getresult =  UserAddress.createUserAddress(addressdetails);

      UserAddress.createUserAddress(addressdetails,async function(err, user) {
        if (err){
          console.log(err);
        }else{
          var update_address = await query("update User set address_created=1 where userid = '"+req.userid+"'");

        }
      });
    }





    // var update_image = await query("update User set profile_image='"+image+"' where userid = '"+new_community.requested_userid+"'");

 
    sql.query("INSERT INTO join_community set ?", new_community,async function (err, res) {            
      if(err) {
          console.log("error: ", err);
          result(null, err);
      }
      else{

        // var join_community = await query("update Community set no_of_apartments=no_of_apartments+1 where  comid='"+req.comid+"' ");
         
     

      //   let resobj = {  
      //     success: true,
      //     status: true,
      //     message: "Thanks for your Request!"
      //     }; 
    
      //  result(null, resobj);
      }
      }); 

  }
  

};


Community.new_community_registration =async function new_community_registration(new_community, result){


  // var join_community = await query("select * from join_community where userid='"+req.userid+"'  and status=1");


  var get_nearby_zone = await query("select *, ROUND( 3959 * acos( cos( radians('" +
  new_community.lat +
  "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
  new_community.lon +
  "') ) + sin( radians('" +
  new_community.lat +
  "') ) * sin(radians(lat)) ) , 2) AS distance from Zone  order by distance asc limit 1");


// if (get_nearby_zone.length !=0) {
  

  // if (get_nearby_zone[0].distance > radiuslimit) {
    new_community.zoneid =1
  // }
// }

// console.log("new_community",new_community);
  sql.query("INSERT INTO Community set ?", new_community,async function (err, res) {            
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{

      // res.insertId
      if (new_community.request_type==1) {
        var image =new_community.image|| '';
        var update_image = await query("update User set profile_image='"+image+"' where userid = '"+new_community.requested_userid+"'");

        var join_community = {};
        join_community.userid = new_community.requested_userid;
        join_community.comid = res.insertId;
        join_community.status = 0;
        join_community.profile_image = new_community.image;
        join_community.flat_no = new_community.flat_no;
        join_community.floor_no=new_community.floor_no;
       Community.join_new_community1(join_community);
      }
 

      let resobj = {  
        success: true,
        status: true,
        message: "Thanks for your Request!"
        }; 
  
     result(null, resobj);
    }
    }); 
  

};


Community.new_community_registration_v2 =async function new_community_registration_v2(new_community, result){


  // var join_community = await query("select * from join_community where userid='"+req.userid+"'  and status=1");

  let order_available = false;
  let alert_title = "";
  let alert_message = "";

  if (new_community.change_address ==false) {
    
    // let querycommunity = "select ( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from Community where comid='"+req.comid+"'";
    // //    console.log("queryaddress",queryaddress);
    //     var community_details=  await query(querycommunity);

    //     if (community_details.length !=0) {

    //       community_details[0].distance  = community_details[0].distance  * 1.6;
    //       console.log(community_details[0].distance);
    //         if (community_details[0].distance < 0.5) {
    //           show_alert=true;
    //            alert_title = "Cannot complete registration as you have upcoming orders";
    //            alert_message = "Please cancel your upcoming orders or get in touch with our support to complete registration."
    //         }
    //     } 

        var orderslist = await query("SELECT * FROM Dayorder WHERE DATE(date) > CURDATE() and userid='"+new_community.userid+"' and dayorderstatus < 10");

        if (orderslist.length !=0) {
          order_available=true;
          alert_title = "Cannot complete registration as you have upcoming orders";
          alert_message = "Please cancel your upcoming orders or get in touch with our support to complete registration."
    
        } else{
          alert_title = "Your delivery address will be changed";
          alert_message = "All your upcoming orders will be delivered to the registered apartment address."
        }


        let resobj = {
          success: true,
          status: false,
          alert_title : alert_title || '',
          alert_message:alert_message || '',
          order_available:order_available,
          show_alert:true
        };
        result(null, resobj);
    
  }else{

  var get_nearby_zone = await query("select *, ROUND( 3959 * acos( cos( radians('" +
  new_community.lat +
  "') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('" +
  new_community.lon +
  "') ) + sin( radians('" +
  new_community.lat +
  "') ) * sin(radians(lat)) ) , 2) AS distance from Zone  order by distance asc limit 1");


// if (get_nearby_zone.length !=0) {
  

  // if (get_nearby_zone[0].distance > radiuslimit) {
    new_community.zoneid =1
  // }
// }

// console.log("new_community",new_community);

var community = new Community(new_community);
//  new_community.request_type= req.body.request_type || 1;
//  new_community.change_address= req.body.change_address;
  sql.query("INSERT INTO Community set ?", community,async function (err, res) {            
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{

      // res.insertId
      if (new_community.request_type==1) {
        var image =new_community.image|| '';
        var update_image = await query("update User set profile_image='"+image+"' where userid = '"+new_community.requested_userid+"'");

        var join_community = {};
        join_community.userid = new_community.requested_userid;
        join_community.comid = res.insertId;
        join_community.status = 0;
        join_community.profile_image = new_community.image;
        join_community.flat_no = new_community.flat_no;
        join_community.floor_no=new_community.floor_no;
       Community.join_new_community1(join_community);
      }
 

      let resobj = {  
        success: true,
        status: true,
        message: "Thanks for your Request!"
        }; 
  
     result(null, resobj);
    }
    }); 
  
  }
};
Community.new_community_approval=async function new_community_approval(req, result){

  var community = await query("select * from Community where comid='"+req.comid+"'  ");

  if (community.length ==0) {

    let resobj = {
      success: true,
      status: false,
      message: "No Request Found!"
    };
    result(null, resobj);

    
  }else{

    var join_community = await query("update Community set status='"+req.status+"' where  comid='"+req.comid+"' ");


    if (req.status=1) {
      message= "Approval successfully";
    }else{
      message= "Rejected successfully";
    }

    let resobj = {
      success: true,
      status: true,
      message: message
    };
    result(null, resobj);
  }
  

};


// Community.get_community_userdetails=async function get_community_userdetails(req, result){
//   var community = await query("Select *,'Hi, Welcome to the Daily Locally community Exclusive club' as welcome_text,if(jc.status=1,true,false)as join_status,us.* From User us left join join_community jc on jc.userid=us.userid left join Community co on co.comid=jc.comid where us.userid ='"+req.userid+"' and jc.status =1  ");

//   var community_status = false;

//   // if (community.length ==0) {
//   //   let resobj = {
//   //     success: true,
//   //     status: false,
//   //     message: "No Request Found!"
//   //   };
//   //   result(null, resobj);    
//   // }else{
//     // sql.query("Select * from User where userid = '"+req.userid+"' ",async function(err, userdetails) {
//     //   if (err) {
//     //     result(err, null);
//     //   } else {
//         var userdetails = await query("Select * from User where userid = '"+req.userid+"' ");
//         var address_details = await query("Select * from Address where userid = '" +req.userid+"'  and delete_status=0");
//         if (address_details.length !=0) {
//          //  userdetails = userdetails.push(address_details[0]);
//           userdetails[0].aid= address_details[0].aid;
//           userdetails[0].lat= address_details[0].lat;
//           userdetails[0].lon= address_details[0].lon;
//           userdetails[0].city=address_details[0].city;
//           userdetails[0].address_type= address_details[0].address_type;
//           userdetails[0].delete_status=address_details[0].delete_status;
//           userdetails[0].address_default=address_details[0].address_default;
//           userdetails[0].flat_house_no=address_details[0].flat_house_no;
//           userdetails[0].plot_house_no=address_details[0].plot_house_no;
//           userdetails[0].floor=address_details[0].floor;
//           userdetails[0].block_name=address_details[0].block_name;
//           userdetails[0].apartment_name=address_details[0].apartment_name;
//           userdetails[0].google_address=address_details[0].google_address;
//           userdetails[0].complete_address=address_details[0].complete_address;
//         }else{
//           userdetails[0].aid=  0;
//           userdetails[0].lat= 0.0;
//           userdetails[0].lon= 0.0;
//           userdetails[0].city='';
//           userdetails[0].address_type= 0;
//           userdetails[0].delete_status= 0;
//           userdetails[0].address_default= 0;
//           userdetails[0].flat_house_no='';
//           userdetails[0].plot_house_no='';
//           userdetails[0].floor='';
//           userdetails[0].block_name='';
//           userdetails[0].apartment_name='';
//           userdetails[0].google_address='';
//           userdetails[0].complete_address='';
//          }   
//     //     let resobj = {
//     //       success: true,
//     //       status: true,
//     //       result : userdetails,
//     //       message: "Thanks for your Request!"
//     //     };
//     //     result(null, resobj);
//     //   }
//     // });
//     var get_total_values = await query("select sum(cod_price + online_price) as total from Dayorder where userid='"+req.userid+"' and dayorderstatus=10");
//     var total_values= 0;
//     if (get_total_values.length !=0) {
//       total_values = get_total_values[0].total / 100;
//     }

//     if (community && community.length >0) {
//       community_status = true;      
//     }else{
//       var community = await query("Select *,0 as join_status from User where userid = '"+req.userid+"' ");
//     }

//     for (let i = 0; i < community.length; i++) { 
//       community[i].name = community[i].name.charAt(0).toUpperCase() + community[i].name.slice(1);
//       var get_count = await query("select count(jc.userid)as members_count from join_community jc left join Community co on jc.comid=co.comid where co.comid ='"+community[i].comid+"' and jc.status =1 ");
//       community[i].members_count=get_count[0].members_count;
//       community[i].members='Members';
//       community[i].total_credits= total_values;
//       community[i].credits_text='DL Credits';
//       community[i].welcome_name_title='Hi ';//+community[0].name
//       community[i].welcome_name_content='Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get it delivered before 12 noon everyday';
//       community[i].min_cart_text='Zero';
//       community[i].min_cart_value='Minimum cart value';
//       community[i].free_delivery_text='Zero';
//       community[i].free_delivery_value='Delivery premium';
//       community[i].cod_text='COD';
//       community[i].cod_value='Cash on Delivery';
//       community[i].show_credits_info =true;
//       community[i].credits_info ="DL Credits are calculated based on your order history with DL. Stay tuned for surprise rewards based on your DL Credits";
//       community[i].welcome_text="Hi, Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get delivered before 12 noon everyday";
//       community[i].cat_page_content ="What can we get you tomorrow morning?";
//       community[i].cat_page_subcontent="Order or Subscribe before 12 midnight & get it delivered before 12 noon everyday";
//       // community[i].home_page_content="Welcome to the Daily Locally";
//       community[i].home_page_subcontent="Order or Subscribe before 12 midnight & get it delivered before 12 noon everyday";

//       if(community_status==true){
//         community[i].home_page_content= "Welcome to the Daily Locally Exclusive Club."
//         }else{
//           community[i].home_page_content= "Welcome to the Daily Locally."
//         }
//       community[i].community_status = community_status;
//     }        

//     let resobj = {
//       success: true,
//       status: true,
//       userdetails:userdetails,
//       result: community
//     };
//     result(null, resobj);
//   // }
// };

Community.get_community_userdetails=async function get_community_userdetails(req, result){

  var community = await query("Select *,'Hi, Welcome to the Daily Locally community Exclusive club' as welcome_text,if(jc.status=1,true,false)as join_status,us.* From User us left join join_community jc on jc.userid=us.userid left join Community co on co.comid=jc.comid where us.userid ='"+req.userid+"' and jc.status =1  ");

  if (community.length ==0) {

    let resobj = {
      success: true,
      status: false,
      message: "No Request Found!"
    };
    result(null, resobj);

    
  }else{

    // sql.query("Select * from User where userid = '"+req.userid+"' ",async function(err, userdetails) {
    //   if (err) {
    //     result(err, null);
    //   } else {

        var userdetails = await query("Select * from User where userid = '"+req.userid+"' ");


       var address_details = await query("Select * from Address where userid = '" +req.userid+"'  and delete_status=0");

       if (address_details.length !=0) {
         //  userdetails = userdetails.push(address_details[0]);

          userdetails[0].aid= address_details[0].aid;
          userdetails[0].lat= address_details[0].lat;
          userdetails[0].lon= address_details[0].lon;
          userdetails[0].city=address_details[0].city;
        userdetails[0].address_type= address_details[0].address_type;
        userdetails[0].delete_status=address_details[0].delete_status;
        userdetails[0].address_default=address_details[0].address_default;
        userdetails[0].flat_house_no=address_details[0].flat_house_no;
        userdetails[0].plot_house_no=address_details[0].plot_house_no;
        userdetails[0].floor=address_details[0].floor;
        userdetails[0].block_name=address_details[0].block_name;
        userdetails[0].apartment_name=address_details[0].apartment_name;
        userdetails[0].google_address=address_details[0].google_address;
        userdetails[0].complete_address=address_details[0].complete_address;




       }else{
         userdetails[0].aid=  0;
         userdetails[0].lat= 0.0;
         userdetails[0].lon= 0.0;
         userdetails[0].city='';
       userdetails[0].address_type= 0;
       userdetails[0].delete_status= 0;
       userdetails[0].address_default= 0;
       userdetails[0].flat_house_no='';
       userdetails[0].plot_house_no='';
       userdetails[0].floor='';
       userdetails[0].block_name='';
       userdetails[0].apartment_name='';
       userdetails[0].google_address='';
       userdetails[0].complete_address='';


         }
     
    


    //     let resobj = {
    //       success: true,
    //       status: true,
    //       result : userdetails,
    //       message: "Thanks for your Request!"
    //     };
    //     result(null, resobj);
    //   }
    // });
  




    var get_total_values = await query("select sum(cod_price + online_price) as total from Dayorder where userid='"+req.userid+"' and dayorderstatus=10");
    var total_values= 0;
    if (get_total_values.length !=0) {
      total_values = get_total_values[0].total / 100;
    }

    for (let i = 0; i < community.length; i++) {
      
      community[i].name = community[i].name.charAt(0).toUpperCase() + community[i].name.slice(1);
      var get_count = await query("select count(jc.userid)as members_count from join_community jc left join Community co on jc.comid=co.comid where co.comid ='"+community[i].comid+"' and jc.status =1 ");

      community[i].members_count=get_count[0].members_count;
      community[i].members='Members';
      community[i].total_credits= total_values;
      community[i].credits_text='DL Credits';
      community[i].welcome_name_title='Hi ';//+community[0].name
      community[i].welcome_name_content='Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get it delivered before 12 noon everyday';
      community[i].min_cart_text='Zero';
      community[i].min_cart_value='Minimum cart value';
      community[i].free_delivery_text='Zero';
      community[i].free_delivery_value='Delivery premium';
      community[i].cod_text='COD';
      community[i].cod_value='Cash on Delivery';
      community[i].show_credits_info =true;
      community[i].credits_info ="DL Credits are calculated based on your order history with DL. Stay tuned for surprise rewards based on your DL Credits";
      community[i].welcome_text="Hi, Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get delivered before 12 noon everyday";


    }


    let resobj = {
      success: true,
      status: true,
      userdetails:userdetails,
      result: community
    };
    result(null, resobj);
  }
  

};

Community.get_community_userdetails_v2=async function get_community_userdetails_v2(req, result){
  var community = await query("Select *,'Hi, Welcome to the Daily Locally community Exclusive club' as welcome_text,if(jc.status=1,true,false)as join_status,us.* From User us left join join_community jc on jc.userid=us.userid left join Community co on co.comid=jc.comid where us.userid ='"+req.userid+"' and jc.status =1  ");

  var community_status = false;

  // if (community.length ==0) {
  //   let resobj = {
  //     success: true,
  //     status: false,
  //     message: "No Request Found!"
  //   };
  //   result(null, resobj);    
  // }else{
    // sql.query("Select * from User where userid = '"+req.userid+"' ",async function(err, userdetails) {
    //   if (err) {
    //     result(err, null);
    //   } else {
        var userdetails = await query("Select * from User where userid = '"+req.userid+"' ");
        var address_details = await query("Select * from Address where userid = '" +req.userid+"'  and delete_status=0");
        if (address_details.length !=0) {
         //  userdetails = userdetails.push(address_details[0]);
          userdetails[0].aid= address_details[0].aid;
          userdetails[0].lat= address_details[0].lat;
          userdetails[0].lon= address_details[0].lon;
          userdetails[0].city=address_details[0].city;
          userdetails[0].address_type= address_details[0].address_type;
          userdetails[0].delete_status=address_details[0].delete_status;
          userdetails[0].address_default=address_details[0].address_default;
          userdetails[0].flat_house_no=address_details[0].flat_house_no;
          userdetails[0].plot_house_no=address_details[0].plot_house_no;
          userdetails[0].floor=address_details[0].floor;
          userdetails[0].block_name=address_details[0].block_name;
          userdetails[0].apartment_name=address_details[0].apartment_name;
          userdetails[0].google_address=address_details[0].google_address;
          userdetails[0].complete_address=address_details[0].complete_address;
        }else{
          userdetails[0].aid=  0;
          userdetails[0].lat= 0.0;
          userdetails[0].lon= 0.0;
          userdetails[0].city='';
          userdetails[0].address_type= 0;
          userdetails[0].delete_status= 0;
          userdetails[0].address_default= 0;
          userdetails[0].flat_house_no='';
          userdetails[0].plot_house_no='';
          userdetails[0].floor='';
          userdetails[0].block_name='';
          userdetails[0].apartment_name='';
          userdetails[0].google_address='';
          userdetails[0].complete_address='';
         }   
    //     let resobj = {
    //       success: true,
    //       status: true,
    //       result : userdetails,
    //       message: "Thanks for your Request!"
    //     };
    //     result(null, resobj);
    //   }
    // });
    var get_total_values = await query("select sum(cod_price + online_price) as total from Dayorder where userid='"+req.userid+"' and dayorderstatus=10");
    var total_values= 0;
    if (get_total_values.length !=0) {
      total_values = get_total_values[0].total / 100;
    }

    if (community && community.length >0) {
      community_status = true;      
    }else{
      var community = await query("Select *,0 as join_status from User where userid = '"+req.userid+"' ");
    }

    for (let i = 0; i < community.length; i++) { 
      community[i].name = community[i].name.charAt(0).toUpperCase() + community[i].name.slice(1);
      var get_count = await query("select count(jc.userid)as members_count from join_community jc left join Community co on jc.comid=co.comid where co.comid ='"+community[i].comid+"' and jc.status =1 ");
      community[i].members_count=get_count[0].members_count;
      community[i].members='Members';
      community[i].total_credits= total_values;
      community[i].credits_text='DL Credits';
      community[i].welcome_name_title='Hi ';//+community[0].name
      community[i].welcome_name_content='Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get it delivered before 12 noon everyday';
      community[i].min_cart_text='Zero';
      community[i].min_cart_value='Minimum cart value';
      community[i].free_delivery_text='Zero';
      community[i].free_delivery_value='Delivery premium';
      community[i].cod_text='COD';
      community[i].cod_value='Cash on Delivery';
      community[i].show_credits_info =true;
      community[i].credits_info ="DL Credits are calculated based on your order history with DL. Stay tuned for surprise rewards based on your DL Credits";
      community[i].welcome_text="Hi, Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get delivered before 12 noon everyday";
      community[i].cat_page_content ="What can we get you tomorrow morning?";
      community[i].cat_page_subcontent="Order or Subscribe before 12 midnight & get it delivered before 12 noon everyday";
      // community[i].home_page_content="Welcome to the Daily Locally";
      community[i].home_page_subcontent="Order or Subscribe before 12 midnight & get it delivered before 12 noon everyday";

      if(community_status==true){
        community[i].home_page_content= "Welcome to the Daily Locally Exclusive Club."
        community[i].group_url= community[i].whatsapp_group_link;
        }else{
          community[i].home_page_content= "Welcome to the Daily Locally."
          community[i].group_url= ""
        }
      community[i].community_status = community_status;
    }        

    let resobj = {
      success: true,
      status: true,
      userdetails:userdetails,
      result: community
    };
    result(null, resobj);
  // }
};
Community.get_homepage=async function get_homepage(req, result){
  var get_whatsup = await query("select co.* from join_community jd left join  Community co on co.comid=jd.comid where jd.userid='"+req.userid+"' and jd.status=1");

  var video_url = "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599842986467-DLE+sneak+peak.mp4";
  var image_url = "https://dailylocally.s3.amazonaws.com/admin/1602829410024-wwww.png";
  var community_status = false;
  var whatsapp_group_link = "";

  if(get_whatsup.length>0){
    video_url = "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599842986467-DLE+sneak+peak.mp4";
    image_url = "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599745891003-WHATS%20COOKING%403x.png";
    community_status = true;
    whatsapp_group_link = get_whatsup[0].whatsapp_group_link ;
  }

  get= [
    {
      
        "event": {
            // "image_url": "https://dailylocally.s3.amazonaws.com/upload/moveit/1599470824386-Community%20Event%20Thumb.jpg",
            "image_url":"https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1600441155234-Group%20535.jpg",
            "topic": "community_event",
            "title":"Community events",
            "home_community_topic":"home_page",
            "home_community_title":"Home page"
        },
        "whatsapp ": {
            "title":"What's Cooking in community",
            "des": "Join your community's whatapp group and socialize with the memebrs",
            "group_url":  whatsapp_group_link || '',
            "image_url": image_url,
            "home_community_topic":"home_page",
            "home_community_title":"Home page",
            "community_status":community_status
        },
        "sneak_peak": {
            "title": "Sneak Peak",
            "des": "Watch a short video on Daily Locally Exclusive",
            // "video_url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "video_url": video_url,
            "image_url": "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599745864472-SNEAK%20PEAK%403x.png",
            "home_community_topic":"home_page",
            "home_community_title":"Home page"
        },
        "cat_list": {
                "title ": "new event",
                "des": "new event",
                "image_url": "https://dailylocally.s3.amazonaws.com/upload/moveit/1599747217361-PLace%20Order%20Thumb%403x.png",
                "home_community_topic":"home_page",
                "home_community_title":"Home page"
                 },
        "about": 
               {
                "title": "About Us",
                "des": "Know More about daily locally Exclusive",
                "image_url": "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599745820731-ABOUT%20US%403x.png",
                "home_community_topic":"home_page",
                "home_community_title":"Home page"
                }              
    }
  ]
  let resobj = {
    success: true,
    status: true,
    result: get
  };
  result(null, resobj);
};



Community.get_wapscreen=async function get_wapscreen(req, result){


  get= [
    {
      imageUrl: "https://dailylocally.s3.amazonaws.com/admin/1599216998960-Group%20490.png",
       phoneno: "8939904769",
          title: "Hi",
          subtitle1: "We have received the registration request for your community",
          subtitle2: "Our DL Exclusive Team will get in touch with you within 24 Hours" ,
          whats_up_link:"https://wa.me/message/2DPUU5JCTASKN1"
    }]
 

 let resobj = {
  success: true,
  status: true,
  result: get
};
result(null, resobj);

};

Community.admin_community_list =async function admin_community_list(req, result){


  var pagelimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * pagelimit;
  var where = "";

  if(req.from_date  && req.to_date){
    where = where+" and (date(co.created_at) BETWEEN '"+req.from_date +"' AND '"+req.to_date+"')";
 }


  if(req.search){
      where = where+" and (co.communityname LIKE  '%" +req.search+ "%' or co.area LIKE  '%" +req.search+ "%') ";
  }

  if(req.status==1){
    where = where+" and  co.status=1 "; 
  }
  if(req.status==0){
    where = where+" and  co.status=0 "; 
  }
  if(req.status==2){
    where = where+" and  co.status=2 ";
  }

   
  var zoneid = req.zoneid || 1;

  if(req.report && req.report==1){
    var admin_community_list = "select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,us.name,us.profile_image from Community co left outer join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where co.zoneid="+zoneid+"   "+where+" group by co.comid order by co.comid desc  ";
    // var getdayorderquery = "select drs.*,if(drs.invoice_no!='',CONCAT('"+domainname+":"+port+"/uploads/invoice_pdf/',drs.id,'.pdf'),'') as invoice_url,if(drs.virtualkey=1,'Virtual Order','Real Order')  as Virtual_msg,us.name,us.phoneno,us.email,sum(orp.quantity * orp.price) as total_product_price,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,sum(orp.received_quantity) as sorted_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'refund_status',orp.refund_status,'refund_status_msg',if(orp.refund_status=0,'Not refunded',if(orp.refund_status=1,'Refund requested','Refunded')))) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus < 5 then 'SCM In-Progress'  when drs.dayorderstatus=5 then 'Qc' when drs.dayorderstatus=6 then 'Ready to Dispatch' when drs.dayorderstatus=10 then 'delivered' when drs.dayorderstatus=8 then 'Moveit Pickup'  when drs.dayorderstatus=7 then 'Moveit Assign' when drs.dayorderstatus=6 then 'Ready to Dispatch(QA)'  when drs.dayorderstatus=11 then 'Cancelled' when drs.dayorderstatus=12 then 'Return' end as dayorderstatus_msg,CASE WHEN (drs.reorder_status=0 || drs.reorder_status=null)then(select id from Dayorder where reorder_id=drs.id order by id desc limit 1) else 0 END as  Reorderid,if(HOUR(drs.order_place_time) <= 19,1,2) as slot,if(HOUR(drs.order_place_time) <= 19,'Slot 1','Slot 2') as slot_msg,if(drs.payment_status=1,'Paid','Not paid')  as payment_status_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid where zoneid="+Dayorder.zoneid+" "+where+" group by drs.id,drs.userid order by drs.id desc";
  

  }else{
        var admin_community_list = "select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,us.name,us.profile_image from Community co left outer join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where co.zoneid="+zoneid+"   "+where+" group by co.comid order by co.comid desc limit " +startlimit +"," +pagelimit +" ";
      }

// var admin_community_list = "select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,us.name,us.profile_image from Community co left outer join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where co.zoneid="+zoneid+"   "+where+" group by co.comid order by co.comid desc limit " +startlimit +"," +pagelimit +" ";

    //  console.log("admin_community_list",admin_community_list);
var admin_community = await query(admin_community_list);  


var totalcount = await query("select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,jc.*,us.name from Community co left join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where zoneid="+zoneid+"   "+where+" group by co.comid order by co.comid desc");


///console.log("req.report",admin_community.length); 
  if (admin_community.length !=0) {

    
    for (let i = 0; i < admin_community.length; i++) {
      
      if (admin_community[i].request_type==1) {
        
        var userdetails = await query("select * from User where userid='"+admin_community[i].requested_userid+"' ");

        if (userdetails.length !=0) {
          admin_community[i].request_by="User";
        admin_community[i].name=userdetails[0].name || '';
        } else {
          admin_community[i].request_by="User";
          admin_community[i].name= '';
        }
        

      } else {
 
        var userdetails = await query("select * from Admin_users where admin_userid='"+admin_community[i].requested_userid+"' ");
        admin_community[i].request_by="admin";

        if (userdetails.length !=0) {
          admin_community[i].name=userdetails[0].name || '';
        }else{
          admin_community[i].name= '';
        }
       
      }
      
      var total_converted_user = await query("select count(userid)as total from join_community where comid='"+admin_community[i].comid+"' and status=1 ");

      admin_community[i].total_converted_user=total_converted_user[0].total || 0;

      var total_revenue = await query("select sum(price)as total_Revenue,count(orderid)as total_orders from Orders where userid in(select userid from join_community where comid='"+admin_community[i].comid+"'  group by userid) and payment_status=1 ");

      admin_community[i].total_Revenue=total_revenue[0].total_Revenue || 0;
      admin_community[i].total_orders=total_revenue[0].total_orders || 0;
    }

   // console.log("req.report",admin_community.length); 
    let resobj = {
      success: true,
      status: true,
      pagelimit:pagelimit,
      totalcount:totalcount.length,
      result: admin_community
    };
    result(null, resobj);

  }else{

    let resobj = {
      success: true,
      status: false,
      result: admin_community
    };
    result(null, resobj);
  }
  

};


Community.admin_edit_community = async function admin_edit_community(req, result) {

    var email_status = true;
    var staticquery = "UPDATE Community SET updated_at = ?, ";
    var column = "";
    var column = '';
    var values =[];
   
    values.push(new Date());
    for (const [key, value] of Object.entries(req)) {
      if (key !== "comid") {
        column = column + key +" = ?,";
        values.push(value);
      }
    }
    column=column.slice(0, -1)
    values.push(req.comid);
 
    var query1 = staticquery + column  + " where comid = ?";
 
    sql.query(query1, values, function(err) {
      if (err) {
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
   };



module.exports = Community;
