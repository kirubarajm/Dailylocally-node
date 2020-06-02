"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var dayorder = require("../../model/common/dayorderModel");


var Dayorderproducts = function(Dayorderproducts) {
    this.doid = Dayorderproducts.doid;
    this.vpid = Dayorderproducts.vpid;
    this.orderid = Dayorderproducts.orderid;
    this.productname=Dayorderproducts.productname;
    this.quantity=Dayorderproducts.quantity;
    this.price=Dayorderproducts.price;
    this.scm_status=Dayorderproducts.scm_status || 0;

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