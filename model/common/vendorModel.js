"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var VendorModel = function(vendormodel) {
  this.vid = vendormodel.vid;
  this.name = vendormodel.name;
  this.phoneno = vendormodel.phoneno;
  this.address = vendormodel.address;
  this.email = vendormodel.email;
  this.pan = vendormodel.pan
  this.fssai = vendormodel.fssai;
  this.gst = vendormodel.gst;
}

//For Admin
VendorModel.createVendorModel = async function createVendorModel(req, result) {
    var insertdata = new VendorModel(req);
    if(insertdata.name && insertdata.phoneno){
        var namecheckquery = "select * from Vendor where name='"+insertdata.name+"' ";
        var namecheck = await query(namecheckquery);
        if(namecheck.length==0){
            var phonenocheckquery = "select * from Vendor where phoneno='"+insertdata.phoneno+"' ";
            var phonenocheck = await query(phonenocheckquery);
            if(phonenocheck.length==0){
                sql.query("INSERT INTO Vendor set ?", insertdata,async function(err, res) {
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
                            message: "vendor added successfully"
                        };
                        result(null, resobj);
                    }
                });
            }else{
                let resobj = {
                    success: true,
                    status: false,
                    message: "phoneno already exist"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "vendor name already exist"
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

VendorModel.updateVendorModel =async function updateVendorModel(req, result) {
    var updatedata = new VendorModel(req);
    if(updatedata.vid){
        var namecheckquery = "select * from Vendor where name='"+updatedata.name+"' and vid NOT IN("+updatedata.vid+")";
        var namecheck = await query(namecheckquery);
        if(namecheck.length==0){
            var phonenocheckquery = "select * from Vendor where phoneno='"+updatedata.phoneno+"' and vid NOT IN("+updatedata.vid+")";
            var phonenocheck = await query(phonenocheckquery);
            if(phonenocheck.length==0){
                sql.query("UPDATE Vendor SET ? WHERE vid = ?", [updatedata, updatedata.vid],async function(err, res) {
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
                    message: "phoneno already exist"
                };
                result(null, resobj);
            }
        }else{
            let resobj = {
                success: true,
                status: false,
                message: "vendor name already exist"
            };
            result(null, resobj);
        } 
    }else{
        let resobj = {
            success: true,
            status: false,
            message: 'please enter vendor id'
        };
        result(null, resobj);
    }
};

VendorModel.VendorModelview =async function VendorModelview(req, result) {
    var getvendorquery = "select * from Vendor where vid="+req.vid;
    var getvendors = await query(getvendorquery);
    if(getvendors.length>0){
        let resobj = {
            success: true,
            status: true,
            result: getvendors
        };
        result(null, resobj);
    }else{
        let resobj = {
            success: true,
            status: false,
            message: "in valid vendor id"
        };
        result(null, resobj);
    }
};

VendorModel.VendorModelList =async function VendorModelList(req, result) {
    var pagelimit = 20;
    var page = req.page || 1;
    var startlimit = (page - 1) * pagelimit;

    var wherecon = "";
    if(req.vendorsearch){
        wherecon = wherecon +" and name LIKE '%"+req.vendorsearch+"%' or phoneno LIKE '%"+req.vendorsearch+"%' ";
    }

    if(req.report && req.report==1){
        var getvendorquery = "select * from Vendor where vid!='' "+wherecon+" group by vid";
    }else{
        var getvendorquery = "select * from Vendor where vid!='' "+wherecon+" group by vid order by vid DESC limit " +startlimit +"," +pagelimit +" ";
    }
    var getvendors = await query(getvendorquery);

    var totalcountquery = "select * from Vendor where vid!='' "+wherecon+" group by vid";
    var total_count = await query(totalcountquery);        
    if(getvendors.length>0){
        var totalcount = total_count.length;
        let resobj = {
            success: true,
            status: true,
            totalcount: totalcount,
            pagelimit: pagelimit,
            result: getvendors
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

module.exports = VendorModel;