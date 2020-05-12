"use strict";

var Allocation = require("../../model/sales/allocationModel.js");

exports.list_all_allocation = function(req, res) {
  Allocation.getAllAllocation(function(err, allocation) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", allocation);
    res.send(allocation);
  });
};

exports.list_all_allocation_by_salesempid = function(req, res) {
  if (!req.params.id) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide sales_emp_id" });
  } else {
    console.log("V1--> 1.0.0");
  Allocation.getAllocationBySalesEmpId(req.params.id, function(
    err,
    allocation
  ) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", allocation);
    res.send(allocation);
  });
}
};


exports.list_all_today_tasklist_by_salesempid = function(req, res) {
  if (!req.params.id) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide sales_emp_id" });
  } else {
    console.log("V1--> 1.0.0");
  Allocation.tasklistSalesId(req.params.id, function(err,allocation) {
    console.log("controller");
    if (err) res.send(err);
    res.send(allocation);
  });
}
};

exports.list_all_allocation_by_salesempid_V2 = function(req, res) {
  if (!req.params.id) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide sales_emp_id" });
  } else {
    console.log("V2--> 2.0.0");
  Allocation.getAllocationBySalesEmpId(req.params.id, function(
    err,
    allocation
  ) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", allocation);
    res.send(allocation);
  });
}
};

exports.create_a_allocation = function(req, res) {
  //handles null error
  if (!req.body.sales_emp_id) {
    res
      .status(400)
      .send({ error: true, message: "Please provide sales_emp_id" });
  } else {
    Allocation.updateAllocation(req.body, function(err, allocation) {
      if (err) res.send(err);
      res.json(allocation);
    });
  }
};

exports.read_a_allocation = function(req, res) {
  Allocation.getAllocationById(req.params.id, function(err, allocation) {
    if (err) res.send(err);
    res.json(allocation);
  });
};

exports.update_a_allocation = function(req, res) {
  Allocation.updateById(req.params.id, new Allocation(req.body), function(
    err,
    allocation
  ) {
    if (err) res.send(err);
    res.json(allocation);
  });
};

exports.delete_a_allocation = function(req, res) {
  Allocation.remove(req.params.id, function(err, allocation) {
    if (err) res.send(err);
    res.json({ message: "Allocation successfully deleted" });
  });
};

exports.update_a_followupstatus = function(req, res) {
  if (!req.body.status) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide status" });
  } else if (!req.body.makeit_userid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide makeit_userid" });
  }else if (!req.body.sales_emp_id) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide sales_emp_id" });
  }else if (!req.body.aid) {
    res
      .status(400)
      .send({ error: true, status: false, message: "Please provide aid" });
  } else {
  Allocation.update_a_followupstatus(req.body, function(
    err,
    allocation
  ) {
    if (err) res.send(err);
    res.json(allocation);
  });
}
};


exports.list_all_history_by_salesempid = function(req, res) {
  if (!req.params.userid) {
    res
      .status(400)
      .send({ error: true,status:false, message: "Please provide sales_emp_id" });
  } else {
  Allocation.getHistoryBySalesEmpId(req.params.userid, function(err,allocation) {
    if (err) res.send(err);
    console.log("res", allocation);
    res.send(allocation);
  });
}
};



exports.list_all_allocation_by_admin = function(req, res) {

  Allocation.list_all_allocation_by_admin(req.body, function(err,allocation) {
    console.log("controller");
    if (err) res.send(err);
    console.log("res", allocation);
    res.send(allocation);
  });

};