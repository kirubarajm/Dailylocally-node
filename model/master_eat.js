'user strict';

// makeit appointment status 

const master_eat = {
    cuisinelist:[
            {
                "id": 1,
                "name": "Continental"
            },
            {
                "id": 2,
                "name": "South Indian"
            },
            {
                "id": 3,
                "name": "North Indian"
            },
            {
                "id": 4,
                "name": "Itallian"
            }
        ],
    sort:[
            {
                "id": 1,
                "name": "Nearest"
            },
            {
                "id": 2,
                "name": "Top rated"
             }
        ],
    gender: [
            {
                "id": 1,
                "name": "Male"
            },
            {
                "id": 2,
                "name": "Female"
            },
            {
                "id": 3,
                "name": "Others"
            }
     ],

    
    order_status:{
        order_post_id : 0,
        order_accept_id :1,
        order_preparing_id :2,
        order_prepared_id:3,
        order_kitchen_reached_id:4,
        order_pickedup_id:5,
        order_delivered_id:6,
        order_cancel_id:7,
        order_missed_by_kitchen_id:8,
        order_incompleted_online_rejected_id:9,

        order_post_desc : "Order Post",
        order_accept_desc :"Order Accept",
        order_preparing_desc : "Order Preparing",
        order_prepared_desc:"Order Prepared",
        order_kitchen_reached_desc:"Kitchen Reached",
        order_pickedup_desc:"Order Pickedup",
        order_delivered_desc:"Order Delivered",
        order_cancel_desc:"Order Cancel",
        order_missed_by_kitchen_desc:"Order Missed By Kitchen",
        order_incompleted_online_rejected_desc:"Incompleted Order Online Reject"
    },

    payment_type:{
        cash_id:0,
        cash_desc:"Cash",

        online_id:1,
        online_desc:"Online"
    },

    payment_status:{
        not_paid_id:0,
        not_paid_desc:"Not Paid",

        paid_id:1,
        paid_desc:"Paid",

        failed_id:2,
        failed_desc:"Falied",
    },

    food_type:{
        veg_id:0,
        veg_desc:"Veg",
        non_veg_id:1,
        non_veg_desc:"Non Veg"
    },
   
    address_type:{
       home_id:1,
       work_id:2,
       others_id:3,
       home_desc:"Home",
       work_desc:"Work",
       others_desc:"Others"
    },
    
    gender:{
        male_id:1,
        female_id:2,
        others_id:3,

        male_desc:"Male",
        female_desc:"Female",
        others_desc:"Othres"
    },
    

    quick_search:{
        product_id:1,
        kitchen_id:2,
        others_id:3,
        product_desc:"Product",
        kitchen_desc:"Kitchen",
        others_desc:"Others"
    },
   
    questions:{
       unread_id:0,
       read_id:1,
       unread_desc:"unread",
       read_desc:"read",
    },
   

    kitchen_member_type:{
        gold_id:1,
        silver_id:2,
        bronze_id:3,

        gold_desc:"Gold",
        silver_desc:"Silver",
        bronze_desc:"Bronze"
    },
   
     media_type:{
        image_id:1,
        video_id:2,
        image_desc:"Image",
        video_desc:"Video"
    },
    position_type:{
        top_id:1,
        bottom_id:2,
        center_id:3,
        center_right_id:4,
        center_left_id:5,

        top_desc:"Top",
        bottom_desc:"Bottom",
        center_desc:"Center",
        center_right_desc:"Center Right",
        center_left_desc:"Center Left"
    }
}
module.exports = master_eat;