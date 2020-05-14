"use strict";
module.exports = function(app) {
  //forever start server.js
  var routesVersioning = require('express-routes-versioning')();

  var region = require("../controllers/common/RegionController");
  var cusine = require("../controllers/common/CusineController");
  var master = require("../controllers/common/MastersController");
  var homedown = require("../controllers/common/HometownController");
  var makeithub = require("../controllers/common/MakeitHubController");
  var faq = require("../controllers/common/FaqController");
  var documents = require("../controllers/common/DocumentsController");
  var stories = require("../controllers/common/StoryController");
  // Masters


  //Region
  app.route("/masters/regionlist").get(routesVersioning({"1.0.0":region.list_all_region}));
  app.route("/masters/region").post(routesVersioning({"1.0.0":region.create_a_Region}));
  app.route("/masters/radiuslimit").post(routesVersioning({"1.0.0":region.create_a_radius_limit}));
  app.route("/masters/region/search").post(routesVersioning({"1.0.0":region.search_a_search_region}));
  


  //Stories
  app.route("/masters/storieslist").post(routesVersioning({"1.0.0":stories.list_all_Stories}));
  app.route("/masters/storiescreate").post(routesVersioning({"1.0.0":stories.createnewstory}));



  app.route("/masters/homedownlist").get(routesVersioning({"1.0.0":homedown.list_all_homedown}));
  app.route("/masters/makeithub").get(routesVersioning({"1.0.0":makeithub.list_all_makeithubs}));
  app.route("/masters/cuisinelist").get(routesVersioning({"1.0.0":cusine.list_all_Cuisine}));
  app.route("/procedure").get(routesVersioning({"1.0.0":region.pro_call}));

 
  // Common
  app.route("/masters").get(routesVersioning({"1.0.0":master.read_a_masters}));
  app.route("/masters/eat").get(routesVersioning({"1.0.0":master.read_eat_masters}));
  // app.route("/masters/producttag").get(routesVersioning({"1.0.0":master.read_product_masters}));

 // Others
  app.route("/faqs/:id").get(routesVersioning({"1.0.0":faq.list_all_faqbytype}));
  app.route("/faq")
    .get(routesVersioning({"1.0.0":faq.list_all_faq}))
    .post(routesVersioning({"1.0.0":faq.create_a_faq}));
  app
    .route("/faq/:id")
    .get(routesVersioning({"1.0.0":faq.read_a_faq}))
    .put(routesVersioning({"1.0.0":faq.update_a_faq}))
    .delete(routesVersioning({"1.0.0":faq.delete_a_faq}));
    //Documents
  app
  .route("/documents")
  .get(routesVersioning({"1.0.0":documents.list_all_documents}))
  .post(routesVersioning({"1.0.0":documents.create_a_documents}));
app
  .route("/documents/:id")
  .get(routesVersioning({"1.0.0":documents.read_a_documents}))
  .put(routesVersioning({"1.0.0":documents.update_a_documents}))
  .delete(routesVersioning({"1.0.0":documents.delete_a_documents}));


};
