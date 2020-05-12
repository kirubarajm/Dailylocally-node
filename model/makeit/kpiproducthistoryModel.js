"user strict";
var sql = require("../db.js");

//Task object constructor
var kpiproducthistory = function(kpiproducthistory) {
  this.makeit_id        = kpiproducthistory.makeit_id;
  this.product_id       = kpiproducthistory.product_id;
  this.quantity         = kpiproducthistory.quantity || 0;
};

kpiproducthistory.createkpiProducthistory = function createkpiProducthistory(kpiproduct_history,res) {
    console.log(kpiproduct_history);
    sql.query("INSERT INTO KPI_Product_History set ?", kpiproduct_history, function(err,result) {
        if (err) {
            sql.rollback(function() {
                throw err;
            });
        //res(null, err);
        }
    });
};

module.exports = kpiproducthistory;