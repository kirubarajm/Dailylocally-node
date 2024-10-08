"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  let middleware = require('../model/middleware.js');
  var catalog = require("../controllers/admin/catalogController");
  var dayorder = require("../controllers/common/DayorderController");
  var procurement = require("../controllers/procurement/ProcurementController");
  var scm = require("../controllers/admin/scmController.js");  
  var stockkeeping = require("../controllers/admin/stockkeepingController.js");
  var Logistics = require("../controllers/admin/logisticsController.js");
  var dluser = require("../controllers/dluser/DlUserController");
  var darorder = require("../controllers/common/DayorderController"); 
  var darordercomments = require("../controllers/admin/orderCommentsController");
  var Zendeskissues = require("../controllers/common/ZendeskissuesController");
  var orders = require("../controllers/common/OrderController");
  var useraddress = require("../controllers/dluser/UserAddressController");
  var refundOnline = require("../controllers/common/refundController");
  var Razorpay = require("../controllers/common/RazorpayController");
  var adminuser = require("../controllers/admin/adminUserController");
  var quicksearch = require("../controllers/common/QuickSearchController.js");
  var Vendor = require("../controllers/common/VendorController.js");
  var Brand = require("../controllers/common/BrandController.js");
  var Collection = require("../controllers/common/CollectionController.js");
  var category = require("../controllers/category/CategoryController");
  var documents = require("../controllers/common/DocumentsController");

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
  app.route("/admin/delete/product").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.delete_product}));
  app.route("/admin/live/product").put(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_product_livestatus}));

  /////////Get Basic List ////////////
  app.route("/admin/uomlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_uom_list}));
  app.route("/admin/brandlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_brand_list}));
  app.route("/admin/zonelist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_zone_list}));
  app.route("/admin/vendorlist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_vendor_list}));
  app.route("/admin/taglist").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.get_tag_list}));
  app.route("/admin/fileUpload").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.fileUpload}));   

  /////// Edit Vendor Product Mapping ////////////////
  app.route("/admin/add/vendorproductmapping").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.add_vendor_product_mapping}));
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
  app.route("/admin/stock/autoassign").post(middleware.checkToken,routesVersioning({"1.0.0": scm.auto_stock_to_dayorder}));
  app.route("/admin/po/view").post(middleware.checkToken,routesVersioning({"1.0.0": scm.view_po}));
  app.route("/admin/po/pdf").post(middleware.checkToken,routesVersioning({"1.0.0": scm.po_pdf}));
  app.route("/admin/invoice/pdf").post(middleware.checkToken,routesVersioning({"1.0.0": scm.invoice_pdf}));
  app.route("/admin/po/delete").post(middleware.checkToken,routesVersioning({"1.0.0": scm.delete_po}));
  app.route("/admin/po/close").post(middleware.checkToken,routesVersioning({"1.0.0": scm.close_po}));
  app.route("/admin/po/deletepotemp").post(middleware.checkToken,routesVersioning({"1.0.0": scm.delete_po_temp}));
  app.route("/admin/po/removebohmapping").post(middleware.checkToken,routesVersioning({"1.0.0": scm.remove_boh_mapping}));
  app.route("/admin/po/reason/list").post(middleware.checkToken,routesVersioning({"1.0.0": scm.delete_po_reson_list}));

  ///////PO Auto Creation Loop//////
  app.route("/admin/po/pdfloop").post(middleware.checkToken,routesVersioning({"1.0.0": scm.autopopdfcreate}));
  ///////Invoice Auto Creation Loop//////
  app.route("/admin/invoice/pdfloop").post(middleware.checkToken,routesVersioning({"1.0.0": scm.autoinvoicepdfcreate}));
  /////// SCM Sorting /////////////
  app.route("/admin/sorting/getsortinglist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.get_soring_list}));
  app.route("/admin/sorting/savesorting").post(middleware.checkToken,routesVersioning({"1.0.0": scm.save_sorting}));
  app.route("/admin/sorting/movetoqa").post(middleware.checkToken,routesVersioning({"1.0.0": scm.move_to_qa}));  
  app.route("/admin/sorting/missingquantityreport").post(middleware.checkToken,routesVersioning({"1.0.0": scm.missing_quantity_report}));  
  /////// SCM QA /////////////
  app.route("/admin/quality/dayorderlist").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.quality_day_order_list}));
  app.route("/admin/quality/dayorderview").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.quality_day_order_view}));
  app.route("/admin/quality/type").post(middleware.checkToken,routesVersioning({"1.0.0": scm.quality_type_list}));
  app.route("/admin/quality/qualitycheck").post(middleware.checkToken,routesVersioning({"1.0.0": scm.quality_check_product}));
  app.route("/admin/quality/missingquantityreport").post(middleware.checkToken,routesVersioning({"1.0.0": scm.missing_quantity_report}));

  app.route("/admin/return/getreturnlist").post(middleware.checkToken,routesVersioning({"1.0.0": scm.get_return_list}));
  app.route("/admin/return/updateorders").post(middleware.checkToken,routesVersioning({"1.0.0": scm.update_return_orders}));
  app.route("/admin/return/reorder").post(middleware.checkToken,routesVersioning({"1.0.0": scm.return_reorder}));

  /////// Stock Keeping /////////////
  app.route("/admin/stockkeeping/list").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_list}));
  app.route("/admin/stockkeeping/openlist").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_openlist}));
  app.route("/admin/stockkeeping/add").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_add}));
  app.route("/admin/stockkeeping/view").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_view}));
  app.route("/admin/stockkeeping/edit").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_edit}));
  app.route("/admin/stockkeeping/delete").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.stockkeeping_delete}));

  app.route("/admin/stockkeeping/wastage/list").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.wastage_list}));
  app.route("/admin/stockkeeping/missingitem/list").post(middleware.checkToken,routesVersioning({"1.0.0": stockkeeping.missingitem_list}));
  
  ///////// Logistics //////////////
  app.route("/admin/logistics/readytodispatchlist").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.ready_to_dispatch_list}));
  app.route("/admin/logistics/qa/type_list").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.qa_type_list}));
  app.route("/admin/logistics/qa/submit_checklist").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.submit_qa_checklist}));
  app.route("/admin/logistics/moveit/add").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.moveit_add}));
  app.route("/admin/logistics/moveit/view").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.moveit_view}));
  app.route("/admin/logistics/moveit/edit").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.moveit_edit}));
  app.route("/admin/logistics/moveit/list").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.moveit_list}));
  app.route("/admin/logistics/moveit/sendotp").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.Moveituser_send_otp_byphone}));
  app.route("/admin/logistics/moveit/otpverify").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.Moveituser_otp_verification}));
  app.route("/admin/logistics/moveit/forcelogout").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.admin_force_Moveituser_logout}));
  app.route("/admin/logistics/trip/templist").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.trip_temp_list}));
  app.route("/admin/logistics/moveit/listwithtrip").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.moveit_list_trip}));
  app.route("/admin/logistics/trip/create").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.trip_create}));
  app.route("/admin/logistics/trip/unassign").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.trip_unassign}));
  app.route("/admin/logistics/trip/tripmoveitfilters").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.trip_moveit_filters}));
  app.route("/admin/logistics/trip/list").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.trip_list}));
  app.route("/admin/logistics/dunzo/orderlist").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.dunzo_order_list}));
  app.route("/admin/logistics/dunzo/assign").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.dunzo_assign}));
  app.route("/admin/logistics/dunzo/pickup").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.dunzo_pickup}));
  app.route("/admin/logistics/dunzo/delivered").post(middleware.checkToken,routesVersioning({"1.0.0": Logistics.dunzo_delivered}));
  
  ////Dont Remove Cron Not Work /////////////
  app.route("/eat/explore").get(middleware.checkToken,routesVersioning({"1.0.0":quicksearch.eat_explore_store_data}));

app.route("/admin/crm/dayorderlist").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.crm_day_order_list}));
app.route("/admin/crm/dayorderview").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.crm_day_order_view}));
app.route("/admin/crm/userlist").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.dl_User_list}));
app.route("/admin/crm/productcancel").post(middleware.checkToken,routesVersioning({"1.0.0":darorder.admin_day_order_product_cancel}));
app.route("/admin/ordercomments").post(routesVersioning({"1.0.0":darordercomments.create_OrderComments}));
app.route("/admin/crm/bookreturn").post(middleware.checkToken,routesVersioning({"1.0.0":darorder.admin_day_order_book_return}));
//re order
app.route("/admin/crm/reorder").post(routesVersioning({"1.0.0":dayorder.reorder_order_create}));
app.route("/admin/crm/refundrequest").post(routesVersioning({"1.0.0":dayorder.refund_create}));
app.route("/admin/crm/reorder/reasonlist").get(routesVersioning({"1.0.0":dayorder.reorder_reasonlist}));
app.route("/admin/crm/cancel/reasonlist").get(routesVersioning({"1.0.0":dayorder.cancel_reasonlist}));
app.route("/admin/crm/bookreturn/reasonlist").get(routesVersioning({"1.0.0":dayorder.bookreturn_reasonlist}));
app.route("/admin/crm/refund/reasonlist").get(routesVersioning({"1.0.0":dayorder.refund_reasonlist}));
app.route("/admin/crm/userdayorderlist").post(middleware.checkToken,routesVersioning({"1.0.0": dayorder.user_crm_day_order_list}));
app.route("/admin/refundlist").post(routesVersioning({"1.0.0":refundOnline.get_all_refund_list}));
app.route("/admin/repayment").post(routesVersioning({"1.0.0":Razorpay.razorpay_refund_payment}));


//////zen desk//////
app.route("/admin/zendesk/issues").post(middleware.checkToken,routesVersioning({"1.0.0":Zendeskissues.getZendeskissues}));
app.route("/admin/zendesk/issuesdetails").post(middleware.checkToken,routesVersioning({"1.0.0":Zendeskissues.getZendeskissuesDetails}));
app.route("/admin/zendesk/ticketcreate").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.zendesk_ticket_create}));
app.route("/admin/crm/usersms").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.dl_user_send_message}));
app.route("/admin/dayorderlog").post(routesVersioning({"1.0.0":darordercomments.day_order_log_list}));


//trnsaction list
app.route("/admin/transaction").post(middleware.checkToken,routesVersioning({"1.0.0":orders.transaction_list}));
app.route("/admin/transaction/view").post(middleware.checkToken,routesVersioning({"1.0.0":orders.day_order_transaction_view_by_user}));


app.route("/admin/address").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.update_a_user_address}));

app.route("/admin/adminuserlist").post(middleware.checkToken,routesVersioning({"1.0.0":adminuser.getAllUser}));
app.route("/admin/login").post(routesVersioning({"1.0.0":adminuser.login}));
app.route("/admin/logout").post(routesVersioning({"1.0.0":adminuser.logout}));

app.route("/admin/userdetails").post(routesVersioning({"1.0.0":adminuser.user_details}));


////////Vendor Details////////////////
app.route("/admin/vendor/add").post(routesVersioning({"1.0.0":Vendor.createVendorModel}));
app.route("/admin/vendor/edit").post(routesVersioning({"1.0.0":Vendor.updateVendorModel}));
app.route("/admin/vendor/view").post(routesVersioning({"1.0.0":Vendor.VendorModelview}));
app.route("/admin/vendor/list").post(routesVersioning({"1.0.0":Vendor.VendorModelList}));

////////Brand Details////////////////
app.route("/admin/brand/add").post(routesVersioning({"1.0.0":Brand.createBrandModel}));
app.route("/admin/brand/edit").post(routesVersioning({"1.0.0":Brand.updateBrandModel}));
app.route("/admin/brand/view").post(routesVersioning({"1.0.0":Brand.BrandModelview}));
app.route("/admin/brand/list").post(routesVersioning({"1.0.0":Brand.BrandModelList}));

/////////Collections////////////////
app.route("/admin/collection/classificationlist").post(routesVersioning({"1.0.0":Collection.get_classification_list}));
app.route("/admin/collection/classificationfilter").post(routesVersioning({"1.0.0":Collection.classificationfilter}));
app.route("/admin/collection/add").post(routesVersioning({"1.0.0":Collection.collection_add}));
app.route("/admin/collection/view").post(routesVersioning({"1.0.0":Collection.collection_view}));
app.route("/admin/collection/edit").post(routesVersioning({"1.0.0":Collection.collection_edit}));
app.route("/admin/collection/list").post(routesVersioning({"1.0.0":Collection.collection_list}));
app.route("/admin/collection/live").put(routesVersioning({"1.0.0":Collection.collection_live}));

app.route("/admin/community/masterlist").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.admin_community_list}));

app.route("/admin/community/userlist").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.community_dl_User_list}));

app.route("/admin/community/edit").put(middleware.checkToken,routesVersioning({"1.0.0": dluser.community_edit}));

app.route("/admin/communityapproval").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.join_new_community_approval}));

app.route("/admin/user/edit").put(middleware.checkToken,routesVersioning({"1.0.0":dluser.edit_user}));

app.route("/admin/new_community_registration").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.new_community_registration}));

app.route("/admin/sendnotification").post(routesVersioning({"1.0.0":dluser.user_based_notification}));


//layout changes for category and collection

app.route("/admin/layout").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.update_category_collection_list}));

app.route("/admin/categorylist").post(middleware.checkToken,routesVersioning({"2":category.get_category_list_v2}));



}