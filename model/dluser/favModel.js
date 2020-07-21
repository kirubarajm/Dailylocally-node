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
                let message = "Favourite  not found!";
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

            //   if (req.catid !=0) {
                var product_list = "Select pt.*,fa.vpid,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from  Fav fa  left join Product_live pl on fa.vpid = pl.vpid left join ProductMaster pt on pt.pid=pl.pid left join SubcategoryL1 sub1 on sub1.scl1_id=pt.scl1_id left join Category cat on cat.catid=sub1.catid  left join UOM um on um.uomid=pt.uom left join Fav faa on faa.vpid = pt.pid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pt.brand "

            //   } else {
            //     var product_list = "   Select pt.*,fa.vpid,faa.favid,IF(faa.favid,'1','0') as isfav,um.name as unit,br.brandname from  ProductMaster pt left join Fav fa on fa.vpid = pt.pid  left join UOM um on um.uomid=pt.uom left join Fav faa on faa.vpid = pt.pid and faa.userid = '"+req.userid+"' left join Brand br on br.id=pt.brand  "

            //   }

              if (req.catid !=0) {
                product_list = product_list +"  where fa.userid  = '"+req.userid+"' and cat.catid='"+req.catid+"'";

              } else {
                product_list = product_list +"  where fa.userid  = '"+req.userid+"'"
              }



            if (brandlist !== undefined) {

                product_list = product_list +"  and (" +brandquery;

              }

          
              if (req.sortid==1) {
              
                product_list = product_list+ " group by fa.vpid ORDER BY pt.Productname ASC ";
               
              }else if (req.sortid==2) {
          
                product_list = product_list+ "group by fa.vpid ORDER BY pt.mrp ASC ";
          
              }else if (req.sortid==3) {
          
                product_list = product_list+ " group by fa.vpid ORDER BY pt.mrp DESC ";
              }

            //   console.log(product_list);
                sql.query(product_list, function (err, res) {

                    if(err) {
                        console.log("error: ", err);
                        result(err, null);
                    }
                    else{
                    
                        for (let i = 0; i < res.length; i++) {
     
      
                            if (res[i].uom== 1 || res[i].uom==7) {
                              res[i].weight = res[i].weight * 1000;
                            }
                            
                            // res[i].servicable_status=servicable_status;
                            res[i].offer='offer';
                            res[i].discount_cost_status=false;
                            res[i].mrp_discount_amout=0;
                            if ( res[i].discount_cost) {
                              res[i].discount_cost_status=true;
                              res[i].mrp_discount_amout = res[i].mrp - res[i].discount_cost ;
                            }
                            
                            
                          }
                      
                        
                        let resobj = {  
                        success: true,
                        status:true,
                        tille:"Favourites content will given by sushant",
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


Fav.read_a_category_by_userid = function read_a_category_by_userid(req,result) {

    sql.query("select * from Fav where userid ='"+req.userid+"' and vpid != 0", function (err, res) {
       
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          
            if (res.length === 0) {

                let sucobj=true;
                let message = "Favourite  Category  not found!";
                     let resobj = {  
                     success: sucobj,
                     status : false,
                     message : message,
                     result: res
                     }; 
     
                  result(null, resobj);

                

            }else{


            var query = "Select cat.* from  Product_live pl left join Fav fa on fa.vpid = pl.vpid left join ProductMaster pm on pm.pid=pl.pid left join SubcategoryL1 sub1 on sub1.scl1_id=pm.scl1_id left join Category cat on cat.catid=sub1.catid where fa.userid  = '"+req.userid+"'  group by cat.catid"

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