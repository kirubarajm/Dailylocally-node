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
exports.get_subcategoryl1_list = function(req, res) {    
    catalog.get_subcategoryl1_list(req.body, function(err, ress) {
        //console.log("get_subcategoryl1_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get L2SubCategory List///////////
exports.get_subcategoryl2_list = function(req, res) {    
    catalog.get_subcategoryl2_list(req.body, function(err, ress) {
        //console.log("get_subcategoryl2_list controller");
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
exports.update_subcategoryl1_livestatus = function(req, res) {    
    catalog.update_subcategoryl1_livestatus(req.body, function(err, ress) {
        //console.log("update_subcategoryl1_livestatus controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update L2SubCategory Status///////////
exports.update_subcategoryl2_livestatus = function(req, res) {    
    catalog.update_subcategoryl2_livestatus(req.body, function(err, ress) {
        //console.log("update_subcategoryl2_livestatus controller");
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

/////////View Category///////////
exports.view_category = function(req, res) {    
    catalog.view_category(req.body, function(err, ress) {
        //console.log("view_category controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Add Category///////////
exports.add_category = function(req, res) {    
    catalog.add_category(req.body, function(err, ress) {
        //console.log("add_category controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Edit Category///////////
exports.edit_category = function(req, res) {    
    catalog.edit_category(req.body, function(err, ress) {
        //console.log("edit_category controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////View SubCategoryl1///////////
exports.view_subcategoryl1 = function(req, res) {    
    catalog.view_subcategoryl1(req.body, function(err, ress) {
        //console.log("view_subcategoryl1 controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Add SubCategoryl1///////////
exports.add_subcategoryl1 = function(req, res) {    
    catalog.add_subcategoryl1(req.body, function(err, ress) {
        //console.log("add_subcategoryl1 controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Edit SubCategoryl1///////////
exports.edit_subcategoryl1 = function(req, res) {    
    catalog.edit_subcategoryl1(req.body, function(err, ress) {
        //console.log("edit_subcategoryl1 controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////View SubCategoryl2///////////
exports.view_subcategoryl2 = function(req, res) {    
    catalog.view_subcategoryl2(req.body, function(err, ress) {
        //console.log("view_subcategoryl2 controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Add SubCategoryl2///////////
exports.add_subcategoryl2 = function(req, res) {    
    catalog.add_subcategoryl2(req.body, function(err, ress) {
        //console.log("add_subcategoryl2 controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Edit SubCategoryl2///////////
exports.edit_subcategoryl2 = function(req, res) {    
    catalog.edit_subcategoryl2(req.body, function(err, ress) {
        //console.log("edit_subcategoryl2 controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get UOM List///////////
exports.get_uom_list = function(req, res) {    
    catalog.get_uom_list(req.body, function(err, ress) {
        //console.log("get_uom_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get Brand List///////////
exports.get_brand_list = function(req, res) {    
    catalog.get_brand_list(req.body, function(err, ress) {
        //console.log("get_brand_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////View Product///////////
exports.view_product = function(req, res) {    
    catalog.view_product(req.body, function(err, ress) {
        //console.log("view_product controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Add Product///////////
exports.add_product = function(req, res) {    
    catalog.add_product(req.body, function(err, ress) {
        //console.log("add_product controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Edit Product///////////
exports.edit_product = function(req, res) {    
    catalog.edit_product(req.body, function(err, ress) {
        //console.log("edit_product controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////// Edit Vendor Product Mapping ////////////////
exports.edit_vendor_product_mapping = function(req, res) {    
    catalog.edit_vendor_product_mapping(req.body, function(err, ress) {
        //console.log("edit_vendor_product_mapping controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Search Catalog///////////
exports.home_quick_search = function(req, res) {    
    catalog.home_quick_search(req.body, function(err, ress) {
        //console.log("search_catalog controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Search Catalog Data///////////
exports.search_catalog_data_mobile = function(req, res) {    
    catalog.search_catalog_data_mobile(req.body, function(err, ress) {
        //console.log("search_catalog_data controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};
