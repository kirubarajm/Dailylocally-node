"use strict";

var StockKeeping = require("../../model/admin/stockkeepingModel.js");

/////////Stockkeeping List///////////
exports.stockkeeping_list = function(req, res) {    
    StockKeeping.stockkeeping_list(req.body, function(err, ress) {
        //console.log("stockkeeping_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////show Stockkeeping Open List///////////
exports.stockkeeping_openlist = function(req, res) {    
    StockKeeping.stockkeeping_openlist(req.body, function(err, ress) {
        //console.log("stockkeeping_openlist controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Stockkeeping Add///////////
exports.stockkeeping_add = function(req, res) {    
    StockKeeping.stockkeeping_add(req.body, function(err, ress) {
        //console.log("stockkeeping_add controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Stockkeeping View///////////
exports.stockkeeping_view = function(req, res) {    
    StockKeeping.stockkeeping_view(req.body, function(err, ress) {
        //console.log("stockkeeping_view controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Stockkeeping Edit///////////
exports.stockkeeping_edit = function(req, res) {    
    StockKeeping.stockkeeping_edit(req.body, function(err, ress) {
        //console.log("stockkeeping_edit controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Stockkeeping Delete///////////
exports.stockkeeping_delete = function(req, res) {    
    StockKeeping.stockkeeping_delete(req.body, function(err, ress) {
        //console.log("stockkeeping_delete controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Wastage List///////////
exports.wastage_list = function(req, res) {    
    StockKeeping.wastage_list(req.body, function(err, ress) {
        //console.log("stockkeeping_delete controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Missing Item List///////////
exports.missingitem_list = function(req, res) {    
    StockKeeping.missingitem_list(req.body, function(err, ress) {
        //console.log("stockkeeping_delete controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};