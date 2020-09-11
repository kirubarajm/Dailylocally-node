"use strict";

var Brand = require("../../model/common/brandModel.js");

exports.createBrandModel = function(req, res) {
    Brand.createBrandModel(req.body,function(err, result) {
        //console.log("createBrandModel");
        if (err) res.send(err);
        //console.log("res", result);
        res.send(result);
    });
};

exports.updateBrandModel= function(req, res) {
    Brand.updateBrandModel(req.body, function(err, result) {
        //console.log("updateBrandModel");
        if (err) res.send(err);
        //console.log("res", result);
        res.json(result);
    });
};

exports.BrandModelview= function(req, res) {
    Brand.BrandModelview(req.body, function(err, result) {
        //console.log("BrandModelview");
        if (err) res.send(err);
        //console.log("res", result);
        res.json(result);
    });
};

exports.BrandModelList= function(req, res) {
    Brand.BrandModelList(req.body, function(err, result) {
        //console.log("BrandModelList");
        if (err) res.send(err);
        //console.log("res", result);
        res.json(result);
    });
};



