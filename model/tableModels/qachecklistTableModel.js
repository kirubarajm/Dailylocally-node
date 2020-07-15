"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var QACheckList = function(qachecklist) {
  this.qacid = qachecklist.qacid;
  this.doid = qachecklist.doid;
  this.qaid = qachecklist.qaid;
  this.qavalue = qachecklist.qavalue;
}

//For Admin
QACheckList.createQACheckList = async function createQACheckList(req, result) {
    var insertdata = new QACheckList(req);
    sql.query("INSERT INTO QA_check_list set ?", insertdata,async function(err, res) {
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
    var updatedata = new QACheckList(req);
    sql.query("UPDATE QA_check_list SET ? WHERE qacid = ?", [updatedata, updatedata.qacid],async function(err, res) {
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