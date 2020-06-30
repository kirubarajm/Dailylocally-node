"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  let middleware = require('../model/middleware.js');
  var catalog = require("../controllers/admin/catalogController");
  var dayorder = require("../controllers/common/DayorderController");
  var procurement = require("../controllers/procurement/ProcurementController");
  var scm = require("../controllers/admin/scmController.js");  
  var stockkeeping = require("../controllers/admin/stockkeepingController.js");

  //////// ==============> Admin Routes <================= /////////  
  ///////// Search /////////////
  app.route("/admin/search/catalog").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.search_catalog}));
  app.route("/admin/search/catalogdata").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.search_catalog_data}));

  //////// Category ////////////
  app.route("/admin/categorylist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_category_list}));
  app.route("/admin/view/category").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_category}));
  app.route("/admin/add/category").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_category}));
  app.route("/admin/edit/category").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_category}));
  app.route("/admin/live/category").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_category_livestatus}));

  //////// SubCategoryL1 ////////////
  app.route("/admin/subcategoryl1list").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_subcategoryl1_list}));
  app.route("/admin/view/subcategoryl1").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_subcategoryl1}));
  app.route("/admin/add/subcategoryl1").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_subcategoryl1}));
  app.route("/admin/edit/subcategoryl1").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_subcategoryl1}));
  app.route("/admin/live/subcategoryl1").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_subcategoryl1_livestatus}));

  //////// SubCategory2 ////////////
  app.route("/admin/subcategoryl2list").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_subcategoryl2_list}));
  app.route("/admin/view/subcategoryl2").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_subcategoryl2}));
  app.route("/admin/add/subcategoryl2").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_subcategoryl2}));
  app.route("/admin/edit/subcategoryl2").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_subcategoryl2}));
  app.route("/admin/live/subcategoryl2").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_subcategoryl2_livestatus}));

  //////// Product ////////////
  app.route("/admin/productlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_product_list}));
  app.route("/admin/view/product").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.view_product}));
  app.route("/admin/add/product").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_product}));
  app.route("/admin/edit/product").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_product}));
  app.route("/admin/live/product").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_product_livestatus}));

  /////////Get Basic List ////////////
  app.route("/admin/uomlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_uom_list}));
  app.route("/admin/brandlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_brand_list}));
  app.route("/admin/zonelist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_zone_list}));
  app.route("/admin/vendorlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_vendor_list}));
  app.route("/admin/taglist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_tag_list}));
  app.route("/admin/fileUpload").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.fileUpload}));   

  /////// Edit Vendor Product Mapping ////////////////
  app.route("/admin/edit/vendorproductmapping").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.edit_vendor_product_mapping}));

  /////// SCM Precurment /////////////
  app.route("/admin/dayorderlist").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.day_order_list}));
  app.route("/admin/dayorderview").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.day_order_view}));
  app.route("/admin/procurement/view").post(middleware.checkToken,routesVersioning({"1.0.0": procurement.procurement_view}));
  app.route("/admin/procurement/create").post(middleware.checkToken,routesVersioning({"1.0.0": procurement.new_procurement_create}));
  app.route("/admin/procurement/list").post(middleware.checkToken,routesVersioning({"1.0.0": procurement.procurement_list}));
  app.route("/admin/procurement/movetopurchase").post(middleware.checkToken,routesVersioning({"1.0.0": procurement.move_to_purchase}));
  /////// SCM PO /////////////
  app.route("/admin/po/waitingpolist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.waiting_po_list}));
  app.route("/admin/po/productwisevendorlist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.product_wise_vendor_list}));
  app.route("/admin/po/productvendorassign").post(middleware.checkToken,routesVersioning({"1.0.0": scm.product_vendor_assign}));
  app.route("/admin/po/updatepotempquantity").post(middleware.checkToken,routesVersioning({"1.0.0": scm.update_potemp_quantity}));
  app.route("/admin/po/createpo").post(middleware.checkToken,routesVersioning({"1.0.0": scm.create_po}));
  app.route("/admin/po/getpolist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.get_po_list}));
  app.route("/admin/po/getporeceivelist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.get_po_receive_list}));
  app.route("/admin/po/updateporeceive").post(middleware.checkToken,routesVersioning({"1.0.0": scm.update_po_receive}));
  app.route("/admin/po/updatepounreceive").post(middleware.checkToken,routesVersioning({"1.0.0": scm.update_po_unreceive}));
  app.route("/admin/po/popsoring").post(middleware.checkToken,routesVersioning({"1.0.0": scm.pop_to_dayorder}));
  app.route("/admin/po/view").post(middleware.checkToken,routesVersioning({"1.0.0": scm.view_po}));
  app.route("/admin/po/delete").post(middleware.checkToken,routesVersioning({"1.0.0": scm.delete_po}));
  app.route("/admin/po/close").post(middleware.checkToken,routesVersioning({"1.0.0": scm.close_po}));
  app.route("/admin/po/deletepotemp").post(middleware.checkToken,routesVersioning({"1.0.0": scm.delete_po_temp}));
  /////// SCM Sorting /////////////
  app.route("/admin/sorting/getsortinglist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.get_soring_list}));
  app.route("/admin/sorting/savesorting").post(middleware.checkToken,routesVersioning({"1.0.0": scm.save_sorting}));
  app.route("/admin/sorting/movetoqa").post(middleware.checkToken,routesVersioning({"1.0.0": scm.move_to_qa}));  
  /////// SCM QA /////////////
  app.route("/admin/quality/dayorderlist").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.quality_day_order_list}));
  app.route("/admin/quality/dayorderview").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.quality_day_order_view}));
  app.route("/admin/quality/type").post(middleware.checkToken,routesVersioning({"1.0.0": scm.quality_type_list}));
  app.route("/admin/quality/qualitycheck").post(middleware.checkToken,routesVersioning({"1.0.0": scm.quality_check_product}));
  /////// Stock Keeping /////////////
  app.route("/admin/stockkeeping/list").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_list}));
  app.route("/admin/stockkeeping/openlist").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_openlist}));
  app.route("/admin/stockkeeping/add").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_add}));
  app.route("/admin/stockkeeping/view").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_view}));
  app.route("/admin/stockkeeping/edit").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_edit}));
  app.route("/admin/stockkeeping/delete").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_delete}));

  
//CRM
app.route("/admin/dayorderlist").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.crm_day_order_list}));
}