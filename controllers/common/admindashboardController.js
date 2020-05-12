"use strict";
var admindashboardModel = require("../../model/common/admindashboardModel");

exports.get_all_dashboard_count = function(req, res) {
    admindashboardModel.get_all_dashboard_count_by_admin(function(err, result) {
        if (err) res.send(err);
        res.send(result);
  });
};
