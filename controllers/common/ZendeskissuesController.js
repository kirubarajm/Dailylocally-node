"use strict";

var Zendeskissues = require("../../model/common/zendeskissuesModel");

exports.getZendeskissues = function(req, res) {
    Zendeskissues.getZendeskissues(req.body ,function(err, faq) {
    if (err) res.send(err);
    console.log("res", faq);
    res.send(faq);
  });
};

exports.getZendeskissuesDetails = function(req, res) {
  Zendeskissues.getZendeskissuesDetails(req.body ,function(err, faq) {
  console.log("controller");
  if (err) res.send(err);
  console.log("res", faq);
  res.send(faq);
});
};




