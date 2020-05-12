"user strict";
var sql = require("../db.js");
var PackageInvetoryTeacking = require("../../model/makeit/packageInventoryTrackingModel.js");
const constant = require("../constant");
//Task object constructor
var PackageInvetory = function(packageinvetory) {
  this.makeit_id = packageinvetory.makeit_id;
  this.count = packageinvetory.count || 0;
  this.packageid = packageinvetory.packageid;
};

PackageInvetory.createPackageInventory = function createPackageInventory(
  packageinvetory,
  result
) {
  sql.query("INSERT INTO Package_Inventory set ?", packageinvetory, function(
    err,
    res
  ) {
    if (err) {
      sql.rollback(function() {
        throw err;
      });
    }else{
      let resobj = {
        success: true,
        status:true
      };
      PackageInvetoryTeacking.CheckandUpdate(packageinvetory,function(
        err,
        res
      ) {
        if (err) {
          sql.rollback(function() {
            throw err;
          });
        }
      });

      result(null, resobj);
    }
  });
};

PackageInvetory.packageInventoryCheckAfterCreate = function packageInventoryCheckAfterCreate(
  packageinvetory,
  result
) {
  sql.query("SELECT * from Package_Inventory where date(created_at)= CURDATE() and makeit_id = "+packageinvetory.makeit_id+" and packageid="+packageinvetory.packageid, function(
    err,
    res
  ) {
    if (err) {
      result(null, err);
    }else{
      if(res.length>0){
        let resobj = {
          success: true,
          status:false,
          message:'Already added this package in today'
        };
        result(null, resobj);
      }else{
          PackageInvetory.createPackageInventory(packageinvetory,result);
      }
    }
  });
};

PackageInvetory.deletePackageinventory = function deletePackageinventory(
  makeit_id,
  package_id,
  res
) {
  sql.query(
    "DELETE FROM Package_Inventory where makeit_id = " +
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

PackageInvetory.updatePackageitems = function updatePackageitems(
  package_item,
  result
) {
  sql.query(
    " select * from ProductPackaging where product_id = " +
      package_item.product_id +
      " and package_id = " +
      package_item.package_id +
      "",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        console.log("res===>: ", res.length);
        if (res.length == 0) {
          sql.query(
            "INSERT INTO ProductPackaging set ?",
            package_item,
            function(err, result) {
              if (err) {
                console.log("error: ", err);
                res(null, err);
              } else {
                console.log("result===>: ", result);
              }
            }
          );
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true
          };

          result(null, resobj);
        } else if (res.length == 1) {
          console.log("update");
          sql.query(
            "update ProductPackaging set count = ?, updated_at= ? where product_id = ? and package_id = ?",
            [
              package_item.count,
              new Date(),
              package_item.product_id,
              package_item.package_id
            ],
            function(err, result) {
              if (err) {
                console.log("error: ", err);
                res(null, err);
              }
            }
          );
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true
          };

          result(null, resobj);
        }
      }
    }
  );
};

PackageInvetory.getPackageInventoryList = function getPackageInventoryList(
  req,
  result
) {
  var packageQuery =
    "select * from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid where pi.makeit_id = " +
    req.makeit_id+" order by pi.created_at desc";
  sql.query(packageQuery, function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};

PackageInvetory.getPackageMapInventoryList = function getPackageMapInventoryList(
  req,
  result
) {
  //var packageQuery ="SELECT it.packageid as id,pb.name FROM InventoryTracking it left join PackagingBox pb on pb.id =it.packageid where it.makeit_id="+req.makeit_id+" and it.packageid!="+constant.order_cover_package_id+ " GROUP BY it.packageid";
  var packageQuery ="SELECT * FROM PackagingBox where id!="+constant.order_cover_package_id;
  sql.query(packageQuery, function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};

PackageInvetory.getPackageInventoryByid = function getPackageInventoryByid(
  req,
  result
) {
  var packageQuery ="select pi.*,pb.*,mk.brandname from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid join MakeitUser mk on mk.userid=pi.makeit_id where pi.id="+req.inventoryid;
  sql.query(packageQuery, function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        result: res
      };

      result(null, resobj);
    }
  });
};

PackageInvetory.getPackageInventoryStockList = function getPackageInventoryStockList(
  req,
  result
) {
  var listlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * listlimit;
  
  // SELECT mk.userid,mk.name,mk.phoneno,mk.brandname,it.packageid,it.remaining_count,pb.name FROM MakeitUser mk right join InventoryTracking it on it.makeit_id=mk.userid left join PackagingBox pb on it.packageid =pb.id where it.id in (SELECT max(id) FROM InventoryTracking where makeit_id=mk.userid GROUP BY packageid) and  it.packageid=1
  var packageStockQuery ="SELECT mk.userid,mk.phoneno,mk.brandname,it.packageid,it.remaining_count,pb.name FROM MakeitUser mk right join InventoryTracking it on it.makeit_id=mk.userid left join PackagingBox pb on it.packageid =pb.id where it.id in (SELECT max(id) FROM InventoryTracking where makeit_id=mk.userid GROUP BY packageid)"

  if(req.search){
    packageStockQuery=packageStockQuery+" and (mk.brandname like '%"+req.search+"%' or mk.userid LIKE  '%" + req.search +"%' or pb.name LIKE  '%" + req.search +"%')" 
  }

  if(req.isAlert){
    packageStockQuery=packageStockQuery+" and it.remaining_count<=25"
  }

  var limitquery = packageStockQuery +" limit " +startlimit +"," +listlimit;

  
  sql.query(packageStockQuery+";"+limitquery, function(err, res) {
    if (err) {
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        pageLimt:listlimit,
        total_list_count:res[0].length,
        result: res[1]
      };

      result(null, resobj);
    }
  });
};

PackageInvetory.getAllPackageInventoryList = function getAllPackageInventoryList(
  req,
  result
) {

  var listlimit = 20;
  var page = req.page || 1;
  var startlimit = (page - 1) * listlimit;
  

  var packageInventoryQuery ="select pi.id,mk.userid,mk.name,mk.phoneno,mk.brandname,pi.packageid,pi.created_at,pi.count,pb.name as pname from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid join MakeitUser mk on mk.userid=pi.makeit_id"

  if(req.search){
    packageInventoryQuery=packageInventoryQuery+" and (mk.brandname like '%"+req.search+"%' or mk.userid LIKE  '%" + req.search +"%' or pb.name LIKE  '%" + req.search +"%')" 
  }

  packageInventoryQuery =packageInventoryQuery+" order by pi.created_at desc";

  
  var limitquery = packageInventoryQuery +" limit " +startlimit +"," +listlimit;

  sql.query(packageInventoryQuery+";"+limitquery, function(err, res) {
    if (err) {
      console.log("err-->",err);
      result(null, err);
    } else {
      let resobj = {
        success: true,
        status: true,
        pageLimt:listlimit,
        total_list_count:res[0].length,
        result: res[1]
      };

      result(null, resobj);
    }
  });
};


PackageInvetory.updatePackageInventory = function updatePackageInventory(
  req,
  result
) {
  var packageQuery ="select pi.*,pb.*,mk.brandname from Package_Inventory pi join PackagingBox pb on pb.id =pi.packageid join MakeitUser mk on mk.userid=pi.makeit_id where pi.id="+req.inventoryid;
  sql.query(packageQuery, function(err, res) {
    if (err) {
      result(null, err);
    } else {
            req.oldCount=res[0].count;
            PackageInvetoryTeacking.StocksUpdate(req,function(
              err,
              res2
            ) {
              if (err) {
                result(null, err);
              }else{
                if(res2.status){
                    sql.query(
                      "update Package_Inventory set count = ?, updated_at= ?, packageid = ?, makeit_id = ? where id = ? ",
                      [
                        req.count,
                        new Date(),
                        req.packageid,
                        req.makeit_id,
                        req.inventoryid
                      ],
                      function(err, res3) {
                        if (err) {
                          result(null, err);
                        }else{
                          let resobj = {
                            success: true,
                            status: true,
                            message:"Update Successfully"
                          };
                          result(null, resobj);
                  }
                });
              }else result(null, res2);
          }
        }
      );
      
    }
  });
};

module.exports = PackageInvetory;
