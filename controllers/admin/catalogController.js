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

/////////Update Category Status///////////
exports.update_category_livestatus = function(req, res) {    
    catalog.update_category_livestatus(req.body, function(err, ress) {
        //console.log("update_category_livestatus controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update L1SubCategory Status///////////
exports.update_l1subcategory_livestatus = function(req, res) {    
    catalog.update_l1subcategory_livestatus(req.body, function(err, ress) {
        //console.log("update_l1subcategory_livestatus controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update L2SubCategory Status///////////
exports.update_l2subcategory_livestatus = function(req, res) {    
    catalog.update_l2subcategory_livestatus(req.body, function(err, ress) {
        //console.log("update_l2subcategory_livestatus controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update Product Status///////////
exports.update_product_livestatus = function(req, res) {    
    catalog.update_product_livestatus(req.body, function(err, ress) {
        //console.log("update_product_livestatus controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Search Catalog///////////
exports.search_catalog = function(req, res) {    
    catalog.search_catalog(req.body, function(err, ress) {
        //console.log("search_catalog controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Search Catalog Data///////////
exports.search_catalog_data = function(req, res) {    
    catalog.search_catalog_data(req.body, function(err, ress) {
        //console.log("search_catalog_data controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};