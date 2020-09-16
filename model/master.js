'user strict';

// makeit appointment status 

const master = [


   


 

    // order cancel by for using who is the cancel orders

  
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
                "ordertype": "user"
            },
            {
                "ordertypeid": 1,
                "ordertype": "virtual"
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
            }
        ]
    },


    {
        'addresstype': [{
                "addresstypeid": 1,
                "description": 'Individual'
            },
            {
                "addresstypeid": 2,
                "description": 'Apratment'
            },
            {
                "addresstypeid": 3,
                "description": 'others'
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
        'apptype': [
            {
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
        'search_types': [{
                "type": 1,
                "description": "category"
            },
            {
                "type": 2,
                "description": "sub_cat 1"
            },
            {
                "type": 3,
                "description": "sub_cat 2"
            },
            {
                "type": 4,
                "description": "product"
            }
        ]
    },

    {
        'category_types': [{
                "type": 1,
                "description": "category"
            },
            {
                "type": 2,
                "description": "Collection"
            },
            {
                "type": 3,
                "description": "Community"
            }
        ]
    },
    {
        'community_type': [
            {
            "id": 1,
            "description": 'Commmunity user'
            },
            {
            "id": 2,
            "description": 'admin'
            }

        ]
    },

]
module.exports = master;