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

/////////Add Moveit//////////
exports.moveit_add = function(req, res) {    
    Logistics.moveit_add(req.body, function(err, ress) {
        //console.log("moveit_add controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////View Moveit//////////
exports.moveit_view = function(req, res) {    
    Logistics.moveit_view(req.body, function(err, ress) {
        //console.log("moveit_view controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Edit Moveit//////////
exports.moveit_edit = function(req, res) {    
    Logistics.moveit_edit(req.body, function(err, ress) {
        //console.log("moveit_edit controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Assign to Dunzo//////////
exports.assign_to_dunzo = function(req, res) {    
    Logistics.assign_to_dunzo(req.body, function(err, ress) {
        //console.log("assign_to_dunzo controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Create Moveit Trip//////////
exports.create_moveit_trip = function(req, res) {    
    Logistics.create_moveit_trip(req.body, function(err, ress) {
        //console.log("create_moveit_trip controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Moveit Trip List//////////
exports.moveit_trip_list = function(req, res) {    
    Logistics.moveit_trip_list(req.body, function(err, ress) {
        //console.log("moveit_trip_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Dunzo Order List//////////
exports.dunzo_trip_list = function(req, res) {    
    Logistics.dunzo_trip_list(req.body, function(err, ress) {
        //console.log("dunzo_trip_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};


