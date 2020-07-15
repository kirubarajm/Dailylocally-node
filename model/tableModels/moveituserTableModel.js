"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var MoveitUser = function(moveituser) {
    this.userid = moveituser.userid;
    this.name = moveituser.name;
    this.email = moveituser.email;
    this.password = moveituser.password;
    this.bank_account_no = moveituser.bank_account_no;
    this.phoneno = moveituser.phoneno;
    this.Vehicle_no = moveituser.Vehicle_no; ///////no used
    this.verified_status = moveituser.verified_status;
    this.online_status = moveituser.online_status; ///////no used
    this.referalcode = moveituser.referalcode;
    this.bank_name = moveituser.bank_name;
    this.ifsc = moveituser.ifsc;
    this.bank_holder_name = moveituser.bank_holder_name;
    this.moveit_hub = moveituser.moveit_hub; ///////no used
    this.driver_lic = moveituser.driver_lic;
    this.vech_insurance = moveituser.vech_insurance; ///////no used
    this.vech_rcbook = moveituser.vech_rcbook; ///////no used
    this.photo = moveituser.photo;
    this.legal_document = moveituser.legal_document;
    this.branch = moveituser.branch; ///////no used
    this.pushid_android = moveituser.pushid_android;
    this.address = moveituser.address;
    this.pushid_ios = moveituser.pushid_ios;
    this.login_status = moveituser.login_status; ///////no used
    this.login_time = moveituser.login_time; ///////no used
    this.logout_time = moveituser.logout_time; ///////no used
    this.zone = moveituser.zone;
    this.trip_status = moveituser.trip_status; ///////no used
    this.order_assign_status = moveituser.order_assign_status; ///////no used
    ///////////////////////////////////////////////////
    this.dob = moveituser.dob;
    this.gender = moveituser.gender;
    this.fathersname = moveituser.fathersname;
    this.qualification = moveituser.qualification;
    this.languages = moveituser.languages;
    this.licenseexpiry = moveituser.licenseexpiry;
    this.pannumber = moveituser.pannumber;
    this.pincode = moveituser.pincode;
    this.area = moveituser.area;
    this.licensephotograph = moveituser.licensephotograph;
    this.panphotograph = moveituser.panphotograph;
    this.aadharphotograph = moveituser.aadharphotograph;
    this.bankdocument = moveituser.bankdocument;
    this.contractdocument = moveituser.contractdocument;
    this.addressproofdocument = moveituser.addressproofdocument;
}

//For Admin
MoveitUser.createMoveitUser = async function createMoveitUser(req, result) {
    var insertdata = new MoveitUser(req);
    sql.query("INSERT INTO MoveitUser set ?", insertdata,async function(err, res) {
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
    });    
};

MoveitUser.updateMoveitUser =async function updateMoveitUser(req, result) {
    var updatedata = new MoveitUser(req);
    sql.query("UPDATE MoveitUser SET ? WHERE userid = ?", [updatedata, updatedata.userid],async function(err, res) {
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
};

module.exports = MoveitUser;