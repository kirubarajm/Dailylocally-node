"use strict";
module.exports = function(app) {
    var routesVersioning = require('express-routes-versioning')();
  var makeituser = require("../controllers/makeit/MakeitUserController");
  var salesuser = require("../controllers/sales/SalesUserController");
  var documents = require("../controllers/common/DocumentsController");
  var faq = require("../controllers/common/FaqController");
  var allocation = require("../controllers/sales/AllocationController");
  var salesdocument = require("../controllers/common/DocumentsalesController");
  let middleware = require('../model/middleware.js');
//Sales API
app.route("/sales/makeit/followupstatus").put(middleware.checkToken,routesVersioning({"1.0.0":allocation.update_a_followupstatus}));
app.route("/sales/faq").get(middleware.checkToken,routesVersioning({"1.0.0":faq.list_all_faq}));
app.route("/sales/makeit/documentupload").post(middleware.checkToken,routesVersioning({"1.0.0":documents.upload_a_documents}));
app.route("/sales/documentView").post(middleware.checkToken,routesVersioning({"1.0.0":salesdocument.sales_document_view}));
app.route("/sales/document/remove").delete(middleware.checkToken,routesVersioning({"1.0.0":documents.remove_s3_sales_doc}));
app.route("/sales/pushid/add").put(middleware.checkToken,routesVersioning({"1.0.0":salesuser.add_a_pushid}));
app.route("/sales/makeitinfo/update").put(middleware.checkToken,routesVersioning({"1.0.0":makeituser.edit_makeit_brand_identity}));
app.route("/sales/makeitdocument/update").post(middleware.checkToken,routesVersioning({"1.0.0":salesdocument.create_a_new_infodocument}));
app.route("/sales/makeitkitchen/update").post(middleware.checkToken,routesVersioning({"1.0.0":salesdocument.create_a_new_documents}));
app.route("/sales/rating").post(middleware.checkToken,routesVersioning({"1.0.0":salesuser.create_a_rating}));
app.route("/sales/makeit/approved").put(middleware.checkToken,routesVersioning({"1.0.0":salesuser.makeit_approved}));
app.route("/sales/makeitinfo/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":salesuser.get_makeit_kitchen_info}));
app.route("/sales/makeitdocument/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":salesuser.get_makeit_user_document}));
app.route("/sales/makeitkitchens/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":salesuser.get_makeit_kitchen_document}));
app.route("/sales/rating/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":salesuser.get_sales_makeit_rating}));
app.route("/sales/history/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":allocation.list_all_history_by_salesempid}));
app.route("/sales/login").post(routesVersioning({"1.0.0":salesuser.checklogin}));
app.route("/sales/registration").post(routesVersioning({"1.0.0":salesuser.create_a_user}));
app.route("/sales/trainingdocs").get(middleware.checkToken,routesVersioning({"1.0.0":documents.list_all_sales_training_documents}));
app.route("/sales/tasklist/:id").get(middleware.checkToken,routesVersioning({"1.0.0":allocation.list_all_allocation_by_salesempid,"2.0.0":allocation.list_all_allocation_by_salesempid_V2}));
app.route("/sales/todaytasklist/:id").get(middleware.checkToken,routesVersioning({"1.0.0":allocation.list_all_today_tasklist_by_salesempid}));

app.route("/salesusers").post(routesVersioning({"1.0.0":salesuser.create_a_user}));
//app.route("/salesusers").get(routesVersioning({"1.0.0":salesuser.list_all_user}));
app.route("/salesusers/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":salesuser.read_a_user}));
app.route("/salesusers/:userid").put(middleware.checkToken,routesVersioning({"1.0.0":salesuser.update_a_user}));


app.route("/sales/versioncheck").post(routesVersioning({"1.0.0": salesuser.sales_app_version_check_vid}));
app.route("/sales/logout").post(middleware.checkToken,routesVersioning({"1.0.0":salesuser.Salesuser_logout}));
//app.route("/salesusers/:userid").delete(routesVersioning({"1.0.0":salesuser.delete_a_user}));

app.route("/sales/customersupport").post(routesVersioning({"1.0.0": salesuser.sales_customer_support}));
}