"user strict";

var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);

var POproducts = function(poproducts) {
  this.prid = poproducts.prid;
  this.pid = poproducts.pid;
  this.vid = poproducts.vid;
  this.cost = poproducts.cost;
  this.other_charges = poproducts.other_charges;
  this.requested_quantity = poproducts.requested_quantity;
  this.received_quantity = poproducts.received_quantity;
  this.aditional_quantity = poproducts.aditional_quantity;
  this.pop_status = poproducts.pop_status;
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

POproducts.updatePOProducts =async function updatePOProducts(req, result) {
    sql.query("UPDATE POproducts SET ? WHERE popid = ?", [req, req.poid],async function(err, res) {
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