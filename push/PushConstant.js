const PushConstant={
    masteridOrder_Post:0,
    masteridOrder_Accept:1,
    masteridOrder_Preparing:2,
    masteridOrder_Prepared:3,
    masteridOrder_Pickedup:5,
    masteridOrder_Delivered:6,

    Pageid_dl_order_post:1,
    Pageid_dl_order_accept:2,
    Pageid_dl_order_preparing:3,
    Pageid_dl_order_Prepared:4,
    Pageid_dl_order_pickedup:5,
    Pageid_dl_order_reached:6,
    Pageid_dl_order_delivered:7,
    Pageid_dl_order_cancel:8,
    Pageid_dl_query_replay:9,
    Pageid_dl_send_notification:0,//bulk nofication
    Pageid_dl_zendesk_notification:13,//zendesk
    Pageid_dl_return_notification:14,
    Pageid_dl_reorder_notification:15,


    pageidMoveit_Order_Assigned:1,
    pageidMoveit_Order_Cancel:2,
    pageidMoveit_Order_Prepared:3,
    pageidMoveit_Replies:4,
    pageidMoveit_Order_Reassign:5,
    pageidMoveit_Order_unassign:6,
    pageidMoveit_return_book:7,
    pageidMoveit_Trip_Assigned:8,

    pageidMakeit_Order_Post:1,
    pageidMakeit_Order_Cancel:2,
    pageidMakeit_Replies:4,
    pageidMakeit_Package_limit:5,

    pageid_eat_razorpay_payment_success:11,

};

module.exports = PushConstant;

