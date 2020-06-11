'user strict';
var sql = require('../db.js');


//Task object constructor
var UserAddress = function(useraddress){
    this.userid = useraddress.userid;
    this.city = useraddress.city;
    this.pincode = useraddress.pincode;
    this.lat = useraddress.lat;
    this.lon = useraddress.lon;
    this.landmark = useraddress.landmark;
    this.address_type = useraddress.address_type;
    this.delete_status = useraddress.delete_status || 0;  
    this.address_default = useraddress.address_default || 0;
    this.google_address = useraddress.google_address;
    this.complete_address = useraddress.complete_address;
    this.flat_house_no = useraddress.flat_house_no;
    this.plot_house_no = useraddress.plot_house_no;
    this.floor = useraddress.floor;
    this.block_name = useraddress.block_name;
    this.apartment_name = useraddress.apartment_name;
};



UserAddress.createUserAddress = function createUserAddress(new_address, result) {   
    
    sql.query("Select * from Address where userid = '"+new_address.userid+"' and  address_type = '"+new_address.address_type+"' and delete_status=0", function (err, res) {
                
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{

        if (res.length === 0 || new_address.address_type == 3) {
            sql.query("INSERT INTO Address set ?", new_address, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  let sucobj=true;
                  let mesobj = "Address Created successfully";
                  let resobj = {  
                    success: sucobj,
                    message:mesobj,
                    status:true,
                    aid: res.insertId
                    }; 
              
                 result(null, resobj);
                }
                }); 
                
        }else{
            
    
          if (new_address.address_type === 1) {
                var message = "Sorry home address already exist!";
            }else if(new_address.address_type === 2){
                var message = "Sorry office address already exist!";
            }
                  let sucobj=true;
                  let mesobj = message;
                  let resobj = {  
                    success: sucobj,
                    message:mesobj,
                    status:false,
                    aid: res.insertId
                    }; 
              
                 result(null, resobj);          
        }

        }
    });
};

UserAddress.getaddressById = function getaddressById(userId, result) {
        sql.query("Select * from Address where userid = ? and delete_status = 0", userId, function (err, res) {             
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                status = true;
                if (res.length ===0) {
                    
                    status = false;
                }
               
                let resobj = {  
                success: true,
                status:status,
                location_radius:3,
                result: res
                }; 

             result(null, resobj);
          
            }
            });   
};

UserAddress.getAllAddress = function getAllAddress(result) {
        sql.query("Select * from Address", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('User : ', res);  

                 result(null, res);
                }
            });   
};

UserAddress.updateById = function(req, result){

  staticquery = "UPDATE Address SET updated_at = ?,";
        var column = '';
        for (const [key, value] of Object.entries(req)) {
            //  console.log(`${key} ${value}`); 

            if (key !== 'userid') {
                // var value = `=${value}`;
                column = column + key + "='" + value + "',";
            }
        }

      var  query = staticquery + column.slice(0, -1) + " where aid = " + req.aid;
        sql.query(query,[new Date()], function (err, res) {
            if (err) {
                console.log("error: ", err);
                result(err, null);
            }
            else {

                let resobj = {
                    success: true,
                    status:true,
                    message: "Address Updated successfully",

                };

                result(null, resobj);
            }

        });
};

UserAddress.remove = function(id, result){
     sql.query("DELETE FROM User WHERE userid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};


UserAddress.update_delete_status = function(req, result){
    sql.query("UPDATE Address SET delete_status = 1 WHERE aid = ?", [req.aid], function (err, res) {
           if(err) {
        console.log("error: ", err);
        result(err, null);
           }
            else{
    
              let resobj = {  
             success: true,
             status:true,
             message :'Address removed successfully'
        }; 
  
     result(null, resobj);
  
    }
  }); 
  };

  UserAddress.getaddressByaid = function getaddressByaid(aid, result) {
    sql.query("Select * from Address where aid = ? ",aid, function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
        }
        });   
};


UserAddress.getaddressByadmin = function getaddressByadmin(req, result) {
    sql.query("Select * from Address where userid = 0", function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
           let sucobj=true;
            let resobj = {  
            success: sucobj,
            result: res
            }; 

         result(null, resobj);
      
        }
        });   
};

////Start: Default Address Update////////////// 
UserAddress.user_default_address_update_aid = function eat_user_default_address_update_aid(req, result) {   
    sql.query("update Address set address_default=1 WHERE aid="+req.aid+" and userid="+req.userid+"", function (err, res1) {
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }else{
            if(res1.length !=0){
             
                let resobj = {  
                    success: true,
                    status:true,
                    message :"Updated successfully"
                }; 
                result(null, resobj);
            }else{
               
                let resobj = {  
                    success: true,
                    status:false,
                    message :"Sorry No Update"
                }; 
                result(null, resobj);
            }
            
        }
    });
};
///////////////////////////////////////////// 


module.exports = UserAddress;