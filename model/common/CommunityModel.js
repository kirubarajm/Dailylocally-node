"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
var constant = require('../constant.js');

//Task object constructor
var Community = function(Community) {
  this.communityname = Community.communityname;
  this.lat = Community.lat;
  this.long = Community.long;
  this.apartmentname = Community.apartmentname;
  this.image = Community.image;
  this.requested_userid=Community.requested_userid;
  this.no_of_apartments=Community.no_of_apartments;
  this.flat_no=Community.flat_no;
  this.floor_no=Community.floor_no;
  this.community_address=Community.community_address;
  this.area=Community.area;
};




//////community_search//////////////////////
Community.community_search =async function community_search(req, result){

  var search_community = await query("select * from Community where communityname like '%"+req.search+"%' and status=1");

  if (search_community.length !=0) {
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


Community.community_list =async function community_list(req, result){

  var search_community = await query("select *,if(status=1,'Live Mode','Offline')as status_msg from Community where status=1 and zoneid=1");

  if (search_community.length !=0) {


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

Community.join_new_community =async function join_new_community(req, result){

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

    var new_community = {};
    new_community.userid = req.userid;
    new_community.comid = req.comid;
    new_community.status = 0;
    new_community.profile_image = req.profile_image;
    new_community.flat_no = req.flat_no;
    new_community.floor_no=req.floor_no;

    
    sql.query("INSERT INTO join_community set ?", new_community,async function (err, res) {            
      if(err) {
          console.log("error: ", err);
          result(null, err);
      }
      else{

        // res.insertId
         

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

  var join_community = await query("select * from join_community where userid='"+req.userid+"' and comid='"+req.comid+"' ");

  if (join_community.length ==0) {

    let resobj = {
      success: true,
      status: false,
      message: "No Request Found!"
    };
    result(null, resobj);

    
  }else{

    var join_community = await query("update join_community set status='"+req.status+"' where userid='"+req.userid+"' and comid='"+req.comid+"' ");


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

Community.new_community_registration =async function new_community_registration(new_community, result){


  sql.query("INSERT INTO Community set ?", new_community,async function (err, res) {            
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{

      // res.insertId
       

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

  var community = await query("Select *,'Hi, Welcome to the Daily Locally community Exclusive club' as welcome_text,if(status=1,true,false)as join_status From User us left join join_community jc on jc.userid=us.userid where us.userid ='"+req.userid+"' and status=1  ");

  if (community.length ==0) {

    let resobj = {
      success: true,
      status: false,
      message: "No Request Found!"
    };
    result(null, resobj);

    
  }else{

    for (let i = 0; i < community.length; i++) {
      

      var get_count = await query("select count(jc.userid)as members_count from join_community jc left join Community co on jc.comid=co.comid where co.comid ='"+community[i].comid+"' and jc.status=1 ");

      community[i].members_count=get_count[0].members_count;
      community[i].members='Members';
      community[i].total_credits=get_count[0].members_count;
      community[i].credits_text='credits';
      community[i].welcome_name_title='Hi';
      community[i].welcome_name_content='Welcome to the Daily Locally community Exclusive club, order before 12 midnight & get it delivered before 12 noon everyday';
      community[i].min_cart_text='Minimum Cart Value';
      community[i].min_cart_value='Zero';
      community[i].free_delivery_text='Free delivery across Chennai';
      community[i].free_delivery_value='Free Home Delivery';
      community[i].cod_text='COD';
      community[i].cod_value='Cash on Delivery on all orders';

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


  get= [
    {
      
        "event": {
            "image_url": "https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1595868674050-DLV2%20Category-Bakery.jpg",
            "topic": "new event"
        },
        "whatsapp ": {
            "title":"new event",
            "des": "new event",
            "group_url ": "https://dailylocally.s3.ap-south-1.amazonaws.com/admin/1596196480459-DLV2%20Category-Spreads.jpg"
        },
        "sneak_peak": {
            "title": "new event",
            "des": "new event",
            "video_url ": null
        },
        "cat_list": [
            {
                "title ": "new event",
                "des": "new event",
                "image_url ": "https://eattovo.s3.ap-south-1.amazonaws.com/upload/admin/makeit/product/1595847977688-Category%20Milk-01.jpg"
            }
          ],
          "about": [
               {
                  "title": "new event",
                  "des": 25
                }
              ]
    }
]
 
//   get_details[0].whatsapp ={
//                       title : "",
//                       des : "Community event ",
//                       group_url : ""
//                }

//  get_details[0].sneak_peak = {
//                       title : "",
//                       des : "Community event ",
//                       video_url : ""
//                }
 
//                get_details[0].cat_list= {
//                       title : "",
//                       des : "Community event ",
//                      image_url : "",
//                },
//               about= {
//                       title : "",
//                       des : "Community event ",
//                }
 
 



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
  if(req.starting_date && req.end_date){
    where = where+" and (co.created_at BETWEEN '"+req.starting_date +"' AND '"+req.end_date+"')";
 }


  if(req.search){
      where = where+" and (co.communityname LIKE  '%" +req.search+ "%' or co.area LIKE  '%" +req.search+ "% ' ) ";
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


var admin_community_list = "select co.comid,co.*,if(co.status=1,'Approved',if(co.status=2,'Rejected','Waiting for approval'))as status_msg,jc.*,us.name from Community co left join join_community jc on jc.comid=co.comid left join User us on us.userid=jc.userid where zoneid="+zoneid+" and jc.status=1  "+where+" group by jc.comid order by jc.comid desc limit " +startlimit +"," +pagelimit +" ";

 

  var admin_community = await query(admin_community_list);

  if (admin_community.length !=0) {

    
for (let i = 0; i < admin_community.length; i++) {
  

  var total_converted_user = await query("select count(userid)as total from join_community where comid='"+admin_community[i].comid+"' ");

  admin_community[i].total_converted_user=total_converted_user[0].total || 0;

  var total_revenue = await query("select sum(price)as total_Revenue,count(orderid)as total_orders from Orders where userid in(select userid from join_community where comid='"+admin_community[i].comid+"'  group by userid) and payment_status=1 ");

  admin_community[i].total_Revenue=total_revenue[0].total_Revenue || 0;
  admin_community[i].total_orders=total_revenue[0].total_orders || 0;
}


    let resobj = {
      success: true,
      status: true,
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
 
    console.log(query1);
    console.log(values);
    sql.query(query1, values, function(err) {
      if (err) {
        result(err, null);
      } else {
  

      }
    });
   };



module.exports = Community;
