"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Category = function(category) {
  this.name = category.name;
  this.image = category.image;
  this.active_status = category.active_status;
}

//For Admin
Category.createCategory = async function createCategory(req, result) {
    req.active_status=0;
    sql.query("INSERT INTO Category set ?", req,async function(err, res) {
        if (err) {
            let resobj = {
                success: true,
                status: false,
                message: err
            };
            result(null, resobj);
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

Category.updateCategory =async function updateCategory(req, result) {
    sql.query("UPDATE Category SET ? WHERE catid = ?", [req, req.catid],async function(err, res) {
        if (err) {
            let resobj = {
                success: true,
                status: false,
                message: err
            };
            result(null, resobj);
        } else {
            let resobj = {
                success: true,
                status: true,
                result: res
            };
            result(null, resobj);
        }
      }
    );
};

module.exports = Category;