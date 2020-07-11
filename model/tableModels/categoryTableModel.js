"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var Category = function(category) {
  this.catid = category.catid
  this.name = category.name;
  this.image = category.image;
  this.thumbimage = category.thumbimage;
  this.active_status = category.active_status;
}

//For Admin
Category.createCategory = async function createCategory(req, result) {   
    req.active_status=0;
    var insertdata = new Category(req);
    sql.query("INSERT INTO Category set ?", insertdata,async function(err, res) {
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
    var updatedata = new Category(req);
    sql.query("UPDATE Category SET ? WHERE catid = ?", [updatedata, updatedata.catid],async function(err, res) {
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