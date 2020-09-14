"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant = require('../constant.js');
var Notification = require("../../model/common/notificationModel.js");
var sendsms =  require("../common/smsModel");
var PushConstant = require("../../push/PushConstant.js");


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
  var query1 = "select *,if(status=1,'Live Mode','Offline')as status_msg,( 3959 * acos( cos( radians('"+req.lat+"') ) * cos( radians( lat ) )  * cos( radians( lon ) - radians('"+req.lon+"') ) + sin( radians('"+req.lat+"') ) * sin(radians(lat)) ) ) AS distance from Community where status=1  order by distance ";
  
  // console.log(query1);
  var search_community = await query(query1);

  if (search_community.length !=0) {


        for (let i = 0; i < search_community.length; i++) {
          search_community[i].distance= search_community[i].distance * 1.6;
          if (search_community[i].distance > 1) {
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

  var join_community = await query("select * from join_community where userid='"+req.userid+"' and comid='"+req.comid+"'  and status=1");

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
    new_community.profile_image = req.profile_image;
    new_community.flat_no = req.flat_no;
    new_community.floor_no=req.floor_no;
    // Community.join_new_community();
    var update_image = await query("update User set profile_image='"+req.profile_image+"' where userid = '"+req.userid+"'");

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
        var update_image = await query("update User set profile_image='"+new_community.image+"' where userid = '"+new_community.requested_userid+"'");

      }
      var join_community = {};
      join_community.userid = new_community.requested_userid;
      join_community.comid = res.insertId;
      join_community.status = 0;
      join_community.profile_image = new_community.image;
      join_community.flat_no = new_community.flat_no;
      join_community.floor_no=new_community.floor_no;
     Community.join_new_community1(join_community);

      let resobj = {  
        success: true,
        status: true,
        message: "Thanks for your Request!"
        }; 
  
     result(null, resobj);
    }
    }); 
  

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


    var get_total_values = await query("select sum(cod_price + online_price) as total from Dayorder where userid='"+req.userid+"' and dayorderstatus=10");
    var total_values= 0;
    if (get_total_values.length !=0) {
      total_values = get_total_values[0].total / 100;
    }
    for (let i = 0; i < community.length; i++) {
      

      var get_count = await query("select count(jc.userid)as members_count from join_community jc left join Community co on jc.comid=co.comid where co.comid ='"+community[i].comid+"' and jc.status =1 ");

      community[i].members_count=get_count[0].members_count;
      community[i].members='Members';
      community[i].total_credits= total_values;
      community[i].credits_text='DL Credits';
      community[i].welcome_name_title='Hi ';//+community[0].name
      community[i].welcome_name_content='Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get it delivered before 12 noon everyday';
      community[i].min_cart_text='Minimum Cart Value';
      community[i].min_cart_value='Zero';
      community[i].free_delivery_text='Free delivery across Chennai';
      community[i].free_delivery_value='Free Home Delivery';
      community[i].cod_text='COD';
      community[i].cod_value='Cash on Delivery on all orders';
      community[i].show_credits_info =true;
      community[i].credits_info  ="DL Credits are calculated based on your order history with DL. Stay tuned for surprise rewards based on your DL Credits";
      

    }


    let resobj = {
      success: true,
      status: true,
      result: community
    };
    result(null, resobj);
  }
  

};


Community.get_homepage=async function get_homepage(req, result){

var get_whatsup = await query("select co.* from join_community jd left join  Community co on co.comid=jd.comid where jd.userid='"+req.userid+"' and jd.status=1");

  get= [
    {
      
        "event": {
            "image_url": "https://dailylocally.s3.amazonaws.com/upload/moveit/1599470824386-Community%20Event%20Thumb.jpg",
            "topic": "community_event",
            "title":"Community events",
            "home_community_topic":"home_page",
            "home_community_title":"Home page"
        },
        "whatsapp ": {
            "title":"What's Cooking in community",
            "des": "Join your community's whatapp group and socialize with the memebrs",
            "group_url":  get_whatsup[0].whatsapp_group_link || '',
            "image_url": "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599745891003-WHATS%20COOKING%403x.png",
            "home_community_topic":"home_page",
            "home_community_title":"Home page"
        },
        "sneak_peak": {
            "title": "Sneak Peak",
            "des": "Watch a short video on Daily Locally Exclusive",
            // "video_url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "video_url": "https://dailylocally.s3.ap-south-1.amazonaws.com/upload/moveit/1599842986467-DLE+sneak+peak.mp4",
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


var admin_community_list = "select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,us.name,us.profile_image from Community co left outer join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where co.zoneid="+zoneid+"   "+where+" group by co.comid order by co.comid desc limit " +startlimit +"," +pagelimit +" ";

    //  console.log("admin_community_list",admin_community_list);
var admin_community = await query(admin_community_list);  


var totalcount = await query("select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,jc.*,us.name from Community co left join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where zoneid="+zoneid+"   "+where+" group by co.comid order by co.comid desc");



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
