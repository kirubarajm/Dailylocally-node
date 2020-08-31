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

      console.log(get_count[0].members_count);
      community[i].members_count=get_count[0].members_count;
      community[i].members='Members';
      community[i].total_credits=get_count[0].members_count;
      community[i].credits_text='credits';
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

module.exports = Community;
