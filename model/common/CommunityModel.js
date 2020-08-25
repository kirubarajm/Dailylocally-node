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
};




//////community_search//////////////////////
Community.community_search =async function community_search(req, result){


};

module.exports = Community;
