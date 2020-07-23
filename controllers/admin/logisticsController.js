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

/////////Moveit List//////////
exports.moveit_list = function(req, res) {    
    Logistics.moveit_list(req.body, function(err, ress) {
        //console.log("moveit_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Trip Temp List//////////
exports.trip_temp_list = function(req, res) {    
    Logistics.trip_temp_list(req.body, function(err, ress) {
        //console.log("trip_temp_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Moveit Send OTP Verify//////////
exports.Moveituser_send_otp_byphone = function(req, res) {    
    Logistics.Moveituser_send_otp_byphone(req.body, function(err, ress) {
        //console.log("Moveituser_send_otp_byphone controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Moveit OTP Verify//////////
exports.Moveituser_otp_verification = function(req, res) {    
    Logistics.Moveituser_otp_verification(req.body, function(err, ress) {
        //console.log("Moveituser_otp_verification controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Moveit Force Logout//////////
exports.admin_force_Moveituser_logout = function(req, res) {    
    Logistics.admin_force_Moveituser_logout(req.body, function(err, ress) {
        //console.log("admin_force_Moveituser_logout controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get Moveit List///////////
exports.moveit_list_trip = function(req, res) {    
    Logistics.moveit_list_trip(req.body, function(err, ress) {
        //console.log("moveit_list_trip controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Create Moveit Trip//////////
exports.trip_create = function(req, res) {    
    Logistics.trip_create(req.body, function(err, ress) {
        //console.log("trip_create controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Unassign Moveit Trip//////////
exports.trip_unassign = function(req, res) {    
    Logistics.trip_unassign(req.body, function(err, ress) {
        //console.log("trip_unassign controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Trip Moveit Filters//////////
exports.trip_moveit_filters = function(req, res) {    
    Logistics.trip_moveit_filters(req.body, function(err, ress) {
        //console.log("trip_moveit_filters controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Moveit Trip List//////////
exports.trip_list = function(req, res) {    
    Logistics.trip_list(req.body, function(err, ress) {
        //console.log("trip_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Dunzo Order List//////////
exports.dunzo_order_list = function(req, res) {    
    Logistics.dunzo_order_list(req.body, function(err, ress) {
        //console.log("dunzo_order_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Dunzo Assign//////////
exports.dunzo_assign = function(req, res) {    
    Logistics.dunzo_assign(req.body, function(err, ress) {
        //console.log("dunzo_assign controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Dunzo Pickup//////////
exports.dunzo_pickup = function(req, res) {   
    Logistics.dunzo_pickup(req.body, function(err, ress) {
        //console.log("dunzo_pickup controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Dunzo Deliverd//////////
exports.dunzo_delivered = function(req, res) {    
    Logistics.dunzo_delivered(req.body, function(err, ress) {
        //console.log("dunzo_delivered controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};