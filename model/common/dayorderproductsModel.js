"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var dayorder = require("../../model/common/dayorderModel");


var Dayorderproducts = function(Dayorderproducts) {
    this.doid = Dayorderproducts.doid;
    this.ordder_pid = Dayorderproducts.ordder_pid;
    this.orderid = Dayorderproducts.orderid;
    this.productname=Dayorderproducts.productname;
    this.quantity=Dayorderproducts.quantity;
    this.price=Dayorderproducts.price;

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