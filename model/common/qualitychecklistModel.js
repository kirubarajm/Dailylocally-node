"user strict";
var sql = require("../db.js");

//Task object constructor
var QC_check_list = function(qc_check_list) {
  this.doid = qc_check_list.doid;
  this.vpid = qc_check_list.vpid;
  this.qcid = qc_check_list.qcid;
};

QC_check_list.create_qc_check_list= function create_qc_check_list(new_check_list, result) {
  sql.query("INSERT INTO QC_check_list set ?", new_check_list, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "QC_check_list created succesfully",
        faqid: res.insertId
      };

      result(null, resobj);
    }
  });
};

module.exports = QC_check_list;