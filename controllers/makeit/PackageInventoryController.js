"use strict";

var PackageInventory = require("../../model/makeit/packageInventoryModel.js");

exports.getPackageInventoryList = function(req, res) {
  PackageInventory.getPackageInventoryList(req.params, function(err, result) {
    if (err) res.send(err);
    else res.send(result);
  });
};
exports.getPackageMapInventoryList = function(req, res) {
  PackageInventory.getPackageMapInventoryList(req.params, function(err, result) {
    if (err) res.send(err);
    else res.send(result);
  });
};

exports.getPackageInventoryByid = function(req, res) {
  PackageInventory.getPackageInventoryByid(req.params, function(err, result) {
    if (err) res.send(err);
    else res.send(result);
  });
};

exports.create_PackageInventory = function(req, res) {
  var package_Inventory = new PackageInventory(req.body);

  if (!package_Inventory.makeit_id) {
    res.status(400).send({ error: true,status:false, message: "Please provide makeit id" });
  }else if (!package_Inventory.packageid) {
    res.status(400).send({ error: true,status:false, message: "Please provide package id" });
  }else if (!package_Inventory.count) {
    res.status(400).send({ error: true,status:false, message: "Please provide package count" });
  } else {
    PackageInventory.createPackageInventory(package_Inventory, function(err, result) {
      if (err) res.send(err);
      else res.json(result);
    });
  }
};

exports.getPackageInventoryStockList = function(req, res) {
  PackageInventory.getPackageInventoryStockList(req.body, function(err, result) {
    if (err) res.send(err);
    else res.send(result);
  });
};

exports.getAllPackageInventoryList = function(req, res) {
  PackageInventory.getAllPackageInventoryList(req.body, function(err, result) {
    if (err){
      console.log("err-->",err);
      res.send(err);

    }else
    res.send(result);
  });
};

exports.updatePackageInventory = function(req, res) {
  PackageInventory.updatePackageInventory(req.body, function(err, result) {
    if (err) res.send(err);
    else res.send(result);
  });
};

