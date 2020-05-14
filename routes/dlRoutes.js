"use strict";
module.exports = function(app) {
  var routesVersioning = require('express-routes-versioning')();
  var dluser = require("../controllers/dluser/DlUserController");
  var useraddress = require("../controllers/dluser/UserAddressController");
  let middleware = require('../model/middleware.js');





// Dl user
app.route("/user/app/versioncheck").post(routesVersioning({"1.0.0": dluser.user_app_version_check_vid}));
app.route("/user/sendotp").post(routesVersioning({"1.0.0":dluser.dl_user_send_otp}));
app.route("/user/otpverification").post(routesVersioning({"1.0.0":dluser.user_otp_verification}));
app.route("/user/logout").post(middleware.checkToken,routesVersioning({"1.0.0":dluser.user_logout}));
app.route("/user/edit").put(middleware.checkToken,routesVersioning({"1.0.0":dluser.edit_user}));
app.route("/user/referral/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":dluser.user_referral}));
app.route("/user/pushid/add").put(middleware.checkToken,routesVersioning({"1.0.0":dluser.add_a_pushid}));
app.route("/user/customersupport").post(routesVersioning({"1.0.0":dluser.customer_support}));
//User Address
app.route("/user/address").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.update_a_user_address})).post(middleware.checkToken,routesVersioning({"1.0.0":useraddress.create_a_address}));
app.route("/user/address/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":useraddress.read_a_user_address_userid})).delete(routesVersioning({"1.0.0":useraddress.delete_a_user_address}));
app.route("/user/addresslist/:aid").get(middleware.checkToken,routesVersioning({"1.0.0":useraddress.read_a_user_address_aid}));
app.route("/user/addressdelete").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.update_delete_status}));
app.route("/user/defaultaddress").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.user_default_address_update}));

// app.route("/eat/address").get(middleware.checkToken,routesVersioning({"1.0.0":eatuseraddress.list_all_address})).post(middleware.checkToken,routesVersioning({"1.0.0":eatuseraddress.create_a_address}));
// app.route("/eat/addresslist/:aid").get(middleware.checkToken,routesVersioning({"1.0.0":eatuseraddress.read_a_user_address_aid}));
// app.route("/eat/address/").put(middleware.checkToken,routesVersioning({"1.0.0":eatuseraddress.update_a_user_address}));
// app.route("/eat/addressdelete").put(middleware.checkToken,routesVersioning({"1.0.0":eatuseraddress.update_delete_status}));
// app.route("/eat/feedback").get(middleware.checkToken,routesVersioning({"1.0.0":feedback.list_all_feedback})).post(routesVersioning({"1.0.0":feedback.create_a_feedback}));
// app.route("/eat/checklogin").post(routesVersioning({"1.0.0":eatuser.checklogin}));

// app.route("/eat/postregistration").put(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_user_post_registration}));
// app.route("/eat/defaultaddress").put(middleware.checkToken,routesVersioning({"1.0.0":eatuseraddress.eat_user_default_address_update}));
// app.route("/eatusers").post(routesVersioning({"1.0.0":eatuser.create_a_eatuser})); //.get(middleware.checkToken,routesVersioning({"1.0.0":eatuser.list_all_eatuser}))
// app.route("/eatusers/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":eatuser.read_a_user})).put(routesVersioning({"1.0.0":eatuser.update_a_user}));
// app.route("/favforeatusers/:id").get(middleware.checkToken,routesVersioning({"1.0.0":fav.list_all_fav_eatusers}));
// app.route("/eat/getotp/:phone_number").get(middleware.checkToken,routesVersioning({"1.0.0":eatuser.get_otp_phone_number}));
// app.route("/eat/products").post(middleware.checkToken,routesVersioning({"1.0.0": eatuser.eat_makeit_product_list,"2.0.0": eatuser.get_eat_makeit_product_list_v_2,"2.0.1": eatuser.get_eat_makeit_product_list_v_2_1,"2.0.2": eatuser.get_eat_makeit_product_list_v_2_2}));
// //app.route("/eat/placeorder").post(middleware.checkToken,routesVersioning({"1.0.0":orders.eatuser_order_create}));
// app.route("/eat/order/:orderid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.order_view_eatuser}));
// app.route("/eat/orders/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.order_list_eatuser}));
// app.route("/eat/makeituser/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":makeituser.read_a_user}));
// app.route("/eat/orderplace").post(middleware.checkToken,routesVersioning({"1.0.0":orders.online_order_place_conformation}));
// app.route("/eat/cartdetails").post(middleware.checkToken,routesVersioning({"1.0.0":makeituser.read_a_cartdetails}));
// app.route("/eat/dishlist").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_dish_sort_filter}));
// app.route("/eat/kitchenlist").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_kitchen_sort_filter,"2.0.0":eatuser.eat_kitchen_sort_filter_v2,"2.0.1":eatuser.eat_kitchen_sort_filter_v_2_1,"2.0.2":eatuser.eat_kitchen_sort_filter_v_2_2}));
// //app.route("/eat/kitchenlist").post(middleware.checkToken,routesVersioning({"2.0.0":eatuser.eat_kitchen_sort_filter_2}));
// app.route("/eat/fav").post(middleware.checkToken,routesVersioning({"1.0.0":fav.create_a_fav}));
// app.route("/eat/fav/:id").delete(middleware.checkToken,routesVersioning({"1.0.0":fav.delete_a_fav}));
// app.route("/eat/fav/dishlist/:id").get(middleware.checkToken,routesVersioning({"1.0.0":fav.read_a_fav_dishlist,"2.0.0":fav.read_a_fav_dishlist_v2}));
// app.route("/eat/fav/kitchenlist/:id").get(middleware.checkToken,routesVersioning({"1.0.0":fav.read_a_fav_kitchenlist,"2.0.0":fav.read_a_fav_kitchenlist_v2}));
// app.route("/eat/liveorders/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.live_order_list_byeatuser}));
// app.route("/eat/proceedtopay").post(middleware.checkToken,routesVersioning({"1.0.0":orders.read_a_proceed_to_pay}));
// app.route("/eat/forgot").post(routesVersioning({"1.0.0":eatuser.eat_user_forgot_password}));
// app.route("/eat/password").put(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_user_forgot_password_update}));
// app.route("/eat/rating").post(middleware.checkToken,routesVersioning({"1.0.0":orderrating.createorderrating}));

// app.route("/eat/payment/customerid").get(middleware.checkToken,routesVersioning({"1.0.0":eatuser.create_customerid_by_razorpay}));
// app.route("/eat/region/kitchenlist").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_region_list_sort_filter}));
// app.route("/eat/regionlist").post(middleware.checkToken,routesVersioning({"2.0.0": eatuser.eat_region_list2,"1.0.0": eatuser.eat_region_list}));
// app.route("/eat/kitche/showmore").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_region_kitchen_showmore,"2.0.0":eatuser.eat_region_kitchen_showmore_v2}));
// app.route("/eat/product/search").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.eat_explore_dish,"2.0.0":eatuser.eat_explore_dish_v2}));
// app.route("/eat/explore").get(middleware.checkToken,routesVersioning({"1.0.0":quicksearch.eat_explore_store_data}));
// app.route("/eat/quicksearch").post(middleware.checkToken,routesVersioning({"1.0.0":quicksearch.eat_explore_quick_search}));
// app.route("/eat/order/cancel").put(middleware.checkToken,routesVersioning({"1.0.0":orders.eat_order_cancel}));
// app.route("/eat/refund/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":refundcoupon.read_a_refundcoupon_by_userid}));
// app.route("/eat/refundupdate").put(middleware.checkToken,routesVersioning({"1.0.0":refundcoupon.updateByRefundCouponId}));
// app.route("/eat/stories").get(middleware.checkToken,routesVersioning({"1.0.0":Stories.list_all_Stories}));
// app.route("/eat/order/refund/getlastcoupon/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":refundcoupon.read_a_refundcoupon_by_userid}));

// app
// .route("/fav")
//     .get(middleware.checkToken,routesVersioning({"1.0.0":fav.list_all_fav}))
//     .post(middleware.checkToken,routesVersioning({"1.0.0":fav.create_a_fav}));

//   app.route("/fav/:id")
//     .get(middleware.checkToken,routesVersioning({"1.0.0":fav.read_a_fav}))
//     .put(middleware.checkToken,routesVersioning({"1.0.0":fav.update_a_fav}))
//     .delete(middleware.checkToken,routesVersioning({"1.0.0":fav.delete_a_fav}));

// //app.route("/orders/ordercreate").post(middleware.checkToken,routesVersioning({"1.0.0":orders.eatuser_order_create})).delete(routesVersioning({"1.0.0":eatuser.delete_a_user}));
// //app.route("/eat/coupon/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":coupon.get_all_coupons_by_userid}));
// app.route("/eat/coupon/validate").post(middleware.checkToken,routesVersioning({"1.0.0":coupon.coupons_code_validate}));
// app.route("/eat/coupon").post(middleware.checkToken,routesVersioning({"1.0.0":coupon.get_all_coupons_by_userid}));
// app.route("/eat/coupon/:eatuserid").get(middleware.checkToken,routesVersioning({"1.0.0":coupon.get_coupons_by_userid_new}));
// //app.route("/eat/collection").get(middleware.checkToken,routesVersioning({"1.0.0":collection.list_all_collection}));
// //app.route("/eat/collectionlist").post(middleware.checkToken,routesVersioning({"1.0.0":collection.read_all_collection_by_userid}));
// app.route("/eat/collectiondetails").post(middleware.checkToken,routesVersioning({"1.0.0":collection.get_all_collection_by_cid,"2.0.0":collection.get_all_collection_by_cid_v2}));
// app.route("/eat/collection").post(middleware.checkToken,routesVersioning({"1.0.0":collection.list_all_collection}));
// app.route("/eat/collectionicons").post(middleware.checkToken,routesVersioning({"1.0.0":collection.list_all_collection_icons}))
// app.route("/eat/orderskip").post(middleware.checkToken,routesVersioning({"1.0.0":orders.eat_order_skip_count}));
// app.route("/eat/order/deliverytime").post(middleware.checkToken,routesVersioning({"1.0.0":orders.eat_get_delivery_time}));
// app.route("/eat/order/distance").post(middleware.checkToken,routesVersioning({"1.0.0":orders.eat_order_distance_calculation}));

// app.route("/eat/tunnelorder").post(middleware.checkToken,routesVersioning({"1.0.0":orders.create_tunnel_order}));
// app.route("/eat/getXfactors").post(middleware.checkToken,routesVersioning({"1.0.0":orders.getXfactors_by_userid}));
// app.route("/eat/updatetunneluser").put(middleware.checkToken,routesVersioning({"1.0.0":eatuser.update_tunnel_byid}));


// //////////Razorpay////////////////////
// app.route("/eat/payment/retry").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.payment_retry}));
// app.route("/eat/promotion/homescreen").post(middleware.checkToken,routesVersioning({"1.0.0":Promotion.get_all_Promotion_by_userid}));

// //////zen desk//////
// app.route("/eat/zendesk/issues").post(middleware.checkToken,routesVersioning({"1.0.0":Zendeskissues.getZendeskissues}));
// app.route("/eat/zendesk/issuesdetails").post(middleware.checkToken,routesVersioning({"1.0.0":Zendeskissues.getZendeskissuesDetails}));
// app.route("/eat/zendesk/requestcreate").post(middleware.checkToken,routesVersioning({"1.0.0":eatuser.zendesk_requestcreate}));
// app.route("/eat/productunlive").get(middleware.checkToken,routesVersioning({"1.0.0":quicksearch.manual_product_unlive}));





}