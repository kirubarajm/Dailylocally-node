"user strict";
var sql = require("../db.js");
const util = require("util");
const constant = require("../constant");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Packageitem = function(packageitem) {
  this.product_id = packageitem.product_id;
  this.makeit_id = packageitem.makeit_id;
  this.count = packageitem.count || 0;
  this.package_id = packageitem.package_id;
};

Packageitem.createPackageitems = function createPackageitems(product_item,res) {

  console.log(product_item);
  sql.query("INSERT INTO ProductPackaging set ?", product_item, function(err,result) {
    if (err) {
      sql.rollback(function() {
        throw err;
      });
      //res(null, err);
    }
  });
};

Packageitem.deletePackageitems = function deletePackageitems(product_id,package_id,res) {
  sql.query(
    "DELETE FROM ProductPackaging where product_id = " +
    product_id +
      " and package_id NOT IN (" +
      package_id +
      ") ",
    function(err, result) {
      if (err) {
        console.log("error: ", err);
        res(null, err);
      }
    }
  );
};

Packageitem.updatePackageitems = function updatePackageitems(
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
          sql.query("INSERT INTO ProductPackaging set ?", package_item, function(
            err,
            result
          ) {
            if (err) {
              console.log("error: ", err);
              res(null, err);
            }else{
              console.log("result===>: ", result);
            }
          });
          let resobj = {
            success: true,
            status:true
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
          let resobj = {
            success: true,
            status:true
          };

          result(null, resobj);
        }
      }
    }
  );
};

Packageitem.packageitemlist = function packageitemlist(req, result) {
  var packageQuery="select pb.name,pp.count,pp.product_id,pp.package_id,mu.makeit_type from ProductPackaging pp join PackagingBox pb on pb.id =pp.package_id join MakeitUser mu on mu.userid =pp.makeit_id where pp.product_id = "+ req.productid
  sql.query(packageQuery,
    function(err, res) {
      if (err) {
        result(null, err);
      } else {
        let resobj = {
          success: true,
          status:true,
          result:(res.length>0 && res[0].makeit_type===1)?[]:res
        };
        result(null, resobj);
      }
    }
  );
};
module.exports = Packageitem;
