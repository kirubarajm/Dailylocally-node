"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var BrandModel = function(brandmodel) {
  this.id = brandmodel.id;
  this.brandname = brandmodel.brandname;
}

//For Admin
BrandModel.createBrandModel = async function createBrandModel(req, result) {
    var insertdata = new BrandModel(req);
    if(insertdata.brandname){
        var namecheckquery = "select * from Brand where brandname='"+insertdata.brandname+"' ";
        var namecheck = await query(namecheckquery);
        if(namecheck.length==0){
            sql.query("INSERT INTO Brand set ?", insertdata,async function(err, res) {
                if (err) {
                    let resobj = {
                        success: true,
                        status: false,
                        message: err
                    };
                    result(null, resobj);
                } else {
                    let resobj = {
                        success: true,
                        status: true,
                        result: res,
                        message: "brand added successfully"
                    };
                    result(null, resobj);
                }
            });
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "brand name already exist"
            };
            result(null, resobj);
        } 
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "plz enter name and phono"
        };
        result(null, resobj);
    }           
};

BrandModel.updateBrandModel =async function updateBrandModel(req, result) {
    var updatedata = new BrandModel(req);
    if(updatedata.id){
        var namecheckquery = "select * from Brand where brandname='"+updatedata.brandname+"' and id NOT IN("+updatedata.id+")";
        var namecheck = await query(namecheckquery);
        if(namecheck.length==0){
            sql.query("UPDATE Brand SET ? WHERE id = ?", [updatedata, updatedata.id],async function(err, res) {
                if (err) {
                    let resobj = {
                        success: true,
                        status: false,
                        message: err
                    };
                    result(null, resobj);
                } else {
                    let resobj = {
                        success: true,
                        status: true,
                        result: res
                    };
                    result(null, resobj);
                }
                }
            );            
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "brand name already exist"
            };
            result(null, resobj);
        } 
    }else{
        let resobj = {
            success: true,
            status: false,
            message: 'please enter brand id'
        };
        result(null, resobj);
    }
};

BrandModel.BrandModelview =async function BrandModelview(req, result) {
    var getbrandquery = "select * from Brand where id="+req.id;
    var getbrands = await query(getbrandquery);
    if(getbrands.length>0){
        let resobj = {
            success: true,
            status: true,
            result: getbrands
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "in valid brand id"
        };
        result(null, resobj);
    }
};

BrandModel.BrandModelList =async function BrandModelList(req, result) {
    var pagelimit = 20;
    var page = req.page || 1;
    var startlimit = (page - 1) * pagelimit;

    var wherecon = "";
    if(req.brandsearch){
        wherecon = wherecon +" and brandname LIKE '%"+req.brandsearch+"%' ";
    }

    if(req.report && req.report==1){
        var getbrandquery = "select * from Brand where id!='' "+wherecon+" group by id";
    }else{
        var getbrandquery = "select * from Brand where id!='' "+wherecon+" group by id order by id DESC limit " +startlimit +"," +pagelimit +" ";
    }
    var getbrands = await query(getbrandquery);

    var totalcountquery = "select * from Brand where id!='' "+wherecon+" group by id";
    var total_count = await query(totalcountquery);        
    if(getbrands.length>0){
        var totalcount = total_count.length;
        let resobj = {
            success: true,
            status: true,
            totalcount: totalcount,
            pagelimit: pagelimit,
            result: getbrands
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            totalcount: 0,
            message: "no data"
        };
        result(null, resobj);
    }
};

module.exports = BrandModel;