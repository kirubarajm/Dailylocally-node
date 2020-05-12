"use strict";

var Question = require("../../model/sales/questionModel.js");

exports.list_all_question = function(req, res) {
  Question.getAllQuestion(function(err, question) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", question);
    res.send(question);
  });
};

exports.create_a_question = function(req, res) {
  var new_question = new Question(req.body);
  console.log(new_question);
  //handles null error
  if (!new_question.question) {
    res.status(400).send({ error: true, message: "Please provide question" });
  } else {
    Question.createQuestion(new_question, function(err, question) {
      if (err) res.send(err);
      res.json(question);
    });
  }
};

exports.read_a_question = function(req, res) {
  Question.getQuestionById(req.params.id, function(err, question) {
    if (err) res.send(err);
    res.json(question);
  });
};

exports.update_a_question = function(req, res) {
  Question.updateById(req.params.id, new Question(req.body), function(
    err,
    question
  ) {
    if (err) res.send(err);
    res.json(question);
  });
};

exports.read_questionsformakeit = function(req, res) {
  Question.getAllQuestionByMakeituserid(req.params.id, function(err, question) {
    if (err) res.send(err);
    res.json(question);
  });
};

exports.delete_a_question = function(req, res) {
  Question.remove(req.params.id, function(err, question) {
    if (err) res.send(err);
    res.json({ message: "Question successfully deleted" });
  });
};
