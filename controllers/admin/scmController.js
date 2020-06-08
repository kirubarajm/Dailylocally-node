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