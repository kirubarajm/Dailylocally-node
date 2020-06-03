"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");



  var Procurement = function(procurement) {
    this.vpid = procurement.vpid;
    this.quantity = procurement.quantity;
    this.pr_status = procurement.pr_status || 0;
    this.zoneid=procurement.zoneid;
  };



  Procurement.new_procurement_create=async function new_procurement_create(new_Procurement,result) {

    var productquery= "select vpid,productname,count(quantity) as quantity from Dayorder_products where doid IN("+new_Procurement.doid+") and scm_status=0 group by vpid"
    // console.log("productquery",productquery);
    var get_product = await query(productquery);

    if (get_product.length !=0) {

        for (let i = 0; i < get_product.length; i++) {
            get_product[i].zoneid= 1;
            var items = new Procurement(get_product[i]);
          
            sql.query("INSERT INTO Procurement set ?", items,async function(err, res) {
                if (err) {
                    console.log(err);
                    result(err, null);
                } else {
                    var Dayorder_products_query="update Dayorder_products set scm_status=1 where doid IN("+new_Procurement.doid+")";
                    // console.log("Dayorder_products_query",Dayorder_products_query);
                    var update_query=await query(Dayorder_products_query);

                    let resobj = {  
                        success: true,
                        status:true,
                        message:"procurement created!"   

                        };
                        result(null, resobj);
                

                }
              });
        }
    }else{

        let resobj = {  
            success: true,
            status: false,
            message:"data not available"   

            };
            result(null, resobj);
    }
   
    
   

    


  };
  
  
  
module.exports = Procurement;