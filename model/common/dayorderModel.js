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


Dayorder.checkdayorder =async function checkdayorder(Dayorder,getproduct){
  for (let i = 0; i < getproduct.length; i++) {
    if (getproduct[i].subscription==0) {
      var date  = moment(getproduct[i].deliverydate).format("YYYY-MM-DD");
      var dayorders = await query("select * from Dayorder where userid='"+Dayorder.userid+"' and date='"+date+"'");
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

////// Day Order List ////////////////
Dayorder.day_order_list =async function day_order_list(Dayorder,result) {
if(Dayorder){
  var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
  var where = "";
  if(Dayorder.starting_date && Dayorder.end_date){
      where = where+" and (drs.date BETWEEN '"+Dayorder.starting_date +"' AND '"+Dayorder.end_date +"')";
  }else{
    where = where+" and drs.date='"+tomorrow+"' ";
  }
  
  if(Dayorder.doid){
      where = where+" and drs.id="+Dayorder.doid;
  }
  if(Dayorder.dayorderstatus){
      where = where+" and drs.dayorderstatus="+Dayorder.dayorderstatus;
  }

  var getdayorderquery = "select drs.*,count(DISTINCT orp.vpid) u_product_count,sum(orp.quantity) as order_quantity,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname)) AS products,case when drs.dayorderstatus=0 then 'open' when drs.dayorderstatus=1 then 'SCM In-Progress' when drs.dayorderstatus=6 then 'Ready to Dispatch' end as dayorderstatus_msg  from Dayorder drs left join Dayorder_products orp on orp.doid=drs.id where zoneid="+Dayorder.zoneid+" "+where+" group by drs.id,drs.userid";

  //console.log("getdayorderquery -->",getdayorderquery);
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

///////QA Day Order List
Dayorder.quality_day_order_list =async function quality_day_order_list(Dayorder,result) {
  if(Dayorder.zoneid){
    var tomorrow = moment().add(1, "days").format("YYYY-MM-DD");
    var where = "";
    if(Dayorder.date){
        where = where+" and drs.date='"+Dayorder.date +"' ";
    }else{
      where = where+" and drs.date='"+tomorrow+"' ";
    }    
    if(Dayorder.doid){
        where = where+" and drs.id="+Dayorder.id;
    }
    var getqadayorderquery = "select drs.date,drs.id as doid,drs.dayorderstatus,JSON_ARRAYAGG(JSON_OBJECT('quantity', orp.quantity,'vpid',orp.vpid,'price',orp.price,'productname',orp.productname,'quantity',orp.quantity,'received_quantity',orp.received_quantity,'actival_weight',(orp.quantity*pm.weight),'received_weight',(orp.received_quantity*pm.weight))) AS products from Dayorder as drs left join Dayorder_products as orp on orp.doid=drs.id left join Product_live as pl on pl.vpid=orp.vpid left join ProductMaster as pm on pm.pid=pl.pid where drs.zoneid='"+Dayorder.zoneid+"' "+where+" and orp.scm_status = 4 group by drs.id,drs.userid";
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

//////Update Day Order Status ////
Dayorder.update_scm_status = async function update_scm_status(Dayorder){
  console.log("Dayorder ==>",Dayorder);
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

      if (product[0].scm_status < 6 ) {

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

  module.exports = Dayorder;
