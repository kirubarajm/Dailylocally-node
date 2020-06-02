"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");



  var Procurement = function(procurement) {
    this.pid = procurement.pid;
    this.userid = procurement.quantity;
    this.pr_status = procurement.pr_status;
    this.zoneid=procurement.zoneid;
  };



  Procurement.new_procurement_create=async function new_procurement_create(new_Procurement,result) {

    
    var get_product = await query("select ordder_pid,productname,count(quantity) as productquantity from Dayorder_products where doid IN('"+new_Procurement+"') group by ordder_pid");

    if (get_product.length !=0) {

        for (let i = 0; i < get_product.length; i++) {

            
            sql.query("INSERT INTO Procurement set ?", new_Procurement, function(err, result) {
                if (err) {
                  res(err, null);
                } else {
                

                }
              });
        }
    }
   
    
   

    


  };
  
  
  
module.exports = Procurement;