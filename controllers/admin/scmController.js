"use strict";

var SCM = require("../../model/admin/scmModel.js");

/////////Waiting PO List///////////
exports.waiting_po_list = function(req, res) {    
    SCM.waiting_po_list(req.body, function(err, ress) {
        //console.log("waiting_po_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Product Wise Vendor List///////////
exports.product_wise_vendor_list = function(req, res) {    
    SCM.product_wise_vendor_list(req.body, function(err, ress) {
        //console.log("product_wise_vendor_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Product Vendor assign///////////
exports.product_vendor_assign = function(req, res) {    
    SCM.product_vendor_assign(req.body, function(err, ress) {
        //console.log("product_wise_vendor_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Create PO///////////
exports.create_po = function(req, res) {    
    SCM.create_po(req.body, function(err, ress) {
        //console.log("create_po controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get PO List///////////
exports.get_po_list = function(req, res) {    
    SCM.get_po_list(req.body, function(err, ress) {
        //console.log("get_po_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get PO receive List///////////
exports.get_po_receive_list = function(req, res) {    
    SCM.get_po_receive_list(req.body, function(err, ress) {
        //console.log("get_po_receive_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update PO receive///////////
exports.update_po_receive = function(req, res) {    
    SCM.update_po_receive(req.body, function(err, ress) {
        //console.log("update_po_receive controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};