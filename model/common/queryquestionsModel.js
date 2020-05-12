"user strict";
var sql = require("../db.js");
var QueryAnswer = require("../../model/common/queryanswerModel");
var moment = require("moment");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var QueryQuestions = function(queryquestions) {
  this.question = queryquestions.question;
  this.type = queryquestions.type;
  this.userid = queryquestions.userid;
  this.admin_read = queryquestions.admin_read || 0;
  this.orderid = queryquestions.orderid || null;
  // this.created_at = new Date();
};

QueryQuestions.createquestions = function createquestions(req, result) {
  sql.query("INSERT INTO Query_questions  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Questions created successfully"
      };
      result(null, resobj);
    }
  });
};

QueryQuestions.read_a_question_id = function read_a_question_id(req, result) {
  var query =
    "SELECT qqs.* ,SUM(CASE WHEN qa.user_read = 0 THEN 1 ELSE 0 END) AS un_read_count FROM Query_questions AS qqs LEFT JOIN Query_answers AS qa ON (qqs.qid = qa.qid)";
  if (req.type) {
    query = query + "WHERE qqs.type='" + req.type + "'";
  }
  if (req.userid) {
    query = query + " and qqs.userid='" + req.userid + "'";
  }

  query = query + "GROUP BY qqs.qid ORDER BY qa.created_at desc";

  sql.query(query,async function(err, res) {
    if (err) {
      result(err, null);
    } else {

    
      let resobj = {
        success: true,
        status:true,
        result: res}
      result(null, resobj);
    }
  });

  //               async function  getunreadcount(userid,qid){

  //                let count = await sql.query("Select COUNT(*) as count from Query_answers where userid = '"+userid+"' and user_read = 0 and qid = '"+qid+"' group by user_read");

  //               // count = await res1;
  //                 console.log(count)
  //                  return count;
  //              }
  // } catch (error) {
  //     var errorCode = 402;
  // }
};



QueryQuestions.read_a_question_id_by_admin = function read_a_question_id_by_admin(req, result) {
  var query =
    "SELECT qqs.* ,SUM(CASE WHEN qa.admin_read = 0 THEN 1 ELSE 0 END) AS admin_un_read_count FROM Query_questions AS qqs LEFT JOIN Query_answers AS qa ON (qqs.qid = qa.qid)";
  if (req.type) {
    query = query + "WHERE qqs.type='" + req.type + "'";
  }
  if (req.userid) {
    query = query + " and qqs.userid='" + req.userid + "'";
  }

  query = query + "GROUP BY qqs.qid ORDER BY admin_un_read_count desc,qqs.created_at desc,qqs.admin_read";
  
  console.log(query);

  sql.query(query,async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {

    

      let resobj = {
        success: true,
        status:true,
        result: res}
      result(null, resobj);
    }
  });
};

QueryQuestions.get_user_list_by_type = function get_user_list_by_type(type, result) {
 
  if (type < 5) {
 var type  = parseInt(type)

  if (type === 1) {
   var query =  "Select  mk.name, mk.email, mk.phoneno, mk.brandname,qqs.userid,SUM(qqs.admin_read = 0 or (qqa.admin_read = 0 and qqa.adminid=0)) as count from Query_questions AS qqs left JOIN MakeitUser AS mk ON qqs.userid = mk.userid left JOIN Query_answers AS qqa ON qqa.qid = qqs.qid where qqs.type='"+type+"' ";
  } else if (type === 2) {
    var query =  "Select mu.name,mu.email,mu.phoneno,qqs.userid,SUM(qqs.admin_read = 0 or (qqa.admin_read = 0 and qqa.adminid=0)) as count from Query_questions AS qqs left JOIN MoveitUser AS mu ON qqs.userid = mu.userid left JOIN Query_answers AS qqa ON qqa.qid = qqs.qid where qqs.type ='"+type+"' ";
  }else if (type === 3) {
    var query =  "Select se.name,se.email,se.phoneno,se.id,SUM(qqs.admin_read = 0) as count from Query_questions AS qqs left JOIN Sales_QA_employees AS se ON qqs.userid = se.id where qqs.type ='"+type+"' ";
  }else if (type === 4) {
    var query =  "Select us.name,us.email,us.phoneno,us.userid,SUM(qqs.admin_read = 0 or (qqa.admin_read = 0 and qqa.adminid=0)) as count ,(SELECT substring_index(GROUP_CONCAT(DISTINCT CONCAT(ors.orderid)ORDER BY ors.orderid desc SEPARATOR ','), ',', 5) as last_orderids from Orders ors WHERE ors.userid = qqs.userid) AS last_orderids from Query_questions AS qqs left JOIN User AS us ON qqs.userid= us.userid left JOIN Query_answers AS qqa ON qqa.qid = qqs.qid where qqs.type='"+type+"'";
  }
 
    query = query + "group by qqs.userid ORDER BY count desc,qqs.created_at desc,qqs.admin_read";

  console.log(query);

  sql.query(query,async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res}
      result(null, resobj);
    }
  });
}else{
  let resobj = {
    success: true,
    status:false,
    message:"Sorry there is no user type is exist!"
  }
  result(null, resobj);
}
}


QueryQuestions.getFaqByType = function getFaqById(id, result) {
  sql.query("Select * from Query_questions where type = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

QueryQuestions.getAllFaq = function getAllFaq(result) {
  sql.query("Select * from Query_questions", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Faq : ", res);

      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

QueryQuestions.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Query_questions SET task = ? WHERE faqid = ?",
    [task.task, id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

QueryQuestions.remove = function(id, result) {
  sql.query("DELETE FROM Query_questions WHERE faqid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

QueryQuestions.getAllFaqbyid = function getAllFaqByid(id, result) {
  sql.query("Select * from Query_questions where faqid = ? ", id, function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      console.log("Faq : ", res);
      result(null, res);
    }
  });
};




QueryQuestions.update_read_answer_by_admin = function(req, result) {
  var temp = 0;
 // var qidlist = req.qidlist;
  //var date = Date.now();

  var date = moment().format("YYYY-MM-DD HH:mm:ss");

  // console.log();

  // for (let i = 0; i < qidlist.length; i++) {
    var qusquery ="UPDATE Query_questions SET admin_read = 1, updated_at = '"+date+"' WHERE qid = '" +req.qid +"'";

    //  console.log(query);
    sql.query(qusquery, function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      }else{
        
        var ansreadquery ="UPDATE Query_answers SET admin_read = 1, updated_at = '"+date +"' WHERE qid = '"+req.qid +"'"; 

        sql.query(ansreadquery, function(err, res1) {
          if (err) {
            console.log("error: ", err);
            result(null, err);
          }else{
          
            let message = "readed successfully";
            let resobj = {
              success: true,
              message: message,
              status: true
            };
    
        result(null, resobj);
          }
        });
       
      }
    });

    


  //   temp++;
  // }

  // if (temp === qidlist.length) {
  //   let sucobj = true;
  //   let message = "readed successfully";
  //   let resobj = {
  //     success: sucobj,
  //     message: message
  //   };

  //   result(null, resobj);
  // } else {
  //   let sucobj = true;
  //   let message = "not yet be read";
  //   let resobj = {
  //     success: sucobj,
  //     message: message
  //   };

  //   result(null, resobj);
  // }
};

QueryQuestions.get_user_by_type = function get_user_by_type(req, result) {
  var type=req.type;
  var userid =req.userid;
 
  if (type < 5) {
 var type  = parseInt(type)

  if (type === 1) {
   var query =  "Select  mk.name, mk.email, mk.phoneno, mk.brandname,qqs.userid,SUM(qqs.admin_read = 0) as count from Query_questions AS qqs left JOIN MakeitUser AS mk ON qqs.userid = mk.userid where qqs.type='"+type+"' and qqs.userid='"+userid+"'";
  } else if (type === 2) {
    var query =  "Select mu.name,mu.email,mu.phoneno,qqs.userid,SUM(qqs.admin_read = 0) as count from Query_questions AS qqs left JOIN MoveitUser AS mu ON qqs.userid = mu.userid where qqs.type ='"+type+"' and qqs.userid='"+userid+"'";
  }else if (type === 3) {
    var query =  "Select se.name,se.email,se.phoneno,se.id,SUM(qqs.admin_read = 0) as count from Query_questions AS qqs left JOIN Sales_QA_employees AS se ON qqs.userid = se.id where qqs.type ='"+type+"' and qqs.userid='"+userid+"'";
  }else if (type === 4) {
    var query =  "Select us.name,us.email,us.phoneno,us.userid,substring_index(GROUP_CONCAT(DISTINCT CONCAT(ors.orderid)ORDER BY ors.orderid desc SEPARATOR ','), ',', 5) as last_orderids from Query_questions AS qqs left JOIN User AS us ON qqs.userid = us.userid left JOIN Orders AS ors ON ors.userid = us.userid where qqs.type='"+type+"' and qqs.userid='"+userid+"'";
  }
 
    query = query + "group by qqs.userid";

  //console.log(query);

  sql.query(query,async function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res}
      result(null, resobj);
    }
  });
}else{
  let resobj = {
    success: true,
    status:false,
    message:"Sorry there is no user type is exist!"
  }
  result(null, resobj);
}
};

module.exports = QueryQuestions;
