"user strict";
var sql = require("../db.js");

//Task object constructor
var Hometown = function(hometown) {
  this.hometownname = hometown.hometownname;
  this.regionid = hometown.regionid;
 
};

Hometown.createHometown = function createHometown(req, result) {
  sql.query("INSERT INTO Hometown  set ?", req, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status:true,
        message: "Region created successfully"
      };
      result(null, resobj);
    }
  });
};

Hometown.read_a_region_id = function read_a_region_id(req, result) {
  var query = "Select * from Hometown";
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

Hometown.getRegionByType = function getRegionByType(id, result) {
  sql.query("Select * from Hometown where type = ? ", id, function(err, res) {
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

Hometown.getAllHometown = function getAllHometown(result) {
  sql.query("Select hometownid,hometownname,regionid from Hometown where delete_status=0", function(err, res) {
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


Hometown.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Hometown SET task = ? WHERE faqid = ?",
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

Hometown.remove = function(id, result) {
  sql.query("DELETE FROM Hometown WHERE faqid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

module.exports = Hometown;
