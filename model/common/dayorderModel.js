"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
var moment = require("moment");
var Dayorderproducts = require("../../model/common/dayorderproductsModel");
var Stock = require('../tableModels/stockTableModel.js');
var OrderComments = require("../../model/admin/orderCommentsModel");
var RefundOnline = require("../../model/common/refundonlineModel");
var Dayorder = function(Dayorder) {
  this.date = Dayorder.date;
  this.userid = Dayorder.userid;
  this.zoneid=Dayorder.zoneid;
  this.dayorderstatus=Dayorder.dayorderstatus || 0 ;
  this.rating_skip=Dayorder.rating_skip || 0;
  this.reorder_id=Dayorder.reorder_id || 0;
  this.reorder_by=Dayorder.reorder_by || 0;
  
};


Dayorder.checkdayorder =async function checkdayorder(Dayorder,getproduct){
  for (let i = 0; i < getproduct.length; i++) {
    if (getproduct[i].subscription==0) {
      var date  = moment(getproduct[i].deliverydate).format("YYYY-MM-DD");
      var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
      var ordersdetails = await query("select * from Orders where orderid='"+Dayorder.orderid+"'");
      if (dayorders.length !=0) {
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
          var date  = moment().add(j, "days").format("YYYY-MM-DD");; ////0-current date
          var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
          if (dayorders.length !=0) {
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
    
              console.log("new_day_order===>3",new_day_order); 
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

    var getdayorderquery = "select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where zoneid="+Dayorder.zoneid+" " +where+" ";
    console.log("getdayorder=====>",getdayorderquery);
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
    var getdayorderquery = "select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where drs.id="+Dayorder.id+" group by drs.id,drs.userid";
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
    var getdayorderquery = "select drs.*,us.name,us.phoneno,us.email,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('id',orp.id,'quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'scm_status',iF(orp.scm_status=6,'Ready to Dispatch',IF (orp.scm_status=11,'Product cancel',IF (orp.scm_status=10,'deliverd',IF(orp.scm_status=12,'Return','Inprogress') ))))) AS Products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id  left join User us on us.userid=drs.userid  where drs.id="+Dayorder.id+" group by drs.id,drs.userid";
    console.log(getdayorderquery);
    var getdayorder = await query(getdayorderquery);
    if(getdayorder.length>0){
      for (let i = 0; i < getdayorder.length; i++) {
        getdayorder[i].Products = JSON.parse(getdayorder[i].Products);
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

    var getqadayorderquery = "select drs.date,drs.id as doid,drs.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('dopid',orp.id,'quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'quantity',orp.quantity,'received_quantity',orp.received_quantity,'actival_weight',(orp.quantity*orp.product_weight),'received_weight',(orp.received_quantity*orp.product_weight),'sorting_status',orp.sorting_status,'report_quantity',0,'scm_status',orp.scm_status)) AS products,0 as actival_weight,0 as received_weight from Dayorder as drs left join Dayorder_products as orp on orp.doid=drs.id where drs.zoneid='"+Dayorder.zoneid+"' "+where+" and drs.id=(select DISTINCT(doid) from Dayorder_products where scm_status=4) and drs.dayorderstatus=1 group by drs.id,drs.userid";
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

    var product= await query("select * from Dayorder_products where doid='"+Dayorder.doid+"' and vpid='"+Dayorder.vpid+"'");
    
    if (product.length !==0) {
      var dayorder= await query("select * from Dayorder where id='"+Dayorder.doid+"'");
      if (product[0].scm_status < 6 ) {

        var req = {};
        req.quantity = product[0].quantity;
        req.vpid = Dayorder.vpid;
        req.zoneid = dayorder[0].zoneid;
        Stock.cancel_product_quantity_update_Stock(req);

        var cancel_query = await query("update Dayorder_products set scm_status=11 ,product_cancel_time='"+now+"' where doid='"+Dayorder.doid+"' and vpid='"+Dayorder.vpid+"'");

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

  var orderlimit = 20;
  var page = Dayorder.page || 1;
  var startlimit = (page - 1) * orderlimit;


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

      if (Dayorder.slot===1) {
 

        let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD 23:00:00");
        let datetimeB = moment(end_date).format("YYYY-MM-DD 19:00:00");
        where = where+" and (drs.created_at BETWEEN '"+datetimeA +"' AND '"+datetimeB +"')";

      }else if(Dayorder.slot===2){

        let datetimeA =  moment(Dayorder.starting_date).format("YYYY-MM-DD 19:00:00");
        let datetimeB = moment(end_date).format("YYYY-MM-DD 23:00:00");
      
        where = where+" and (drs.created_at BETWEEN '"+datetimeA +"' AND '"+datetimeB +"')";

      }
      else{

        console.log("slot3");
        where = where+" and (drs.created_at BETWEEN '"+Dayorder.starting_date +"' AND '"+end_date +"')";

      }
    }else{


        where = where+" and  DATE(drs.created_at) = CURDATE() ";



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
  
    var getdayorderquery = "select drs.*,us.name,us.phoneno,us.email,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id left join User us on us.userid=drs.userid where zoneid="+Dayorder.zoneid+" "+where+" ";

    console.log(getdayorderquery);
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

Dayorder.admin_day_order_product_cancel=async function admin_day_order_product_cancel(Dayorder,vpid,result) {
  var now = moment().format("YYYY-MM-DD,h:mm:ss a");

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
  
};


Dayorder.admin_day_order_book_return=async function admin_day_order_book_return(req,result) {

      
    var day = moment().format("YYYY-MM-DD HH:mm:ss");;
  
    var update_query = "Update Dayorder set dayorderstatus=12 ,return_order_time='"+day+"',return_reason='"+req.return_reason+"',return_booked_by='"+req.done_by+"' where id = "+req.doid+" "
  
    var update = await query(update_query);

    var product_update_query = "Update Dayorder_products set scm_status=12  where doid = "+req.doid+" "
  
    var product_update = await query(product_update_query);
   
    let resobj = {
      success: true,
      message: "Order returned successfully .",
      status: true
    };
    result(null, resobj);
  
   

   
};

Dayorder.reorder_order_create=async function reorder_order_create(Dayorder,order_item,result) {
 
  var date  = moment(Dayorder.date).format("YYYY-MM-DD");
  var startdate =  moment().format("YYYY-MM-DD");
  var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");

  if ( date < startdate) {
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
  New_comments.comments=create_comments
  New_comments.done_by=Dayorder.done_by
  New_comments.type=2
  New_comments.done_type=1
  New_comments.Img1=Dayorder.Img1 || ''
  

  // console.log(New_comments);

  OrderComments.create_OrderComments_crm(New_comments)


  if (dayorders.length !=0) {
  
    for (let i = 0; i < order_item.length; i++) {
     
      var getproductdetails = "select  * from Dayorder_products where doid="+Dayorder.doid+" and id='"+order_item[i]+"'";
      var getproduct = await query(getproductdetails);

      var update_query =await query("update Dayorder set reorder_reason='"+Dayorder.reorder_reason+"',reorder_by='"+Dayorder.done_by+"',reorder_id='"+Dayorder.doid+"' where id='"+dayorders[0].id+"' ");
      
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

    let resobj = {
      success: true,
      status: true,
      message : 're-order created Sucessfully'
    };

    result(null, resobj); 
   
  }else{
    // console.log("dayorders.length1",dayorders.length);

    for (let i = 0;i < order_item.length; i++) {
    
      var getproductdetails = "select  * from Dayorder_products where doid="+Dayorder.doid+" and id='"+order_item[i]+"'";
      var getproduct = await query(getproductdetails);

      
    }
 

    var new_day_order={};
    new_day_order.userid=Dayorder.userid;
    new_day_order.zoneid=Dayorder.zoneid;
    new_day_order.date=Dayorder.date;   
    new_day_order.reorder_id=Dayorder.doid   
    new_day_order.reorder_by=Dayorder.done_by  
    new_day_order.reorder_reason=Dayorder.reorder_reason  
    console.log("new_day_order===>1",new_day_order); 
    sql.query("INSERT INTO Dayorder set ?", new_day_order,async function(err, result) {
      if (err) {
        res(err, null);
      } else {
        var doid = result.insertId;                
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
    
        let resobj = {
          success: true,
          status: true,
          message : 're-order created Sucessfully'
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

  const orderdetails = await query("select * from Dayorder where id ='" + req.doid + "'");

  if (orderdetails.length !=0) {
    const userdetails = await query("select * from User where userid ='" + orderdetails[0].userid + "'");
    if (orderdetails[0].dayorderstatus === 10) {

      // var today = moment();
      // var moveit_actual_delivered_time = moment(orderdetails[0].moveit_actual_delivered_time);
      // var diffMs  = (today - moveit_actual_delivered_time);
      // var diffDays = Math.floor(diffMs / 86400000); 
      // var diffHrs = Math.floor((diffMs % 86400000) / 3600000);
      // var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
  

      
      var refundDetail = {
        doid : req.doid,
        active_status : 0,
        userid : orderdetails[0].userid,
        payment_id : orderdetails[0].transactionid
      };

      await Dayorder.create_refund(refundDetail);
      
      let response = {
        success: true,
        status: true,
        message: "Refunded created successfully."
      };
      result(null, response);
  
    } else if(orderdetails[0].dayorderstatus === 11){
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
      message: "Day Order is not available"
    };
    result(null, response);
  }
};
  module.exports = Dayorder;
