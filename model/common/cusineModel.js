"user strict";
var sql = require("../db.js");

//Task object constructor
var Cuisine = function(ciusine) {
  this.regionname = cusine.cuisinename;
  // this.created_at = new Date();
};

Cuisine.createCuisine = function createCuisine(req, result) {
  sql.query("INSERT INTO Cusine  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Cusine created successfully"
      };
      result(null, resobj);
    }
  });
};

Cuisine.read_a_Cusine_id = function read_a_Cusine_id(req, result) {
  var query = "Select * from Cusine where type = '" + req.type + "'";
  if (req.type && req.userid) {
    query = query + " and userid = '" + req.userid + "'";
  }
  query = query + "order by qid desc";
  sql.query(query, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

Cuisine.getCusineByType = function getCusineByType(id, result) {
  sql.query("Select * from Cusine where type = ? ", id, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

Cuisine.getAllcuisine = function getAllcuisine(result) {
  sql.query("Select cuisineid,cuisinename from Cuisine", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

Cuisine.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Cusine SET task = ? WHERE faqid = ?",
    [task.task, id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Cuisine.remove = function(id, result) {
  sql.query("DELETE FROM Cusine WHERE faqid = ?", [id], function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Cuisine;
