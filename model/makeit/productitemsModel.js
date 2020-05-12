"user strict";
var sql = require("../db.js");
var Productitem = require("../../model/makeit/productitemsModel.js");

//Task object constructor
var Productitem = function(productitem) {
  this.productid = productitem.productid;
  this.itemid = productitem.itemid;
  this.quantity = productitem.quantity;
  this.delete_status = productitem.delete_status || 0;
};

Productitem.createProductitems = function createProductitems(product_item,res) {

  console.log(product_item);
  sql.query("INSERT INTO Productitem set ?", product_item, function(err,result) {
    if (err) {
      sql.rollback(function() {
        throw err;
      });
      //res(null, err);
    }
  });
};

Productitem.deleteProductitems = function deleteProductitems(productid,itemids,res) {
  sql.query(
    "DELETE FROM Productitem where productid = " +productid +" and itemid NOT IN (" +itemids +") ",function(err, result) {
      if (err) {
        console.log("error: ", err);
        res(null, err);
      }
    }
  );
};

Productitem.updateProductitems = function updateProductitems(
  product_item,
  result
) {
  sql.query(
    " select * from Productitem where productid = " +
      product_item.productid +
      " and itemid = " +
      product_item.itemid +
      "",
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        if (res.length == 0) {
          sql.query("INSERT INTO Productitem set ?", product_item, function(
            err,
            result
          ) {
            if (err) {
              console.log("error: ", err);
              res(null, err);
            }
          });
          let sucobj = true;
          let resobj = {
            success: sucobj,
            status: true
          };

          result(null, resobj);
        } else if (res.length == 1) {
          console.log("update");
          sql.query(
            "update Productitem set quantity = ?, updated_at= ? where productid = ? and itemid = ?",
            [
              product_item.quantity,
              new Date(),
              product_item.productid,
              product_item.itemid
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
module.exports = Productitem;
