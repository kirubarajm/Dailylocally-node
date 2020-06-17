"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");



  var Dayorder = function(Dayorder) {
    this.date = Dayorder.date;
    this.userid = Dayorder.userid;
    this.zoneid=Dayorder.zoneid;
    this.dayorderstatus=Dayorder.dayorderstatus || 0 ;
    this.rating_skip=Dayorder.rating_skip || 0;
  };



  Dayorder.checkdayorder =async function checkdayorder(Dayorder,getproduct,result) {



    
    for (let i = 0; i < getproduct.length; i++) {


        if (getproduct[i].subscription==0) {

          var date  = moment(getproduct[i].deliverydate).format("YYYY-MM-DD");

            var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");

            if (dayorders.length !=0) {
              console.log("dayorders.length",dayorders.length);
                var new_createDayorderproducts={};
          
                new_createDayorderproducts.orderid = Dayorder.orderid;
                new_createDayorderproducts.doid=dayorders[0].id;
                new_createDayorderproducts.vpid=getproduct[i].vpid;
                new_createDayorderproducts.productname=getproduct[i].productname;
                new_createDayorderproducts.quantity=getproduct[i].quantity;
                new_createDayorderproducts.price=getproduct[i].price;
            
                Dayorderproducts.createDayorderproducts(new_createDayorderproducts);

            }else{
              console.log("dayorders.length1",dayorders.length);
  
                var new_day_order={};
                new_day_order.userid=Dayorder.userid;
                new_day_order.zoneid=Dayorder.zoneid;
                new_day_order.date=getproduct[i].deliverydate;
             
     
                sql.query("INSERT INTO Dayorder set ?", new_day_order, function(err, result) {
                    if (err) {
                      res(err, null);
                    } else {
                      var doid = result.insertId;
                     
                      var new_createDayorderproducts={};

                      new_createDayorderproducts.orderid=Dayorder.orderid;
                      new_createDayorderproducts.doid=doid;
                      new_createDayorderproducts.vpid=getproduct[i].vpid;
                      new_createDayorderproducts.productname=getproduct[i].productname;
                      new_createDayorderproducts.quantity=getproduct[i].quantity;
                      new_createDayorderproducts.price=getproduct[i].price;
 
                      Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                    }
                  });

            }

        } else {
            
          var dates = [];

          // var d = moment(getproduct[i].starting_date).format("YYYY-MM-DD") ;
          console.log("d",d);
          var d = new Date(getproduct[i].starting_date);
          console.log("d",d);
          d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);

          if (getproduct[i].mon==1) {
            dates.push(moment(d).format("YYYY-MM-DD"));
            var monday = 1;

          }

          if (getproduct[i].tue==1) {
             dates.push(moment(d, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD"));
             var tuesday = 2;

          }

          if (getproduct[i].wed==1) {
            dates.push(moment(d, "YYYY-MM-DD").add(2, 'days').format("YYYY-MM-DD"));//wed
            var wednesday = 3;

          }

          if (getproduct[i].thur==1) {
             dates.push(moment(d, "YYYY-MM-DD").add(3, 'days').format("YYYY-MM-DD"));
             var Thursday = 4;
          }

          if (getproduct[i].fri==1) {
            dates.push(moment(d, "YYYY-MM-DD").add(4, 'days').format("YYYY-MM-DD"));//fri
            var friday = 5;
          }

          if (getproduct[i].sat==1) {
             dates.push(moment(d, "YYYY-MM-DD").add(5, 'days').format("YYYY-MM-DD"));
             var saturday = 6;
          }

          if (getproduct[i].sun==1) {
             dates.push(moment(d, "YYYY-MM-DD").add(6, 'days').format("YYYY-MM-DD"));
             var sunday = 7;
          }

          console.log("dates",dates);
          /////formula for i max ---->[31-3(daycount)]/3(daycount)
           
          for(let k=0; k < getproduct[i].no_of_deliveries; k++){

          
          
            d=moment(d, "YYYY-MM-DD").add(7, 'days').format("YYYY-MM-DD");

            if (monday==1) {
              if(dates.length<getproduct[i].no_of_deliveries){
                dates.push(moment(d).format("YYYY-MM-DD"));
              }
            }
           
            if (tuesday == 2) {
            if(dates.length<getproduct[i].no_of_deliveries){
              dates.push(moment(d, "YYYY-MM-DD").add(1, 'days').format("YYYY-MM-DD"));
            }
          }

          if (wednesday == 3) {
            if(dates.length<getproduct[i].no_of_deliveries){
              dates.push(moment(d, "YYYY-MM-DD").add(2, 'days').format("YYYY-MM-DD"));
            }
          }

          if (Thursday == 4) {
            if(dates.length<getproduct[i].no_of_deliveries){
              dates.push(moment(d, "YYYY-MM-DD").add(3, 'days').format("YYYY-MM-DD"));
            }
          }
            
            if (friday == 5) {
              if(dates.length<getproduct[i].no_of_deliveries){
                dates.push(moment(d, "YYYY-MM-DD").add(4, 'days').format("YYYY-MM-DD"))
              } 
            }
              
            if (saturday == 6) {
              if(dates.length<getproduct[i].no_of_deliveries){
                dates.push(moment(d, "YYYY-MM-DD").add(5, 'days').format("YYYY-MM-DD"))
              } 
            }
            
            if (sunday == 7) {
              if(dates.length<getproduct[i].no_of_deliveries){
                dates.push(moment(d, "YYYY-MM-DD").add(6, 'days').format("YYYY-MM-DD"))
              } 
  
            }
            
          }

          if (dates.length==0) {
            
            for (let j = 0; j < getproduct[i].no_of_deliveries; j++) {
            var date  = moment().add(j, "days").format("YYYY-MM-DD");;
            var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
            if (dayorders.length !=0) {
                  var new_createDayorderproducts={};
            
                  new_createDayorderproducts.orderid=Dayorder.orderid;
                  new_createDayorderproducts.doid=dayorders[0].id;
                  new_createDayorderproducts.vpid=getproduct[i].vpid;
                  new_createDayorderproducts.productname=getproduct[i].productname;
                  new_createDayorderproducts.quantity=getproduct[i].quantity;
                  new_createDayorderproducts.price=getproduct[i].price;
              
                  Dayorderproducts.createDayorderproducts(new_createDayorderproducts);
  
              }else{
                  
    
                  var new_day_order={};
                  new_day_order.userid=Dayorder.userid;
                  new_day_order.date=date;
                  new_day_order.zoneid=Dayorder.zoneid;
               
       
                  sql.query("INSERT INTO Dayorder set ?", new_day_order, function(err, result) {
                      if (err) {
                        res(err, null);
                      } else {
                        var doid = result.insertId;
                       
                        var new_createDayorderproducts={};
  
                        new_createDayorderproducts.orderid=Dayorder.orderid;
                        new_createDayorderproducts.doid=doid;
                        new_createDayorderproducts.vpid=getproduct[i].vpid;
                        new_createDayorderproducts.productname=getproduct[i].productname;
                        new_createDayorderproducts.quantity=getproduct[i].quantity;
                        new_createDayorderproducts.price=getproduct[i].price;
   
                        Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                      }
                    });
  
              }
  
            }
          }else{
       

            for (let j = 0; j < dates.length; j++) {
        
           

              var date  =dates[j];
  
              var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
  
              if (dayorders.length !=0) {
                  
                  var new_createDayorderproducts={};
            
                  new_createDayorderproducts.orderid=Dayorder.orderid;
                  new_createDayorderproducts.doid=dayorders[0].id;
                  new_createDayorderproducts.vpid=getproduct[i].vpid;
                  new_createDayorderproducts.productname=getproduct[i].productname;
                  new_createDayorderproducts.quantity=getproduct[i].quantity;
                  new_createDayorderproducts.price=getproduct[i].price;
              
                  Dayorderproducts.createDayorderproducts(new_createDayorderproducts);
  
              }else{
                  
    
                  var new_day_order={};
                  new_day_order.userid=Dayorder.userid;
                  new_day_order.date=date;
                  new_day_order.zoneid=Dayorder.zoneid;
               
       
                  sql.query("INSERT INTO Dayorder set ?", new_day_order, function(err, result) {
                      if (err) {
                        res(err, null);
                      } else {
                        var doid = result.insertId;
                       
                        var new_createDayorderproducts={};
  
                        new_createDayorderproducts.orderid=Dayorder.orderid;
                        new_createDayorderproducts.doid=doid;
                        new_createDayorderproducts.vpid=getproduct[i].vpid;
                        new_createDayorderproducts.productname=getproduct[i].productname;
                        new_createDayorderproducts.quantity=getproduct[i].quantity;
                        new_createDayorderproducts.price=getproduct[i].price;
   
                        Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                      }
                    });
  
              }
  
            }
          }
          

        }
        
    }

    


  };


  Dayorder.day_order_list =async function day_order_list(Dayorder,result) {
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    if (Dayorder.starting_date && Dayorder.end_date) {

      var get_day_order_list = await query("select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where (drs.date BETWEEN '"+Dayorder.starting_date +"' AND '"+Dayorder.end_date +"') and zoneid='"+Dayorder.zoneid+"'  group by drs.id,drs.userid");

    }else{

      var get_day_order_list = await query("select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where drs.date='"+tomorrow+"'  and zoneid='"+Dayorder.zoneid+"' group by drs.id,drs.userid");

    }

    if (Dayorder.id) {

      var get_day_order_list = await query("select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where drs.id='"+Dayorder.id+"' and zoneid='"+Dayorder.zoneid+"' group by drs.id,drs.userid");

    }

   
    if (get_day_order_list.length !=0) {
      
      // for (let i = 0; i < get_day_order_list.length; i++) {
        

      //   get_day_order_list[i].products = JSON.parse(get_day_order_list[i].products);
      //   get_day_order_list[i].product_count= get_day_order_list[i].products.length
      //   var get_product = await query("select productname,count(quantity)as quantity from Dayorder_products where doid='"+get_day_order_list[i].id+"' group by vpid");
 
      //   get_product.forEach(element => {
      //     get_day_order_list[i].productname=element.productname;
      //     get_day_order_list[i].quantity=element.quantity;
      //   });
        
      // }
    }

    let resobj = {
      success: true,
      status: true,
      result: get_day_order_list
    };

    result(null, resobj);  
  };
  
  
  Dayorder.quality_day_order_list =async function quality_day_order_list(Dayorder,result) {
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    if (Dayorder.date) {

      var get_day_order_list = await query("select drs.*,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where drs.date ='"+Dayorder.date +"' and zoneid='"+Dayorder.zoneid+"' and orp.scm_status = 4  group by drs.id,drs.userid");

    }else{

      var get_day_order_list = await query("select drs.*,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where zoneid='"+Dayorder.zoneid+"' and orp.scm_status = 4 group by drs.id,drs.userid");

    }

    if (Dayorder.id) {

      var get_day_order_list = await query("select drs.*,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where drs.id='"+Dayorder.id+"' and zoneid='"+Dayorder.zoneid+"' and orp.scm_status = 4 group by drs.id,drs.userid");

    }

   
    if (get_day_order_list.length !=0) {
      
      for (let i = 0; i < get_day_order_list.length; i++) {
        

        get_day_order_list[i].products = JSON.parse(get_day_order_list[i].products);
        get_day_order_list[i].product_count= get_day_order_list[i].products.length
        // var get_product = await query("select productname,count(quantity)as quantity from Dayorder_products where doid='"+get_day_order_list[i].id+"' group by vpid");
 
        // get_product.forEach(element => {
        //   get_day_order_list[i].productname=element.productname;
        //   get_day_order_list[i].quantity=element.quantity;
        // });
        
      }
    }

    let resobj = {
      success: true,
      status: true,
      result: get_day_order_list
    };

    result(null, resobj);  
  };
 

  Dayorder.quality_day_order_view=async function quality_day_order_view(Dayorder,result) {
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");

    
    if (Dayorder.id) {

      var get_day_order_list = await query("select drs.*,JSON_ARRAYAGG(JSON_OBJECT('available', orp.quantity,'quantity', orp.quantity,'vpid',orp.vpid,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id  where drs.id='"+Dayorder.id+"' and zoneid=1 and orp.scm_status = 4 group by drs.id,drs.userid");

    }

   
    if (get_day_order_list.length !=0) {
      
      for (let i = 0; i < get_day_order_list.length; i++) {
        

        get_day_order_list[i].products = JSON.parse(get_day_order_list[i].products);
       
        
      }
    }

    let resobj = {
      success: true,
      status: true,
      result: get_day_order_list
    };

    result(null, resobj);  
  };
 
  
  module.exports = Dayorder;