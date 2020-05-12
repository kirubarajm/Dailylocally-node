'user strict';
var sql = require('../db.js');

//Task object constructor
var Question = function(question){
    this.makeit_userid = question.makeit_userid;
    this.date=question.date;
    this.question=question.question;
    this.status=question.status;
    this.answer=question.answer;
   // this.created_at = new Date();
};


Question.createQuestion = function createQuestion(newQuestion, result) {    
        sql.query("INSERT INTO Questions set ?", newQuestion, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    result(null, res.insertId);
                }
            });           
};

Question.getQuestionById = function getQuestionById(userId, result) {
        sql.query("Select * from Questions where questionid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Question.getAllQuestion = function getAllQuestion(result) {
        sql.query("Select * from Questions", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Question : ', res);  

                 result(null, res);
                }
            });   
};

Question.getAllQuestionByMakeituserid = function getAllQuestionByMakeituserid(userId,result) {
        sql.query("Select * from Questions where makeit_userid = ? ", userId, function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Question : ', res);  
                 result(null, res);
                }
            });   
};

Question.updateById = function(id, user, result){
  sql.query("UPDATE Questions SET task = ? WHERE questionid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Question.remove = function(id, result){
     sql.query("DELETE FROM Questions WHERE questionid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};

module.exports= Question;