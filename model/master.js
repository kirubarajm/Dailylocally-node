'user strict';

// makeit appointment status 

const master = [

    {
        'regionlist': [{
                "regionid": 1,
                "regionname": "Tamil nadu"
            },
            {
                "regionid": 2,
                "regionname": "Kerala specialist"
            },
            {
                "regionid": 3,
                "regionname": "punjabi"
            }
        ]
    },

    {
        'cuisinelist': [{
                "cuisineid": 1,
                "cuisinename": "Continental"
            },
            {
                "cuisineid": 2,
                "cuisinename": "South Indian"
            },
            {
                "cuisineid": 3,
                "cuisinename": "North Indian"
            },
            {
                "cuisineid": 4,
                "cuisinename": "Itallian"
            }
        ]
    },

    {
        'sort': [{
                "sortid": 1,
                "sortname": "Nearest"
            },
            {
                "sortid": 2,
                "sortname": "Top rated"
             }
             //,
            // {
            //     "sortid": 3,
            //     "sortname": "low to high"
            // },
            // {
            //     "sortid": 4,
            //     "sortname": "high to low"
            // },
        ]
    },


    {
        'makeitregistrationStatus': [{
                "registrationStatusid": 0,
                "registrationStatus": "Registration"
            },

            {
                "registrationStatusid": 1,
                "registrationStatus": "Makeit Appoinment"
            },
            {
                "registrationStatusid": 2,
                "registrationStatus": "Sales Assign"
            },
            {
                "registrationStatusid": 3,
                "registrationStatus": "Sales Approval"
            },
            {
                "registrationStatusid": 4,
                "registrationStatus": "Admin Approval"
            }
        ]
    },



    // Food Cycle for product 0 is disable 1 is enable for food cycle
    {
        'foodcycle': [{
                "foodcycleStatusid": 1,
                "foodcycle": "Breakfast",
                "foodtime": " 7 to 12",
            },
            {
                "foodcycleStatusid": 2,
                "foodcycle": "Lunch",
                "foodtime": "12 to 4",
            },
            {
                "foodcycleStatusid": 3,
                "foodcycle": "Dinner",
                "foodtime": "6 to 11",
            }
        ]
    },


    // // Sales for followupstatus
    //  {'salesfollowupstatus' : [
    //     {
    //         "followupstatussid":0,
    //         "followupstatus":"incomplete"
    // },
    //     {
    //         "followupstatussid":1,
    //         "followupstatus":"complete"
    //     }
    // ]},


    // Sales for followupstatus
    {
        'salesfollowupstatus': [{
                "followupstatussid": 0,
                "followupstatus": "incomplete"
            },
            {
                "followupstatussid": 1,
                "followupstatus": "complete"
            },
            {
                "followupstatussid": 2,
                "followupstatus": "info-schedule"
            },
            {
                "followupstatussid": 3,
                "followupstatus": "info-reschedule"
            },
            {
                "followupstatussid": 4,
                "followupstatus": "appointment-schedule"
            },
            {
                "followupstatussid": 5,
                "followupstatus": "appointment-reschedule"
            },
            {
                "followupstatussid": 6,
                "followupstatus": "appointment cancel"
            }
        ]
    },


    // order status
    {
        'OrderStatus': [{
                "OrderStatusid": 0,
                "OrderStatus": "Orderput"
            },
            {
                "OrderStatusid": 1,
                "OrderStatus": "Order Accept"
            },
            {
                "OrderStatusid": 2,
                "OrderStatus": "Order Preparing"
            },
            {
                "OrderStatusid": 3,
                "OrderStatus": "Order Prepared"
            },
            {
                "OrderStatusid": 4,
                "OrderStatus": "Kitchen reached"
            }, //orderPacked
            // "OrderStatusid":4,"OrderStatus":"kitchen reached",
            {
                "OrderStatusid": 5,
                "OrderStatus": "Order Pickedup"
            },
            {
                "OrderStatusid": 6,
                "OrderStatus": "Order Delivered"
            },
            {
                "OrderStatusid": 7,
                "OrderStatus": "Order Cancel"
            },
            {
                "OrderStatusid": 8,
                "OrderStatus": "Order missed by kitchen"
            },
            {
                "OrderStatusid": 9,
                "OrderStatus": "Incomplete online order reject "
            },
            {
                "OrderStatusid": 10,
                "OrderStatus": "Tunnel order"
            },
            {
                "OrderStatusid": 11,
                "OrderStatus": "Moveit order Hign demand"
            },
            {
                "OrderStatusid": 12,
                "OrderStatus": "Dunzo Hign demand "
            }
        ]
    },

    // order cancel by for using who is the cancel orders

    
    {
        'cancel_by': [
            {
                "id": 0,
                "appid": "default"
            },
            {
                "id": 1,
                "appid": "EAT"
            },
            {
                "id": 2,
                "appid": "Make-it"
            }

        ]
    },
    //order payment type
    {
        'paymenttype': [{
                "paymenttypeid": 0,
                "paymenttype": "cashOnDelivery"
            },
            {
                "paymenttypeid": 1,
                "paymenttype": "netBanking"
            }

        ]
    },

    //order payment status
    {
        'paymentstatus': [{
                "paymentstatusid": 0,
                "paymentstatus": "not paid"
            },
            {
                "paymentstatusid": 1,
                "paymentstatus": "paid"
            },
            {
                "paymentstatusid": 2,
                "paymentstatus": "cancelled"
            }

        ]
    },

    //order user type
    {
        'ordertype': [{
                "ordertypeid": 0,
                "ordertype": "eatuser"
            },
            {
                "ordertypeid": 1,
                "ordertype": "virtual"
            }
        ]
    },

    //product move to live
    {
        'liveproductstatus': [{
                "active_statusid": 0,
                "active_status": "removeliveproduct"
            },
            {
                "active_statusid": 1,
                "active_status": "moveliveproduct"
            }
        ]
    },

    // food type
    {
        'foodtype': [{
                "vegtypeid": 0,
                "vegtype": "veg"
            },
            {
                "vegtypeid": 1,
                "vegtype": "non-veg"
            }
        ]
    },

    // user type
    {
        'usertype': [{
                "usertypeid": 0,
                "usertype": "user"
            },
            {
                "usertypeid": 1,
                "usertype": "virtual_user"
            },
        ]
    },
// document table image_type using fornt and back ids
    {
        'imagetype': [
            {
            "image_type_id": 0,
            "image_type": "default"
            },
            {
                "image_type_id": 1,
                "image_type": "Front"
            },
            {
                "image_type_id": 2,
                "image_type": "Back"
            },
        ]
    },

    // kitchen/makeit approval status
    {
        'ka_status': [
            {
            "ka_status": 0,
            "approval_status": "default"
            },
            {
                "ka_status": 1,
                "approval_status": "Sales Approval"
            },
            {
                "ka_status": 2,
                "approval_status": "Admin Approval"
            },
        ]
    },

    // image upload type 
    {
        'documenttypemakeit': [{
                "documenttypeid": 1,
                "documenttype": "Kitchen image"
            },
            {
                "documenttypeid": 2,
                "documenttype": "Kitchen Appliances"
            },
            {
                "documenttypeid": 3,
                "documenttype": "Identification document"
            },
            {
                "documenttypeid": 4,
                "documenttype": "Address proof"
            },
            {
                "documenttypeid": 5,
                "documenttype": "Signature image"
            },

            {
                "documenttypeid": 6,
                "documenttype": "Pan Card"
            },
        ]
    },

    // sales move online 
    {
        'moveitonlinestatus': [{
                "moveonlinestatusid": 0,
                "moveonlinestatus": "offline"
            },
            {
                "moveonlinestatusid": 1,
                "moveonlinestatus": "online"
            },
        ]
    },


    // Moveit login and logout status

    {
        'moveitstatus': [{
                "login_status_id": 1,
                "login_status": "login"
            },
            {
                "login_status_id": 2,
                "login_status": "logout"
            },
        ]
    },
    // order payment status
    {
        'paymentstatus': [{
                "paymentstatusid": 0,
                "paymentstatus": "Paymemt Pending"
            },
            {
                "paymentstatusid": 1,
                "paymentstatus": "Paymemt paid"
            },
            {
                "paymentstatusid": 2,
                "paymentstatus": "Payment failed"
            },
            {
                "paymentstatusid": 3,
                "paymentstatus": "Refunded"
            },
            {
                "paymentstatusid": 4,
                "paymentstatus": "Declined"
            },
            {
                "paymentstatusid": 5,
                "paymentstatus": "Paymemt Incomplete"
            },

        ]
    },

    // order pick up quality check
    {
        'qualitycheck': [{
                "id": 1,
                "description": 'Hot Food Received'
            },
            {
                "id": 2,
                "description": 'Food Packaging'
            },
            {
                "id": 3,
                "description": 'Food Preparation Time'
            },
            {
                "id": 4,
                "description": 'product'
            }
        ]
    },

    // order pick up quality check
    {
        'qualitycheckenabletype': [{
                "id": 0,
                "description": 'not ok'
            },
            {
                "id": 1,
                "description": 'ok'
            }
        ]
    },

    {
        'addresstype': [{
                "addresstypeid": 1,
                "description": 'Home'
            },
            {
                "addresstypeid": 2,
                "description": 'work'
            },
            {
                "addresstypeid": 3,
                "description": 'others'
            },
        ]
    },

    {
        'appuserstype': [{
                "addresstypeid": 0,
                "description": 'admin'
            },
            {
                "addresstypeid": 1,
                "description": 'makeit'
            },
            {
                "addresstypeid": 2,
                "description": 'moveit'
            },
            {
                "addresstypeid": 3,
                "description": 'sales'
            },
            {
                "addresstypeid": 4,
                "description": 'eat'
            },

        ]
    },

    {
        'gender': [{
                "genderid": 1,
                "gendername": "Male"
            },
            {
                "genderid": 2,
                "gendername": "Female"
            },
            {
                "genderid": 3,
                "gendername": "Others"
            }
        ]
    },

    {
        'productapprovestatus': [{
                "statusid": 0,
                "description": "Defult"
            },
            {
                "statusid": 1,
                "description": "Product Intermediate approved"
            },
            {
                "statusid": 2,
                "description": "Product Eat approved"
            },
            {
                "statusid": 3,
                "description": "Product rejected"
            },
            {
                "statusid": 4,
                "description": "Product edit"
            }
        ]
    },

    {
        'productItemapprovestatus': [{
                "statusid": 0,
                "description": "Defult"
            },
            {
                "statusid": 1,
                "description": "Item approved"
            },
            {
                "statusid": 2,
                "description": "Item rejected"
            }
        ]
    },

    {
        'quicksearch': [{
                "quicksearchid": 1,
                "quicksearchtype": 'Product'
            },
            {
                "quicksearchid": 2,
                "quicksearchtype": 'kitchen'
            },
            {
                "quicksearchid": 3,
                "quicksearchtype": 'others'
            }
        ]
    },

    {
        'boxingtype': [{
                "boxingtypeid": 1,
                "description": "Small Boxes"
            },
            {
                "boxingtypeid": 2,
                "description": "Medium Boxes"
            },
            {
                "boxingtypeid": 3,
                "description": "Large Boxes"
            },
            {
                "boxingtypeid": 4,
                "description": "Outer Boxes"
            }
        ]
    },
    {
        'questions': [{
                "readid": 0,
                "read_description": 'unread'
            },
            {
                "readid": 1,
                "read_description": 'read'
            }
        ]
    }, {
        'kitchenmembertype': [{
                "kitchenmembertypeid": 1,
                "kitchenmembertype": "Gold"
            },
            {
                "kitchenmembertypeid": 2,
                "kitchenmembertype": "Silver"
            },
            {
                "kitchenmembertypeid": 3,
                "kitchenmembertype": "bronze"
            }
        ]
    },{
        'kitchenimagetype': [{
                "kitchenimagetypeid": 1,
                "kitchenimagetype": "Signature"
            },
            {
                "kitchenmembertypeid": 2,
                "kitchenmembertype": "kitchen-info"
            },
            {
                "kitchenmembertypeid": 3,
                "kitchenmembertype": "SpecialitiesFood"
            },{
                "kitchenmembertypeid": 4,
                "kitchenmembertype": "kitchenmenuimges"
            }
        ]
    },
    {
        'mediatype': [{
                "mediatypetypeid": 1,
                "mediatype": "image"
            },
            {
                "mediatypetypeid": 2,
                "mediatype": "video"
            }
        ]
    },
    {
        'positiontype': [{
                "positiontypeid": 1,
                "positiontype": "top"
            },
            {
                "positiontypeid": 2,
                "positiontype": "bottom"
            },
            {
                "positiontypeid": 3,
                "positiontype": "center"
            },
            {
                "positiontypeid": 4,
                "positiontype": "center-right"
            },
            {
                "positiontypeid": 5,
                "positiontype": "center-left"
            },
        ]
    },

    {
        'apptype': [{
            "apptypeid": 0,
            "description": 'admin'
        },{
                "apptypeid": 1,
                "description": 'android'
            },
            {
                "apptypeid": 2,
                "description": 'ios'
            }

        ]
    },
    {
        'categorytype': [{
                "categorytypeid": 1,
                "categorytype": "product"
            },
            {
                "categorytypeid": 2,
                "categorytype": "kitchen"
            }
        ]
    },

    {
        'moveit_status': [
            {
                "statusid": 1,
                "status": "order accept"
            },
            {
                "statusid": 2,
                "status": "Kitchen reached"
            },
            {
                "statusid": 3,
                "status": "order pickup"
            },
             {
                "statusid": 4,
                "status": "order Rating "
            },
            {
                "statusid": 5,
                "status": "Customer location reached"
            },
            {
                "statusid": 6,
                "status": "Cash received"
            },
            {
                "statusid": 7,
                "status": "Order  delivery"
            },

        ]
    },
    {
        'cancelstatus': [{
                "cancelstatusid": 1,
                "cancelstatus": "kitchen prepared cancel"
            },
            {
                "cancelstatusid": 2,
                "cancelstatus": "moveit pickup cancel"
            }
        ]
    },
    {
        'liveproducthistoryaction': [{
                "actionid": 1,
                "status": "live product add"
            },
            {
                "actionid": 2,
                "status": "live product edit"
            },
            {
                "actionid": 3,
                "status": "cycle start"
            },
            {
                "actionid": 4,
                "status": "cycle end"
            }
        ]
    },
    {
        'product_desc_flag': [{
                "product_desc_flag": 0,
                "status": "auto"
            },
            {
                "product_desc_flag": 1,
                "status": "manual"
            }
        ]
    },
    {
        'package_session': [{
                "id": 1,
                "session": "start_session"
            },
            {
                "id": 2,
                "session": "end_session"
            }
        ]
    },{
        'push_notification_type': [{
                "type": 1,
                "description": "user with out order list"
            },
            {
                "type": 2,
                "description": "user with order list"
            }
        ]
    },{
        'makeit_type': [{
                "type": 0,
                "description": "Home"
            },
            {
                "type": 1,
                "description": "Caters"
            }
        ]
    },
    {
        'Live_Product_History': [{
                "action": 1,
                "description": "Add"
            },
            {
                "action": 2,
                "description": "Edit"
            },
            {
                "action": 3,
                "description": "Cycle Start"
            },
            {
                "action": 4,
                "description": "Cycle End"
            },
            {
                "action": 5,
                "description": "Unlive Product"
            }
        ]
    },
    {
        'location_user_type': [{
                "type": 0,
                "description": "Not tunnel user"
            },
            {
                "type": 1,
                "description": "Not tunnel user"
            }
        ]
    },{
        'Moveit_timelog_action': [{
                "action": 1,
                "description": "Moveit Login and Logout"
            },
            {
                "action": 2,
                "description": "Cron Login and Logout"
            },
            {
                "action": 3,
                "description": "20 min logout"
            },
            {
                "action": 4,
                "description": "Admin Unassign Logout"
            }
        ]
    },{
        'Cron_Type': [{
                "cron_id": 1,
                "description": "Quick Search"
            },
            {
                "cron_id": 2,
                "description": "Incomplete Order Relese Product"
            },
            {
                "cron_id": 3,
                "description": "Driver Auto Logout EOD"
            },
            {
                "cron_id": 4,
                "description": "Package Tracking Every Morning"
            },
            {
                "cron_id": 5,
                "description": "Driver Time Log"
            },
            {
                "cron_id": 6,
                "description": "Driver Day Wise"
            },
            {
                "cron_id": 7,
                "description": "Kitchen Day Wise"
            },
            {
                "cron_id": 8,
                "description": "Live Product History Start"
            },
            {
                "cron_id": 9,
                "description": "Live Product History End"
            },
            {
                "cron_id": 10,
                "description": "Home Maker Tiering"
            },
            {
                "cron_id": 11,
                "description": "Kitchen Lost Revenue"
            }
        ]
    },{
        'Order_action_log': [
            {
                "cron_id": 1,
                "description": "Unassign the Order"
            },
            {
                "cron_id": 2,
                "description": "Reassign the Order"
            },
            {
                "cron_id": 3,
                "description": "Manual assign"
            },
            {
                "cron_id": 4,
                "description": "Virtual Order Placed"
            },
            {
                "cron_id": 5,
                "description": "Raise Ticket"
            },
            {
                "cron_id": 6,
                "description": "Item Missing"
            },
            {
                "cron_id": 7,
                "description": "Order Cancel"
            },
            {
                "cron_id": 8,
                "description": "Prepared Order Cancel"
            },
            {
                "cron_id": 9,
                "description": "Deliver the Order"
            },
            {
                "cron_id": 10,
                "description": "Succeeding the Payment COD"
            },
            {
                "cron_id": 11,
                "description": "Pick up After cancel"
            },
            {
                "cron_id": 12,
                "description": "Refund"
            }
        ]
    },

]
module.exports = master;