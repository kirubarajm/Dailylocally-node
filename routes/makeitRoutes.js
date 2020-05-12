"use strict";
module.exports = function(app) {
var routesVersioning = require('express-routes-versioning')();
var routesVersioning = require('express-routes-versioning')();
var makeituser = require("../controllers/makeit/MakeitUserController");
var documents = require("../controllers/common/DocumentsController");
var menuitem = require("../controllers/makeit/MenuItemController");
var product = require("../controllers/makeit/ProductController");
var orders = require("../controllers/common/OrderController");
let middleware = require('../model/middleware.js');
var makeitbadges = require("../controllers/makeit/MakeitBadgesController");
var PackageItems = require("../controllers/makeit/PackageItemsController.js");
// Makeit
app.route("/makeit/orders").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.all_order_list}));
app.route("/makeit/orders/listbydate").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.all_order_list_bydate}));
app.route("/makeit/orders/:id").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.orderlist}));
app.route("/makeit/ordershistory/:id").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.orderhistory,"2.0.0": makeituser.orderhistory_V2}));
app.route("/makeit/orderview/:orderid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.orderview}));
app.route("/makeit/orderstatus").put(middleware.checkToken,routesVersioning({"1.0.0":makeituser.orderstatus}));
app.route("/makeit/lproduct/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":product.list_all_liveproduct}));
app.route("/makeit/moveliveproduct").post(middleware.checkToken,routesVersioning({"1.0.0":product.moveliveproduct}));
app.route("/makeit/productitem/:productid").get(middleware.checkToken,routesVersioning({"1.0.0":product.productitemlist}));
app.route("/makeit/addquantity").put(middleware.checkToken,routesVersioning({"1.0.0":product.add_quantity}));
app.route("/makeit/addquantityandproductlive").put(middleware.checkToken,routesVersioning({"1.0.0":product.add_quantity_productlive}));
app.route("/makeit/menuitems/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
app.route("/makeit/edit").put(middleware.checkToken,routesVersioning({"1.0.0":makeituser.edit_makeit_user_byid}));
app.route("/makeit/referral/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.make_user_referral}));
app.route("/makeit/phoneotp").post(routesVersioning({"1.0.0":makeituser.makeit_user_send_otp}));
app.route("/makeit/otpverification").post(routesVersioning({"1.0.0":makeituser.makeit_otp_verification}));
app.route("/makeit/logout").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.makeituser_logout}));
app.route("/makeit/password").put(routesVersioning({"1.0.0":makeituser.makeit_user_forgot_password_update}));
app.route("/makeit/forgot").post(routesVersioning({"1.0.0":makeituser.makeit_user_forgot_send_otp_by_phone}));
app.route("/makeit/productupload").post(middleware.checkToken,routesVersioning({"1.0.0":documents.makeit_product_upload_a_document}));
app.route("/makeit/documentupload").post(middleware.checkToken,routesVersioning({"1.0.0":documents.makeit_upload_a_documents}));
app.route("/makeit/product/edit").put(middleware.checkToken,routesVersioning({"1.0.0":product.edit_product_by_makeit_userid}));
app.route("/makeit/product/:id").get(middleware.checkToken,routesVersioning({"1.0.0":product.read_a_product})).put(middleware.checkToken,routesVersioning({"1.0.0":product.update_a_product})).delete(middleware.checkToken,routesVersioning({"1.0.0":product.delete_a_product}));
app.route("/makeit/productlist/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":product.list_all_product_makeit_userid}));
app.route("/makeit/menuitem/unapprove").post(middleware.checkToken,routesVersioning({"1.0.0":menuitem.admin_unapproval_approve_list}));
app.route("/makeit/menuitem/edit").put(middleware.checkToken,routesVersioning({"1.0.0":menuitem.update_a_menuitem}));
app.route("/makeit/menuitem/:itemid").delete(middleware.checkToken,routesVersioning({"1.0.0":menuitem.delete_status_menuitem}));
app.route("/makeit/earnings/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.makeit_earnings}));
app.route("/makeit/pushid/add").put(middleware.checkToken,routesVersioning({"1.0.0":makeituser.add_a_pushid}));
app.route("/makeit/dayearnings/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.makeit_earnings_day}));
app.route("/makeit/menuitems/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":menuitem.read_a_menuitem_byid}));
app.route("/makeit/menuitemlist/:makeit_userid") .get(middleware.checkToken,routesVersioning({"1.0.0":menuitem.list_all_menuitem_by_makeituserid}));
app.route("/makeit/appoinmentinfo/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.appointment_info}));
app.route("/makeit/order/cancel").put(middleware.checkToken,routesVersioning({"1.0.0":orders.makeit_order_cancel}));
app.route("/makeit/order/accept").put(middleware.checkToken,routesVersioning({"1.0.0":orders.makeit_order_accept}));
app.route("/makeit/order/missing").put(middleware.checkToken,routesVersioning({"1.0.0":orders.makeit_order_missing}));
app.route("/makeit/users").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.list_all_user})).post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.create_a_user}));
app.route("/makeit/user/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.read_a_user})).put(middleware.checkToken,routesVersioning({"1.0.0":makeituser.update_a_user})).delete(routesVersioning({"1.0.0":makeituser.delete_a_user}));
app.route("/makeit/login").post(routesVersioning({"1.0.0":makeituser.checklogin}));
app.route("/makeit/registration").post(routesVersioning({"1.0.0":makeituser.create_a_user}));
app.route("/makeit/paymentregistration/:userid").put(routesVersioning({"1.0.0":makeituser.update_payment_registration}));
app.route("/makeit/bookappointment").put(middleware.checkToken,routesVersioning({"1.0.0":makeituser.creat_a_appointment}));
app.route("/makeit/appointments").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.list_all_appointment}));
app.route("/makeit/menuitem").get(middleware.checkToken,routesVersioning({"1.0.0":menuitem.list_all_menuitem})).post(routesVersioning({"1.0.0":menuitem.create_a_menuitem}));
app.route("/makeit/product").get(middleware.checkToken,routesVersioning({"1.0.0":product.list_all_product})).post(routesVersioning({"1.0.0":product.create_a_product}))
app.route("/makeit/badgescreate").post(middleware.checkToken,routesVersioning({"1.0.0":makeitbadges.createMakeitBadges}));
app.route("/makeit/versioncheck").post(routesVersioning({"1.0.0": makeituser.makeit_app_version_check_vid}));
app.route("/makeit/loginstatus").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.makeituser_online_status}));
app.route("/makeit/liveproductstatus/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0":product.live_product_status}));
app.route("/makeit/createliveproducthistory").post(middleware.checkToken,routesVersioning({"1.0.0":product.create_live_product_status_history}));
app.route("/makeit/cronliveproducthistory").post(routesVersioning({"1.0.0":product.cron_create_live_product_status_history}));
app.route("/makeit/customersupport").post(routesVersioning({"1.0.0": makeituser.makeit_customer_support}));

////New Makeit Earnings/////////////
app.route("/makeit/weeklyearnings").post(middleware.checkToken,routesVersioning({"1.0.0": makeituser.makeit_weekly_earnings}));
app.route("/makeit/daywiseearnings").post(middleware.checkToken,routesVersioning({"1.0.0": makeituser.makeit_daywise_earnings}));
app.route("/makeit/getfirstorder/:makeit_userid").get(middleware.checkToken,routesVersioning({"1.0.0": makeituser.makeit_get_firstorder}));
app.route("/makeit/packageitem/:productid").get(middleware.checkToken,routesVersioning({"1.0.0":PackageItems.packageitemlist}));
app.route("/makeit/makeitrevenuelost").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.total_lost_revenue}));
app.route("/makeit/makesuccessionrate").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.total_makesuccessionrate}));
app.route("/makeit/makefinancedisplay").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.total_makefinancedisplay}));

////////Makeit Incentive///////////
app.route("/makeit/incentives").post(middleware.checkToken,routesVersioning({"1.0.0": makeituser.makeit_incentives}));
////////Makeit cancellist///////////
app.route("/makeit/order/cancellist").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.makeit_order_cancellist}));
////Makeit Live Session/////////////
app.route("/makeit/makeitlivesession").post(middleware.checkToken,routesVersioning({"1.0.0": makeituser.makeit_live_session}));


}