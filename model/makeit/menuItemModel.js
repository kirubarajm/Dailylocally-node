'user strict';
var sql = require('../db.js');

//Task object constructor
var Menuitem = function(menuitem){
    this.makeit_userid = menuitem.makeit_userid;
    this.menuitem_name=menuitem.menuitem_name;
    this.active_status=menuitem.active_status || 0;
    this.vegtype=menuitem.vegtype;
    this.price=menuitem.price;
    this.approved_status=menuitem.approved_status ||0;
  //  this.created_at = new Date();
   // this.price = menuitem.price;
};

/*
this.product_name = menuitem.product_name;
    this.makeit_userid = menuitem.makeit_userid;
    this.image=menuitem.image;
    this.active_status=menuitem.active_status;
    this.vegtype=menuitem.vegtype;
*/

Menuitem.createMenuitem = function createMenuitem(newMenuitem, result) {    
        sql.query("INSERT INTO Menuitem set ?", newMenuitem, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    let sucobj=true;
                    let megobj = "Menu Item Created Successful";
                    let resobj = {  
                    success: sucobj,
                    message:megobj, 
                    result: res.insertId
                    }; 

                 result(null, resobj);
                }
            });           
};

Menuitem.getMenuitemById = function getMenuitemById(userId, result) {
        sql.query("Select * from Menuitem where menuitemid = ? ", userId, function (err, res) {             
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

Menuitem.getAllMenuitem = function getAllMenuitem(req,result) {
        sql.query("Select * from Menuitem ", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Menuitem : ', res); 
                  let sucobj=true;
                  let resobj = {  
                    success: sucobj,
                    result: res 
                    }; 

                 result(null, resobj);
                }
            });   
};

Menuitem.updateById = function(id, user, result){
  sql.query("UPDATE Menuitem SET task = ? WHERE menuitemid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
                }
            }); 
};

Menuitem.remove = function(id, result){
     sql.query("DELETE FROM Menuitem WHERE menuitemid = ?", [id], function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
               
                 result(null, res);
                }
            }); 
};


Menuitem.get_Menuitem_By_makeitid = function get_Menuitem_By_makeitid(userId, result) {

    sql.query("Select * from Menuitem  where makeit_userid = ? ", userId, function (err, res) {             
            if(err) {
                console.log("error: ", err);
                result(err, null);
            }
            else{
                let sucobj=true;
                let resobj = {  
                    success: sucobj,
                    status:true,
                    result: res 
                 }; 
                 result(null, resobj);
            }
        });   
};

Menuitem.update_a_menuitem_makeit_userid = function(req, result){
  //console.log("UPDATE: ", req);
  sql.query(" select * from Menuitem where menuitemid = "+req.menuitemid, function (err, res) {
    if(err) {
        result(err, null);
    }else{

      if (res.length !== 0) {

    var staticquery = "UPDATE Menuitem SET ";
    var column = '';
    var values =[];
    for (const [key, value] of Object.entries(req)) {
        console.log(`${key} ${value}`);

        if (key !== 'menuitemid') {
            // var value = `=${value}`;
            //column = column + key + "='" + value + "',";
            column = column + key +" = ?,";
            values.push(value);
        }
    }
    column=column.slice(0, -1)
    values.push(req.makeit_userid);
    values.push(req.menuitemid);
    //values=values.slice(0, -1)
    console.log("value--->",values)
   //var  query = staticquery + column  + " where makeit_userid = " + req.makeit_userid +" and menuitemid = "+req.menuitemid ;
   var  query = staticquery + column  + " where makeit_userid = ? and menuitemid = ?";
    console.log(query);
    sql.query(query, values,function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(err, null);
        }
        else {

            let sucobj = true;
            let message = " Menu item updated successfully"
            let resobj = {
                success: sucobj,
                status:true,
                message: message
            };

            result(null, resobj);
        }

    });
      }else{

    let resobj = {
        success: true,
        status:false,
        message: "No Item found,Sorry you can't edit the item"
    };
    result(null, resobj);
  }
  }
});
  };
  

  Menuitem.approve_menuitem_status =  function(req, result){

    sql.query(" select * from Menuitem where menuitemid = "+req.menuitemid+" ", function (err, res) {
      if(err) {
          console.log("error: ", err);
          result(null, err);
      }
      else{

        if (res.length !== 0) {
      
          // sql.query(" select * from Menuitem where itemid = "+req.menuitemid+" ", function (err, res2) {
          //   if(err) {
          //       console.log("error: ", err);
          //       result(null, err);
          //   }
          //   else{

              // console.log(res2.length);
              // if (res2.length === 1) {
  
                if (res[0].approved_status === 0 || res[0].approved_status === 3) {
    
                  var query = "UPDATE Menuitem SET active_status = 1,approved_time= ?,approved_status = "+req.approved_status+",approvedby=0  WHERE menuitemid = "+req.menuitemid+"";
                sql.query(query, new Date(), function (err, res1) {
                  if(err) {
                      console.log("error: ", err);
                        result(null, err);
                     }
                   else{   
                       var  message = "Menuitem approved successfully"
                       if(req.approved_status===2) message = "Menuitem rejected successfully"
                        let sucobj=true;
                        let resobj = {  
                          success: sucobj,
                          status:true,
                          message:message,
                          }; 
            
                       result(null, resobj);
                        }
                    }); 
    
                  }else if(res[0].approved_status === 1){
                    
                        let sucobj=true;
                        let resobj = {  
                          success: sucobj,
                          status:false,
                          message: "Menuitem Already approved",
                          }; 
            
                       result(null, resobj);
    
                  }else if(res[0].approved_status === 2){
                    console.log('Menuitem Already rejected');
                        let sucobj=true;
                        let resobj = {  
                          success: sucobj,
                          status:false,
                          message: "Menuitem Already rejected",
                          }; 
            
                       result(null, resobj);
                  }
              // } else{
              //   console.log('There is no menu item available');
              //           let sucobj=true;
              //           let resobj = {  
              //             success: sucobj,
              //             status:false,
              //             message: "There is no menu item available",
              //             }; 
            
              //          result(null, resobj);
              // }

          //   }
          // }); 
            
          }else{
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              status:false,
              message: "menuitem is not available",
              }; 
  
           result(null, resobj);
          }
            }
    });      
  };


  
  Menuitem.admin_list_all__unapproval_menuitem = function admin_list_all__unapproval_menuitem(req,result) {


    console.log(req);

    var query = "Select * from Menuitem where  active_status = 0 and approved_status !=1 and approved_status !=2 "

    console.log(req.approved_status);

    if(req.approved_status === 0){

      query = query+" and approved_status = '"+req.approved_status+"' order by created_at desc";

     }else if(req.approved_status ===3){
      query = query+" and approved_status = '"+req.approved_status+"' order by updated_at desc";
     }

  

   console.log(query);

        sql.query(query, function (err, res) {

          if(err) {
            console.log("error: ", err);  
            result(null, err);
        }
        else{
          console.log('Product : ', res);  
          let sucobj=true;
          let resobj = {  
            success: sucobj,
            status:true,
            result: res 
            }; 

         result(null, resobj);
        }
});   
};


Menuitem.update_delete_status =  function(itemid, result){
 

  //select * from Productitem where itemid = "+itemid+" and delete_status =0
  sql.query("  select * from Productitem pi join Product pt on pt.productid =pi.productid where pi.itemid ="+itemid+" and pi.delete_status =0 and pt.approved_status != 3", function (err, res) {
    if(err) {
        console.log("error: ", err);
        result(null, err);
    }
    else{

      if (res.length === 0) {

        sql.query(" select * from Menuitem where menuitemid = "+itemid+" " , function (err, res1) {
          if(err) {
              console.log("error: ", err);
              result(null, err);
          }
          else{
            
      
            if (res1.length !== 0) {

                // if (res1[0].active_status == 0) {

                  sql.query("DELETE FROM Menuitem WHERE menuitemid = "+itemid+" ",  function (err, res2) {
                    if(err) {
                        console.log("error: ", err);
                          result(null, err);
                      }
                    else{   
                    
        
                          let sucobj=true;
                          let resobj = {  
                            success: sucobj,
                            status:true,
                            message: "Item deleted from the Inventory successfully",
                            }; 
              
                        result(null, resobj);
                          }
                      }); 
                    
                // } else if(res1[0].active_status == 1){
                
                //           let sucobj=true;
                //           let resobj = {  
                //             success: sucobj,
                //             status:false,
                //             message: "menuitem is live now, You can't delete",
                //             }; 
              
                //         result(null, resobj);
                // }

              }else{
                let sucobj=true;
                let resobj = {  
                  success: sucobj,
                  status:false,
                  message: "menuitem is not available",
                  }; 

              result(null, resobj);
              }
                }
        }); 
        
}else{

  let sucobj = true;
  let message = " Sorry Already added product, so you can't delete the menuitem"
  let resobj = {
      success: sucobj,
      status:false,
      message: message
  };

  result(null, resobj);
}
}
}); 
};

Menuitem.getAllMenuitembymakeituserid = function getAllMenuitembymakeituserid(req,result) {
  sql.query("Select * from Menuitem where makeit_userid = ?",[req.makeit_userid], function (err, res) {

          if(err) {
              console.log("error: ", err);
              result(null, err);
          }
          else{
            console.log('Menuitem : ', res); 
            let sucobj=true;
            let resobj = {  
              success: sucobj,
              result: res 
              }; 

           result(null, resobj);
          }
      });   
};

module.exports= Menuitem;