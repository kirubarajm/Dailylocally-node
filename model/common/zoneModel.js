"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

//Task object constructor
var Zone = function(zone) {
  this.Zonename = zone.Zonename;
  this.boundaries = zone.boundaries;
};

////Create Zone
Zone.createZone = function createZone(req, result) {
  sql.query("INSERT INTO Zone set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let resobj = {
        success: true,
        status: true,
        message: "Zone created successfully"
      };
      result(null, resobj);
    }
  });
};

////List All Zone Controller
Zone.get_all_zone = function get_all_zone(req, result) {
  var query = "Select * from Zone";

  if (req.boundaries == 1) {
    query = query + " where boundaries IS NOT NULL";
  } else if (req.boundaries == 0) {
    query = query + " where boundaries IS NULL";
  }
  //console.log("Zone query-->",query);
  sql.query(query, function(err, res) {
    if (err) {
      let resobj = {
        success: true,
        status: false,
        message:
          req.boundaries == 0
            ? "Unassign boundaries not avaiable"
            : "No boundaries avaiable"
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

////Update Zone
Zone.updateZone = function createZone(req, result) {
  var boundaries;
  if (req.isDelete) {
    boundaries = null;
  } else {
    if (req.boundaries) {
      boundaries = JSON.stringify(req.boundaries);
    } else {
      let resobj = {
        success: true,
        status: false,
        message: "Please send boundaries value"
      };
      result(null, resobj);
      return;
    }
  }

  sql.query(
    "UPDATE Zone set boundaries = ? WHERE id = ?",
    [boundaries, req.id],
    function(err, res) {
      if (err) {
        result(err, null);
      } else {
        Zone.updateMakeitZoneId(req.id);
        let resobj = {
          success: true,
          status: true,
          message: req.isDelete
            ? "Zone deleted successfully"
            : "Zone updated successfully"
        };
        result(null, resobj);
      }
    }
  );
};

////Get zone based on lat and lng
Zone.check_map_boundaries = function check_map_boundaries(req, result) {
  //console.log("Request =========>", req);
  sql.query("Select * from Zone where boundaries IS NOT NULL", function(
    err,
    res
  ) {
    if (err) {
      //console.log("err =========>", err);
      let resobj = {
        success: true,
        status: false,
        message: "No Zone Available."
      };
      result(null, resobj);
    } else {
      var isZone = false;
      var zoneName = "";
      if (res.length > 0) {
        for (var i = 0; i < res.length; i++) {
          var polygon = JSON.parse(res[i].boundaries);
          if (Zone.pointInPolygon(polygon, { lat: req.lat, lng: req.lon })) {
            zoneName = res[i].Zonename;
            isZone = true;
            break;
          }
        }
      }
      if (isZone) {
        let resobj = {
          success: true,
          status: true,
          message: "Inside Zone",
          zone_name: zoneName,
          zone_id: res[i].id
        };
        result(null, resobj);
        //console.log("Response =======>", resobj);
        //return resobj;
      } else {
        let resobj = {
          success: true,
          status: false,
          message: "No Zone Available."
        };
        result(null, resobj);
      }
    }
  });
};

////Get point In Polygon
Zone.pointInPolygon = function pointInPolygon(polygonPath, coordinates) {
  let numberOfVertexs = polygonPath.length - 1;
  let inPoly = false;
  let { lat, lng } = coordinates;
  let lastVertex = polygonPath[numberOfVertexs];
  let vertex1, vertex2;
  let x = lat,
    y = lng;
  let inside = false;
  for (var i = 0, j = polygonPath.length - 1; i < polygonPath.length; j = i++) {
    let xi = polygonPath[i].lat,
      yi = polygonPath[i].lng;
    let xj = polygonPath[j].lat,
      yj = polygonPath[j].lng;

    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

////Check Boundaries
Zone.check_boundaries = async function check_boundaries(req) {
  //console.log("Request =========>", req);
  var res = await query("Select * from Zone where boundaries IS NOT NULL");

  var isZone = false;
  var zoneName = "";
  if (res && res.length > 0) {
    for (var i = 0; i < res.length; i++) {
      var polygon = JSON.parse(res[i].boundaries);
      if (Zone.pointInPolygon(polygon, { lat: req.lat, lng: req.lon })) {
        zoneName = res[i].Zonename;
        isZone = true;
        break;
      }
    }
  }
  if (isZone) {
    let resobj = {
      success: true,
      status: true,
      message: "Inside Zone",
      zone_name: zoneName,
      zone_id: res[i].id
    };
    return resobj;
    //console.log("Response =======>", resobj);
    //return resobj;
  } else {
    let resobj = {
      success: true,
      status: false,
      message: "No Zone Available."
    };
    //console.log("Response =======>", resobj);
    return resobj;
  }

};

Zone.updateMakeitZoneId = function updateMakeitZoneId(zoneid) {
  console.log("zoneid =========>", zoneid);
  sql.query("Select * from Zone where id=" + zoneid, async function(err, res) {
    if (err) {
      console.log("err =========>", err);
    } else {
      console.log("boundaries =========>", res[0].boundaries);
      if (res[0].boundaries) {
        var makeit_list = await query("select * from MakeitUser");
        var makeit_ids='';
        console.log("makeit_list length =========>",makeit_list.length);
        if (makeit_list.length > 0) {
          for (var i = 0; i < makeit_list.length; i++) {
            var polygon = JSON.parse(res[0].boundaries);
            var makeit = makeit_list[i];
            if (Zone.pointInPolygon(polygon, { lat: makeit.lat, lng: makeit.lon })) {
              makeit_ids=makeit_ids+','+makeit.userid;
              await query("update MakeitUser set zone = "+zoneid+" where userid="+makeit.userid);
            }else if(zoneid===makeit.zone){
              await query("update MakeitUser set zone = 0 where userid="+makeit.userid);
            }
            
          }
        }
        console.log("zone changed makeit id=========>", makeit_ids);
      }else{
        await query("update MakeitUser set zone = 0 where zone ="+zoneid);
      }
    }
  });
};


////Update Zone
Zone.update_a_xfactore = function update_a_xfactore(req, result) {

  sql.query("UPDATE Zone set xfactor = '"+req.xfactor+"' WHERE id = '"+req.id+"'",function(err, res) {
      if (err) {
        result(err, null);
      } else {
        let resobj = {
          success: true,
          status: true,
          message: "Zone xfactor updated successfully"           
        };
        result(null, resobj);
      }
    }
  );
};
module.exports = Zone;