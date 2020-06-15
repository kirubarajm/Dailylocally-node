"user strict";
var sql = require("../db.js");

//Task object constructor
var QA_check_list = function(qa_check_list) {
  this.doid = qa_check_list.doid;
  this.vpid = qa_check_list.vpid;
  this.qaid = qa_check_list.qaid;
};

QA_check_list.create_qa_check_list= function create_qa_check_list(new_check_list, result) {
  sql.query("INSERT INTO QA_check_list set ?", new_check_list, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "QA_check_list created succesfully",
        faqid: res.insertId
      };

      result(null, resobj);
    }
  });
};

module.exports = QA_check_list;