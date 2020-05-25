"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Subcategoryl1 = function(subcategoryl1) {
  this.name = subcategoryl1.name;
  this.image = subcategoryl1.image;
  this.catid = subcategoryl1.catid;
}

//For Admin
Subcategoryl1.createSubcategoryl1 = async function createSubcategoryl1(req) {
    req.active_status=1;
    sql.query("INSERT INTO SubcategoryL1 set ?", req,async function(err, res) {
        if (err) {
            return err;
        } else {
             return res;
        }
    });    
};

Subcategoryl1.updateSubcategoryl1 =async function updateSubcategoryl1(req) {
    sql.query("UPDATE SubcategoryL1 SET ? WHERE scl1_id = ?", [req, req.scl1_id],async function(err, res) {
        if (err) {
            return err;
        } else {
            return res;
        }
      }
    );
};

module.exports = Subcategoryl1;