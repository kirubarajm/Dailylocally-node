'user strict';
var sql = require('../db.js');


//Task object constructor
var Cusinemakeit = function (cusinemakeit) {
    this.cuisineid = cusinemakeit.cuisineid;
    this.makeit_userid = cusinemakeit.makeit_userid;
  //  this.created_at = new Date();
};

Cusinemakeit.createCusinemakeit = function createCusinemakeit(cuisine, result) {

    query = "select * from Cuisine_makeit where cuisineid = '"+cuisine.cuisineid+"' and makeit_userid = '"+cuisine.makeit_userid+"'";

   // console.log(query);
    sql.query(query, function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }else{
           // console.log(res);
            
            if (res.length === 0 ) {
               // console.log('insert');
               // 
                sql.query("INSERT INTO Cuisine_makeit set ?", cuisine, function (err, res1) {
                    if (err) {
                        console.log("error: ", err);
                        result(null, err);
                    }
                    let sucobj = true;
                    let message = "Insert successfully"
                    let resobj = {
                        success: sucobj,
                        message: message
                    };
    
                    result(null, resobj);
                });

            }else{
                // console.log('update');
                //      var  updatequery = "Update Cuisine_makeit set updated_at = ?, cuisineid = '"+cuisine.cuisineid+"' where makeit_userid = '"+cuisine.makeit_userid+"' and cuisineid = '"+cuisine.cusineid+"'"
                //    // console.log(updatequery);

                //      sql.query(updatequery,[new Date()],function (err, res2) {
                //     if (err) {
                //         console.log("error: ", err);
                //         result(null, err);
                //     }
                    let sucobj = true;
                    let message = "Updated successfully"
                    let resobj = {
                        success: sucobj,
                        message: message
                    };
    
                    result(null, resobj);
               // });

            }

        }

    });

};




Cusinemakeit.updateById = function (cid, result) {
    sql.query("UPDATE Cuisine_makeit SET task = ? WHERE userid = ?", [task.task, id], function (err, res) {
        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {
            result(null, res);
        }
    });
};

Cusinemakeit.remove = function (cid, result) {
  
    sql.query("DELETE FROM Cuisine_makeit WHERE cid = ?", [cid], function (err, res) {

        if (err) {
            console.log("error: ", err);
            result(null, err);
        }
        else {

            result(null, res);
        }
    });
};


module.exports = Cusinemakeit;