"user strict";
var sql = require("../db.js");
var masters = require("../master.js");
var Notification = require("../common/notificationModel.js");

//Task object constructor
var QueryAnswer = function(queryanswer) {
  this.qid = queryanswer.qid;
  this.answer = queryanswer.answer;
  this.type = queryanswer.type;
  this.adminid = queryanswer.adminid;
  this.userid = queryanswer.userid || 0;
  this.user_read = queryanswer.user_read || 0;
  this.admin_read = queryanswer.admin_read || 0;
};

QueryAnswer.createanswer = function createanswer(req, qtype,result) {
  sql.query("INSERT INTO Query_answers set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status: true,
        message: "replied successfully"
      };
      if(qtype)
      Notification.queries_answers_PushNotification(req.userid,req.qid,req.answer,qtype);
      result(null, resobj);
    }
  });
};

QueryAnswer.read_a_replies_id = function read_a_replies_id(qid, result) {
  sql.query("Select * from Query_answers where qid = ? order by aid asc",qid,function(err, res) {
      if (err) {
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

QueryAnswer.getFaqByType = function getFaqById(id, result) {
  sql.query("Select * from Faq where type = ? ", id, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

QueryAnswer.getAllFaq = function getAllFaq(result) {
  sql.query("Select * from Faq", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

QueryAnswer.update_read_answer = function(req, result) {
  var temp = 0;
  var aidlist = req.aidlist;
  var date = Date.now();

  for (let i = 0; i < aidlist.length; i++) {
    var query =
      "UPDATE Query_answers SET user_read = 1, updated_at = '" +
      date +
      "' WHERE aid = '" +
      aidlist[i].aid +
      "'";

    sql.query(query, function(err, res) {
      if (err) {
        result(err, null);
      }
    });

    temp++;
  }

  if (temp === aidlist.length) {
    let resobj = {
      success: true,
      status:true,
      message: "readed successfully"
    };

    result(null, resobj);
  } else {
    let resobj = {
      success: true,
      status:true,
      message: "not yet be read"
    };

    result(null, resobj);
  }
};

QueryAnswer.remove = function(id, result) {
  sql.query("DELETE FROM Faq WHERE faqid = ?", [id], function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

QueryAnswer.getAllFaqbyid = function getAllFaqByid(id, result) {
  sql.query("Select * from Faq where faqid = ? ", id, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

QueryAnswer.read_a_answer_count = function read_a_answer_count(req, result) {
  sql.query(
    "Select COUNT(*) as count from Query_answers where userid = '" +
      req.userid +
      "' and user_read = 0  and type = 0 group by user_read",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status:true,
          result: res
        };
        result(null, resobj);
      }
    }
  );
};

QueryAnswer.read_a_answer_count_by_qid = function read_a_answer_count_by_qid(
  req,
  result
) {
  sql.query(
    "Select COUNT(*) as count from Query_answers where userid = '" +
      req.userid +
      "' and user_read = 0 and qid = '" +
      req.qid +
      "' group by user_read",
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

QueryAnswer.read_a_masters = function read_a_masters(req, result) {
  var masterlist = [];
  let resobj = {
    success: true,
    status:true,
    result: masters
  };
  result(null, resobj);
};

module.exports = QueryAnswer;
