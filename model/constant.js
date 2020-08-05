'user strict';


const calculate = {
  gst: 18, // percentage
  food_gst: 5, // percentage
  food_commission_cost: 18,
  deliverycharge: 20, // cost made changes 27-Apr-2020
  applink: "https://bit.ly/2xCD6JM",
  iosapplink: "https://apple.co/2lna3n9",
  refferalcontent:"Order groceries and get them delivered to your doorstep. Click the link below to download the Daily Locally app!",
  radiuslimit: 6.5,
  foodpreparationtime: 15, //min
  onekm: 3,
  servicecharge: 0,
  cancellationmessage: "Are you sure! you want to cancel the order?",
  makeit_nearby_moveit_radius: 4, // in kilometers
  eatversioncodenew: 1, //normal update
  eatversionforceupdate: 5, //forceupdate version
  eatforceupdate: 5,
  eat_delivery_min: 60,
  product_commission_percentage: 50, // percentage
  breatfastcycle: 8, //8 -12
  lunchcycle: 12, //12 - 4
  dinnercycle: 16, //4 - 11
  dinnerend: 22,
  dinnerstart: 4,
  max_order_rating_skip: 2,
  tunnel_refund_amout: 100,
  //  moveitversioncode : 1,
 

  eatiosversioncodenew: 1, //normal update
  eatiosversionforceupdate: 1, //forceupdate version
  eatforceupdate: 1,

  distanceapiKey: "AIzaSyDsjqcaz5Ugj7xoBn9dhOedDWE1uyW82Nc",
  orderbuffertime: 10, //min

  customer_support: 7358531315,
  //Moveit Support Number
  moveit_customer_support: 7358531315,
  //Sales Support Number
  sales_customer_support: 7358531315,
  //support number
  makeit_customer_support: 7358531315,

  //Live Razorpay Details
  // razorpay_key_id: "rzp_live_bCMW6sG1GWp36Q",
  // razorpay_key_secret: "2VAma7EVApDnLuOMerwX3ODu",

  //Test Razorpay Details
  // razorpay_key_id: "rzp_test_3cduMl5T89iR9G",
  // razorpay_key_secret: "BSdpKV1M07sH9cucL5uzVnol",
  
  //EAT-Clone Live Razorpay Details
  //  razorpay_key_id : 'rzp_live_kelnGLZvTecvPV',
  //  razorpay_key_secret : 'GX0bqRNINZwCqp01M8p4xDQh',

  //EAT-Clone Demo Testing Razorpay Details
  ////01-aug-2020 commaded demo key
  // razorpay_key_id : 'rzp_test_8ZBt2J9hAsxH9Q',
  // razorpay_key_secret : 'hvaGojdH4IwolHeDh246ibjz',

  razorpay_key_id : 'rzp_live_kelnGLZvTecvPV',
  razorpay_key_secret : 'GX0bqRNINZwCqp01M8p4xDQh',

  Xfactor_value:1.9,
  Xfactor_subtraction_value:1,
  
    //Auto assign Radius limit  2km  - 3km
    //miles 1.24 to 1.87
    nearby_moveit_radius: 1.87,

    //Miles to km
    onemile : 1.6,

    order_assign_status:false,

    //Hub circle radius 3 km.
    hub_radius:3,

    
    // ///Dunzo Authorization
    // order_assign_dunzo:false,

    // order_assign_dunzo_waiting_min:3,
    // dunzo_client_id : "c6c3acd5-e254-4404-ad06-c0c1d2aafd1e",
    // Authorization : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkIjp7InJvbGUiOjEwMCwidWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1In0sIm1lcmNoYW50X3R5cGUiOm51bGwsImNsaWVudF9pZCI6ImM2YzNhY2Q1LWUyNTQtNDQwNC1hZDA2LWMwYzFkMmFhZmQxZSIsImF1ZCI6Imh0dHBzOi8vaWRlbnRpdHl0b29sa2l0Lmdvb2dsZWFwaXMuY29tL2dvb2dsZS5pZGVudGl0eS5pZGVudGl0eXRvb2xraXQudjEuSWRlbnRpdHlUb29sa2l0IiwibmFtZSI6IkFQSVVTRVIiLCJ1dWlkIjoiZTRiNDU5ZTktODIxOS00M2Q2LWEyYWQtZDJlODhkOTBlYmI1Iiwicm9sZSI6MTAwLCJkdW56b19rZXkiOiIwNmRkZGU1Yy1jODlkLTRiZjgtYjBhMi0wY2Q3NWE2NTVkYWQiLCJleHAiOjE3Mjk2NjUzNDksInYiOjAsImlhdCI6MTU3NDE0NTM0OSwic2VjcmV0X2tleSI6Ik5vbmUifQ.iOvx9-J_0hpD859q2jGuJUMJ_GLdR3RVkB6tFGgeusw",

    //Zone Controles
    zone_control:false,

    //kitchen pagenation 
     kitchen_pagenation_limit :5,

     //dunzo zone order limit 
     Dunzo_zone_order_limit:10,
    ///dunzo max req to generate task id
     Dunzo_max_req:10,

     makeit_applink: "http://bit.ly/2Em3K9T",
     makeit_iosapplink: "https://apple.co/2lna3n9",
     makeit_refferalcontent:"Welcome to EAT Kitchen. Click the link to download the EAT app from play store",
    
    order_cover_package_id :1,
    
    interval_days : 3,

    //////////////Infinity/////////////
    infinity_kitchen_page_limit:5,
    infinity_repeat_switch_loop:1,    
    infinity_first_collection_details_cid:24,
    cart_demand_value:70, /// ruppes
    minimum_cart_value:250,
    home_gst:18,//%
    cater_gst:5,
    convenience_charge:20,
    convenience_charge_status:false,
    product_cost_limit_message:"We are sorry. We can't process this order. Kindly order above the minimum cart value of Rs.250 to proceed.",
    product_cost_limit_short_message:"Minimum cart value is Rs.",
    Makeit_monthly_expect_earning :10000,


    /////////////Makit Incentive///////////////
    logtime_percentage :75,
    makeit_tier1:500,
    makeit_tier2:750,
    makeit_tier3:1000,

    ////////////////Moveit Cycle time//////////
    cycle1:4,
    cycle2:4,
    cycle3:7,
    ////////////////Makeit Cycle time//////////
    cycle1_diff_hours:"04:00:00",
    cycle2_diff_hours:"04:00:00",
    cycle3_diff_hours:"07:00:00", 
    ///Virtual Kitchen onboarded count////
    virtual_kitchen_onboarded_count:240,
    testing_kitchen_onboarded_count:4,

    order_assign_first_radius : 2.5,
    order_assign_second_radius : 0.5,
    delivery_buffer_time : 5,
    Xfactor_status:false,
    Xfactor_moveit_count:5,
    order_waiting_min:30, //min
    zendesk_url:"https://dailylocallytest.zendesk.com/",
    Username:"aravind@tovogroup.com",
    Password:"Dailylocally12!",
    isCronStart:true,
    zoho_refresh_token:"1000.86b2dd470174b25acacf0817f4353584.5f33e9df83931f63717d24fa1a022198",
    zoho_client_id:"1000.86b2dd470174b25acacf0817f4353584.5f33e9df83931f63717d24fa1a022198",
    zoho_client_secret:"05ebb54fcd6f64053118dd8bc7e30b62033eff2894",
    zoho_redirect_uri:"http://www.eatalltime.co.in/admin/",
    zoho_grant_type:"refresh_token",
    zoho_grant_type_code:"authorization_code",
    zoho_auth_api:"https://accounts.zoho.in/oauth/v2/token?",
    zoho_base_api:"https://books.zoho.in/api/v3/",

    makeit_package_alert_count:25,
    makeit_live_quantity_restrict_count:10,

    email_user:'dailylocally@gmail.com',
    email_pass:'Dailylocally12!',

    virtual_order_sms_contact_number:'9150265900',
    Real_order_sms_link:'https://bit.ly/2WIHsYs',

    tovo_po_header_logo:"https://dailylocally.s3.amazonaws.com/admin/1595952461064-Daily%20locally3.png",
    tovo_po_authorized_sign:"https://dailylocally.s3.amazonaws.com/admin/1596520523879-WhatsApp%20Image%202020-08-03%20at%208.34.22%20PM.jpeg",
    tovo_po_header_name:"Tovo Technologies PVT.LTD",
    tovo_po_header_address:"D2, 15, Featherlite Vaikundam,Urapakkam",
    tovo_po_header_area:"chennai - 603210",
    tovo_po_header_gst:"GST : 33AAGCT8518D1ZF",
    tovo_po_header_email:"waziq@tovogroup.com",
    tovo_po_contact:"vignesh",
    tovo_po_contact_number:"8438282534",
    tovo_po_contact_email:"scm@dailylocally.in",
    tovo_po_footer_name:"Tovo Technologies PVT.LTD.,",
    tovo_po_footer_address:"AMG Towers, Lawyer Jaganathan Street,",
    tovo_po_footer_area:"Alandur, chennai - 600032",
    tovo_po_ship_to:" no 48, 5th street, T-nagar, chennai-697898",

}



module.exports = calculate;