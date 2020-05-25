"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Category = function(category) {
  this.name = category.name;
  this.image = category.image;
}

//For Admin
Category.createCategory = async function createCategory(req) {
    req.active_status=1;
    sql.query("INSERT INTO Category set ?", req,async function(err, res) {
        if (err) {
            return err;
        } else {
             return res;
        }
    });    
};

Category.updateCategory =async function updateCategory(req) {
    sql.query("UPDATE Category SET ? WHERE catid = ?", [req, req.catid],async function(err, res) {
        if (err) {
            return err;
        } else {
            return res;
        }
      }
    );
};

module.exports = Category;