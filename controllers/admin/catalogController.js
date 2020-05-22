"use strict";

var catalog = require("../../model/admin/catalogModel");

/////////Get Category List///////////
exports.get_category_list = function(req, res) {    
    catalog.get_category_list(req.body, function(err, ress) {
        //console.log("get_category_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get L1SubCategory List///////////
exports.get_l1subcategory_list = function(req, res) {    
    catalog.get_l1subcategory_list(req.body, function(err, ress) {
        //console.log("get_l1subcategory_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get L2SubCategory List///////////
exports.get_l2subcategory_list = function(req, res) {    
    catalog.get_l2subcategory_list(req.body, function(err, ress) {
        //console.log("get_l2subcategory_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get Product List///////////
exports.get_product_list = function(req, res) {    
    catalog.get_product_list(req.body, function(err, ress) {
        //console.log("get_product_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};
