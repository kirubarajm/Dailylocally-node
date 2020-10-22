"use strict";
module.exports = function(app) {
  // var routesVersioning = require('express-routes-versioning')();
  var dluser = require("../controllers/dluser/DlUserController");
  var useraddress = require("../controllers/dluser/UserAddressController");
  let middleware = require('../model/middleware.js');
  let routesVersioning = require('../model/versioning.js')();
  var category = require("../controllers/category/CategoryController");
  var sub_category_L1 = require("../controllers/category/Subcategoryl1Controller");
  var sub_category_L2 = require("../controllers/category/Subcategoryl2Controller");
  var productmaster = require("../controllers/category/ProductMasterController");
  var orders = require("../controllers/common/OrderController");
  var datorderrating = require("../controllers/common/OrderratingController");
  var Promotion = require("../controllers/common/PromotionController");
  var Zendeskissues = require("../controllers/common/ZendeskissuesController");
  var collection = require("../controllers/common/CollectionController");
  var catalog = require("../controllers/admin/catalogController");
  var fav = require("../controllers/dluser/FavController");
  var coupon = require("../controllers/common/CouponController");
  var darorder = require("../controllers/common/DayorderController"); 

// Dl user
app.route("/user/app/versioncheck").post(routesVersioning({"1.0.0": dluser.user_app_version_check_vid}));
app.route("/user/sendotp").post(routesVersioning({"1.0.0":dluser.dl_user_send_otp}));
app.route("/user/otpverification").post(routesVersioning({"1.0.0":dluser.user_otp_verification}));
app.route("/user/logout").post(middleware.checkToken,routesVersioning({"1.0.0":dluser.user_logout}));
app.route("/user/edit").put(middleware.checkToken,routesVersioning({"1.0.0":dluser.edit_user}));
app.route("/user/referral/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":dluser.user_referral}));
app.route("/user/pushid/add").put(middleware.checkToken,routesVersioning({"1.0.0":dluser.add_a_pushid}));
app.route("/user/customersupport").post(routesVersioning({"1.0.0":dluser.customer_support}));
app.route("/user/checkdevice").post(routesVersioning({"1.0.0":dluser.check_device}));

//User Address
app.route("/user/address").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.update_a_user_address})).post(middleware.checkToken,routesVersioning({"1.0.0":useraddress.create_a_address}));
app.route("/user/address/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":useraddress.read_a_user_address_userid})).delete(routesVersioning({"1.0.0":useraddress.delete_a_user_address}));
app.route("/user/addresslist/:aid").get(middleware.checkToken,routesVersioning({"1.0.0":useraddress.read_a_user_address_aid}));
app.route("/user/addressdelete").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.update_delete_status}));
app.route("/user/defaultaddress").put(middleware.checkToken,routesVersioning({"1.0.0":useraddress.user_default_address_update}));
app.route("/user/checkaddress").post(middleware.checkToken,routesVersioning({"1.0.0":useraddress.checkaddress}));


 // category
 app.route("/user/categorylist").post(middleware.checkToken,routesVersioning({"1.0.0":category.get_category_list,"2":category.get_category_list_v2}));

//sub_category_L1
 app.route("/user/subcategoryL1").post(middleware.checkToken,routesVersioning({"1.0.0":sub_category_L1.get_Sub_Category_L1_list}));

 //sub_category_L2
 app.route("/user/subcategoryL2").post(middleware.checkToken,routesVersioning({"1.0.0":sub_category_L2.get_Sub_Category_L2_list}));


 //products
 app.route("/user/productlist").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_ProductMaster_list}));
 app.route("/user/productdetail").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_Product_detail}));
 app.route("/user/categoryproductlist").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.category_product_list}));


 //cart 
 app.route("/user/cartdetails").post(middleware.checkToken,routesVersioning({"1.0.0":category.read_a_cartdetails}));

 //// proceedtopay
 app.route("/user/proceedtopay").post(middleware.checkToken,routesVersioning({"1.0.0":orders.read_a_proceed_to_pay}));

//online order conformation
 app.route("/user/orderplace").post(middleware.checkToken,routesVersioning({"1.0.0":orders.online_order_place_conformation}));

 //order  cancel
 app.route("/user/dayorder/productcancel").post(middleware.checkToken,routesVersioning({"1.0.0":darorder.day_order_product_cancel}));
 

 //live order list
 app.route("/user/liveorders/:userid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.live_order_list_byuserid}));
 app.route("/user/rating").post(middleware.checkToken,routesVersioning({"1.0.0":datorderrating.createorderrating}));
 app.route("/user/orderskip").post(middleware.checkToken,routesVersioning({"1.0.0":orders.day_order_skip_count}));
 app.route("/user/dayorder/:doid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.day_order_view_user}));
 app.route("/user/dayorderhistory").post(middleware.checkToken,routesVersioning({"1.0.0":orders.order_list}));
 app.route("/user/dayorderhistory/month").post(middleware.checkToken,routesVersioning({"1.0.0":orders.order_list_calendar}));
 app.route("/user/dayorderhistory/day").post(middleware.checkToken,routesVersioning({"1.0.0":orders.order_list_calendar_day}));
 app.route("/user/dayorder/productdetail").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_order_Product_detail}));
 app.route("/user/payment_check/:orderid").get(middleware.checkToken,routesVersioning({"1.0.0":orders.payment_check}));
 app.route("/user/rating/check").post(middleware.checkToken,routesVersioning({"1.0.0":datorderrating.day_order_rating_check}));

 //Subscription_plan
 app.route("/user/subscribeplan").post(middleware.checkToken,routesVersioning({"1.0.0":category.subscribeplan_by_pid}));
 app.route("/user/startingdate").post(middleware.checkToken,routesVersioning({"1.0.0":category.get_dayorder_date}));
 app.route("/user/subscribeplan/totalamount").post(middleware.checkToken,routesVersioning({"1.0.0":category.subscribeplan_totalamount_by_pid}));
 
 //promotions
   app.route("/user/promotion/homescreen").post(middleware.checkToken,routesVersioning({"1.0.0":Promotion.get_all_Promotion_by_userid}));
  // app.route("/user/homescreen").post(middleware.checkToken,routesVersioning({"1.0.0":Promotion.get_all_Promotion_by_userid}));


//////zendesk//////
 app.route("/user/zendesk/issues").post(middleware.checkToken,routesVersioning({"1.0.0":Zendeskissues.getZendeskissues}));
 app.route("/user/zendesk/issuesdetails").post(middleware.checkToken,routesVersioning({"1.0.0":Zendeskissues.getZendeskissuesDetails}));
 app.route("/user/zendesk/requestcreate").post(middleware.checkToken,routesVersioning({"1.0.0":dluser.zendesk_requestcreate}));


//collections
 app.route("/user/collection").post(middleware.checkToken,routesVersioning({"1.0.0":collection.list_all_collection}));
 app.route("/user/collectiondetails").post(middleware.checkToken,routesVersioning({"1.0.0":collection.get_all_collection_by_cid_v2}));
 app.route("/user/collection/productlist").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_collection_product_list}));
 app.route("/user/collection/subcategoryL1").post(middleware.checkToken,routesVersioning({"1.0.0":sub_category_L1.get_collection_Sub_Category_L1_list}));


///search
 app.route("/user/quicksearch").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.home_quick_search}));
 app.route("/user/search/catalogdata").post(middleware.checkToken,routesVersioning({"1.0.0": catalog.search_catalog_data_mobile}));


//fav
app.route("/user/fav").post(middleware.checkToken,routesVersioning({"1.0.0":fav.create_a_fav}));
app.route("/user/fav/:id").delete(middleware.checkToken,routesVersioning({"1.0.0":fav.delete_a_fav}));
app.route("/user/fav/productlist").post(middleware.checkToken,routesVersioning({"1.0.0":fav.read_a_product_by_userid}));
app.route("/user/fav/subcategoryL1").post(middleware.checkToken,routesVersioning({"1.0.0":fav.read_a_subcategoryL1_by_userid}));
app.route("/user/fav/category").post(middleware.checkToken,routesVersioning({"1.0.0":fav.read_category_by_userid}));

//master
 app.route("/user/filterlist/").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_brand_list}));
 app.route("/user/sortlist").get(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_sort_list}));
 app.route("/user/collection/filterlist").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_collection_brand_list}));
 app.route("/user/category/filterlist").post(middleware.checkToken,routesVersioning({"1.0.0":productmaster.get_category_product_brand_list}));
 
 //coupon
app.route("/user/coupon/validate").post(middleware.checkToken,routesVersioning({"1.0.0":coupon.coupons_code_validate}));
app.route("/user/coupon").post(middleware.checkToken,routesVersioning({"1.0.0":coupon.get_all_coupons_by_userid}));

//transaction
app.route("/user/transaction").post(middleware.checkToken,routesVersioning({"1.0.0":orders.transaction_list}));
app.route("/user/transaction/view").post(middleware.checkToken,routesVersioning({"1.0.0":orders.day_order_transaction_view_by_user}));
app.route("/user/faqs/:id").get(routesVersioning({"1.0.0":dluser.faq_by_type}));

//Community API list
app.route("/user/communitysearch").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.community_search}));
app.route("/user/communitylist").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.community_list}));
app.route("/user/joincommunity").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.join_new_community,"2.0.0":dluser.join_new_community_v2,"3.0.0": dluser.join_new_community}));
app.route("/user/communityapproval").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.join_new_community_approval}));
app.route("/user/new_community_registration").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.new_community_registration,"2": dluser.new_community_registration_v2}));
app.route("/user/communityuserdetails").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.communityuserdetails}));
app.route("/user/Community/homepage").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.homepage}));
app.route("/user/Community/wapscreen").post(middleware.checkToken,routesVersioning({"1.0.0": dluser.wapscreen}));
app.route("/user/Community/aboutus").post(routesVersioning({"1.0.0":dluser.about_us}));

}