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

  var search_community = await query("select * from Community where status=1");

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

module.exports = Community;
