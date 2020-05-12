'user strict';
var sql = require('../db.js');

const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var MakeitBadges = function(makeitbadges){
    this.makeit_id = makeitbadges.makeit_id;
    this.badge_id=makeitbadges.badge_id;
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

MakeitBadges.createMakeitBadges = async function createMakeitBadges(badges, result) {

            var new_badges ={} ;
       for (let i = 0; i < badges.length; i++) {
        var new_badges = new MakeitBadges(badges[i]);
        new_badges.makeit_id = req.makeit_userid;
       
      }
      console.log(new_badges);
        sql.query("INSERT INTO Makeit_badges_mapping set ?", new_badges, function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res.insertId);
                    
                    let megobj = "Makeit badges Created Successfully";
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


MakeitBadges.remove = function(ids, result){
    removequery = "DELETE FROM Makeit_badges_mapping WHERE id IN ("+ids+") ";

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





module.exports= MakeitBadges;