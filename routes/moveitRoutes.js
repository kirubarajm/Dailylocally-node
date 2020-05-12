"use strict";
module.exports = function(app) {
    var routesVersioning = require('express-routes-versioning')();
    var moveituser = require("../controllers/moveit/MoveitUserController");
    var documents = require("../controllers/common/DocumentsController");
    var faq = require("../controllers/common/FaqController");
    var orders = require("../controllers/common/OrderController");
    var moveitdocument = require("../controllers/common/DocumentmoveitController");
    let middleware = require('../model/middleware.js');
    var moveitlogtime = require("../controllers/moveit/MoveitTimelogController");
// Moveit
app.route("/moveit/faqs/:id").get(middleware.checkToken,routesVersioning({"1.0.0":faq.list_all_faqbytype}));
app.route("/moveit/onlinestatus").put(middleware.checkToken,routesVersioning({"1.0.0":moveituser.moveit_live_status}));
app.route("/moveit/orders/:moveit_user_id").get(middleware.checkToken,routesVersioning({"1.0.0":orders.orderlist_by_moveit_userid,"2.0.0":orders.orderlist_by_moveit_userid_V2}));
app.route("/moveit/vorders/:orderid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.orderview}));
app.route("/moveit/orderpickupstatus").put(middleware.checkToken,routesVersioning({"1.0.0":orders.order_pickup_status}));
app.route("/moveit/orderdeliverystatus").put(middleware.checkToken,routesVersioning({"1.0.0":orders.order_delivery_status}));
app.route("/moveit/kitchenreach").put(middleware.checkToken,routesVersioning({"1.0.0":orders.moveit_kitchen_reached}));
app.route("/moveit/makeitrating").put(middleware.checkToken,routesVersioning({"1.0.0":moveituser.moveit_kitchen_rating}));
app.route("/moveit/qualitycheck").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.moveit_kitchen_qualitycheck}));
app.route("/moveit/paymentstatus").put(middleware.checkToken,routesVersioning({"1.0.0":orders.order_payment_status}));
app.route("/moveit/ordershistory/:moveit_user_id").get(middleware.checkToken,routesVersioning({"1.0.0":orders.orderhistory_by_moveit_userid}));
app.route("/moveit/documentUpload").post(middleware.checkToken,routesVersioning({"1.0.0":documents.moveit_upload_a_documents}));
app.route("/moveit/documentstore").post(middleware.checkToken,routesVersioning({"1.0.0":moveitdocument.create_a_documents}));
//app.route("/moveit/makeitrating").put(middleware.checkToken,routesVersioning({"1.0.0":moveituser.moveit_kitchen_rating}));
app.route("/moveit/qualitychecklist").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.moveit_quality_checklist}));
app.route("/moveit/pushid/add").put(routesVersioning({"1.0.0":moveituser.add_a_pushid}));
app.route("/moveit/registration").post(routesVersioning({"1.0.0":moveituser.create_a_user}));
app.route("/moveit/login").post(routesVersioning({"1.0.0":moveituser.checklogin}));
app.route("/moveit/hub").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.read_a_hub_details}));
app.route("/moveit/setlocation").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.setGeoLocation}));
app.route("/moveit/getlocation").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.getGeoLocation}));
app.route("/moveitusers").get(middleware.checkToken,routesVersioning({"1.0.0":moveituser.list_all_user})).post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.create_a_user}));

app.route("/moveitusers/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":moveituser.read_a_user})).put(middleware.checkToken,routesVersioning({"1.0.0":moveituser.update_a_user})).delete(middleware.checkToken,routesVersioning({"1.0.0":moveituser.delete_a_user}));
app.route("/moveit/logout").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.Moveituser_logout}));
app.route("/moveit/todayincome").post(routesVersioning({"1.0.0":orders.moveit_delivery_cash_received_by_today}));
app.route("/moveit/order/accept").put(middleware.checkToken,routesVersioning({"1.0.0":orders.moveit_order_accept}));
app.route("/moveit/versioncheck").post(routesVersioning({"1.0.0": moveituser.moveit_app_version_check_vid}));
app.route("/moveit/ordernotificationtime").post(routesVersioning({"1.0.0": orders.moveit_notification_time}));
app.route("/moveit/logtime").post(routesVersioning({"1.0.0": moveitlogtime.createMoveitTimelog_by_id}));
app.route("/moveit/customerlocationreach").put(middleware.checkToken,routesVersioning({"1.0.0":orders.moveit_customer_location_reached}));
app.route("/moveit/loginstatus").post(middleware.checkToken,routesVersioning({"1.0.0":moveituser.moveit_online_status}));
app.route("/moveit/unacceptorders").post(middleware.checkToken,routesVersioning({"1.0.0":orders.moveit_unaccept_orders}));

app.route("/moveit/customersupport").post(routesVersioning({"1.0.0": moveituser.moveit_customer_support}));
app.route("/moveit/zone").post(routesVersioning({"1.0.0": moveituser.moveit_zone_data}));

}