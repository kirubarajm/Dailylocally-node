"use strict";

var Logistics = require("../../model/admin/logisticsModel.js");

/////////Stockkeeping List///////////
exports.ready_to_dispatch_list = function(req, res) {    
    Logistics.ready_to_dispatch_list(req.body, function(err, ress) {
        //console.log("ready_to_dispatch_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get QA Type List///////////
exports.qa_type_list = function(req, res) {    
    Logistics.qa_type_list(req.body, function(err, ress) {
        //console.log("qa_type_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Submit QA Check List///////////
exports.submit_qa_checklist = function(req, res) {    
    Logistics.submit_qa_checklist(req.body, function(err, ress) {
        //console.log("submit_qa_checklist controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get Moveit List///////////
exports.get_moveit_list = function(req, res) {    
    Logistics.get_moveit_list(req.body, function(err, ress) {
        //console.log("moveit_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};