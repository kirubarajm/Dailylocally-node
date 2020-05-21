"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");



  var Dayorder = function(Dayorder) {
    this.date = Dayorder.date;
    this.userid = Dayorder.userid;
  };



  Dayorder.checkdayorder =async function checkdayorder(Dayorder,getproduct,result) {




    for (let i = 0; i < getproduct.length; i++) {
       

        if (getproduct[i].subscription==0) {
     
          var date  = moment(getproduct[i].deliverydate).format("YYYY-MM-DD");

            var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");

            if (dayorders.length !=0) {
                
                var new_createDayorderproducts={};
          
                new_createDayorderproducts.orderid=Dayorder.orderid;
                new_createDayorderproducts.doid=dayorders[0].id;
                new_createDayorderproducts.pid=getproduct[i].pid;
            
                Dayorderproducts.createDayorderproducts(new_createDayorderproducts);

            }else{
                
  
                var new_day_order={};
                new_day_order.userid=Dayorder.userid;
                new_day_order.date=getproduct[i].deliverydate;
             
     
                sql.query("INSERT INTO Dayorder set ?", new_day_order, function(err, result) {
                    if (err) {
                      res(err, null);
                    } else {
                      var doid = result.insertId;
                     
                      var new_createDayorderproducts={};

                      new_createDayorderproducts.orderid=Dayorder.orderid;
                      new_createDayorderproducts.doid=doid;
                      new_createDayorderproducts.pid=getproduct[i].pid;
 
                      Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                    }
                  });

            }

        } else {
            
          console.log("getproduct[i]",getproduct[i].no_of_deliveries);

          for (let j = 0; j < getproduct[i].no_of_deliveries; j++) {
        
            console.log("getproduct[i]",j);

            var date  = moment().add(j, "days").format("YYYY-MM-DD");;

            var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");

            if (dayorders.length !=0) {
                
                var new_createDayorderproducts={};
          
                new_createDayorderproducts.orderid=Dayorder.orderid;
                new_createDayorderproducts.doid=dayorders[0].id;
                new_createDayorderproducts.pid=getproduct[i].pid;
            
                Dayorderproducts.createDayorderproducts(new_createDayorderproducts);

            }else{
                
  
                var new_day_order={};
                new_day_order.userid=Dayorder.userid;
                new_day_order.date=date;
             
     
                sql.query("INSERT INTO Dayorder set ?", new_day_order, function(err, result) {
                    if (err) {
                      res(err, null);
                    } else {
                      var doid = result.insertId;
                     
                      var new_createDayorderproducts={};

                      new_createDayorderproducts.orderid=Dayorder.orderid;
                      new_createDayorderproducts.doid=doid;
                      new_createDayorderproducts.pid=getproduct[i].pid;
 
                      Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                    }
                  });

            }

          }

        }
        
    }

    


  };


  Dayorder.createDayorder =async function createDayorder(Dayorder,getproduct,result) {


  
    


  };
  
  
  
 

  module.exports = Dayorder;