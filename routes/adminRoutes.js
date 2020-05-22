"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  var catalog = require("../controllers/admin/catalogController");

  //////// Admin Routes /////////
  app.route("/admin/categorylist").post(routesVersioning({"1.0.0": catalog.get_category_list}));
  app.route("/admin/l1subcategorylist").post(routesVersioning({"1.0.0": catalog.get_l1subcategory_list}));
  app.route("/admin/l2subcategorylist").post(routesVersioning({"1.0.0": catalog.get_l2subcategory_list}));
  app.route("/admin/productlist").post(routesVersioning({"1.0.0": catalog.get_product_list}));
  app.route("/admin/live/category").put(routesVersioning({"1.0.0": catalog.update_category_livestatus}));
  app.route("/admin/live/l1subcategory").put(routesVersioning({"1.0.0": catalog.update_l1subcategory_livestatus}));
  app.route("/admin/live/l2subcategory").put(routesVersioning({"1.0.0": catalog.update_l2subcategory_livestatus}));
  app.route("/admin/live/product").put(routesVersioning({"1.0.0": catalog.update_product_livestatus}));
  app.route("/admin/search/catalog").post(routesVersioning({"1.0.0": catalog.search_catalog}));
  app.route("/admin/search/catalogdata").post(routesVersioning({"1.0.0": catalog.search_catalog_data}));




}