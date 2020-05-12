"use strict";

var Faq = require("../../model/common/faqModel.js");

exports.list_all_faq = function(req, res) {
  Faq.getAllFaq(function(err, faq) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.list_all_faqbytype = function(req, res) {
  Faq.getFaqByType(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.create_a_faq = function(req, res) {
  var new_faq = new Faq(req.body);
  console.log(new_faq);
  //handles null error

  Faq.createFaq(new_faq, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.read_a_faq = function(req, res) {
  Faq.getFaqById(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.update_a_faq = function(req, res) {
  Faq.updateById(req.params.id, new Faq(req.body), function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};

exports.delete_a_faq = function(req, res) {
  Faq.remove(req.params.id, function(err, faq) {
    if (err) res.send(err);
    res.json(faq);
  });
};
