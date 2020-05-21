"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var dayorder = require("../../model/common/dayorderModel");


var Dayorderproducts = function(Dayorderproducts) {
    this.date = Dayorderproducts.doid;
    this.userid = Dayorderproducts.productid;
    this.orderid = Dayorderproducts.orderid;
  };



  Dayorderproducts.createDayorderproducts =async function createDayorderproducts(new_createDayorderproducts,result) {
  
    sql.query("INSERT INTO Dayorder_products set ?", new_createDayorderproducts, async function(err, res1) {
        if (err) { 
            result(err, null); //result.send(err);
        }else{
         
        }
      });
  
  };
  
  
  
 

  module.exports = Dayorderproducts;