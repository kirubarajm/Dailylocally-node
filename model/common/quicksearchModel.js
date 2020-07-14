"user strict";
var sql = require("../db.js");
const CronJob = require("cron").CronJob;
const util = require("util");
var moment = require("moment");
var constant = require("../constant");
var producthistory = require("../../model/makeit/liveproducthistoryModel.js");
var MoveitFireBase = require("../../push/Moveit_SendNotification");
var Ordersqueue = require("../../model/common/ordersqueueModel");
var Notification = require("../../model/common/notificationModel.js");
var PushConstant = require("../../push/PushConstant.js");
var isCronRun=false;
var Order = require("../../model/common/orderModel.js");
var OrderStatusHistory = require("../common/orderstatushistoryModel");
var Dunzo = require("../../model/webhooks/dunzoModel.js");
var dunzoconst = require('../../model/dunzo_constant');
var PackageStockInventory = require('../makeit/packageStockModel');
var kpiproducthistory = require("../makeit/kpiproducthistoryModel.js");
var Moveituser = require("../moveit/moveitUserModel.js");
var MoveitDayWise = require("../../model/common/moveitdaywiseModel.js");
var MakeitDayWise = require("../../model/common/makeitdaywiseModel.js");
var Makeitlog =require("../../model/common/makeittimelogModel.js");
var Makeittotalrevenue = require("../../model/common/MakeittotalrevenueModel");
var CronLog = require("../../model/common/cronlogModel");

const start_cron=1;
const end_cron=2;
const query = util.promisify(sql.query).bind(sql);
var QuickSearch   = function(QuickSearch) {
  this.eatuserid  = QuickSearch.eatuserid;
  this.productid  = QuickSearch.productid || 0;
  this.makeit_userid = QuickSearch.makeit_userid || 0;
};



// This cron is to running all day order address edit
const day_order_address_update_cron = new CronJob("0 22 * * *", async function(search, result) {

  var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

  var get_day_orderlist = await query("SELECT * FROM Dayorder WHERE date = tomorrow");

  if (get_day_orderlist.length !=0) {
    
    for (let i = 0; i < get_day_orderlist.length; i++) {

      sql.query("Select * from Address where userid = '"+get_day_orderlist[0].userid+"'  ", function(err, res) {
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


  

QuickSearch.onStartAllCron = function onStartAllCron(){
    if(constant.isCronStart){
      day_order_address_update_cron.start();
  }
}

QuickSearch.onStartAllCron();

module.exports = QuickSearch;