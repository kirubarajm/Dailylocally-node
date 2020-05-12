"use strict";

var MakeitBadges = require("../../model/makeit/makeitbadgesmappingModel");

exports.list_all_menuitem = function(req, res) {
  Menuitem.getAllMenuitem(function(err, menuitem) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", menuitem);
    res.send(menuitem);
  });
};

exports.createMakeitBadges = function(req, res) {

    MakeitBadges.createMakeitBadges(req.body, function(err, MakeitBadges) {
      if (err) res.send(err);
      res.json(MakeitBadges);
    });
  
};