"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  var catalog = require("../controllers/admin/catalogController");

  //////// Admin Routes /////////
  app.route("/admin/categorylist").post(routesVersioning({"1.0.0": catalog.get_category_list}));
  app.route("/admin/l1subcategorylist").post(routesVersioning({"1.0.0": catalog.get_l1subcategory_list}));
  app.route("/admin/l2subcategorylist").post(routesVersioning({"1.0.0": catalog.get_l2subcategory_list}));
  app.route("/admin/productlist").post(routesVersioning({"1.0.0": catalog.get_product_list}));




}