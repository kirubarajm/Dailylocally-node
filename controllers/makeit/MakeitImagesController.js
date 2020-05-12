"use strict";

var MakeitImages = require("../../model/makeit/makeitImagesModel");

exports.list_all_MakeitImages= function(req, res) {
    MakeitImages.getAllMenuitem(function(err, menuitem) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", menuitem);
    res.send(menuitem);
  });
};

exports.create_a_MakeitImages = function(req, res) {
  // var newMakeitImages = new MakeitImages(req.body);
  // console.log(newMakeitImages);
  //handles null error
  if (!req.body.makeitid) {
    res.status(400).send({ error: true,status:false, message: "Please provide makeitid" });
  } else {
    MakeitImages.createMakeitImages(req.body, function(err, MakeitImages) {
      if (err) res.send(err);
      res.json(MakeitImages);
    });
  }
};

exports.read_a_menuitem = function(req, res) {
  Menuitem.getMenuitemById(req.params.id, function(err, menuitem) {
    if (err) res.send(err);
    res.json(menuitem);
  });
};

exports.update_a_menuitem = function(req, res) {
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

