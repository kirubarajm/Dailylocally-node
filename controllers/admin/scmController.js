"use strict";

var SCM = require("../../model/admin/scmModel.js");

/////////Waiting PO List///////////
exports.waiting_po_list = function(req, res) {    
    SCM.waiting_po_list(req.body, function(err, ress) {
        //console.log("waiting_po_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Product Wise Vendor List///////////
exports.product_wise_vendor_list = function(req, res) {    
    SCM.product_wise_vendor_list(req.body, function(err, ress) {
        //console.log("product_wise_vendor_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Product Vendor assign///////////
exports.product_vendor_assign = function(req, res) {    
    SCM.product_vendor_assign(req.body, function(err, ress) {
        //console.log("product_wise_vendor_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update POtemp quantity///////////
exports.update_potemp_quantity = function(req, res) {    
    SCM.update_potemp_quantity(req.body, function(err, ress) {
        //console.log("update_potemp_quantity controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Create PO///////////
exports.create_po = function(req, res) {    
    SCM.create_po(req.body, function(err, ress) {
        //console.log("create_po controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get PO List///////////
exports.get_po_list = function(req, res) {    
    SCM.get_po_list(req.body, function(err, ress) {
        //console.log("get_po_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get PO receive List///////////
exports.get_po_receive_list = function(req, res) {    
    SCM.get_po_receive_list(req.body, function(err, ress) {
        //console.log("get_po_receive_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update PO receive///////////
exports.update_po_receive = function(req, res) {    
    SCM.update_po_receive(req.body, function(err, ress) {
        //console.log("update_po_receive controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update PO un-receive///////////
exports.update_po_unreceive = function(req, res) {    
    SCM.update_po_unreceive(req.body, function(err, ress) {
        //console.log("update_po_unreceive controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////pop to dayorder soring///////////
exports.pop_to_dayorder = function(req, res) {    
    SCM.pop_to_dayorder(req.body, function(err, ress) {
        //console.log("pop_to_dayorder controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////Auto stock to dayorder product assign//////
exports.auto_stock_to_dayorder = function(req, res) {    
    SCM.auto_stock_to_dayorder(req.body, function(err, ress) {
        //console.log("auto_stock_to_dayorder controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////View PO///////////
exports.view_po = function(req, res) {    
    SCM.view_po(req.body, function(err, ress) {
        //console.log("view_po controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////// PO PDF ////////
exports.po_pdf = function(req, res) {
    SCM.po_pdf(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
};

/////// Invoice PDF ////////
exports.invoice_pdf = function(req, res) {
    SCM.invoice_pdf(req.body, function(err, result) {
      if (err) res.send(err);
      res.json(result);
    });
};

/////////Delete PO///////////
exports.delete_po = function(req, res) {    
    SCM.delete_po(req.body, function(err, ress) {
        //console.log("delete_po controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Close PO///////////
exports.close_po = function(req, res) {    
    SCM.close_po(req.body, function(err, ress) {
        //console.log("close_po controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Delete POtemp///////////
exports.delete_po_temp = function(req, res) {    
    SCM.delete_po_temp(req.body, function(err, ress) {
        //console.log("delete_po_temp controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////List Of Delete PO Reason///////////
exports.delete_po_reson_list = function(req, res) {    
    SCM.delete_po_reson_list(req.body, function(err, ress) {
        //console.log("delete_po_reson_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Remove BOH Mapping///////////
exports.remove_boh_mapping = function(req, res) {    
    SCM.remove_boh_mapping(req.body, function(err, ress) {
        //console.log("remove_boh_mapping controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

///////PO Auto Creation Loop//////
exports.autopopdfcreate = function(req, res) {    
    SCM.autopopdfcreate(req.body, function(err, ress) {
        //console.log("autopopdfcreate controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

///////Invoice Auto Creation Loop//////
exports.autoinvoicepdfcreate = function(req, res) {    
    SCM.autoinvoicepdfcreate(req.body, function(err, ress) {
        //console.log("autoinvoicepdfcreate controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get Sorting List///////////
exports.get_soring_list = function(req, res) {    
    SCM.get_soring_list(req.body, function(err, ress) {
        //console.log("get_soring_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Save Sorting///////////
exports.save_sorting = function(req, res) {    
    SCM.save_sorting(req.body, function(err, ress) {
        //console.log("save_sorting controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Move to QA///////////
exports.move_to_qa = function(req, res) {    
    SCM.move_to_qa(req.body, function(err, ress) {
        //console.log("move_to_qa controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Sorting Missing Quantity Report///////////
exports.missing_quantity_report = function(req, res) {    
    SCM.missing_quantity_report(req.body, function(err, ress) {
        //console.log("missing_quantity_report controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

////////Get Quality Type List/////////////
exports.quality_type_list = function(req, res) {    
    SCM.quality_type_list(req.body, function(err, ress) {
        //console.log("quality_type_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

////////Update Quantity Check/////////////
exports.quality_check_product = function(req, res) {    
    SCM.quality_check_product(req.body, function(err, ress) {
        //console.log("quality_check_product controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Get Retutn List///////////
exports.get_return_list = function(req, res) {    
    SCM.get_return_list(req.body, function(err, ress) {
        //console.log("get_return_list controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Update Retutn Orders///////////
exports.update_return_orders = function(req, res) {    
    SCM.update_return_orders(req.body, function(err, ress) {
        //console.log("update_return_orders controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};

/////////Admin Return Reorder///////////
exports.return_reorder = function(req, res) {    
    SCM.return_reorder(req.body, function(err, ress) {
        //console.log("return_reorder controller");
        if (err) res.send(err);
        //console.log("res", ress);
        res.send(ress);
    });    
};