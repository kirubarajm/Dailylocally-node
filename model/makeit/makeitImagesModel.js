'user strict';
var sql = require('../db.js');

const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var MakeitImages = function(makeitimages){
    this.img_url = makeitimages.img_url;
    this.type=makeitimages.type;
    this.makeitid=makeitimages.makeitid;
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

MakeitImages.createMakeitImages = async function createMakeitImages(newmakeitimages, result) {


        sql.query("INSERT INTO Makeit_images set ?", newmakeitimages, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    
                    let megobj = "Makeit images Created Successful";
                    let resobj = {  
                    success: true,
                    status:true,
                    message:megobj, 
                    result: res.insertId
                    }; 

                 result(null, resobj);
                }
            });           
};


MakeitImages.remove = function(ids, result){
    removequery = "DELETE FROM Makeit_images WHERE img_id IN ("+ids+") ";

    console.log(removequery);
    sql.query(removequery, function (err, res) {

               if(err) {
                   console.log("error: ", err);
                   result(null, err);
               }
               else{
              
                let megobj = "Makeit images removed Successful";
                let resobj = {  
                success: true,
                status:true,
                message:megobj
                }; 

             result(null, resobj);
               }
           }); 
};


MakeitImages.getMenuitemById = function getMenuitemById(userId, result) {
        sql.query("Select * from Makeit_images where menuitemid = ? ", userId, function (err, res) {             
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


module.exports= MakeitImages;