"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");
var POtepm = require('../../model/tableModels/potempTableModel.js');
var Dayorder = require('../../model/common/dayorderModel.js');

var Procurement = function(procurement) {
  this.vpid = procurement.vpid;
  this.quantity = procurement.quantity;
  this.pr_status = procurement.pr_status || 1;
  this.zoneid=procurement.zoneid;
};

//// Procurment View //////////////
Procurement.procurement_view=async function procurement_view(req,result) {
  if(req.zone_id && req.prid){
    var getprecurementquery = "select pro.*,pm.Productname,pm.uom as unit,um.name as unit_name,st.quantity as boh,greatest(0,pro.quantity-st.quantity)as procurement_quantity from Procurement  pro left join Product_live pl on pl.vpid=pro.vpid left join ProductMaster pm on pm.pid=pl.pid left join UOM um on um.uomid=pm.uom left join Stock st on st.vpid= pm.pid where pro.prid="+req.prid+" and pro.zoneid="+req.zone_id;
    var getprecurement = await query(getprecurementquery);
    if(getprecurement.length > 0){
      let resobj = {  
        success: true,
        status: true,
        result: getprecurement
      };
      result(null, resobj);
    }else{
      let resobj = {  
        success: true,
        status: false,
        message:"no data"
      };
      result(null, resobj);
    }    
  }else{
    let resobj = {  
      success: true,
      status: false,
      message:"check your post values"
    };
    result(null, resobj);
  }    
};

//////// Create New Precurment //////////
Procurement.new_procurement_create=async function new_procurement_create(new_Procurement,result) {
  var productquery= "select dop.vpid,dop.productname,sum(dop.quantity) as quantity,dayo.zoneid,dop.id as dopid from Dayorder_products as dop left join Dayorder as dayo on dayo.id=dop.doid where dop.doid IN("+new_Procurement.doid+") and dop.scm_status=0 group by dop.vpid"
  var get_product = await query(productquery);  

  if (get_product.length !=0) {
    for (let i = 0; i < get_product.length; i++) {
      //get_product[i].zoneid= 1;
      var items = new Procurement(get_product[i]);         
      sql.query("INSERT INTO Procurement set ?", items,async function(err, res) {
        if (err) {
          console.log(err);
          result(err, null);
        } else {       
          var Dayorder_products_query="update Dayorder_products set scm_status=1,prid='"+res.insertId+"' where id="+get_product[i].dopid+"";
          var update_query=await query(Dayorder_products_query);
          ////// update day order status ////
          var get_doid_query="select * from Dayorder_products where id="+get_product[i].dopid+"";
          var get_doid=await query(get_doid_query);
          Dayorder.update_scm_status(get_doid[0].doid);
        }
      });
    }
    let resobj = {  
      success: true,
      status: true,
      message:"procurement created!"
    };
    result(null, resobj); 
  }else{
    let resobj = {  
      success: true,
      status: false,
      message:"data not available"
    };
    result(null, resobj);
  }
};

/////// Get Precurment List ///////////
Procurement.procurement_list=async function procurement_list(req,result) {
  if(req.zone_id){
    var where = "";    
    if(req.date){
        where = where+" and date(pro.created_at)='"+req.date+"' ";
    }
    if(req.vpid){
        where = where+" and pro.vpid="+req.vpid;
    }
    var procurement_list_query= "select pro.*,pm.Productname,pm.uom as unit,um.name as unit_name,st.quantity as boh,greatest(0,pro.quantity-st.quantity)as procurement_quantity from Procurement  pro left join Product_live pl on pl.vpid=pro.vpid left join ProductMaster pm on pm.pid=pl.pid left join UOM um on um.uomid=pm.uom left join Stock st on st.vpid= pm.pid where pro.pr_status=1 and pro.zoneid="+req.zone_id+" "+where+"";    
    var procurement_list = await query(procurement_list_query);

    if(procurement_list.length > 0){
      let resobj = {  
        success: true,
        status: true,
        result:procurement_list 
      };
      result(null, resobj);
    }else{
      let resobj = {  
        success: true,
        status: false,
        message:"no data"
      };
      result(null, resobj);
    }
  }else{
    let resobj = {  
      success: true,
      status: false,
      message:"check your post values"
    };
    result(null, resobj);
  }  
};

////////// Move to PO /////////////
Procurement.move_to_purchase=async function move_to_purchase(req,result) {
  if(req.zone_id && req.pridlist){
    var getprecurementquery = "select * from Procurement where prid IN("+req.pridlist+") and zoneid="+req.zone_id;
    var getprecurement = await query(getprecurementquery);
    if(getprecurement.length > 0){
      for (let i = 0; i < getprecurement.length; i++) {
        var checkpotempquery = "select * from POtemp where vpid="+getprecurement[i].vpid+" and prid="+getprecurement[i].prid;
        var checkpotemp = await query(checkpotempquery);
        if(checkpotemp.length == 0){
          var insertdata = [];
          insertdata.push({"vpid":getprecurement[i].vpid,"prid":getprecurement[i].prid,"actual_quantity":getprecurement[i].quantity,"zoneid":req.zone_id});
          POtepm.createPOtemp(insertdata,async function(err,potempres){ 
            //console.log("potempres -->",potempres); 
          });
        }        
      }
    }

    var procurement_list_query= "update Procurement set pr_status=2 where prid IN("+req.pridlist+")"; 
    var updatequery = await query(procurement_list_query);

    var Dayorder_products_query= "update Dayorder_products set scm_status=2 where prid IN("+req.pridlist+")"; 
    var productquery = await query(Dayorder_products_query);
    
    if(updatequery.affectedRows>0 && productquery.affectedRows>0){
      let resobj = {  
        success: true,
        status: true,
        message:"Moved to purchase"
      };
      result(null, resobj);
    }else{
      let resobj = {  
        success: true,
        status: false,
        message:"something went wrong plz try again"
      };
      result(null, resobj);
    }    
  }else{
    let resobj = {  
      success: true,
      status: false,
      message:"check your post values"
    };
    result(null, resobj);
  }    
};
  
module.exports = Procurement;