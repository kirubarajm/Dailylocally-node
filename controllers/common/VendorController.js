"use strict";

var Vendor = require("../../model/common/vendorModel.js");

exports.createVendorModel = function(req, res) {
    Vendor.createVendorModel(req.body,function(err, result) {
        //console.log("createVendorModel");
        if (err) res.send(err);
        //console.log("res", result);
        res.send(result);
    });
};

exports.updateVendorModel= function(req, res) {
    Vendor.updateVendorModel(req.body, function(err, result) {
        //console.log("updateVendorModel");
        if (err) res.send(err);
        //console.log("res", result);
        res.json(result);
    });
};

exports.VendorModelview= function(req, res) {
    Vendor.VendorModelview(req.body, function(err, result) {
        //console.log("VendorModelview");
        if (err) res.send(err);
        //console.log("res", result);
        res.json(result);
    });
};

exports.VendorModelList= function(req, res) {
    Vendor.VendorModelList(req.body, function(err, result) {
        //console.log("VendorModelList");
        if (err) res.send(err);
        //console.log("res", result);
        res.json(result);
    });
};



