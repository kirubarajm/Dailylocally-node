const PushConstant={
    masteridOrder_Post:0,
    masteridOrder_Accept:1,
    masteridOrder_Preparing:2,
    masteridOrder_Prepared:3,
    masteridOrder_Pickedup:5,
    masteridOrder_Delivered:6,

    Pageid_eat_order_post:1,
    Pageid_eat_order_accept:2,
    Pageid_eat_order_preparing:3,
    Pageid_eat_order_Prepared:4,
    Pageid_eat_order_pickedup:5,
    Pageid_eat_order_reached:6,
    Pageid_eat_order_delivered:7,
    Pageid_eat_order_cancel:8,
    Pageid_eat_query_replay:9,
    Pageid_eat_send_notification:0,//bulk nofication
    Pageid_eat_zendesk_notification:13,//zendesk


    pageidMoveit_Order_Assigned:1,
    pageidMoveit_Order_Cancel:2,
    pageidMoveit_Order_Prepared:3,
    pageidMoveit_Replies:4,
    pageidMoveit_Order_Reassign:5,
    pageidMoveit_Order_unassign:6,

    pageidMakeit_Order_Post:1,
    pageidMakeit_Order_Cancel:2,
    pageidMakeit_Replies:4,
    pageidMakeit_Package_limit:5,

    pageid_eat_razorpay_payment_success:11,

};

module.exports = PushConstant;

