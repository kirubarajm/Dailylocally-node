"user strict";
var sql = require("../db.js");
const util = require("util");
const constant = require("../constant");
const query = util.promisify(sql.query).bind(sql);
const OrderPackageInventory= require("../common/orderpackageModel");
const Notification = require("../../model/common/notificationModel.js");
const PushConstant = require("../../push/PushConstant.js");
//Task object constructor
var PackageInvetoryTracking = function(packageinvetory) {
  this.makeit_id = packageinvetory.makeit_id;
  this.remaining_count = packageinvetory.remaining_count || 0;
  this.packageid = packageinvetory.packageid;
};

PackageInvetoryTracking.createPackageInventoryTracking = function createPackageInventoryTracking(
  packageinvetory,
  result
) {
  console.log(packageinvetory);
  sql.query("INSERT INTO InventoryTracking set ?", packageinvetory, function(
    err,
    res
  ) {
    if (err) {
      sql.rollback(function() {
        throw err;
      });
      //res(null, err);
    } else {
      let resobj = {
        success: true,
        status: true
      };

      if(result)
      result(null, resobj);
    }
  });
};

PackageInvetoryTracking.deletePackageinventory = function deletePackageinventory(
  makeit_id,
  package_id,
  res
) {
  sql.query(
    "DELETE FROM InventoryTracking where makeit_id = " +
      makeit_id +
      " and packageid =" +
      package_id,
    function(err, result) {
      if (err) {
        console.log("error: ", err);
        res(null, err);
      }
    }
  );
};

PackageInvetoryTracking.CheckandUpdate = function CheckandUpdate(
  packageinvetory,
  result
) {
  var makeit_id = packageinvetory.makeit_id;
  var packageid = packageinvetory.packageid;
  var count = packageinvetory.count;
  sql.query(
    "SELECT * FROM InventoryTracking where makeit_id = " +
      makeit_id +
      " and packageid =" +
      packageid +
      " order by id desc limit 1",
    function(err, res) {
      if (err) {
        result(null, err);
      } else {
        if (res.length > 0) {
          console.log(
            res[0].remaining_count + "--res[0].remaining_count--" + count
          );
          var remaining_count = res[0].remaining_count;
          var total_count = parseInt(count) + parseInt(remaining_count);
          var package_inventory_tracking = new PackageInvetoryTracking(
            packageinvetory
          );
          package_inventory_tracking.remaining_count = total_count;
          PackageInvetoryTracking.createPackageInventoryTracking(
            package_inventory_tracking,
            result
          );
        } else {
          var package_inventory_tracking = new PackageInvetoryTracking(
            packageinvetory
          );
          package_inventory_tracking.remaining_count = packageinvetory.count;
          PackageInvetoryTracking.createPackageInventoryTracking(
            package_inventory_tracking,
            result
          );
        }
      }
    }
  );
};

PackageInvetoryTracking.StocksUpdate = function StocksUpdate(
  packageinvetory,
  result
) {
  var makeit_id = packageinvetory.makeit_id;
  var packageid = packageinvetory.packageid;
  var count = parseInt(packageinvetory.count);
  var oldcount = parseInt(packageinvetory.oldCount);
  sql.query(
    "SELECT * FROM InventoryTracking where makeit_id = " +
      makeit_id +
      " and packageid =" +
      packageid +
      " order by id desc limit 1",
    function(err, res) {
      if (err) {
        result(null, err);
      } else {
        if (res.length > 0) {
          var remaining_count = parseInt(res[0].remaining_count);
          var total_count=0;
          var i=0;

          if(oldcount>count){
            i=oldcount-count;
            total_count=remaining_count-i;
          }else if(count>oldcount){
            i=count-oldcount;
            total_count=remaining_count+i;
          }else if(count==oldcount){
            total_count=0;
          }

          if(total_count>-1){
            //total_count =(remaining_count-count);
            // if(remaining_count<count){
            //   total_count = (count - remaining_count)+remaining_count;
            // }else if(remaining_count>=count){
            //   total_count = remaining_count-(remaining_count-count);
            // }
            var package_inventory_tracking = new PackageInvetoryTracking(
              packageinvetory
            );
            package_inventory_tracking.remaining_count = total_count;
            PackageInvetoryTracking.createPackageInventoryTracking(
              package_inventory_tracking,
              null
            );
            let resobj = {
              success: true,
              status: true,
            };
            result(null, resobj);
          }else{
            let resobj = {
              success: true,
              status: false,
              message:count==oldcount?"Sorry cann't edit old and new count values are same.":"Sorry Cann't edit enter count exit the remaing count."
            };
            result(null, resobj);
          }
        }
      }
    }
  );
};

PackageInvetoryTracking.orderbasedpackageTracking = function orderbasedpackageTracking(
  orderid,
  makeit_id,
  result
) {
  var productQuery =
    "SELECT pp.count,pp.package_id,oi.quantity,pp.makeit_id,pp.product_id FROM OrderItem oi left join ProductPackaging pp on (pp.makeit_id =" +
    makeit_id +
    " and pp.product_id=oi.productid) where orderid=" +
    orderid;
  sql.query(productQuery, async function(err, res) {
    if (err) {
      console.log('InventoryTracking-->',err);
     // result(null, err);
    } else {
      var limt_exited_package_name="";
      var isLimitExited=false;
      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          var productpackingItem = res[i];
          console.log("productpackingItem-->",productpackingItem.package_id);
          //
          if (productpackingItem.package_id&&productpackingItem.package_id!==constant.order_cover_package_id) {
            var productPackageQuery =
              "SELECT it.*,pb.name FROM InventoryTracking it left join PackagingBox pb on pb.id=it.packageid where it.makeit_id = " +makeit_id +" and it.packageid =" +productpackingItem.package_id +" order by it.id desc limit 1";
              productpackingItem.orderid=orderid;
              var orderPackageInventory = new OrderPackageInventory(productpackingItem);
              await OrderPackageInventory.createorderpackage(orderPackageInventory,result);
              const respack = await query(productPackageQuery);
            if (respack && respack.length > 0) {
              var productPackageCount =
                productpackingItem.count * productpackingItem.quantity;
              var packageInventoryRemainCount = respack[0].remaining_count;
              var UpdateCount = 0;
              if (packageInventoryRemainCount >= productPackageCount)
                UpdateCount = packageInventoryRemainCount - productPackageCount;
              var packageinvetory = {};
              packageinvetory.remaining_count = UpdateCount;
              packageinvetory.makeit_id = makeit_id;
              packageinvetory.packageid = respack[0].packageid;
              var package_inventory_tracking = new PackageInvetoryTracking(
                packageinvetory
              );
              PackageInvetoryTracking.createPackageInventoryTracking(
                package_inventory_tracking,
                result
              );
              if(UpdateCount<constant.makeit_package_alert_count){
                limt_exited_package_name=limt_exited_package_name?limt_exited_package_name+","+respack[0].name:respack[0].name;
                isLimitExited=true;
              }
            }
          }
        }
      }
      var orderPackageQuery = "SELECT it.*,pb.name FROM InventoryTracking it left join PackagingBox pb on pb.id=it.packageid where it.makeit_id = " +makeit_id +" and it.packageid ="+constant.order_cover_package_id+" order by it.id desc limit 1";
      const orderpack = await query(orderPackageQuery);
      if (orderpack && orderpack.length > 0) {
        var orderPackageInventoryRemainCount = orderpack[0].remaining_count;
        var UpdateCount = 0;
        if (orderPackageInventoryRemainCount >= 1)
          UpdateCount = orderPackageInventoryRemainCount - 1;
        var orderPackageinvetory = {};
        orderPackageinvetory.remaining_count = UpdateCount;
        orderPackageinvetory.makeit_id = makeit_id;
        orderPackageinvetory.packageid = orderpack[0].packageid;

        if(UpdateCount<constant.makeit_package_alert_count){
          limt_exited_package_name=limt_exited_package_name?limt_exited_package_name+","+respack[0].name:respack[0].name;
          isLimitExited=true;
        }

        var order_package_inventory_tracking = new PackageInvetoryTracking(
          orderPackageinvetory
        );
        PackageInvetoryTracking.createPackageInventoryTracking(
          order_package_inventory_tracking,
          result
        );
      }

      if(isLimitExited){
        await Notification.orderMakeItPackagePushNotification(
          makeit_id,limt_exited_package_name +" Package limit is exceeded.",
          PushConstant.pageidMakeit_Package_limit
        );
      }
    }
  });
};

module.exports = PackageInvetoryTracking;
