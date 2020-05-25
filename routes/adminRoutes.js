"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  let middleware = require('../model/middleware.js');
  var catalog = require("../controllers/admin/catalogController");
  

  //////// Admin Routes /////////
  app.route("/admin/categorylist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_category_list}));
  app.route("/admin/subcategoryl1list").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_subcategoryl1_list}));
  app.route("/admin/subcategoryl2list").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_subcategoryl2_list}));
  app.route("/admin/productlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_product_list}));

  app.route("/admin/live/category").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_category_livestatus}));
  app.route("/admin/live/subcategoryl1").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_subcategoryl1_livestatus}));
  app.route("/admin/live/subcategoryl2").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_subcategoryl2_livestatus}));
  app.route("/admin/live/product").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_product_livestatus}));
  
  app.route("/admin/search/catalog").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.search_catalog}));
  app.route("/admin/search/catalogdata").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.search_catalog_data}));

  //////// Category ////////////
  app.route("/admin/view/category").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_category}));
  app.route("/admin/add/category").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_category}));
  app.route("/admin/edit/category").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_category}));

   //////// SubCategoryL1 ////////////
   app.route("/admin/view/subcategoryl1").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_subcategoryl1}));
   app.route("/admin/add/subcategoryl1").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_subcategoryl1}));
   app.route("/admin/edit/subcategoryl1").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_subcategoryl1}));

   //////// SubCategory2 ////////////
   app.route("/admin/view/subcategoryl2").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_subcategoryl2}));
   app.route("/admin/add/subcategoryl2").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_subcategoryl2}));
   app.route("/admin/edit/subcategoryl2").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_subcategoryl2}));


}