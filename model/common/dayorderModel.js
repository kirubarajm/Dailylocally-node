"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");
var Stock = require('../tableModels/stockTableModel.js');
var OrderComments = require("../../model/admin/orderCommentsModel");
var RefundOnline = require("../../model/common/refundonlineModel");
var Notification = require("../../model/common/notificationModel.js");
var MoveitStatus = require("../../model/moveit/moveitStatusModel");
var PushConstant = require("../../push/PushConstant.js");

var Dayorder = function(Dayorder) {
  this.date = Dayorder.date;
  this.userid = Dayorder.userid;
  this.zoneid=Dayorder.zoneid;
  this.dayorderstatus=Dayorder.dayorderstatus || 0 ;
  this.rating_skip=Dayorder.rating_skip || 0;
  this.reorder_id=Dayorder.reorder_id || 0;
  this.reorder_by=Dayorder.reorder_by || 0;
  this.reorder_status=Dayorder.reorder_status || 0;
  this.delivery_charge=Dayorder.delivery_charge || 0;
  this.moveit_type=Dayorder.moveit_type || 0;
  this.return_status=Dayorder.return_status || 0;
  this.address_type=Dayorder.address_type;
  
};


Dayorder.checkdayorder =async function checkdayorder(Dayorder,getproduct){
  var day = moment().format("YYYY-MM-DD, HH:mm:ss");
  var ordersdetails = await query("select * from Orders where orderid='"+Dayorder.orderid+"'");
  var Orderproductssdetails = await query("select * from Orderproducts where orderid='"+Dayorder.orderid+"' and subscription = 0");
  var noof_delivery = ordersdetails[0].delivery_charge  / Orderproductssdetails.length;
  for (let i = 0; i < getproduct.length; i++) {

    if (getproduct[i].subscription==0) {
      var date  = moment(getproduct[i].deliverydate).format("YYYY-MM-DD");
      var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
      if (dayorders.length !=0) {

      
        if (dayorders[0].delivery_charge==0) {
          var updatedayorderstatus = "update Dayorder set dayorderstatus=0,order_place_time='"+day+"',delivery_charge='"+noof_delivery+"' where id="+dayorders[0].id;

        }else{
          var updatedayorderstatus = "update Dayorder set dayorderstatus=0,order_place_time='"+day+"' where id="+dayorders[0].id;

        }
        var updatedayorder = await query(updatedayorderstatus);
        // console.log("dayorders.length",dayorders.length);
        var new_createDayorderproducts={}; 

        new_createDayorderproducts.orderid = Dayorder.orderid;
        new_createDayorderproducts.doid=dayorders[0].id;
        new_createDayorderproducts.vpid=getproduct[i].vpid;
        new_createDayorderproducts.productname=getproduct[i].productname;
        new_createDayorderproducts.quantity=getproduct[i].quantity;
        new_createDayorderproducts.price=getproduct[i].price;
        /////////////////////Insert Product Details/////////
        new_createDayorderproducts.product_hsn_code = getproduct[i].hsn_code;
        new_createDayorderproducts.product_image = getproduct[i].image;
        new_createDayorderproducts.product_brand = getproduct[i].brand;
        new_createDayorderproducts.product_mrp = getproduct[i].mrp;
        new_createDayorderproducts.product_basiccost = getproduct[i].basiccost;
        new_createDayorderproducts.product_targetedbaseprice = getproduct[i].targetedbaseprice;
        new_createDayorderproducts.product_discount_cost = getproduct[i].discount_cost;
        new_createDayorderproducts.product_gst = getproduct[i].gst;
        new_createDayorderproducts.product_scl1_id = getproduct[i].scl1_id;
        new_createDayorderproducts.product_scl2_id = getproduct[i].scl2_id;
        new_createDayorderproducts.product_subscription = getproduct[i].subscription1;
        new_createDayorderproducts.product_weight = getproduct[i].weight;
        new_createDayorderproducts.product_uom = getproduct[i].uom;
        new_createDayorderproducts.product_packetsize = getproduct[i].packetsize;
        new_createDayorderproducts.product_vegtype = getproduct[i].vegtype;
        new_createDayorderproducts.product_tag = getproduct[i].tag;
        new_createDayorderproducts.product_short_desc = getproduct[i].short_desc;
        new_createDayorderproducts.product_productdetails = getproduct[i].productdetails;
        new_createDayorderproducts.product_Perishable = getproduct[i].Perishable;
        Dayorderproducts.createDayorderproducts(new_createDayorderproducts);
      }else{
        // console.log("dayorders.length1",dayorders.length);
        var new_day_order={};
        new_day_order.userid=Dayorder.userid;
        new_day_order.zoneid=Dayorder.zoneid;
        new_day_order.date=getproduct[i].deliverydate;  
        new_day_order.order_place_time=day;  
        //address

        new_day_order.cus_lat=ordersdetails[0].cus_lat;
        new_day_order.cus_lon=ordersdetails[0].cus_lon;
        new_day_order.cus_pincode=ordersdetails[0].cus_pincode;
        new_day_order.landmark=ordersdetails[0].landmark;
        new_day_order.apartment_name=ordersdetails[0].apartment_name;
        new_day_order.google_address=ordersdetails[0].google_address;
        new_day_order.complete_address=ordersdetails[0].complete_address;
        new_day_order.flat_house_no=ordersdetails[0].flat_house_no;
        new_day_order.plot_house_no=ordersdetails[0].plot_house_no;
        new_day_order.floor=ordersdetails[0].floor;
        new_day_order.block_name=ordersdetails[0].block_name;
        new_day_order.city=ordersdetails[0].city;
        new_day_order.delivery_charge=noof_delivery;
        new_day_order.address_type=ordersdetails[0].address_type;
    
        

        console.log("new_day_order===>1",new_day_order); 
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
            /////////////////////Insert Product Details/////////
            new_createDayorderproducts.product_hsn_code = getproduct[i].hsn_code;
            new_createDayorderproducts.product_image = getproduct[i].image;
            new_createDayorderproducts.product_brand = getproduct[i].brand;
            new_createDayorderproducts.product_mrp = getproduct[i].mrp;
            new_createDayorderproducts.product_basiccost = getproduct[i].basiccost;
            new_createDayorderproducts.product_targetedbaseprice = getproduct[i].targetedbaseprice;
            new_createDayorderproducts.product_discount_cost = getproduct[i].discount_cost;
            new_createDayorderproducts.product_gst = getproduct[i].gst;
            new_createDayorderproducts.product_scl1_id = getproduct[i].scl1_id;
            new_createDayorderproducts.product_scl2_id = getproduct[i].scl2_id;
            new_createDayorderproducts.product_subscription = getproduct[i].subscription1;
            new_createDayorderproducts.product_weight = getproduct[i].weight;
            new_createDayorderproducts.product_uom = getproduct[i].uom;
            new_createDayorderproducts.product_packetsize = getproduct[i].packetsize;
            new_createDayorderproducts.product_vegtype = getproduct[i].vegtype;
            new_createDayorderproducts.product_tag = getproduct[i].tag;
            new_createDayorderproducts.product_short_desc = getproduct[i].short_desc;
            new_createDayorderproducts.product_productdetails = getproduct[i].productdetails;
            new_createDayorderproducts.product_Perishable = getproduct[i].Perishable;
            Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
          }
        });
      }
    } else {        
        var dates = [];
        // var d = moment(getproduct[i].starting_date).format("YYYY-MM-DD") ;       
        var d = new Date(getproduct[i].starting_date);
     
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

          console.log("dates ila",dates);
          for (let j = 0; j < getproduct[i].no_of_deliveries; j++) {
          var date  = moment().add(j, "days").format("YYYY-MM-DD");; ////0-current date
          var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
          if (dayorders.length !=0) {
            var updatedayorderstatus = "update Dayorder set dayorderstatus=0,,order_place_time='"+day+"' where id="+dayorders[0].id;
            var updatedayorder = await query(updatedayorderstatus);
            
            var new_createDayorderproducts={};
      
            new_createDayorderproducts.orderid=Dayorder.orderid;
            new_createDayorderproducts.doid=dayorders[0].id;
            new_createDayorderproducts.vpid=getproduct[i].vpid;
            new_createDayorderproducts.productname=getproduct[i].productname;
            new_createDayorderproducts.quantity=getproduct[i].quantity;
            new_createDayorderproducts.price=getproduct[i].price;
            /////////////////////Insert Product Details/////////
            new_createDayorderproducts.product_hsn_code = getproduct[i].hsn_code;
            new_createDayorderproducts.product_image = getproduct[i].image;
            new_createDayorderproducts.product_brand = getproduct[i].brand;
            new_createDayorderproducts.product_mrp = getproduct[i].mrp;
            new_createDayorderproducts.product_basiccost = getproduct[i].basiccost;
            new_createDayorderproducts.product_targetedbaseprice = getproduct[i].targetedbaseprice;
            new_createDayorderproducts.product_discount_cost = getproduct[i].discount_cost;
            new_createDayorderproducts.product_gst = getproduct[i].gst;
            new_createDayorderproducts.product_scl1_id = getproduct[i].scl1_id;
            new_createDayorderproducts.product_scl2_id = getproduct[i].scl2_id;
            new_createDayorderproducts.product_subscription = getproduct[i].subscription1;
            new_createDayorderproducts.product_weight = getproduct[i].weight;
            new_createDayorderproducts.product_uom = getproduct[i].uom;
            new_createDayorderproducts.product_packetsize = getproduct[i].packetsize;
            new_createDayorderproducts.product_vegtype = getproduct[i].vegtype;
            new_createDayorderproducts.product_tag = getproduct[i].tag;
            new_createDayorderproducts.product_short_desc = getproduct[i].short_desc;
            new_createDayorderproducts.product_productdetails = getproduct[i].productdetails;
            new_createDayorderproducts.product_Perishable = getproduct[i].Perishable;
            Dayorderproducts.createDayorderproducts(new_createDayorderproducts);
          }else{                 
            var new_day_order={};
            new_day_order.userid=Dayorder.userid;
            new_day_order.date=date;
            new_day_order.zoneid=Dayorder.zoneid;   
                //address

         
            new_day_order.cus_lat=ordersdetails[0].cus_lat;
            new_day_order.cus_lon=ordersdetails[0].cus_lon;
            new_day_order.cus_pincode=ordersdetails[0].cus_pincode;
            new_day_order.landmark=ordersdetails[0].landmark;
            new_day_order.apartment_name=ordersdetails[0].apartment_name;
            new_day_order.google_address=ordersdetails[0].google_address;
            new_day_order.complete_address=ordersdetails[0].complete_address;
            new_day_order.flat_house_no=ordersdetails[0].flat_house_no;
            new_day_order.plot_house_no=ordersdetails[0].plot_house_no;
            new_day_order.floor=ordersdetails[0].floor;
            new_day_order.block_name=ordersdetails[0].block_name;
            new_day_order.city=ordersdetails[0].city;
            new_day_order.delivery_charge=noof_delivery || 0;
            new_day_order.address_type=ordersdetails[0].address_type;
            
        
            console.log("new_day_order===>2",new_day_order);    
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
                  /////////////////////Insert Product Details/////////
                  new_createDayorderproducts.product_hsn_code = getproduct[i].hsn_code;
                  new_createDayorderproducts.product_image = getproduct[i].image;
                  new_createDayorderproducts.product_brand = getproduct[i].brand;
                  new_createDayorderproducts.product_mrp = getproduct[i].mrp;
                  new_createDayorderproducts.product_basiccost = getproduct[i].basiccost;
                  new_createDayorderproducts.product_targetedbaseprice = getproduct[i].targetedbaseprice;
                  new_createDayorderproducts.product_discount_cost = getproduct[i].discount_cost;
                  new_createDayorderproducts.product_gst = getproduct[i].gst;
                  new_createDayorderproducts.product_scl1_id = getproduct[i].scl1_id;
                  new_createDayorderproducts.product_scl2_id = getproduct[i].scl2_id;
                  new_createDayorderproducts.product_subscription = getproduct[i].subscription1;
                  new_createDayorderproducts.product_weight = getproduct[i].weight;
                  new_createDayorderproducts.product_uom = getproduct[i].uom;
                  new_createDayorderproducts.product_packetsize = getproduct[i].packetsize;
                  new_createDayorderproducts.product_vegtype = getproduct[i].vegtype;
                  new_createDayorderproducts.product_tag = getproduct[i].tag;
                  new_createDayorderproducts.product_short_desc = getproduct[i].short_desc;
                  new_createDayorderproducts.product_productdetails = getproduct[i].productdetails;
                  new_createDayorderproducts.product_Perishable = getproduct[i].Perishable;
                  Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                }
              });  
            }  
          }
        }else{
          console.log("dates iruku",dates);
          for (let j = 0; j < dates.length; j++) {           
            var date  =dates[j];  
            var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");  
            if (dayorders.length !=0) {   
              console.log("dayorders iruku",dates);               
              var new_createDayorderproducts={};

              new_createDayorderproducts.orderid=Dayorder.orderid;
              new_createDayorderproducts.doid=dayorders[0].id;
              new_createDayorderproducts.vpid=getproduct[i].vpid;
              new_createDayorderproducts.productname=getproduct[i].productname;
              new_createDayorderproducts.quantity=getproduct[i].quantity;
              new_createDayorderproducts.price=getproduct[i].price;
              /////////////////////Insert Product Details/////////
              new_createDayorderproducts.product_hsn_code = getproduct[i].hsn_code;
              new_createDayorderproducts.product_image = getproduct[i].image;
              new_createDayorderproducts.product_brand = getproduct[i].brand;
              new_createDayorderproducts.product_mrp = getproduct[i].mrp;
              new_createDayorderproducts.product_basiccost = getproduct[i].basiccost;
              new_createDayorderproducts.product_targetedbaseprice = getproduct[i].targetedbaseprice;
              new_createDayorderproducts.product_discount_cost = getproduct[i].discount_cost;
              new_createDayorderproducts.product_gst = getproduct[i].gst;
              new_createDayorderproducts.product_scl1_id = getproduct[i].scl1_id;
              new_createDayorderproducts.product_scl2_id = getproduct[i].scl2_id;
              new_createDayorderproducts.product_subscription = getproduct[i].subscription1;
              new_createDayorderproducts.product_weight = getproduct[i].weight;
              new_createDayorderproducts.product_uom = getproduct[i].uom;
              new_createDayorderproducts.product_packetsize = getproduct[i].packetsize;
              new_createDayorderproducts.product_vegtype = getproduct[i].vegtype;
              new_createDayorderproducts.product_tag = getproduct[i].tag;
              new_createDayorderproducts.product_short_desc = getproduct[i].short_desc;
              new_createDayorderproducts.product_productdetails = getproduct[i].productdetails;
              new_createDayorderproducts.product_Perishable = getproduct[i].Perishable;            
              Dayorderproducts.createDayorderproducts(new_createDayorderproducts);  
            }else{   
              console.log("day order ila",dates);                  
              var new_day_order={};
              new_day_order.userid=Dayorder.userid;
              new_day_order.date=date;
              new_day_order.zoneid=Dayorder.zoneid;   
              new_day_order.order_place_time=day; 
                  //address
                new_day_order.cus_lat=ordersdetails[0].cus_lat;
                new_day_order.cus_lon=ordersdetails[0].cus_lon;
                new_day_order.cus_pincode=ordersdetails[0].cus_pincode;
                new_day_order.landmark=ordersdetails[0].landmark;
                new_day_order.apartment_name=ordersdetails[0].apartment_name;
                new_day_order.google_address=ordersdetails[0].google_address;
                new_day_order.complete_address=ordersdetails[0].complete_address;
                new_day_order.flat_house_no=ordersdetails[0].flat_house_no;
                new_day_order.plot_house_no=ordersdetails[0].plot_house_no;
                new_day_order.floor=ordersdetails[0].floor;
                new_day_order.block_name=ordersdetails[0].block_name;
                new_day_order.city=ordersdetails[0].city;
                new_day_order.delivery_charge=noof_delivery || 0;
                new_day_order.address_type = ordersdetails[0].address_type;
    
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
                  /////////////////////Insert Product Details/////////
                  new_createDayorderproducts.product_hsn_code = getproduct[i].hsn_code;
                  new_createDayorderproducts.product_image = getproduct[i].image;
                  new_createDayorderproducts.product_brand = getproduct[i].brand;
                  new_createDayorderproducts.product_mrp = getproduct[i].mrp;
                  new_createDayorderproducts.product_basiccost = getproduct[i].basiccost;
                  new_createDayorderproducts.product_targetedbaseprice = getproduct[i].targetedbaseprice;
                  new_createDayorderproducts.product_discount_cost = getproduct[i].discount_cost;
                  new_createDayorderproducts.product_gst = getproduct[i].gst;
                  new_createDayorderproducts.product_scl1_id = getproduct[i].scl1_id;
                  new_createDayorderproducts.product_scl2_id = getproduct[i].scl2_id;
                  new_createDayorderproducts.product_subscription = getproduct[i].subscription1;
                  new_createDayorderproducts.product_weight = getproduct[i].weight;
                  new_createDayorderproducts.product_uom = getproduct[i].uom;
                  new_createDayorderproducts.product_packetsize = getproduct[i].packetsize;
                  new_createDayorderproducts.product_vegtype = getproduct[i].vegtype;
                  new_createDayorderproducts.product_tag = getproduct[i].tag;
                  new_createDayorderproducts.product_short_desc = getproduct[i].short_desc;
                  new_createDayorderproducts.product_productdetails = getproduct[i].productdetails;
                  new_createDayorderproducts.product_Perishable = getproduct[i].Perishable;
                  Dayorderproducts.createDayorderproducts(new_createDayorderproducts)
                }
              });  
            }  
          }
        }
      }        
  }
};

///// Day Order List ///////////
Dayorder.day_order_list =async function day_order_list(Dayorder,result) {
  //console.log("Dayorde=====>",Dayorder);
  var orderlimit = 20;
  var page = Dayorder.page || 1;
  var startlimit = (page - 1) * orderlimit;
  if(Dayorder){
    var tomorrow = moment().format("YYYY-MM-DD");
    var end_date = moment(Dayorder.end_date).add(1, "days").format("YYYY-MM-DD");
    var where = "";
    if(Dayorder.starting_date && Dayorder.end_date){

      if (Dayorder.slot===1) {
 

        let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD 23:00:00");
        let datetimeB = moment(Dayorder.end_date).format("YYYY-MM-DD 19:00:00");
        where = where+" and (drs.created_at BETWEEN '"+datetimeA +"' AND '"+datetimeB +"')";

      }else if(Dayorder.slot===2){

        let datetimeA = moment(Dayorder.starting_date + " " + '19:00:00');
        let datetimeB = moment(Dayorder.end_date + " " + '23:00:00');
        where = where+" and (drs.created_at BETWEEN '"+datetimeA +"' AND '"+datetimeB +"')";

      }
      else{

        where = where+" and (drs.created_at BETWEEN '"+Dayorder.starting_date +"' AND '"+end_date +"')";

      }
    }else{
      where = where+" and  DATE(drs.created_at) = CURDATE()";
    }


    if(Dayorder.id){
        where = where+" and drs.id="+Dayorder.id;
    }
    
    if (Dayorder.trip_id) {
      where = where+" and drs.trip_id='"+Dayorder.trip_id+"' "
    }
    if(Dayorder.dayorderstatus !=null){
        where = where+" and drs.dayorderstatus="+Dayorder.dayorderstatus;
    }

    if (Dayorder.usersearch) {
      where = where+" and (us.phoneno like '%"+Dayorder.usersearch+"%' or us.email like '%"+Dayorder.usersearch+"%' or us.name like '%"+Dayorder.usersearch+"%') ";
    }
    where =where +" group by drs.id,drs.userid order by drs.id desc limit " +startlimit +"," +orderlimit +" ";

    var getdayorderquery = "select drs.*,sum(orp.quantity * orp.price) as total_product_price,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=5 then 'QC' when drs.dayorderstatus=6 then 'QA' when drs.dayorderstatus=7 then 'Moveit Assigned' when drs.dayorderstatus=8 then 'Moveit Pickup' when drs.dayorderstatus=9 then 'Moveit Delivered' when drs.dayorderstatus=10 then 'Completed' when drs.dayorderstatus=11 then 'Cancel' when drs.dayorderstatus=12 then 'return' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where zoneid="+Dayorder.zoneid+" " +where+" ";
    // console.log("getdayorder=====>",getdayorderquery);
    // var getdayorderquery = "select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where zoneid="+Dayorder.zoneid+" " +where+" group by drs.id,drs.userid";
    //console.log("getdayorder=====>",getdayorderquery);
    var getdayorder = await query(getdayorderquery);
    if(getdayorder.length>0){
      for (let i = 0; i < getdayorder.length; i++) {
        getdayorder[i].products = JSON.parse(getdayorder[i].products);
      }        
      let resobj = {
        success: true,
        status: true,
        result: getdayorder
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "no data"
      };
      result(null, resobj);
    }      
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);
  }      
};

///// Day Order View ///////////
Dayorder.day_order_view =async function day_order_view(Dayorder,result) {
  if(Dayorder.id){
    var getdayorderquery = "select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' when drs.dayorderstatus=12 then 'return'  when drs.dayorderstatus=10 then 'Delivered' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where drs.id="+Dayorder.id+" group by drs.id,drs.userid";
    var getdayorder = await query(getdayorderquery);
    if(getdayorder.length>0){
      for (let i = 0; i < getdayorder.length; i++) {
        getdayorder[i].products = JSON.parse(getdayorder[i].products);
      }        
      let resobj = {
        success: true,
        status: true,
        result: getdayorder
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "no data"
      };
      result(null, resobj);
    }      
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);
  }      
};



///// Day Order View ///////////
Dayorder.crm_day_order_view =async function crm_day_order_view(Dayorder,result) {
  if(Dayorder.id){
    var getdayorderquery = "select drs.*,us.name,us.phoneno,us.email,mu.name as moveit_name,mu.phoneno as moveit_phoneno,sum(orp.quantity * orp.price) as total_product_price,sum(orp.received_quantity) as sorted_quantity,IF(drs.moveit_type=0,'Moveit','Dunzo') as delivery_type,JSON_OBJECT('userid',mu.userid,'name',mu.name,'phoneno',mu.phoneno,'email',mu.email,'Vehicle_no',mu.Vehicle_no) as moveitdetail, count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('orderid',orp.orderid,'scm_status',orp.scm_status,'id',orp.id,'quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'refund_status',orp.refund_status,'refund_status_msg',if(orp.refund_status=0,'Not refunded',if(orp.refund_status=1,'Refund requested','Refunded')),'scm_status_msg',iF(orp.scm_status=6,'Ready to Dispatch',IF (orp.scm_status=11,'Product cancel',IF (orp.scm_status=10,'deliverd',IF(orp.scm_status=12,'Return','Inprogress') ))))) AS Products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' when drs.dayorderstatus=12 then 'return' when drs.dayorderstatus=11 then 'cancel' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id  left join User us on us.userid=drs.userid  left join Moveit_trip mt on mt.tripid=drs.trip_id left join MoveitUser mu on mu.userid=mt.moveit_id  where drs.id="+Dayorder.id+" group by drs.id,drs.userid";
    // console.log(getdayorderquery);
    var getdayorder = await query(getdayorderquery);
    if(getdayorder.length>0){
      for (let i = 0; i < getdayorder.length; i++) {
        getdayorder[i].Products = JSON.parse(getdayorder[i].Products);
        getdayorder[i].moveitdetail = JSON.parse(getdayorder[i].moveitdetail);
      }        
      let resobj = {
        success: true,
        status: true,
        result: getdayorder
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "no data"
      };
      result(null, resobj);
    }      
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);
  }      
};


///////QA Day Order List ////////
Dayorder.quality_day_order_list =async function quality_day_order_list(Dayorder,result) {
  if(Dayorder.zoneid){
    //var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
    var where = "";
    if(Dayorder.date){
        where = where+" and drs.date='"+Dayorder.date +"' ";
    }else{
      //where = where+" and drs.date='"+tomorrow+"' ";
    }    
    if(Dayorder.doid){
        where = where+" and drs.id="+Dayorder.doid;
    }
    // var getqadayorderquery = "select drs.date,drs.id as doid,drs.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('dopid',orp.id,'quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'quantity',orp.quantity,'received_quantity',orp.received_quantity,'actival_weight',(orp.quantity*orp.product_weight),'received_weight',(orp.received_quantity*orp.product_weight),'sorting_status',orp.sorting_status,'report_quantity',0,'scm_status',orp.scm_status)) AS products,0 as actival_weight,0 as received_weight from Dayorder as drs left join Dayorder_products as orp on orp.doid=drs.id where drs.zoneid='"+Dayorder.zoneid+"' "+where+" and orp.scm_status<=4 and drs.dayorderstatus=1 group by drs.id,drs.userid";

    var getqadayorderquery = "select drs.date,drs.id as doid,drs.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('dopid',orp.id,'quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'quantity',orp.quantity,'received_quantity',orp.received_quantity,'actival_weight',(orp.quantity*orp.product_weight),'received_weight',(orp.received_quantity*orp.product_weight),'sorting_status',orp.sorting_status,'report_quantity',0,'scm_status',orp.scm_status)) AS products,0 as actival_weight,0 as received_weight from Dayorder as drs left join Dayorder_products as orp on orp.doid=drs.id where drs.zoneid='"+Dayorder.zoneid+"' "+where+" and drs.id IN((select DISTINCT(doid) from Dayorder_products where scm_status=4)) and drs.dayorderstatus=1 group by drs.id,drs.userid";
    var get_day_order_list = await query(getqadayorderquery);
    
    if (get_day_order_list.length>0) {    
      for (let i = 0; i < get_day_order_list.length; i++) {
        get_day_order_list[i].products = JSON.parse(get_day_order_list[i].products);
        get_day_order_list[i].product_count= get_day_order_list[i].products.length
        // var get_product = await query("select productname,count(quantity)as quantity from Dayorder_products where doid='"+get_day_order_list[i].id+"' group by vpid");
        // get_product.forEach(element => {
        //   get_day_order_list[i].productname=element.productname;
        //   get_day_order_list[i].quantity=element.quantity;
        // });  
        
        var productlist = get_day_order_list[i].products;
        for (let j = 0; j < productlist.length; j++) {
          get_day_order_list[i].actival_weight = parseInt(get_day_order_list[i].actival_weight)+parseInt(productlist[j].actival_weight);
          get_day_order_list[i].received_weight =parseInt(get_day_order_list[i].received_weight)+parseInt(productlist[j].received_weight);
          
          var getreprtingqtyquery = "select if(sum(report_quantity),sum(report_quantity),0) as report_quantity from Missing_Quantity_Report where from_type=1 and dopid="+productlist[j].dopid;
          var getreprtingqty = await query(getreprtingqtyquery);
          
          if(getreprtingqty.length>0){
              productlist[j].report_quantity = getreprtingqty[0].report_quantity;
          }
        }
      }
      let resobj = {
        success: true,
        status: true,
        result: get_day_order_list
      };
      result(null, resobj);  
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "no data"
      };
      result(null, resobj); 
    }
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);
  }
};

///////Dayorder View//////////////
Dayorder.quality_day_order_view=async function quality_day_order_view(Dayorder,result) {
  if(Dayorder.id){
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");  
    if (Dayorder.id) {
      var get_day_order_list = await query("select drs.*,JSON_ARRAYAGG(JSON_OBJECT('available', orp.quantity,'quantity', orp.quantity,'vpid',orp.vpid,'productname',orp.productname)) AS products from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id  where drs.id='"+Dayorder.id+"' and zoneid=1 and orp.scm_status<=4 and drs.dayorderstatus=1 group by drs.id,drs.userid");
    }
    
    if (get_day_order_list.length !=0) {    
      for (let i = 0; i < get_day_order_list.length; i++) {
        get_day_order_list[i].products = JSON.parse(get_day_order_list[i].products);      
      }

      let resobj = {
        success: true,
        status: true,
        result: get_day_order_list
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "no data"
      };
      result(null, resobj); 
    }
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);
  }   
};

//////Update Day Order Status ////
Dayorder.update_scm_status = async function update_scm_status(Dayorder){
  // console.log("Dayorder ==>",Dayorder);
  if(Dayorder){
    var getcountvaluequery = "select count(dop.id) as total_dop,count(case when dop.scm_status>=1 then dop.id end) as af1 from Dayorder_products as dop where dop.doid="+Dayorder;
    var getcountvalue = await query(getcountvaluequery);
    if(getcountvalue.length>0){
      if(getcountvalue[0].total_dop == getcountvalue[0].af1){
        var updatescmstatusquery = "update Dayorder set dayorderstatus=1 where id="+Dayorder;
        var updatescmstatus = await query(updatescmstatusquery);
      }else{
        var updatescmstatusquery = "update Dayorder set dayorderstatus=0 where id="+Dayorder;
        var updatescmstatus = await query(updatescmstatusquery);
      }
    }
  }
};


Dayorder.day_order_product_cancel=async function day_order_product_cancel(Dayorder,result) {
    var now = moment().format("YYYY-MM-DD,h:mm:ss a");

    var product= await query("select * from Dayorder_products where doid='"+Dayorder.doid+"' and id='"+Dayorder.id+"'");
    
    if (product.length !==0) {
      var dayorder= await query("select * from Dayorder where id='"+Dayorder.doid+"'");
      if (product[0].scm_status < 6 ) {

        var req = {};
        req.quantity = product[0].quantity;
        req.vpid = Dayorder.vpid;
        req.zoneid = dayorder[0].zoneid;
        Stock.cancel_product_quantity_update_Stock(req);

        var cancel_query = await query("update Dayorder_products set scm_status=11 ,product_cancel_time='"+now+"' where doid='"+Dayorder.doid+"' and id='"+Dayorder.id+"'");

        let resobj = {
          success: true,
          status: true,
          message : 'Product cancel Sucessfully'
        };
    
        result(null, resobj); 
      } else {
        let resobj = {
          success: true,
          status: true,
          message : 'product not available'
        };
    
        result(null, resobj); 
      }

    }else{

      let resobj = {
        success: true,
        status: true,
        message : 'product not available'
      };
  
      result(null, resobj); 
    }
  
  

     
  };


///// crm Day Order List ///////////
Dayorder.crm_day_order_list =async function crm_day_order_list(Dayorder,result) {

  var pagelimit = 20;
  var page = Dayorder.page || 1;
  var startlimit = (page - 1) * pagelimit;


  if(Dayorder){
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
    var end_date = moment(Dayorder.end_date).add(1, "days").format("YYYY-MM-DD");

    var where = "";
    // if(Dayorder.starting_date && Dayorder.end_date){
    //     where = where+" and (drs.created_at BETWEEN '"+Dayorder.starting_date +"' AND '"+end_date+"')";
    // }else{
    //   where = where+" and drs.created_at='"+tomorrow+"' ";
    // }
    
    if(Dayorder.starting_date && Dayorder.end_date){

           where = where+" and (drs.date BETWEEN '"+Dayorder.starting_date +"' AND '"+end_date+"')";

    }else{


        // where = where+" and  DATE(drs.created_at) = CURDATE() ";

    }


    // if (Dayorder.slot===1) {
 

    //   // let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD 23:00:00");
    //   // let datetimeB = moment(end_date).format("YYYY-MM-DD 19:00:00");

    //   let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD");
    //   let datetimeB = moment(end_date).format("YYYY-MM-DD");
    //   let datetimeC =  moment().format("00:00:00");
    //   let datetimeD  = moment().format("19:00:00");
    //   //TIME(DATE) BETWEEN '09:00' AND '19:00'
    //   // where = where+" and HOUR(drs.order_place_time) <= 19 ";
    //   where = where+" and TIME(drs.order_place_time) BETWEEN '00:00:00' and '19:00:00' ";

    // }else if(Dayorder.slot===2){

    //   // let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD 19:00:00");
    //   // let datetimeB = moment(end_date).format("YYYY-MM-DD 23:00:00");
    
    //   let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD");
    //   let datetimeB = moment(end_date).format("YYYY-MM-DD");
    //   // where = where+" and HOUR(drs.order_place_time) > 19";
    //   where = where+" and TIME(drs.order_place_time) BETWEEN '19:00:00' and '00:00:00' ";

    // }
    // else{

    //   where = where+" and (drs.date BETWEEN '"+Dayorder.starting_date +"' AND '"+end_date +"')";

    // }


    if(Dayorder.slot==1){
      where = where+" and HOUR(time(drs.order_place_time))<=19 ";
  }else if(Dayorder.slot==2){
    where = where+" and HOUR(time(drs.order_place_time))>=19 ";
  } 

    if(Dayorder.id){
        where = where+" and drs.id="+Dayorder.id;
    }

    if(Dayorder.userid){
      where = where+" and drs.userid="+Dayorder.userid;
  }
  
    
    if (Dayorder.trip_id && Dayorder.moveit_type==1) {
      where = where+" and drs.trip_id='"+Dayorder.trip_id+"' "
    }
    if (Dayorder.moveit_type==2) {
      where = where+" and drs.moveit_type='"+Dayorder.moveit_type+"' "
    }
    //   where = where+" and drs.moveit_type='"+Dayorder.moveit_type+"' "

    // }
    
    if(Dayorder.dayorderstatus !=null){
        where = where+" and drs.dayorderstatus="+Dayorder.dayorderstatus;
    }

    if (Dayorder.search) {

      where = where+" and (us.phoneno like '%"+Dayorder.search+"%' or us.userid like '%"+Dayorder.search+"%' or us.name like '%"+Dayorder.search+"%') ";
    }

      where =where +" group by drs.id,drs.userid order by drs.id desc limit " +startlimit +"," +pagelimit +" ";
  
    var getdayorderquery = "select drs.*,us.name,us.phoneno,us.email,sum(orp.quantity * orp.price) as total_product_price,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,sum(orp.received_quantity) as sorted_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'refund_status',orp.refund_status,'refund_status_msg',if(orp.refund_status=0,'Not refunded',if(orp.refund_status=1,'Refund requested','Refunded')))) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus < 5 then 'SCM In-Progress'  when drs.dayorderstatus=5 then 'Qc' when drs.dayorderstatus=6 then 'Ready to Dispatch' when drs.dayorderstatus=10 then 'delivered' when drs.dayorderstatus=11 then 'Cancelled' when drs.dayorderstatus=12 then 'Return' end as dayorderstatus_msg,CASE WHEN (drs.reorder_status=0 || drs.reorder_status=null)then(select id from Dayorder where reorder_id=drs.id order by id desc limit 1) else 0 END as  Reorderid,if(HOUR(drs.order_place_time) <= 19,1,2) as slot,if(HOUR(drs.order_place_time) <= 19,'Slot 1','Slot 2') as slot_msg     from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid where zoneid="+Dayorder.zoneid+" "+where+" ";

    // console.log(getdayorderquery);

    var getdayorder = await query(getdayorderquery);
    if(getdayorder.length>0){
      for (let i = 0; i < getdayorder.length; i++) {
        getdayorder[i].products = JSON.parse(getdayorder[i].products);
      }        

      var getdayorder1 = "select drs.*,us.name,us.phoneno,us.email,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid where zoneid="+Dayorder.zoneid+"  group by drs.id,drs.userid order by drs.id ";

      var totalcountgetdayorder = await query(getdayorder1);
         var totalcount = totalcountgetdayorder.length;
      // var totalcount = getdayorder.length;

      let resobj = {
        success: true,
        status: true,
        totalcount:totalcount,
        pagelimit:pagelimit,
        result: getdayorder
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status: false,
        totalcount:0,
        message: "no data"
      };
      result(null, resobj);
    }      
  }else{
    let resobj = {
      success: true,
      status: false,
      totalcount:0,
      message: "check your post values"
    };
    result(null, resobj);
  }      
};

Dayorder.admin_day_order_product_cancel=async function admin_day_order_product_cancel(Dayorder,vpid,result) {
  console.log(Dayorder);
  var now = moment().format("YYYY-MM-DD,h:mm:ss a");

  var day_order = await query("select * from Dayorder where id = "+Dayorder.doid+" ");

  if (day_order.length==0) {
    let resobj = {
      success: true,
      message: "Order not found .",
      status: true
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus ==12) {
    let resobj = {
      success: true,
      message: "Following order not returned. Please check admin.",
      status: true
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus ==11) {
    let resobj = {
      success: true,
      message: "Already order cancelled.",
      status: true
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus ==10) {
    let resobj = {
      success: true,
      message: "Already order delivered.",
      status: true
    };
    result(null, resobj);
  
  }else{


  var product= await query("select * from Dayorder_products where id IN('"+vpid+"') and scm_status >=6 ");
  if (product.length==0 ) {
  for (let i = 0; i < vpid.length; i++) {
 
    var product1= await query("select * from Dayorder_products where id ='"+vpid[i]+"' ");
      var dayorder= await query("select * from Dayorder where id='"+product1[0].doid+"'");

        
        if (product1[0].scm_status >=1) {
          
        var req = {};
        req.quantity = product1[0].quantity;
        req.vpid = product1[0].vpid;
        req.zoneid = dayorder[0].zoneid;
        Stock.cancel_product_quantity_update_Stock(req);

        }

        var cancel_comments = product1[0].productname+' Following product cancellled'
        var New_comments  ={};
        New_comments.doid=product1[0].doid;
        // New_comments.vpid=vpid[i];
        New_comments.comments=cancel_comments
        New_comments.done_by=Dayorder.cancel_by
        New_comments.type=2
        New_comments.done_type=1

        // console.log(New_comments);

        OrderComments.create_OrderComments_crm(New_comments)

        var cancel_query = await query("update Dayorder_products set scm_status=11 ,product_cancel_time='"+now+"',product_cancel_reason='"+Dayorder.product_cancel_reason+"',cancel_by='"+Dayorder.cancel_by+"',cancel_type='"+Dayorder.cancel_type+"' where doid='"+Dayorder.doid+"' and id='"+vpid[i]+"'");
  
    
  }
  var day_order_product = await query("select * from  Dayorder_products where doid='"+Dayorder.doid+"' and scm_status < 11 ");

  if (day_order_product.length ==0) {
    var update_day_order = await query("update Dayorder set dayorderstatus=11 where id ='"+Dayorder.doid+"'");

    var orders = await query("SELECT ors.*,us.pushid_ios,us.pushid_android,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail from Dayorder as ors left join User as us on ors.userid=us.userid where ors.id = '"+Dayorder.doid+"'" );

    PushConstant.Pageid_dl_order_cancel = 8;
    await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_order_cancel);
  
  }

  let resobj = {
    success: true,
    status: true,
    message : 'Product cancel Sucessfully'
  };

  result(null, resobj); 
} else {
  let resobj = {
    success: true,
    status: true,
    message : 'Sorry Cannot Cancel Product Is ready to dispatch',
    product : product
  };

  result(null, resobj); 
}
  }
};


Dayorder.admin_day_order_book_return=async function admin_day_order_book_return(req,result) {

  var day_order = await query("select * from Dayorder where id = "+req.doid+" ");

  if (day_order.length==0) {
    let resobj = {
      success: true,
      message: "Order not found .",
      status: false
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus ==12) {
    let resobj = {
      success: true,
      message: "Following order not returned. Please check admin.",
      status: false
    
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus ==11) {
    let resobj = {
      success: true,
      message: "Already order cancelled.",
      status: false
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus ==10) {
    let resobj = {
      success: true,
      message: "Already order delivered.",
      status: false
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus <=8) {
    let resobj = {
      success: true,
      message: "order not pickedup.",
      status: false
    };
    result(null, resobj);
  
  }else{

      
  var cancel_comments = req.return_reason
  var New_comments  ={};
  New_comments.doid=req.doid;
  New_comments.comments=cancel_comments
  New_comments.done_by=req.done_by
  New_comments.type=2
  New_comments.done_type=1


  OrderComments.create_OrderComments_crm(New_comments)


    var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  
    var update_query = "Update Dayorder set dayorderstatus=12 ,return_status=1, return_order_time='"+day+"',return_reason='"+req.return_reason+"',return_booked_by='"+req.done_by+"' where id = "+req.doid+" "
  
    var update = await query(update_query);

    var product_update_query = "Update Dayorder_products set scm_status=12  where doid = "+req.doid+" "
  
    var product_update = await query(product_update_query);

    var orders = await query("SELECT ors.*,us.pushid_ios,us.pushid_android,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail from Dayorder as ors left join User as us on ors.userid=us.userid where ors.id = '"+req.doid+"'" );

    // PushConstant.Pageid_dl_return_notification = 14;
    // await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_return_notification);

    // await Notification.orderMoveItPushNotification(moveittripres.result.insertId,PushConstant.pageidMoveit_Order_Assigned,getmoveitdetails[0]);
    // result(null, resobj);
 
    // var getmoveitdetailsquery = "select * from MoveitUser where userid="+req.moveit_id;
    // var getmoveitdetails = await query(getmoveitdetailsquery);
    // if(getmoveitdetails.length>0){
    //     console.log("moveit Send Notification ============> For assign 1");
    //     await Notification.orderMoveItPushNotification(moveittripres.result.insertId,PushConstant.pageidMoveit_Order_Assigned,getmoveitdetails[0]);
    // }
   
    let resobj = {
      success: true,
      message: "Order returned successfully .",
      status: true
    };
    result(null, resobj);
  
  }
 
};

Dayorder.reorder_order_create=async function reorder_order_create(Dayorder,order_item,result) {

  var day = moment().format("YYYY-MM-DD , h:mm:ss");
  var date  = moment(Dayorder.date).format("YYYY-MM-DD");
  var startdate =  moment().format("YYYY-MM-DD");
  var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"' and dayorderstatus < 10 ");

  if (date < startdate) {
    let resobj = {
      success: true,
      status: false,
      message : 'Please choose Feature date'
    };

    result(null, resobj); 
  } else {
    
  var create_comments = 're-order created'
  var New_comments  ={};
  New_comments.doid=Dayorder.doid;
  // New_comments.vpid=vpid[i];
  New_comments.comments=Dayorder.reorder_reason
  New_comments.done_by=Dayorder.done_by
  New_comments.type=2
  New_comments.done_type=1
  New_comments.Img1=Dayorder.Img1 || ''
  
  OrderComments.create_OrderComments_crm(New_comments)


  if (dayorders.length !=0) {
  
    for (let i = 0; i < order_item.length; i++) {
     
      var getproductdetails = "select  * from Dayorder_products where doid="+Dayorder.doid+" and id='"+order_item[i]+"'";
      var getproduct = await query(getproductdetails);

      var day_order_update = "update Dayorder set  reorder_status=1,reorder_reason='"+Dayorder.reorder_reason+"',reorder_by='"+Dayorder.done_by+"',reorder_id='"+Dayorder.doid+"',order_place_time='"+day+"' where id='"+dayorders[0].id+"' ";

      var update_query =await query(day_order_update);
 
      var new_createDayorderproducts={};
      new_createDayorderproducts.orderid = getproduct[0].orderid;
      new_createDayorderproducts.doid=dayorders[0].id;
      new_createDayorderproducts.vpid=getproduct[0].vpid;
      new_createDayorderproducts.productname=getproduct[0].productname;
      new_createDayorderproducts.quantity=getproduct[0].quantity;
      new_createDayorderproducts.price=getproduct[0].price;
      /////////////////////Insert Product Details/////////
      new_createDayorderproducts.product_hsn_code = getproduct[0].hsn_code;
      new_createDayorderproducts.product_image = getproduct[0].product_image;
      new_createDayorderproducts.product_brand = getproduct[0].product_brand;
      new_createDayorderproducts.product_mrp = getproduct[0].product_brand;
      new_createDayorderproducts.product_basiccost = getproduct[0].product_basiccost;
      new_createDayorderproducts.product_targetedbaseprice = getproduct[0].product_targetedbaseprice;
      new_createDayorderproducts.product_discount_cost = getproduct[0].product_discount_cost;
      new_createDayorderproducts.product_gst = getproduct[0].product_gst;
      new_createDayorderproducts.product_scl1_id = getproduct[0].product_scl1_id;
      new_createDayorderproducts.product_scl2_id = getproduct[0].product_scl2_id;
      new_createDayorderproducts.product_subscription = getproduct[0].product_subscription;
      new_createDayorderproducts.product_weight = getproduct[0].product_weight;
      new_createDayorderproducts.product_uom = getproduct[0].product_uom;
      new_createDayorderproducts.product_packetsize = getproduct[0].product_packetsize;
      new_createDayorderproducts.product_vegtype = getproduct[0].product_packetsize;
      new_createDayorderproducts.product_tag = getproduct[0].product_tag;
      new_createDayorderproducts.product_short_desc = getproduct[0].product_short_desc;
      new_createDayorderproducts.product_productdetails = getproduct[0].product_productdetails;
      new_createDayorderproducts.product_Perishable = getproduct[0].product_Perishable;
      Dayorderproducts.createDayorderproducts(new_createDayorderproducts);

    }


    var orders = await query("SELECT ors.*,us.pushid_ios,us.pushid_android,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail from Dayorder as ors left join User as us on ors.userid=us.userid where ors.id = '"+Dayorder.doid+"'" );

    PushConstant.Pageid_dl_reorder_notification = 14;
    await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_reorder_notification);


    let resobj = {
      success: true,
      status: true,
      message : 're-order created Sucessfully'
    };

    result(null, resobj); 
   
  }else{
    // console.log("dayorders.length1",dayorders.length);

    // for (let i = 0;i < order_item.length; i++) {
    
    //   var getproductdetails = "select  * from Dayorder_products where doid="+Dayorder.doid+" and id='"+order_item[i]+"'";
    //   var getproduct = await query(getproductdetails);

      
    // }
 
    var dayorders1 = await query("select * from Dayorder where id='"+Dayorder.doid+"' ");
    var new_day_order={};
    new_day_order.userid=Dayorder.userid;
    new_day_order.zoneid=Dayorder.zoneid;
    new_day_order.date=Dayorder.date;   
    new_day_order.reorder_id=Dayorder.doid   
    new_day_order.reorder_by=Dayorder.done_by  
    new_day_order.reorder_reason=Dayorder.reorder_reason  

    new_day_order.cus_lat=dayorders1[0].cus_lat;
    new_day_order.cus_lon=dayorders1[0].cus_lon;
    new_day_order.cus_pincode=dayorders1[0].cus_pincode;
    new_day_order.landmark=dayorders1[0].landmark;
    new_day_order.apartment_name=dayorders1[0].apartment_name;
    new_day_order.google_address=dayorders1[0].google_address;
    new_day_order.complete_address=dayorders1[0].complete_address;
    new_day_order.flat_house_no=dayorders1[0].flat_house_no;
    new_day_order.plot_house_no=dayorders1[0].plot_house_no;
    new_day_order.floor=dayorders1[0].floor;
    new_day_order.block_name=dayorders1[0].block_name;
    new_day_order.city=dayorders1[0].city;
    new_day_order.order_place_time=day
    new_day_order.reorder_status = 1

    sql.query("INSERT INTO Dayorder set ?", new_day_order,async function(err, res1) {
      if (err) {
        res(err, null);
      } else {
        var doid = res1.insertId;   

        var day_order_update = "update Dayorder set  reorder_mapping_orderid='"+res1.insertId+"'  where id='"+Dayorder.doid+"' ";
        console.log("day_order_update",day_order_update);
        var update_query =await query(day_order_update);


       for (let i = 0; i < order_item.length; i++) {
     
          var getproductdetails = "select  * from Dayorder_products where doid="+Dayorder.doid+" and id='"+order_item[i]+"'";
          var getproduct = await query(getproductdetails);
    
          
          var new_createDayorderproducts={};
          new_createDayorderproducts.orderid = getproduct[0].orderid;
          new_createDayorderproducts.doid=doid;
          new_createDayorderproducts.vpid=getproduct[0].vpid;
          new_createDayorderproducts.productname=getproduct[0].productname;
          new_createDayorderproducts.quantity=getproduct[0].quantity;
          new_createDayorderproducts.price=getproduct[0].price;
          /////////////////////Insert Product Details/////////
          new_createDayorderproducts.product_hsn_code = getproduct[0].hsn_code;
          new_createDayorderproducts.product_image = getproduct[0].product_image;
          new_createDayorderproducts.product_brand = getproduct[0].product_brand;
          new_createDayorderproducts.product_mrp = getproduct[0].product_brand;
          new_createDayorderproducts.product_basiccost = getproduct[0].product_basiccost;
          new_createDayorderproducts.product_targetedbaseprice = getproduct[0].product_targetedbaseprice;
          new_createDayorderproducts.product_discount_cost = getproduct[0].product_discount_cost;
          new_createDayorderproducts.product_gst = getproduct[0].product_gst;
          new_createDayorderproducts.product_scl1_id = getproduct[0].product_scl1_id;
          new_createDayorderproducts.product_scl2_id = getproduct[0].product_scl2_id;
          new_createDayorderproducts.product_subscription = getproduct[0].product_subscription;
          new_createDayorderproducts.product_weight = getproduct[0].product_weight;
          new_createDayorderproducts.product_uom = getproduct[0].product_uom;
          new_createDayorderproducts.product_packetsize = getproduct[0].product_packetsize;
          new_createDayorderproducts.product_vegtype = getproduct[0].product_packetsize;
          new_createDayorderproducts.product_tag = getproduct[0].product_tag;
          new_createDayorderproducts.product_short_desc = getproduct[0].product_short_desc;
          new_createDayorderproducts.product_productdetails = getproduct[0].product_productdetails;
          new_createDayorderproducts.product_Perishable = getproduct[0].product_Perishable;

          Dayorderproducts.createDayorderproducts(new_createDayorderproducts);
    
        }

        var orders = await query("SELECT ors.*,us.pushid_ios,us.pushid_android,JSON_OBJECT('userid',us.userid,'pushid_ios',us.pushid_ios,'pushid_android',us.pushid_android,'name',us.name) as userdetail from Dayorder as ors left join User as us on ors.userid=us.userid where ors.id = '"+res1.insertId+"'" );

        PushConstant.Pageid_dl_reorder_notification = 14;
        await Notification.orderdlPushNotification(orders,null,PushConstant.Pageid_dl_reorder_notification);
        // result(null, resobj);
    
        let resobj = {
          success: true,
          status: true,
          message : 're-order created Sucessfully, reorder '+res1.insertId
        };
    
        result(null, resobj); 
      }
    });
  }
}
   
};



Dayorder.reorder_reasonlist=async function reorder_reasonlist(req,result) {

      
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;

  var reasonquery = " select * from Reorder_reason"

  var reason_list = await query(reasonquery);
 
  let resobj = {
    success: true,
    status: true,
    result:reason_list
  };
  result(null, resobj);

 

 
};


Dayorder.cancel_reasonlist=async function cancel_reasonlist(req,result) {

      
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;

  var reasonquery = " select * from Cancellation_reason"

  var reason_list = await query(reasonquery);
 
  let resobj = {
    success: true,
    status: true,
    result:reason_list
  };
  result(null, resobj);

 

 
};

Dayorder.bookreturn_reasonlist=async function bookreturn_reasonlist(req,result) {

      
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;

  var reasonquery = " select * from Day_Order_Return_reason"

  var reason_list = await query(reasonquery);
 
  let resobj = {
    success: true,
    status: true,
    result:reason_list
  };
  result(null, resobj);

 

 
};

Dayorder.refund_reasonlist=async function refund_reasonlist(req,result) {

      
  var day = moment().format("YYYY-MM-DD HH:mm:ss");;

  var reasonquery = " select * from Day_Order_Return_reason"

  var reason_list = await query(reasonquery);
 
  let resobj = {
    success: true,
    status: true,
    result:reason_list
  };
  result(null, resobj);

 

 
};


Dayorder.user_crm_day_order_list =async function user_crm_day_order_list(Dayorder,result) {
  if(Dayorder){
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
    var where = "";
    // if(Dayorder.starting_date && Dayorder.end_date){
    //     where = where+" and (drs.date BETWEEN '"+Dayorder.starting_date +"' AND '"+Dayorder.end_date +"')";
    // }else{
    //   where = where+" and drs.date='"+tomorrow+"' ";
    // }
    
    // if(Dayorder.doid){
    //     where = where+" and drs.id="+Dayorder.doid;
    // }
    

    if(Dayorder.userid){
      where = where+"  drs.userid="+Dayorder.userid;
  }

    if(Dayorder.dayorderstatus){
        where = where+" and drs.dayorderstatus="+Dayorder.dayorderstatus;
    }

    var getdayorderquery = "select drs.*,us.name,us.phoneno,us.email,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid where  "+where+" group by drs.id,drs.userid";
    var getdayorder = await query(getdayorderquery);
    if(getdayorder.length>0){
      for (let i = 0; i < getdayorder.length; i++) {
        getdayorder[i].products = JSON.parse(getdayorder[i].products);
      }        
      let resobj = {
        success: true,
        status: true,
        result: getdayorder
      };
      result(null, resobj);
    }else{
      let resobj = {
        success: true,
        status: false,
        message: "no data"
      };
      result(null, resobj);
    }      
  }else{
    let resobj = {
      success: true,
      status: false,
      message: "check your post values"
    };
    result(null, resobj);
  }      
};

//online refund coupon
Dayorder.create_refund = function create_refund(refundDetail) {
  var refund = new RefundOnline(refundDetail);
  RefundOnline.createRefund(refund, function(err, res) {
    if (err) return err;
    else return res;
  });
};

Dayorder.refund_create = async function refund_create(req,result) {

  var reject_status = true;
  var refund_status = true;
  var refundDetail = {};

  const dayorderdetails = await query("select * from Dayorder where id ='" + req.doid + "'");
  var items = req.refunditems;
  var product_price = 0;
  if (dayorderdetails.length !=0) {


    const userdetails = await query("select * from User where userid ='" + dayorderdetails[0].userid + "'");
    const dayproductdetails = await query("select orderid from Dayorder_products where id IN ('" + items + "') group by orderid ");

   if (dayproductdetails.length !=0) {

    if (dayorderdetails[0].dayorderstatus === 10) {
        
      var order_ids = [];

              for (let i = 0; i < dayproductdetails.length; i++) {        
                order_ids.push(dayproductdetails[i].orderid);
              }

            const orderrefunddetails = await query("select * from Refund_Online where orderid ='" + order_ids + "' and active_status !=0");

              if (orderrefunddetails.length ==0) {
                

                      for (let i = 0; i < items.length; i++) {

                        const productdetails = await query("select orderid,price * quantity as product_price from Dayorder_products where id ='" + items[i] + "' ");

                        const orderdetails = await query("select *  from Orders where orderid ='" + productdetails[0].orderid+ "' ");


                        var update_query = "Update Dayorder_products set refund_status=1 where id ='" + items[i] + "' ";
          
                        var update = await query(update_query);

                        product_price = productdetails[0].product_price + dayorderdetails[0].delivery_charge;
                  
                        var refundDetail = {
                          orderid :  productdetails[0].orderid,
                          active_status : 0,
                          userid :  orderdetails[0].userid,
                          payment_id : orderdetails[0].tsid,
                          original_amt:  product_price,
                          refund_image : req.refund_image,
                          refund_reason : req.refund_reason
                        };

                        await Dayorder.create_refund(refundDetail);

                    
                      }


                      var refund_comments = 'refunds requested. dayorderid : ' + req.doid
                      var New_comments  ={};
                      New_comments.doid=req.doid;
                      New_comments.comments=refund_comments
                      New_comments.done_by=req.done_by
                      New_comments.type=2
                      New_comments.done_type=1
                      OrderComments.create_OrderComments_crm(New_comments)

                
                      let response = {
                        success: true,
                        status: true,
                        message: "Refunded created successfully."
                      };
                      result(null, response);

              } else {
                let response = {
                  success: true,
                  status: false,
                  message: "Refund Already created."
                };
                result(null, response);

              }
                  
  
    }else if(dayorderdetails[0].dayorderstatus === 11){
      let response = {
        success: true,
        status: false,
        message: " Day Order already canceled."
      };
      result(null, response);
    
    
    }else {
      let response = {
        success: true,
        status: false,
        message: "Day Order not yet to delivered."
      };
      result(null, response);
    }



   } else {
    let response = {
      success: true,
      status: false,
      message: "Day Order Product is not available"
    };
    result(null, response);
   }


} else {
  let response = {
    success: true,
    status: false,
    message: "Order is not available"
  };
  result(null, response);
}
};


Dayorder.insert_order_status = function insert_order_status(req) {
  var new_MoveitStatus = new MoveitStatus(req);
  MoveitStatus.createMoveitStatus(new_MoveitStatus, function(err, res) {
   if (err) return err;
   else return res;
 });
};


Dayorder.day_order_book_return_by_moveit=async function day_order_book_return_by_moveit(req,result) {


  var day_order = await query("select * from Dayorder where id = "+req.id+" ");

  if (day_order.length==0) {
    let resobj = {
      success: true,
      message: "Order not found .",
      status: true
    };
    result(null, resobj);
  
  }else if (day_order[0].dayorderstatus !=12) {
    let resobj = {
      success: true,
      message: "Following order not returned. Please check admin.",
      status: true
    };
    result(null, resobj);
  
  }else{

    
    req.moveitid = req.moveit_userid;
    req.status = 8;
    req.doid= req.id;
    await Dayorder.insert_order_status(req); 

    var cancel_comments = 'return requested by moveit'
    var New_comments  ={};
    New_comments.doid=req.id;
    New_comments.comments=cancel_comments
    New_comments.done_by=req.moveit_userid
    New_comments.type=4
    New_comments.done_type=0
    OrderComments.create_OrderComments_crm(New_comments)
    
    var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  
    var update_query = "Update Dayorder set return_status=1,moveit_order_return_time='"+day+"'  where id = "+req.id+" "
  
    var update = await query(update_query);

    // var product_update_query = "Update Dayorder_products set scm_status=12  where doid = "+req.doid+" "
  
    // var product_update = await query(product_update_query);
   
    let resobj = {
      success: true,
      message: "Order returned successfully .",
      status: true
    };
    result(null, resobj);

  }
   
};



  module.exports = Dayorder;
