"user strict";
var sql = require("../db.js");
const CronJob = require("cron").CronJob;
const util = require("util");
var moment = require("moment");
var constant = require("../constant");
var SCM = require("../admin/scmModel.js");
var cron = require('node-cron');


const start_cron=1;
const end_cron=2;
const query = util.promisify(sql.query).bind(sql);

var QuickSearch   = function(QuickSearch) {

};
// console.log("this is cron file");
/////Dont Remove Cron Not Work///////////////
QuickSearch.eat_explore_store_data_by_cron = async function eat_explore_store_data_by_cron(search, result) { };

// This cron is to running all day order address edit
const day_order_address_update_cron = new CronJob("0 22 * * *", async function(search, result) {
  console.log("day_order_address_update_cron Cron at 22 am ====>");
  var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  var get_day_orderlist = await query("SELECT * FROM Dayorder WHERE date = tomorrow");
  if (get_day_orderlist.length !=0) {    
    for (let i = 0; i < get_day_orderlist.length; i++) {
      sql.query("Select * from Address where userid = '"+get_day_orderlist[0].userid+"'  ",async function(err, res) {
        if (err) {
          console.log("error: ", err);
          //result(err, null);
        } else {         
          update_day_order_query = await query("update Dayorder set cus_lat= '"+res[0].lat+"', cus_lon='"+res[0].lon+"',cus_pincode='"+res[0].pincode+"',google_address='"+res[0].google_address+"',complete_address='"+res[0].complete_address+"',flat_house_no='"+res[0].flat_house_no+"',plot_house_no='"+res[0].plot_house_no+"',floor='"+res[0].floor+"',block_name='"+res[0].block_name+"',city="+res[0].city+"'   where id='"+get_day_orderlist[i].id+"'");
        }
      });
    }   
  }  
});
day_order_address_update_cron.start();

///// Procurement Qty Set To Zero ///////////
const procurement_qty_cron = new CronJob("0 1 * * *", async function(search, result) {
  console.log("Procurment Quantity Cron at 1 am ====>");
  var stockmapping = [];
  stockmapping.push({"zoneid":1});
  await SCM.remove_boh_mapping(stockmapping[0], async function(err,stockmappingres){
    if(stockmappingres.status==true){ console.log("Procurment Quantity Cron run Successfully"); }
  });
});
// procurement_qty_cron.start();

///// Create Invoice ///////////
const create_invoice_cron = new CronJob("0 2 * * *", async function(search, result) {
  console.log("Created Invoice Cron at 2 am ====>");
  var getdayordersquery = "select * from Dayorder where date(date)=CURDATE()";
  var getdayorders = await query(getdayordersquery);
  if(getdayorders.length>0){
    for (let i = 0; i < getdayorders.length; i++) {
      var invoicedata = [];
      invoicedata.push({"doid":getdayorders[i].id});
      await SCM.invoice_pdf(invoicedata[0], async function(err,invoiceres){
        if(invoiceres.status==true){
          var invno = "INV"+getdayorders[i].id;
          var updateinvoiceurlquery = "update Dayorder set invoice_no='"+invno+"',invoice_url='"+invoiceres.url.filename+"' where id="+getdayorders[i].id+" ";
          var updateinvoiceurl = await query(updateinvoiceurlquery);
        }
      });
    }    
  }
});
// create_invoice_cron.start();


QuickSearch.onStartAllCron = function onStartAllCron(){
    if(constant.isCronStart){
      day_order_address_update_cron.start();
      procurement_qty_cron.start();
      create_invoice_cron.start();
  }
}

QuickSearch.onStartAllCron();

module.exports = QuickSearch;