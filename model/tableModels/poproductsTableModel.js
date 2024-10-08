"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POproducts = function(poproducts) {
  this.popid = poproducts.popid;
  this.poid = poproducts.poid;
  this.prid = poproducts.prid;
  this.vpid = poproducts.vpid;
  this.vid = poproducts.vid;
  this.cost = poproducts.cost;
  this.other_charges = poproducts.other_charges;
  this.rate = poproducts.rate ||0;
  this.requested_quantity = poproducts.requested_quantity || 0;
  this.received_quantity = poproducts.received_quantity || 0;
  this.aditional_quantity = poproducts.aditional_quantity || 0;
  this.pop_status = poproducts.pop_status;
  this.due_date = poproducts.due_date;
  this.buyer_comment = poproducts.buyer_comment;
}

//For Admin
POproducts.createPOProducts = async function createPOProducts(req, result) {
    var insertdata = new POproducts(req);
    sql.query("INSERT INTO POproducts set ?", insertdata,async function(err, res) {
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

POproducts.updatePOProducts =async function updatePOProducts(req,popid, result) {
    var updatedata = new POproducts(req);
    sql.query("UPDATE POproducts set ? where popid = ?", [updatedata, popid],function(err, res) {
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

module.exports = POproducts;