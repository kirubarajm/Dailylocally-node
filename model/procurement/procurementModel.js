"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");



  var Procurement = function(procurement) {
    this.vpid = procurement.vpid;
    this.quantity = procurement.quantity;
    this.pr_status = procurement.pr_status || 1;
    this.zoneid=procurement.zoneid;
  };



  Procurement.new_procurement_create=async function new_procurement_create(new_Procurement,result) {

    var productquery= "select vpid,productname,sum(quantity) as quantity from Dayorder_products where doid IN("+new_Procurement.doid+") and scm_status=0 group by vpid"
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
                    var Dayorder_products_query="update Dayorder_products set scm_status=1,prid='"+res.insertId+"' where doid IN("+new_Procurement.doid+")";
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

  
  Procurement.procurement_list=async function procurement_list(req,result) {

    var procurement_list_query= "select pro.*,pm.Productname,pm.uom as unit,um.name as unit_name,st.quantity as boh,greatest(0,pro.quantity-st.quantity)as procurement_quantity from Procurement  pro left join Product_live pl on pl.vpid=pro.vpid left join ProductMaster pm on pm.pid=pl.pid left join UOM um on um.uomid=pm.uom left join Stock st on st.vpid= pm.pid where pro.pr_status=1 and pro.zoneid='"+req.zoneid+"'"

    
    var procurement_list = await query(procurement_list_query);
      
        let resobj = {  
            success: true,
            status:true,
            result:procurement_list 

            };
            result(null, resobj);
    
  };

  
  Procurement.move_to_purchase=async function move_to_purchase(req,result) {

    var procurement_list_query= "update Procurement set pr_status=2 where prid IN("+req.pridlist+")";
 
    var updatequery = await query(procurement_list_query);

    var Dayorder_products_query= "update Dayorder_products set scm_status=2 where prid IN("+req.pridlist+")";
 
    var productquery = await query(Dayorder_products_query);

        let resobj = {  
            success: true,
            status:true,
           message:"Moved to purchase"

            };
            result(null, resobj);
  };

  
module.exports = Procurement;