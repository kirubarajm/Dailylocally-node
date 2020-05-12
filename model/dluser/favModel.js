'user strict';
var sql = require('../db.js');
var constant = require('../constant.js');
var moment = require("moment");
//Task object constructor
var Fav = function(fav){
    this.eatuserid = fav.eatuserid;
    this.productid=fav.productid || 0;
    //this.created_at = new Date();
    this.makeit_userid = fav.makeit_userid || 0;
};


Fav.createFav = function createFav(newFav, result) {  
     
    var makeit_userid = null;
    var productid = null;
    console.log(newFav);

    if (newFav.makeit_userid && newFav.eatuserid) {
        
        var query = "Select * from Fav where eatuserid = '"+newFav.eatuserid+"' and makeit_userid = '"+newFav.makeit_userid+"'";

    }else if(newFav.productid && newFav.eatuserid){

        var query = "Select * from Fav where eatuserid = '"+newFav.eatuserid+"' and productid = '"+newFav.productid+"'";
    }
     
  //  console.log(query);
    sql.query(query , function (err, res) {             
        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
           
           // console.log(res[0]);
            if(res[0] === undefined){

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
           
           let resobj = {  
           success: true,
           status:false,
           message:"Already added the Favourite"
           };
           result(null, resobj);
        }
        } 
        });                  
};

Fav.getFavById = function getFavById(userId, result) {
        sql.query("Select * from Fav where favid = ? ", userId, function (err, res) {             
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    result(null, res);
              
                }
            });   
};

Fav.getAllFav = function getAllFav(result) {
        sql.query("Select * from Fav", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Fav : ', res);  

                 result(null, res);
                }
            });   
};

Fav.updateById = function(id, user, result){

  sql.query("UPDATE Fav SET task = ? WHERE favid = ?", [task.task, id], function (err, res) {
          if(err) {
              console.log("error: ", err);
                result(null, err);
             }
           else{   
             result(null, res);
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

Fav.getAllFavByEatUser = function getAllFavByEatUser(userId,result) {
        sql.query("Select * from Fav where eatuserid = ? ", userId, function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('Fav : ', res);  
                 result(null, res);
                }

            });   
};



Fav.read_a_dishlist_byeatuserid = function read_a_dishlist_byeatuserid(userId,result) {

    sql.query("select * from Fav where eatuserid ='"+userId+"' and productid != 0", function (err, res) {
       
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

    var query = "Select distinct pt.productid,pt.active_status,pt.prod_desc,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid,re.regionname, pt.product_name,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,ly.localityname  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Cuisine cu on cu.cuisineid=pt.cuisine  left join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid=pt.productid left join Region re on re.regionid = mu.regionid where pt.active_status = 1 and fa.makeit_userid= 0 and fa.eatuserid  = '"+userId+"'  group by productid";
   
  //  console.log(query);

    sql.query(query, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
             let sucobj='true'; 
            let resobj = {  
            success: sucobj,
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


Fav.read_a_dishlist_byeatuserid_v2 = function read_a_dishlist_byeatuserid_v2(userId,result) {

    sql.query("select * from Fav where eatuserid ='"+userId+"' and productid != 0", function (err, res) {
       
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


                var foodpreparationtime = constant.foodpreparationtime;
                var onekm = constant.onekm;
                var radiuslimit=constant.radiuslimit;

                var day = moment().format("YYYY-MM-DD HH:mm:ss");;
                var currenthour  = moment(day).format("HH");


                var breatfastcycle = constant.breatfastcycle;
                var dinnercycle = constant.dinnercycle;
                var lunchcycle = constant.lunchcycle;
                var ifconditionquery;
                var cycle = '' ;
                var nextcycle ='';
                var where_condition_query = '';
                var nextthirdcyclecycle = '';
                var scondcycle = '';
                var thirdcycle = '';

                if (currenthour < lunchcycle) {

                    ifconditionquery = "pt.breakfast =1";
                    scondcycle = "pt.lunch=1";
                    thirdcycle = "pt.dinner =1";
                    cycle = constant.breatfastcycle + 'AM';
                    nextcycle = "Next available \n"+constant.lunchcycle + ' PM';
                    nextthirdcyclecycle = "Next available \n"+constant.dinnerstart + ' PM';
                    where_condition_query = where_condition_query + "and (pt.breakfast = 1 OR pt.lunch = 1)";

                }else if(currenthour >= lunchcycle && currenthour < dinnercycle){
            
                    ifconditionquery = "pt.lunch =1";
                    scondcycle = "pt.dinner=1";
                    thirdcycle = "pt.breakfast =1";
                    cycle =  "Next available \n"+ constant.lunchcycle + ' PM';
                    nextcycle = "Next available \n"+ constant.dinnerstart + ' PM';
                    nextthirdcyclecycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
                    where_condition_query = where_condition_query + "and (pt.lunch = 1 OR pt.dinner = 1)";
            
                }else if(currenthour >= dinnercycle){
            
                    ifconditionquery = "pt.dinner =1";
                    scondcycle = "pt.breakfast=1";
                    thirdcycle = "pt.lunch =1";
                    cycle = constant.dinnercycle + 'PM';
                    nextcycle = "Next available \n"+ constant.breatfastcycle + ' AM,Tomorrow';
                    nextthirdcyclecycle ="Next available \n"+ constant.lunchcycle + ' PM,Tomorrow';
                    where_condition_query = where_condition_query + "and (pt.dinner = 1 OR  pt.breakfast = 1)";
                }


//var query = "Select distinct pt.productid,pt.active_status,pt.prod_desc,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid,re.regionname, pt.product_name,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,ly.localityname  from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Cuisine cu on cu.cuisineid=pt.cuisine  left join Locality ly on mu.localityid=ly.localityid left join Fav fa on fa.productid=pt.productid left join Region re on re.regionid = mu.regionid where pt.active_status = 1 and fa.makeit_userid= 0 and fa.eatuserid  = '"+userId+"'  group by productid";
            var query = "Select distinct pt.productid,pt.active_status,pt.prod_desc,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid,re.regionname, pt.product_name,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,ly.localityname,pt.breakfast,pt.lunch,pt.dinner,IF("+ifconditionquery+",false,true) as next_available,IF("+scondcycle+",'"+nextcycle+"','"+nextthirdcyclecycle+"') as next_available_time from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Cuisine cu on cu.cuisineid = pt.cuisine  left join Locality ly on mu.localityid = ly.localityid left join Fav fa on fa.productid = pt.productid left join Region re on re.regionid = mu.regionid where pt.active_status = 1 and fa.makeit_userid= 0 and fa.eatuserid  = "+userId+"   group by productid order by next_available = 0 desc "
            //  var query = "Select distinct pt.productid,pt.active_status,pt.prod_desc,mu.userid as makeit_userid,mu.name as makeit_username,mu.brandname,mu.img1 as makeit_image,mu.regionid,re.regionname, pt.product_name,pt.price,pt.vegtype as producttype,pt.quantity,fa.favid,IF(fa.favid,'1','0') as isfav,cu.cuisinename,ly.localityname,pt.breakfast,pt.lunch,pt.dinner,IF("+ifconditionquery+",false,true) as next_available,IF("+scondcycle+",'"+nextcycle+"',as next_available_time ),IF("+thirdcycle+",'"+nextthirdcyclecycle+"') as  next_available_time from MakeitUser mu join Product pt on mu.userid = pt.makeit_userid left join Cuisine cu on cu.cuisineid = pt.cuisine  left join Locality ly on mu.localityid = ly.localityid left join Fav fa on fa.productid = pt.productid left join Region re on re.regionid = mu.regionid where pt.active_status = 1 and fa.makeit_userid= 0 and fa.eatuserid  = "+userId+"   group by productid order by next_available = 0 desc "

                sql.query(query, function (err, res) {

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


Fav.read_a_fav_kitchenlist_byeatuserid = function read_a_fav_kitchenlist_byeatuserid(userId,result) {

    sql.query("select * from Fav where eatuserid ='"+userId+"' and makeit_userid != 0", function (err, res) {
       
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          
            if (res.length === 0) {

                let sucobj=true;
                let message = "Favourite  kitchen  not found!";
                     let resobj = {  
                     success: sucobj,
                     status : false,
                     message : message,
                     result: res
                     }; 
     
                  result(null, resobj);

                
            }else{

    var query = "Select mu.userid as makeituserid,mu.name as makeitusername,mu.brandname as makeitbrandname,mu.unservicable,re.regionname,ly.localityname,mu.rating,mu.regionid,mu.costfortwo,mu.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mu left join Fav fa on fa.makeit_userid=mu.userid left join Cuisine_makeit cm on cm.makeit_userid = mu.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mu.localityid=ly.localityid left join Region re on re.regionid = mu.regionid where mu.verified_status = 1 and fa.productid= 0 and fa.eatuserid   = ?  group by mu.userid";
    
   // console.log(query);
    
    sql.query(query, userId, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            
            for (let i = 0; i < res.length; i++) {
                    
               
                
             if (res[i].cuisines) {
                 res[i].cuisines = JSON.parse(res[i].cuisines)
                }


             }
           
            let resobj = {  
            success: true,
            status : true,
            result:res   

            };
            result(null, resobj);
      
        }

        });   
         }
        }
    });   

};


Fav.read_a_fav_kitchenlist_byeatuserid_v2 = function read_a_fav_kitchenlist_byeatuserid_(userId,result) {

    sql.query("select * from Fav where eatuserid ='"+userId+"' and makeit_userid != 0", function (err, res) {
       
        if(err) {
            console.log("error: ", err);
            result(null, err);
        }
        else{
          
            if (res.length === 0) {

                let sucobj=true;
                let message = "Favourite  kitchen  not found!";
                     let resobj = {  
                     success: sucobj,
                     status : false,
                     message : message,
                     result: res
                     }; 
     
                  result(null, resobj);

                
            }else{

    var query = "Select mu.userid as makeituserid,mu.name as makeitusername,mu.brandname as makeitbrandname,mu.unservicable,re.regionname,ly.localityname,mu.rating,mu.regionid,mu.costfortwo,mu.img1 as makeitimg,fa.favid,IF(fa.favid,'1','0') as isfav,JSON_ARRAYAGG(JSON_OBJECT('cuisineid',cm.cuisineid,'cuisinename',cu.cuisinename)) AS cuisines from MakeitUser mu left join Fav fa on fa.makeit_userid=mu.userid left join Cuisine_makeit cm on cm.makeit_userid = mu.userid left join Cuisine cu on cu.cuisineid=cm.cuisineid left join Locality ly on mu.localityid=ly.localityid left join Region re on re.regionid = mu.regionid where mu.verified_status = 1 and fa.productid= 0 and fa.eatuserid   = ?  group by mu.userid ORDER BY mu.unservicable = 0 desc";
    
   // console.log(query);
    
    sql.query(query, userId, function (err, res) {

        if(err) {
            console.log("error: ", err);
            result(err, null);
        }
        else{
            
            for (let i = 0; i < res.length; i++) {
                    
                res[i].serviceablestatus = false;
                console.log(res[i].unservicable);
                if (res[i].unservicable == 0) {
                  res[i].serviceablestatus = true;
                }
                
                // if (res[i].serviceablestatus !== false) {
                  
                //   if (res[i].distance <= radiuslimit) {
                //     res[i].serviceablestatus = true;
                //   }
                // }
                
                
             if (res[i].cuisines) {
                 res[i].cuisines = JSON.parse(res[i].cuisines)
                }


             }
           
            let resobj = {  
            success: true,
            status : true,
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