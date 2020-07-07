"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var QACheckList = function(qachecklist) {
  this.doid = qachecklist.doid;
  this.qaid = qachecklist.qaid;
}

//For Admin
QACheckList.createQACheckList = async function createQACheckList(req, result) {
    sql.query("INSERT INTO QA_check_list set ?", req,async function(err, res) {
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

QACheckList.updateQACheckList =async function updateQACheckList(req, result) {
    sql.query("UPDATE QA_check_list SET ? WHERE qacid = ?", [req, req.qacid],async function(err, res) {
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

module.exports = QACheckList;