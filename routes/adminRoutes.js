"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  var eatuser = require("../controllers/dluser/DlUserController");
  var moveituser = require("../controllers/moveit/MoveitUserController");
  var makeituser = require("../controllers/makeit/MakeitUserController");
  var salesuser = require("../controllers/sales/SalesUserController");
  var documents = require("../controllers/common/DocumentsController");
  var menuitem = require("../controllers/makeit/MenuItemController");
  var product = require("../controllers/makeit/ProductController");
  var faq = require("../controllers/common/FaqController");
  var allocation = require("../controllers/sales/AllocationController");
  var orders = require("../controllers/common/OrderController");
  var moveitdocument = require("../controllers/common/DocumentmoveitController");
  var eatuseraddress = require("../controllers/dluser/UserAddressController");
  var queryquestion = require("../controllers/common/QueryquestionController");
  var queryanswer = require("../controllers/common/QueryanswerController");
  var feedback = require("../controllers/common/EatfeedbackController");
  var refundOnline = require("../controllers/common/refundController");
  var refundcoupon = require("../controllers/common/RefundCouponController");
  var admindashboard = require("../controllers/common/admindashboardController");
  var Razorpay = require("../controllers/common/RazorpayController");
  var MakeitImages = require("../controllers/makeit/MakeitImagesController");
  var Stories = require("../controllers/common/StoryController");
  var adminController = require("../controllers/admin/adminUserController");
  var zoneController = require("../controllers/common/ZoneController");
  var packageController = require("../controllers/common/PackagingBoxTrackingController");
  var packageInventoryController = require("../controllers/makeit/PackageInventoryController");
  var zone = require("../controllers/common/ZoneController");
  var Zendeskissues = require("../controllers/common/ZendeskissuesController");
  var master = require("../controllers/common/MastersController");
  var coupon = require("../controllers/common/CouponController");
/*Admin Api*/
app.route("/admin/eatuser/add").post(routesVersioning({"1.0.0":eatuser.create_a_eatuser}));
app.route("/admin/eatusers/").post(routesVersioning({"1.0.0":eatuser.list_all_virtual_eatuser}));
app.route("/admin/order/add").post(routesVersioning({"1.0.0":orders.eatuser_order_create}));
app.route("/admin/orders").post(routesVersioning({"1.0.0":orders.list_all_orders}));
app.route("/admin/vorders").post(routesVersioning({"1.0.0":orders.list_today_virtual_makeit_orders}));
app.route("/admin/vorders/history").post(routesVersioning({"1.0.0":orders.list_all_virtual_makeit_orders}));
app.route("/admin/order/:id").get(routesVersioning({"1.0.0":orders.order_view}));
app.route("/admin/orderstatus/update").put(routesVersioning({"1.0.0":orders.order_status_update}));//order accept
app.route("/admin/order/assign").put(routesVersioning({"1.0.0":orders.order_assign}));
app.route("/admin/orders/unassign/:id").get(routesVersioning({"1.0.0":orders.un_assign_orders}));
app.route("/admin/product").post(routesVersioning({"1.0.0":product.admin_list_all_product}));
app.route("/admin/makeitusers").post(routesVersioning({"1.0.0":makeituser.admin_list_all_makeitusers}));
app.route("/admin/unapproved/makeitlist").post(routesVersioning({"1.0.0":makeituser.admin_makeit_unapproved_list}));
app.route("/admin/makeituser/add").post(routesVersioning({"1.0.0":makeituser.createnewUser_Admin}));
app.route("/admin/salesuser/add").post(routesVersioning({"1.0.0":salesuser.create_a_user}));
app.route("/admin/moveituser/add").post(routesVersioning({"1.0.0":moveituser.create_a_user}));
app.route("/admin/appointments").get(routesVersioning({"1.0.0":makeituser.list_all_appointment}));
app.route("/admin/appointment/assign").post(routesVersioning({"1.0.0":allocation.create_a_allocation}));
app.route("/admin/moveit/nearbyuser").post(routesVersioning({"1.0.0":moveituser.getNearByMoveit}));
app.route("/admin/eatuser/:userid").get(routesVersioning({"1.0.0":eatuser.read_a_user})).put(routesVersioning({"1.0.0":eatuser.update_a_user})).delete(routesVersioning({"1.0.0":eatuser.delete_a_user}));
app.route("/admin/makeituser/:userid").get(routesVersioning({"1.0.0":makeituser.read_a_user})).delete(routesVersioning({"1.0.0":makeituser.delete_a_user}));
app.route("/admin/salesusers").post(routesVersioning({"1.0.0":salesuser.salesSearch,"2.0.0": salesuser.salesSearch_V2}));
app.route("/admin/moveitusers").post(routesVersioning({"1.0.0":moveituser.moveitSearch}));
app.route("/admin/salesuser/:userid").get(routesVersioning({"1.0.0":salesuser.read_a_user})).delete(routesVersioning({"1.0.0":salesuser.delete_a_user}));
app.route("/admin/moveituser/:userid").get(routesVersioning({"1.0.0":moveituser.admin_read_a_user})).delete(routesVersioning({"1.0.0":moveituser.delete_a_user}));
app.route("/admin/sales/documentupload").post(routesVersioning({"1.0.0":documents.sales_upload_a_documents}));
app.route("/admin/moveit/documentupload").post(routesVersioning({"1.0.0":documents.moveit_upload_a_documents}));
app.route("/admin/makeit/documentupload").post(routesVersioning({"1.0.0":documents.makeit_upload_a_documents}));
app.route("/admin/moveit/documentstore").post(routesVersioning({"1.0.0":moveitdocument.create_a_documents}));
app.route("/admin/menuitem/add").post(routesVersioning({"1.0.0":menuitem.create_a_menuitem}));
app.route("/admin/menuitem/view/:id").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem}));
app.route("/admin/product/add").post(routesVersioning({"1.0.0":product.create_a_product}));
app.route("/admin/liveproduct/:makeit_userid").get(routesVersioning({"1.0.0":product.list_all_liveproduct}));
app.route("/admin/product/view/:productid").get(routesVersioning({"1.0.0":product.productview}));
app.route("/admin/product/movetolive").post(routesVersioning({"1.0.0":product.add_quantity_productlive}));
app.route("/admin/makeituser/edit").put(routesVersioning({"1.0.0":makeituser.edit_makeit_user_byid_Admin}));
app.route("/admin/moveituser/edit").put(routesVersioning({"1.0.0":moveituser.edit_moveit_user_byid}));
app.route("/admin/salesuser/edit").put(routesVersioning({"1.0.0":salesuser.edit_a_user}));
app.route("/admin/menuitems/:makeit_userid").get(routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
app.route("/admin/product/addquantity").put(routesVersioning({"1.0.0":product.add_quantity}));
app.route("/admin/product/edit").put(routesVersioning({"1.0.0":product.update_a_product_by_makeit_userid}));
app.route("/admin/menuitem/edit").put(routesVersioning({"1.0.0":menuitem.update_a_menuitem}));
app.route("/admin/cartdetails").post(routesVersioning({"1.0.0":makeituser.admin_check_cartdetails}));
app.route("/admin/querylist").post(routesVersioning({"1.0.0":queryquestion.read_a_question_byadmin}));
app.route("/admin/queryreplies/:qid").get(routesVersioning({"1.0.0":queryanswer.read_a_replies}));
app.route("/admin/queryanswer").post(routesVersioning({"1.0.0":queryanswer.create_a_answer}));
app.route("/admin/queryread").put(routesVersioning({"1.0.0":queryquestion.update_read_query_by_admin}));
app.route("/admin/query/userlist/:type").get(routesVersioning({"1.0.0":queryquestion.get_user_list_by_type}));
app.route("/admin/orderpickupstatus").put(routesVersioning({"1.0.0":orders.order_pickup_status}));
app.route("/admin/qualitychecklist").post(routesVersioning({"1.0.0":moveituser.moveit_quality_checklist}));
app.route("/admin/addresslist").get(routesVersioning({"1.0.0":eatuseraddress.get_a_admin_address}));
app.route("/admin/faq").get(routesVersioning({"1.0.0":faq.list_all_faq})).post(routesVersioning({"1.0.0":faq.create_a_faq}));
app.route("/admin/faq/:id").get(routesVersioning({"1.0.0":faq.read_a_faq})).put(routesVersioning({"1.0.0":faq.update_a_faq})).delete(routesVersioning({"1.0.0":faq.delete_a_faq}));
app.route("/admin/faqs/:id").get(routesVersioning({"1.0.0":faq.list_all_faqbytype}));
app.route("/admin/feedback").get(routesVersioning({"1.0.0":feedback.list_all_feedback}));
app.route("/admin/productdelete").put(routesVersioning({"1.0.0":product.delete_status_product}));
app.route("/admin/product/approvestatus").put(routesVersioning({"1.0.0":product.approve_status_product}));
app.route("/admin/product/unapprove").post(routesVersioning({"1.0.0":product.admin_unapproval_approve_list}));
app.route("/admin/menuitem/unapprove").post(routesVersioning({"1.0.0":menuitem.admin_unapproval_approve_list}));
app.route("/admin/product/:id").get(routesVersioning({"1.0.0":product.read_a_product})).delete(routesVersioning({"1.0.0":product.delete_a_product}));
app.route("/admin/menuitem/:itemid").delete(routesVersioning({"1.0.0":menuitem.delete_status_menuitem}));
app.route("/admin/menuitem/approve").put(routesVersioning({"1.0.0":menuitem.approve_status_menuitem}));
app.route("/admin/makeit/documentstore").post(routesVersioning({"1.0.0":makeituser.makeit_document_store}));
app.route("/admin/makeit/approved").put(routesVersioning({"1.0.0":salesuser.admin_makeit_approved}));
app.route("/admin/refundlist").get(routesVersioning({"1.0.0":refundOnline.get_all_refund_list}));
app.route("/admin/order/cancel").put(routesVersioning({"1.0.0":orders.admin_order_cancel}));
app.route("/admin/order/refundcreate").put(routesVersioning({"1.0.0":orders.eat_order_item_missing}));
app.route("/admin/dashboard").get(routesVersioning({"1.0.0":admindashboard.get_all_dashboard_count}));
app.route("/admin/repayment").post(routesVersioning({"1.0.0":Razorpay.razorpay_refund_payment}));
app.route("/admin/sales/sendotp").post(routesVersioning({"1.0.0":salesuser.Salesuser_send_otp_byphone}));
app.route("/admin/sales/otpverification").post(routesVersioning({"1.0.0":salesuser.sales_user_otp_verification}));
app.route("/admin/moveituser/sendotp").post(routesVersioning({"1.0.0":moveituser.Moveituser_send_otp_byphone}));
app.route("/admin/moveituser/otpverification").post(routesVersioning({"1.0.0":moveituser.Moveituserotpverification}));
app.route("/admin/makeit/createimages").post(routesVersioning({"1.0.0":MakeitImages.create_a_MakeitImages}));
app.route("/admin/order/refund/list/:activestatus").get(routesVersioning({"1.0.0":refundcoupon.list_all_refund_coupon_by_activestatus}));
app.route("/admin/order/refund/create/").post(routesVersioning({"1.0.0":refundcoupon.createRefundCoupon}));
app.route("/admin/order/refund/remove/:rcid").delete(routesVersioning({"1.0.0":refundcoupon.delete_a_RefundCoupon}));
app.route("/admin/orders/waitinglist").get(routesVersioning({"1.0.0":orders.order_waiting_list_by_admin}));
app.route("/admin/badges").get(routesVersioning({"1.0.0":makeituser.admin_list_all_badges}));
app.route("/admin/moveit/todayincome").post(routesVersioning({"1.0.0":orders.moveit_delivery_cash_received_by_today}));
app.route("/admin/orders/amount").post(routesVersioning({"1.0.0":orders.getTotalAmountofOrders}));
app.route("/admin/products/salescount").post(routesVersioning({"1.0.0":orders.get_sales_products_count}));
app.route("/admin/orders/reassign").post(routesVersioning({"1.0.0":orders.reassign_orders}));
app.route("/admin/moveit/logout").post(routesVersioning({"1.0.0":moveituser.admin_force_Moveituser_logout}));
app.route("/admin/stories").get(routesVersioning({"1.0.0":Stories.list_all_Stories}));
app.route("/admin/login").post(routesVersioning({"1.0.0":adminController.login}));
app.route("/admin/logout").post(routesVersioning({"1.0.0":adminController.logout}));
app.route("/admin/pushupdate").put(routesVersioning({"1.0.0":adminController.updatePushToken}));
app.route("/admin/order/delivery").put(routesVersioning({"1.0.0":orders.admin_order_delivery}));
app.route("/admin/order/paymentstatus").put(routesVersioning({"1.0.0":orders.admin_order_payment_status}));
app.route("/admin/moveit/ordercount").post(routesVersioning({"1.0.0":orders.admin_order_order_count_by_moveit}));
app.route("/admin/makeit/unserviceable").post(routesVersioning({"1.0.0":makeituser.admin_makeit_serviceable_status}));


app.route("/admin/reports/moveitorders").post(routesVersioning({"1.0.0":orders.admin_moveit_no_orders}));
app.route("/admin/reports/orderturnaroundtime/makeit").post(routesVersioning({"1.0.0":orders.admin_order_turnaround_time_makeit}));
app.route("/admin/reports/orderturnaroundtime/moveit").post(routesVersioning({"1.0.0":orders.admin_order_turnaround_time_moveit}));
app.route("/admin/reports/ordercanceled").post(routesVersioning({"1.0.0":orders.admin_order_canceled}));
app.route("/admin/reports/ordercost").post(routesVersioning({"1.0.0":orders.admin_order_cost}));
app.route("/admin/reports/adminviadelivery").post(routesVersioning({"1.0.0":orders.admin_via_order_delivey}));
app.route("/admin/appointmentlist").post(routesVersioning({"1.0.0":allocation.list_all_allocation_by_admin}));
app.route("/admin/query/userdetail").post(routesVersioning({"1.0.0":queryquestion.get_user_by_type}));
app.route("/admin/appointments/rescheduled").post(routesVersioning({"1.0.0":makeituser.makeituser_appointments_rescheduled}));
app.route("/admin/appointments/cancel").post(routesVersioning({"1.0.0":makeituser.makeituser_appointments_cancel}));

//Praveen Reports
app.route("/admin/reports/newusersreport").post(routesVersioning({"1.0.0":orders.new_users}));
app.route("/admin/reports/newusersordersreport").post(routesVersioning({"1.0.0":orders.new_users_orders}));
app.route("/admin/reports/retainedcustomerreport").post(routesVersioning({"1.0.0":orders.retained_customer}));
app.route("/admin/reports/userorderhistoryreport").post(routesVersioning({"1.0.0":orders.user_orders_history}));
app.route("/admin/reports/salesaccountreport").post(routesVersioning({"1.0.0":orders.datewise_sales}));

app.route("/admin/reports/cancelordersreport").post(routesVersioning({"1.0.0":orders.cancel_orders}));
app.route("/admin/reports/driverwisecodreport").post(routesVersioning({"1.0.0":orders.driverwise_cod}));
app.route("/admin/reports/hubtotaldeliveryreport").post(routesVersioning({"1.0.0":orders.hub_total_delivery}));

app.route("/admin/reports/productwisereport").post(routesVersioning({"1.0.0":orders.product_wise}));
app.route("/admin/reports/productwisevirtualreport").post(routesVersioning({"1.0.0":orders.product_wise_virtual}));
app.route("/admin/reports/productwiserealreport").post(routesVersioning({"1.0.0":orders.product_wise_real}));

app.route("/admin/reports/ordersreport").post(routesVersioning({"1.0.0":orders.orders_report}));
app.route("/admin/reports/virtualordersreport").post(routesVersioning({"1.0.0":orders.virtual_orders_report}));
app.route("/admin/reports/realordersreport").post(routesVersioning({"1.0.0":orders.real_orders_report}));

app.route("/admin/ordersrating").post(routesVersioning({"1.0.0":orders.orders_rating}));

app.route("/admin/reports/kitchenwisereport").post(routesVersioning({"1.0.0":orders.kitchenwise_report}));
app.route("/admin/reports/virtualmakeitearningsreport").post(routesVersioning({"1.0.0":orders.virtual_makeit_earnings}));
app.route("/admin/reports/realmakeitearningsreport").post(routesVersioning({"1.0.0":orders.real_makeit_earnings}));
app.route("/admin/reports/virtualkitchenprepareaftercancel").post(routesVersioning({"1.0.0":orders.virtual_after_cancel}));
app.route("/admin/reports/realkitchenprepareaftercancel").post(routesVersioning({"1.0.0":orders.real_after_cancel}));
app.route("/admin/reports/virtualkitchenpreparebeforecancel").post(routesVersioning({"1.0.0":orders.virtual_before_cancel}));
app.route("/admin/reports/realkitchenpreparebeforecancel").post(routesVersioning({"1.0.0":orders.real_before_cancel}));

////Razorpay Capture
app.route("/admin/orders/razorpaycapture").post(routesVersioning({"1.0.0":Razorpay.razorpaycapture}));

app.route("/admin/order/pickupcancel").put(routesVersioning({"1.0.0":orders.admin_order_pickup_cancel}));
app.route("/admin/order/preparedcancel").put(routesVersioning({"1.0.0":orders.admin_order_prepared_cancel}));

app.route("/admin/reports/virtualkitchenordercanceled").post(routesVersioning({"1.0.0":orders.virtual_order_canceled}));
app.route("/admin/reports/realkitchenordercanceled").post(routesVersioning({"1.0.0":orders.real_order_canceled}));

app.route("/admin/moveit/current_location").post(routesVersioning({"1.0.0":moveituser.admin_moveit_current_location}));
app.route("/admin/moveit/nearbymoveit").post(routesVersioning({"1.0.0":moveituser.getNearByMoveit_auto_assign}));

////Live Product Status History
app.route("/admin/makeit/liveproductstatus").post(routesVersioning({"1.0.0":makeituser.makeit_liveproduct_status}));
app.route("/admin/makeit/kitchenliveproductstatus").post(routesVersioning({"1.0.0":makeituser.kitchen_liveproduct_status}));
app.route("/admin/makeit/kitchenpercentage").post(routesVersioning({"1.0.0":makeituser.admin_list_all_makeitusers_percentage}));

app.route("/admin/order/movetoqueue").put(routesVersioning({"1.0.0":orders.order_move_to_queue}));
////Live Product Status History Report
app.route("/admin/reports/kitchenpercentage_report").post(routesVersioning({"1.0.0":makeituser.admin_list_all_makeitusers_percentage_report}));
app.route("/admin/reports/kitchenliveproductstatus_report").post(routesVersioning({"1.0.0":makeituser.kitchen_liveproduct_status_report}));

/////Lost customers list
app.route("/admin/reports/lostcustomerlist_report").post(routesVersioning({"1.0.0":orders.lostcustomerlist_report}));

/////Virtual orders purchased report
app.route("/admin/reports/virtualorderpurchased_report").post(routesVersioning({"1.0.0":orders.virtualorderpurchased_report}));

/////funnel orders report
app.route("/admin/reports/funnelorders_report").post(routesVersioning({"1.0.0":orders.funnelorders_report}));

/////X-Factor orders report
app.route("/admin/reports/xfactororders_report").post(routesVersioning({"1.0.0":orders.xfactororders_report}));

///////Moveit History
app.route("/admin/moveit/getworking_dates").post(routesVersioning({"1.0.0":moveituser.getworking_dates}));
app.route("/admin/moveit/daywise_moveit_records").post(routesVersioning({"1.0.0":moveituser.daywise_moveit_records}));

///////Eat Users History
app.route("/admin/eatuser/userhistory").post(routesVersioning({"1.0.0":eatuser.user_history}));

/////////Zone routes
app.route("/admin/zone/add").post(routesVersioning({"1.0.0":zoneController.create_a_Zone}));
app.route("/admin/zone/getall").post(routesVersioning({"1.0.0":zoneController.list_all_zone}));
app.route("/admin/zone/update").put(routesVersioning({"1.0.0":zoneController.update_a_Zone}));
app.route("/admin/zone/checkmapboundaries").post(routesVersioning({"1.0.0":zoneController.check_map_boundaries}));
app.route("/admin/makeit/zoneupdate/:userid").get(routesVersioning({"1.0.0":makeituser.makeit_zoneid_update}));

////////Movit Report
app.route("/admin/reports/milebasedmoveitaveragedeliveryreport").post(routesVersioning({"1.0.0":moveituser.firstmile_userwise_moveitreport}));
app.route("/admin/reports/milebasedmoveitordersdeliveryreport").post(routesVersioning({"1.0.0":moveituser.firstmile_orderwise_moveitreport}));
app.route("/admin/reports/moveitordersdeliveryreport").post(routesVersioning({"1.0.0":moveituser.orderwise_moveitreport}));

//////Item Missing OR Funnel Refunded coupon list
app.route("/admin/reports/funnelrefundedcouponreport").post(routesVersioning({"1.0.0":orders.funnelrefunded_couponreport}));
//////Item Missing OR Online Refunded coupon list
app.route("/admin/reports/onlinerefundedcouponreport").post(routesVersioning({"1.0.0":orders.onlinerefunded_couponreport}));


///order report///
app.route("/admin/reports/orderreport").post(routesVersioning({"1.0.0":orders.order_report}));
app.route("/admin/reports/Itemwisereport").post(routesVersioning({"1.0.0":orders.Item_wise_report}));
app.route("/admin/reports/moveit_master_report").post(routesVersioning({"1.0.0":orders.moveit_master_report}));
app.route("/admin/reports/makeit_master_report").post(routesVersioning({"1.0.0":orders.makeit_master_report}));

////KPI Dashboard Reports User Exp report///
app.route("/admin/reports/userexperience").post(routesVersioning({"1.0.0":orders.userexperience_report}));
////KPI Dashboard Reports Total completed orders revenu////
app.route("/admin/reports/virtualordercompletedrevenu").post(routesVersioning({"1.0.0":orders.virtualorder_completedrevenu_report}));
app.route("/admin/reports/realordercompletedrevenu").post(routesVersioning({"1.0.0":orders.realorder_completedrevenu_report}));
////KPI Dashboard Reports Total cancelled orders revenu////
app.route("/admin/reports/virtualordercancelledrevenu").post(routesVersioning({"1.0.0":orders.virtualorder_cancelledrevenu_report}));
app.route("/admin/reports/realordercancelledrevenu").post(routesVersioning({"1.0.0":orders.realorder_cancelledrevenu_report}));
////KPI Dashboard Reports Abandoned Cart orders revenu////
app.route("/admin/reports/virtualabandonedcartrevenu").post(routesVersioning({"1.0.0":orders.virtual_abandonedcartrevenu_report}));
app.route("/admin/reports/realabandonedcartrevenu").post(routesVersioning({"1.0.0":orders.real_abandonedcartrevenu_report}));

//admin dunzo cod order list

app.route("/admin/dunzocodorders").post(routesVersioning({"1.0.0":orders.list_dunzo_zone_cod_orders}));
app.route("/admin/dunzoorderlist").post(routesVersioning({"1.0.0":orders.list_dunzo_zone_cod_orders_list}));
app.route("/admin/dunzoorder/assign").post(routesVersioning({"1.0.0":orders.dunzo_order_assign}));
app.route("/admin/dunzoorder/delivery").post(routesVersioning({"1.0.0":orders.dunzo_order_delivery}));

////KPI Dashboard Reports Home Successtion rate////
app.route("/admin/reports/homesuccesstionrate").post(routesVersioning({"1.0.0":makeituser.homesuccesstionrate_report}));
////KPI Dashboard Reports Moveit Avg First and Last Miles////
app.route("/admin/reports/moveitavgfirstandlastmile").post(routesVersioning({"1.0.0":makeituser.moveitavgfirstandlastmile_report}));
///KPI Dashboard Reports Avg Order Value////
app.route("/admin/reports/averageordervalue").post(routesVersioning({"1.0.0":orders.averageordervalue_report}));
///KPI Dashboard Reports Live Kitchen count////
app.route("/admin/reports/livekitchenavgcount").post(routesVersioning({"1.0.0":orders.livekitchenavgcount_report}));


///PackageBox///
app.route("/admin/packagingbox/add").post(routesVersioning({"1.0.0":packageController.create_a_packagingbox}));
app.route("/admin/packagingbox/getlist").get(routesVersioning({"1.0.0":packageController.list_all_packagingbox}));
app.route("/admin/packagingbox/getlist/:id").get(routesVersioning({"1.0.0":packageController.list_single_packagingbox}));
app.route("/admin/packagingbox/update").put(routesVersioning({"1.0.0":packageController.updatePackagingBoxType}));

//Package Inventory//
app.route("/admin/packageinventory/getallpackagelist").post(routesVersioning({"1.0.0":packageInventoryController.getAllPackageInventoryList}));
app.route("/admin/packageinventory/getlist/:makeit_id").get(routesVersioning({"1.0.0":packageInventoryController.getPackageInventoryList}));
app.route("/admin/packageinventory/getpackagemaplist/:makeit_id").get(routesVersioning({"1.0.0":packageInventoryController.getPackageMapInventoryList}));
app.route("/admin/packageinventory/:inventoryid").get(routesVersioning({"1.0.0":packageInventoryController.getPackageInventoryByid}));
app.route("/admin/packageinventory/add").post(routesVersioning({"1.0.0":packageInventoryController.create_PackageInventory}));
app.route("/admin/packageinventory/update").put(routesVersioning({"1.0.0":packageInventoryController.updatePackageInventory}));
app.route("/admin/packageinventory/stocklist").post(routesVersioning({"1.0.0":packageInventoryController.getPackageInventoryStockList}));
app.route("/admin/makeit/packagemakeitusers").get(routesVersioning({"1.0.0":makeituser.get_makeit_package_user}));
app.route("/admin/makeit/delete").put(routesVersioning({"1.0.0":makeituser.makeit_delete}));

///////Eat Users History
app.route("/admin/makeithub/user").post(routesVersioning({"1.0.0":eatuser.hub_based_userlist}));
app.route("/admin/user/sendnotification").post(routesVersioning({"1.0.0":eatuser.user_based_notification}));


//////zone
app.route("/admin/zone/xfactorupdate").post(routesVersioning({"1.0.0":zone.update_a_xfactore}));

///KPI Dashboard Reports Live Kitchen count////
app.route("/admin/reports/loglivekitchenavgcount").post(routesVersioning({"1.0.0":orders.log_livekitchenavgcount_report}));
app.route("/admin/reports/loghublivekitchenavgcount").post(routesVersioning({"1.0.0":orders.log_hub_livekitchenavgcount_report}));

app.route("/admin/reports/cancelled_report_follow_up").post(routesVersioning({"1.0.0":orders.cancelled_report_follow_up}));
app.route("/admin/reports/unclosed_orders").post(routesVersioning({"1.0.0":orders.unclosed_orders}));
app.route("/admin/reports/customerexperience").post(routesVersioning({"1.0.0":orders.customerexperience}));

app.route("/admin/reports/eatusergrowth").post(routesVersioning({"1.0.0":eatuser.user_growth_order_report}));
app.route("/admin/reports/makeit_earnings").post(routesVersioning({"1.0.0":makeituser.makeit_earnings_report}));
app.route("/admin/reports/makeit_cancellation").post(routesVersioning({"1.0.0":makeituser.makeit_cancellation_report}));
app.route("/admin/reports/makeit_avg_preparation").post(routesVersioning({"1.0.0":makeituser.makeit_avg_preparation_report}));
app.route("/admin/reports/xfactor_order_count").post(routesVersioning({"1.0.0":orders.xfactor_order_count}));

///Moveit Succession Report////
app.route("/admin/reports/moveitdaywisecyclereport").post(routesVersioning({"1.0.0":orders.moveit_daywise_cycle_report}));
///makeit_shutdown_report////
app.route("/admin/reports/makeitshutdownreport").post(routesVersioning({"1.0.0":orders.makeit_shutdown_report}));
////Moveit Driver Utilization  Report///
app.route("/admin/reports/moveitutilizationreport").post(routesVersioning({"1.0.0":orders.moveit_utilization_report}));
app.route("/admin/reports/homemaker_activity_per_session").post(routesVersioning({"1.0.0":makeituser.makeit_session_wise_activity_report}));
///OPE Metrics Report////
app.route("/admin/reports/ope_metrics_report").get(routesVersioning({"1.0.0":orders.ope_metrics_report}));

///OPE Metrics growth Report ////
app.route("/admin/reports/ope_metrics_growth").get(routesVersioning({"1.0.0":orders.ope_metrics_growth}));

///OPE Metrics Report table////
app.route("/admin/reports/ope_metrics_report_format").get(routesVersioning({"1.0.0":orders.ope_metrics_report_format}));

///Sales Metrics Report////
app.route("/admin/reports/sales_metrics_report").get(routesVersioning({"1.0.0":orders.sales_metrics_report}));

///Logs Metrics Report////
app.route("/admin/reports/logs_metrics_report").get(routesVersioning({"1.0.0":orders.logs_metrics_report}));

///makeit_incentive_report////
app.route("/admin/reports/makeitincentivereport").post(routesVersioning({"1.0.0":orders.show_makeit_incentive_report}));

///Eat users orders list////
app.route("/admin/user/orderlist").post(routesVersioning({"1.0.0":orders.eat_user_order_list}));

///Admin Raw Data Report////
app.route("/admin/reports/liveproducthistoryrawreport").post(routesVersioning({"1.0.0":orders.liveproducthistory_rawreport}));
app.route("/admin/reports/makeitlograwreport").post(routesVersioning({"1.0.0":orders.makeitlog_rawreport}));
app.route("/admin/reports/moveitlograwreport").post(routesVersioning({"1.0.0":orders.moveitlog_rawreport}));


///Click to call////
app.route("/admin/request_zendesk_ticket").post(routesVersioning({"1.0.0":eatuser.request_zendesk_ticket}));

///Issues list////
app.route("/admin/zendesk/issues").post(routesVersioning({"1.0.0":Zendeskissues.getZendeskissues}));

///Issues list////
app.route("/admin/zoho").get(routesVersioning({"1.0.0":Zendeskissues.zohocode}));

app.route("/masters/producttag").get(routesVersioning({"1.0.0":master.read_product_masters}));

app.route("/admin/virtualproduct").post(routesVersioning({"1.0.0":product.admin_list_all_virtual_product}));
//////Zone Level Performance/////
app.route("/admin/reports/zonelevelperformancereport").get(routesVersioning({"1.0.0":orders.zone_level_performance_report}));


}