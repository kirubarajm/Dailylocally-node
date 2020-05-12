"user strict";
var sql = require("../db.js");

//Task object constructor
var Localities = function(locality) {
  this.localityname = locality.localityname;
  this.lat_range = locality.lat_range;
  this.long_range = locality.long_range;
  //this.created_at = new Date();
};

Localities.createLocality = function createLocality(newUser, result) {
  sql.query("INSERT INTO Locality set ?", newUser, function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res.insertId);
    }
  });
};

Localities.getLocalityById = function getLocalityById(id, result) {
  sql.query("Select * from Locality where localityid = ? ", id, function(
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

Localities.getAllLocality = function getAllLocality(result) {
  sql.query("Select * from Locality", function(err, res) {
    if (err) {
      result(err, null);
    } else {
      result(null, res);
    }
  });
};

Localities.updateById = function(id, locality, result) {
  sql.query(
    "UPDATE MoveitUser SET Locality = ? WHERE localityid = ?",
    [locality.task, id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        result(null, res);
      }
    }
  );
};

Localities.remove = function(id, result) {
  sql.query("DELETE FROM Locality WHERE localityid = ?", [id], function(
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

module.exports = Localities;
