"use strict";
module.exports = function(app) {

    var routesVersioning = require('express-routes-versioning')();
    let middleware = require('../model/middleware.js');
    var category = require("../controllers/category/CategoryController");
 
  
  
  
  
  
  // category
  app.route("/category/categorylist").post(middleware.checkToken,routesVersioning({"1.0.0":category.get_category_list}));

}