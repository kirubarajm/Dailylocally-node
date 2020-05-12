"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var Dunzomoveitdetails = function(dunzomoveitdetails) {
  this.task_id = dunzomoveitdetails.task_id;
  this.runner_state = dunzomoveitdetails.runner_state;
  this.runner_name = dunzomoveitdetails.runner_name;
  this.runner_phone_number = dunzomoveitdetails.runner_phone_number;
  this.runner_lat = dunzomoveitdetails.runner_lat;
  this.runner_lng = dunzomoveitdetails.runner_lng;
  this.runner_eta_pickup_min = dunzomoveitdetails.runner_eta_pickup_min;
  this.runner_eta_dropoff_min = dunzomoveitdetails.runner_eta_dropoff_min;

};

Dunzomoveitdetails.create_Dunzomoveitdetails = async function create_Dunzomoveitdetails(Dunzo_moveit_details, result) {

    sql.query("INSERT INTO Dunzo_moveit_details  set ?", Dunzo_moveit_details, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
        
          let resobj = {
            success: true,
            status : true,
            message: "Dunzo_moveit_details created successfully"
          };
    
          result(null, resobj);
        }
      });
  
};







module.exports = Dunzomoveitdetails;
