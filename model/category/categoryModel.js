"user strict";
var sql = require("../db.js");
const util = require('util');
var constant = require('../constant.js');
var request = require('request');
let jwt = require('jsonwebtoken');
let config = require('../config.js');
var moment = require("moment");


const query = util.promisify(sql.query).bind(sql);


var Category = function(category) {
  this.name = category.name;
  this.image = category.image;
};

Category.get_category_list =async function get_category_list(req,result) {
    var foodpreparationtime = constant.foodpreparationtime;
    var onekm               = constant.onekm;
    var radiuslimit         = constant.radiuslimit;
    var tunnelkitchenliststatus = true;
    var servicable_status = true;
    const userdetails       = await query("select * from User where userid = "+req.userid+" ");
    
    if (userdetails.length ==0) {
      let resobj = {
        success: true,
        status:false,
        message : 'user not found',
        result: []
      };  
      result(null, resobj);
  
    }else{
        
  sql.query("Select * from Category", function(err, res) {
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
}
};

module.exports = Category;