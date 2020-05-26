'user strict';
var sql = require('../db.js');
var constant = require('../constant.js');
var moment = require("moment");
//Task object constructor
var Fav = function(fav){
    this.userid = fav.userid;
    this.productid=fav.productid || 0;
};


Fav.createFav = function createFav(newFav, result) {  
  

        var query = "Select * from Fav where userid = '"+newFav.userid+"' and productid = '"+newFav.productid+"'";
  
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


Fav.read_a_product_by_userid = function read_a_product_by_userid(userId,result) {

    sql.query("select * from Fav where userid ='"+userId+"' and productid != 0", function (err, res) {
       
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


            var query = "   Select distinct fa.pid,pt.Productname from  ProductMaster pt left join Fav fa on fa.pid = pt.pid  where fa.userid  = '"+req.userid+"'  group by pid "

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

module.exports= Fav;