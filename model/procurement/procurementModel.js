"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");
var POtepm = require('../../model/tableModels/potempTableModel.js');
var Dayorder = require('../../model/common/dayorderModel.js');
var DayOrderComment = require('../admin/orderCommentsModel.js');

var Procurement = function(procurement) {
  this.vpid = procurement.vpid;
  this.quantity = procurement.quantity;
  this.pr_status = procurement.pr_status || 1;
  this.zoneid = procurement.zoneid;
  this.created_by = procurement.created_by;
};

//// Procurment View //////////////
Procurement.procurement_view=async function procurement_view(req,result) {
  if(req.zoneid && req.prid){
    var getprecurementquery = "select pro.prid,pro.created_at,pro.vpid,dop.productname,dop.product_uom as unit,uom.name as unit_name,if(st.quantity,st.quantity,0) as boh,pro.quantity,if(greatest(0,pro.quantity-st.quantity),greatest(0,pro.quantity-st.quantity),0) as procurement_quantity,pro.pr_status,case when pro.pr_status=0 then 'open' when pro.pr_status=1 then 'ready to po' end as pr_status_msg,pro.zoneid from Procurement as pro left join Dayorder_products as dop on dop.prid=pro.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=dop.vpid where pro.prid="+req.prid+" and pro.zoneid="+req.zoneid;
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
  var productquery= "select dop.vpid,dop.productname,sum(dop.quantity) as quantity,dayo.zoneid,dop.id as dopid,'"+new_Procurement.done_by+"' as created_by from Dayorder_products as dop left join Dayorder as dayo on dayo.id=dop.doid where dop.doid IN("+new_Procurement.doid+") and dop.scm_status=0 group by dop.vpid"
  var get_product = await query(productquery);  

  if (get_product.length !=0) {
    for (let i = 0; i < get_product.length; i++) {
      //get_product[i].zoneid= 1;
      var items = new Procurement(get_product[i]);         
      // console.log("items==>",items);
      sql.query("INSERT INTO Procurement set ?", items,async function(err, res) {
        if (err) {
          console.log(err);
          result(err, null);
        } else {       
          var Dayorder_products_query="update Dayorder_products set scm_status=1,prid='"+res.insertId+"' where vpid="+get_product[i].vpid+" and doid IN("+new_Procurement.doid+")";
          var update_query=await query(Dayorder_products_query);

          if(update_query.affectedRows>0){
            if(i+1 == get_product.length){
              ////// update day order status ////
              for (let j = 0; j < new_Procurement.doid.length; j++) {
                Dayorder.update_scm_status(new_Procurement.doid[j]);
              } 
            }
          }

          ////// update day order status ////
          // var get_doid_query="select * from Dayorder_products where vpid="+get_product[i].vpid+" and doid IN("+new_Procurement.doid+")";
          // var get_doid=await query(get_doid_query);
          // for (let j = 0; j < get_doid.length; j++) {
          //   Dayorder.update_scm_status(get_doid[j].doid);
          // }                    
        }
      });
    }

    ////////Create Day order Log ////////////
    if(new_Procurement.doid.length>0){
      for (let i = 0; i < new_Procurement.doid.length; i++) {        
        var insertlogdata = [];
        if(new_Procurement.done_by){ }else{ new_Procurement.done_by=0}
        insertlogdata.push({"comments":"procurement_created","done_by":new_Procurement.done_by,"doid":new_Procurement.doid[i],"type":1,"done_type":1});
        DayOrderComment.create_OrderComments_crm(insertlogdata);        
      }
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
  if(req.zoneid){
    var pagelimit = 20;
    var page = req.page || 1;
    var startlimit = (page - 1) * pagelimit;

    var where = "";    
    if(req.from_date && req.to_date){
      wherecon = wherecon+" and (date(pro.created_at) between '"+req.from_date+"' and  '"+req.to_date+"') ";
    }
    if(req.productsearch){
        where = where+" and (pro.vpid='"+req.productsearch+"' or dop.Productname='"+req.productsearch+"') ";
    }
    if(req.report && req.report==1){
      var procurement_list_query = "select pro.prid,pro.created_at,pro.vpid,dop.productname,dop.product_uom as uom,uom.name as uom_name,greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0)) as boh_remaining,greatest(0,if(st.quantity_mapping,st.quantity_mapping,0)) as boh_mapped,if(pro.quantity,pro.quantity,0) as required_quantity,greatest(0,(if(pro.quantity,pro.quantity,0))-(if((greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),(greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),0))) as procurement_quantity,pro.pr_status,case when pro.pr_status=0 then 'open' when pro.pr_status=1 then 'ready to po' end as pr_status_msg,pro.zoneid from Procurement as pro left join Dayorder_products as dop on dop.prid=pro.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=dop.vpid where pro.pr_status=1 and pro.zoneid="+req.zoneid+" "+where+" group by pro.prid order by pro.prid";
    }else{
      var procurement_list_query = "select pro.prid,pro.created_at,pro.vpid,dop.productname,dop.product_uom as uom,uom.name as uom_name,greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0)) as boh_remaining,greatest(0,if(st.quantity_mapping,st.quantity_mapping,0)) as boh_mapped,if(pro.quantity,pro.quantity,0) as required_quantity,greatest(0,(if(pro.quantity,pro.quantity,0))-(if((greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),(greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),0))) as procurement_quantity,pro.pr_status,case when pro.pr_status=0 then 'open' when pro.pr_status=1 then 'ready to po' end as pr_status_msg,pro.zoneid from Procurement as pro left join Dayorder_products as dop on dop.prid=pro.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=dop.vpid where pro.pr_status=1 and pro.zoneid="+req.zoneid+" "+where+" group by pro.prid order by pro.prid limit " +startlimit +"," +pagelimit +" ";
    }
    var procurement_list = await query(procurement_list_query);

    var totalcountquery = "select pro.prid,pro.created_at,pro.vpid,dop.productname,dop.product_uom as uom,uom.name as uom_name,greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0)) as boh_remaining,greatest(0,if(st.quantity_mapping,st.quantity_mapping,0)) as boh_mapped,if(pro.quantity,pro.quantity,0) as required_quantity,greatest(0,(if(pro.quantity,pro.quantity,0))-(if((greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),(greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),0))) as procurement_quantity,pro.pr_status,case when pro.pr_status=0 then 'open' when pro.pr_status=1 then 'ready to po' end as pr_status_msg,pro.zoneid from Procurement as pro left join Dayorder_products as dop on dop.prid=pro.prid left join UOM as uom on uom.uomid=dop.product_uom left join Stock as st on st.vpid=dop.vpid where pro.pr_status=1 and pro.zoneid="+req.zoneid+" "+where+" group by pro.prid order by pro.prid";
    var total_count = await query(totalcountquery);

    if(procurement_list.length > 0){
      var totalcount = total_count.length;     
      let resobj = {  
        success: true,
        status: true,
        totalcount: totalcount,
        pagelimit: pagelimit,
        result:procurement_list 
      };
      result(null, resobj);
    }else{
      let resobj = {  
        success: true,
        status: false,
        totalcount: 0,
        message:"no data"
      };
      result(null, resobj);
    }
  }else{
    let resobj = {  
      success: true,
      status: false,
      totalcount: 0,
      message:"check your post values"
    };
    result(null, resobj);
  }  
};

////////// Move to PO /////////////
Procurement.move_to_purchase=async function move_to_purchase(req,result) {
  if(req.zoneid && req.pridlist && req.done_by){
    var getprocurementquery = "select pro.*,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0) as boh_remaining,if(st.quantity_mapping,st.quantity_mapping,0) as boh_mapped,if(pro.quantity,pro.quantity,0) as required_quantity,greatest(0,(if(pro.quantity,pro.quantity,0))-(if((greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),(greatest(0,if((st.quantity-st.quantity_mapping),(st.quantity-st.quantity_mapping),0))),0))) as procurement_qty from Procurement as pro left join Stock as st on st.vpid=pro.vpid where pro.prid IN("+req.pridlist+") and pro.zoneid="+req.zoneid;
    // console.log("getprocurementquery ===>",getprocurementquery);
    var getprocurement = await query(getprocurementquery);
    if(getprocurement.length > 0){
      for (let i = 0; i < getprocurement.length; i++) {
        var checkpotempquery = "select * from POtemp where vpid="+getprocurement[i].vpid+" and prid="+getprocurement[i].prid+" and delete_status=0";
        var checkpotemp = await query(checkpotempquery);
        if(checkpotemp.length == 0){
          var insertdata = [];
          insertdata.push({"vpid":getprocurement[i].vpid,"prid":getprocurement[i].prid,"actual_quantity":getprocurement[i].procurement_qty,"zoneid":req.zoneid,"delete_status":0,"created_by":req.done_by});
          POtepm.createPOtemp(insertdata[0],async function(err,potempres){ 
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