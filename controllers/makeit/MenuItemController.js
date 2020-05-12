"use strict";

var Menuitem = require("../../model/makeit/menuItemModel.js");

exports.list_all_menuitem = function(req, res) {
  Menuitem.getAllMenuitem(function(err, menuitem) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", menuitem);
    res.send(menuitem);
  });
};

exports.create_a_menuitem = function(req, res) {
  var new_menuitem = new Menuitem(req.body);
  console.log(new_menuitem);
  //handles null error
  if (!new_menuitem.menuitem_name) {
    res.status(400).send({ error: true, message: "Please provide name" });
  } else {
    Menuitem.createMenuitem(new_menuitem, function(err, menuitem) {
      if (err) res.send(err);
      res.json(menuitem);
    });
  }
};

exports.read_a_menuitem = function(req, res) {
  Menuitem.getMenuitemById(req.params.id, function(err, menuitem) {
    if (err) res.send(err);
    res.json(menuitem);
  });
};

exports.update_a_menuitem_old = function(req, res) {
  Menuitem.updateById(req.params.id, new Menuitem(req.body), function(
    err,
    menuitem
  ) {
    if (err) res.send(err);
    res.json(menuitem);
  });
};

exports.delete_a_menuitem = function(req, res) {
  Menuitem.remove(req.params.id, function(err, menuitem) {
    if (err) res.send(err);
    res.json({ message: "Menuitem successfully deleted" });
  });
};

exports.read_a_menuitem_byid = function(req, res) {
  Menuitem.get_Menuitem_By_makeitid(req.params.makeit_userid, function(
    err,
    menuitem
  ) {
    if (err) res.send(err);
    res.json(menuitem);
  });
};

exports.update_a_menuitem = function(req, res) {
  Menuitem.update_a_menuitem_makeit_userid(req.body, function(err, menuitem) {
    if (err) res.send(err);
    res.json(menuitem);
  });
};

exports.admin_unapproval_approve_list = function(req, res) {
  Menuitem.admin_list_all__unapproval_menuitem(req.body, function(
    err,
    product
  ) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", product);
    res.send(product);
  });
};

exports.delete_status_menuitem = function(req, res) {
  Menuitem.update_delete_status(req.params.itemid, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};

exports.approve_status_menuitem = function(req, res) {
  
  Menuitem.approve_menuitem_status(req.body, function(err, product) {
    if (err) res.send(err);
    res.json(product);
  });
};


exports.list_all_menuitem_by_makeituserid = function(req, res) {
  Menuitem.getAllMenuitembymakeituserid(req.params,function(err, menuitem) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", menuitem);
    res.send(menuitem);
  });
};