"use strict";

var Eatfeedback = require("../../model/common/eatfeedbackModel");

exports.list_all_feedback = function(req, res) {
  Eatfeedback.getAllfeedback(function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.list_all_feedbackbytype = function(req, res) {
  Eatfeedback.getfeedbackByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_feedback = function(req, res) {
  var new_Eatfeedback = new Eatfeedback(req.body);
  Eatfeedback.createfeedback(new_Eatfeedback, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.read_a_feedback = function(req, res) {
  Eatfeedback.getfeedbackById(req.params.typeid, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};
