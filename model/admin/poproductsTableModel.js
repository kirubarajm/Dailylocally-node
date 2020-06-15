"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POproducts = function(poproducts) {
  this.prid = poproducts.prid;
  this.vpid = poproducts.vpid;
  this.vid = poproducts.vid;
  this.cost = poproducts.cost;
  this.other_charges = poproducts.other_charges;
  this.requested_quantity = poproducts.requested_quantity;
  this.received_quantity = poproducts.received_quantity;
  this.aditional_quantity = poproducts.aditional_quantity;
  this.pop_status = poproducts.pop_status;
  this.due_date = poproducts.due_date;
  this.buyer_comment = poproducts.buyer_comment;
}

//For Admin
POproducts.createPOProducts = async function createPOProducts(req, result) {
    sql.query("INSERT INTO POproducts set ?", req,async function(err, res) {
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
                data: res
            };
            result(null, resobj);
        }
    });    
};

POproducts.updatePOProducts =async function updatePOProducts(req,popid, result) {
    console.log("updatePOProducts req--->",req,"popid->",popid);
    sql.query("UPDATE POproducts set ? where popid = ?", [req, popid],function(err, res) {
        //sql.query("UPDATE PackagingBox set ? where id =?", [packagingboxdetails,id], function(err, res) {
        console.log("updatePOProducts res-->",res);
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
                data: res
            };
            result(null, resobj);
        }
      }
    );
};

module.exports = POproducts;