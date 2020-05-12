"user strict";
var sql = require("../db.js");
var request = require('request');
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var cronlogModel = function(cron) {
  this.cron_id = cron.cron_id;
  this.cron_name = cron.cron_name;
  this.cron_type = cron.cron_type;
};

cronlogModel.createCronLog = function createCronLog(req) {
  sql.query("INSERT INTO Cron_status set ?", req, function(err, res) {
      
  });
  
};

module.exports = cronlogModel;
