'user strict';
var sql = require('../db.js');
var constant = require('../constant.js');
var moment = require("moment");
//Task object constructor
var Fav = function(fav){
    this.userid = fav.userid;
    this.vpid=fav.vpid || 0;
};


Fav.createFav = function createFav(newFav, result) {  
  

        var query = "Select * from Fav where userid = '"+newFav.userid+"' and vpid = '"+newFav.productid+"'";
  
  //  console.log(query);
    sql.query(query , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
           
           // console.log(res[0]);
            if(res.length==0){

                    sql.query("INSERT INTO Fav set ?", newFav, function (err, res) {
                            
                        if(err) {
                            console.log("error: ", err);
                            result(err, null);
                        }
                        else{
                          
                            let resobj = {  
                            success: true,
                            status: true,
                            message:'Favourite created successfully',
                            favid:res.insertId
                            };

                            result(null, resobj);
                    
                        }
                        });
             }else{
           
            sql.query("DELETE FROM Fav WHERE favid=?", res[0].favid, function (err, res) {
                            
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                  
                    let resobj = {  
                    success: true,
                    status: true,
                    message:'Favourite removed successfully',
                    };

                    result(null, resobj);
            
                }
                });
            }
        } 
        });                  
};

Fav.remove = function(id, result){

    sql.query("DELETE FROM Fav WHERE favid = ?", [id], function (err, res) {
               if(err) {
               console.log("error: ", err);
               result(err, null);
           }
           else{
                let sucobj=true;
                let message = 'Favourite removed successfully';
               let resobj = {  
               success: sucobj,
               status:true,
               message:message,

               };
               result(null, resobj);
         
           }
           }); 
};


Fav.read_a_product_by_userid = function read_a_product_by_userid(req,result) {

    sql.query("select * from Fav where userid ='"+req.userid+"' and vpid != 0", function (err, res) {
       
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          
            if (res.length === 0) {

                let sucobj=true;
                let message = "Favourite  dish  not found!";
                     let resobj = {  
                     success: sucobj,
                     status : false,
                     message : message,
                     result: res
                     }; 
     
                  result(null, resobj);

                

            }else{

                var brandquery  = "";
                var brandlist   = [];
                if (req.brandlist !== undefined || req.brandlist !== null) {
                brandlist = req.brandlist;
                }
            
                if (brandlist) {
                for (let i = 0; i < brandlist.length; i++) {
                    brandquery = brandquery + " pt.brand = '" + brandlist[i].brand + "' or";
                }
                }
  
              brandquery = brandquery.slice(0, -2) + ")";

            var product_list = "   Select distinct fa.vpid,pt.Productname from  ProductMaster pt left join Fav fa on fa.vpid = pt.pid    "


            if (brandlist !== undefined) {
                product_list = product_list +"  where fa.userid  = '"+req.userid+"' and (" +brandquery;
              }else{
                product_list = product_list +"  where fa.userid  = '"+req.userid+"'"
              }
          
              if (req.sortid==1) {
              
                product_list = product_list+ " group by fa.vpid ORDER BY pt.Productname ASC ";
               
              }else if (req.sortid==2) {
          
                product_list = product_list+ "group by fa.vpid ORDER BY pt.mrp ASC ";
          
              }else if (req.sortid==3) {
          
                product_list = product_list+ " group by fa.vpid ORDER BY pt.mrp DESC ";
              }


                sql.query(product_list, function (err, res) {

                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else{
                    
                        
                        let resobj = {  
                        success: true,
                        status:true,
                        result:res   

                        };
                        result(null, resobj);
                
                    }

                });   
     }
}
    });   
};

Fav.read_a_subcategoryL1_by_userid = function read_a_subcategoryL1_by_userid(req,result) {

    sql.query("select * from Fav where userid ='"+req.userid+"' and vpid != 0", function (err, res) {
       
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          
            if (res.length === 0) {

                let sucobj=true;
                let message = "Favourite  dish  not found!";
                     let resobj = {  
                     success: sucobj,
                     status : false,
                     message : message,
                     result: res
                     }; 
     
                  result(null, resobj);

                

            }else{


            var query = "Select sub1.scl1_id,sub1.name from  ProductMaster pt left join Fav fa on fa.vpid = pt.pid left join SubcategoryL1 sub1 on sub1.scl1_id=pt.scl1_id  where fa.userid  = '"+req.userid+"'   group by vpid "

                sql.query(query, function (err, res) {

                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else{
                    
                        
                        let resobj = {  
                        success:true,
                        status:true,
                        result:res   
                        };
                        result(null, resobj);
                
                    }

                });   
     }
}
});   
};

module.exports= Fav;