"user strict";
var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
const constant = require('../constant.js');

//Task object constructor
var ZohoBookModel = function(zohoreq) {
  this.orderid = zohoreq.orderid;
  this.userid = zohoreq.userid;
  this.zoho_customer_id = zohoreq.zoho_customer_id;
};

ZohoBookModel.createzohorequest =async function createzohorequest(req, result) {
  
};

ZohoBookModel.createZohoAccessToken =function createZohoAccessToken(req, result) {
  
};

ZohoBookModel.createZohoRefreshToken =function createZohoRefreshToken(req, result) {
  var headers= {
    'Content-Type': 'application/json',
    'Authorization': constant.zoho_refresh_token,
   };
   request.post({headers: headers, url:ticketURL, json: userdetails,method: 'POST'},async function (e, r, body) {
  });
};

ZohoBookModel.createZohoCustomer =function createZohoCustomer(req, result) {
  
};



module.exports = ZohoBookModel;
