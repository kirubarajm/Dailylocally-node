"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var Dunzoresponce = function(dunzoresponce) {
  this.task_id = dunzoresponce.task_id || 0;
  this.orderid=dunzoresponce.orderid || 0;
  this.dunzo_responce = dunzoresponce.dunzo_responce;
};

Dunzoresponce.create_Dunzoresponce = async function create_Dunzoresponce(new_Dunzoresponce, result) {

    sql.query("INSERT INTO Dunzo_responce  set ?", new_Dunzoresponce, function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(err, null);
        } else {
        
          let resobj = {
            success: true,
            status : true,
            message: "Dunzo_responce created successfully"
          };
    
          result(null, resobj);
        }
      });
  
};







module.exports = Dunzoresponce;
