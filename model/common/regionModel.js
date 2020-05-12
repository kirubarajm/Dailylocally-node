"user strict";
var sql = require("../db.js");


//Task object constructor
var Region = function(region) {
  this.regionname = region.regionname;
  this.stateid=region.stateid;
  this.lat=region.lat;
  this.lon=region.lon;
  this.region_image=region.region_image;
  this.slider_title=region.slider_title;
  this.slider_content=region.slider_content;
  this.region_detail_image=region.region_detail_image;
  this.special_dish_img=region.special_dish_img;
  this.identity_img=region.identity_img;
  this.tagline=region.tagline;
  this.specialities_food_content=region.specialities_food_content;
  this.active_status=region.active_status || 0;
  // this.created_at = new Date();
};

Region.createRegion = function createRegion(req, result) {
  sql.query("INSERT INTO Region  set ?", req, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      

      let resobj = {
        success: true,
        status : true,
        message: "Region created successfully"
        
      };

      result(null, resobj);
    }
  });
};

Region.read_a_region_id = function read_a_region_id(req, result) {
  var query = "Select * from Region where type = '" + req.type + "'";

  if (req.type && req.userid) {
    query = query + " and userid = '" + req.userid + "'";
  }
  query = query + "order by qid desc";


  sql.query(query, function(err, res) {
    if (err) {
      result(err, null);
    } else {
     
      let sucobj = true;
      let resobj = {
        sucobj: sucobj,
        status:true,
        result: res
      };
      result(null, resobj);
    }
  });
};

Region.getRegionByType = function getRegionByType(id, result) {
  sql.query("Select * from Region where type = ? ", id, function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      result(null, resobj);
    }
  });
};

Region.getAllregion = function getAllregion(result) {
  var regionquery = "Select regionid,regionname from Region where active_status = 1";
  //var regionquery = "Select * from Region";
  sql.query(regionquery, function(err, res) {
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

Region.procall = function procall(req, result) {
  sql.query("CALL `eattovo`.`eatusers`()", function(err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      let sucobj = "true";
      let resobj = {
        success: sucobj,
        result: res
      };
      console.log("resobj: ", resobj);
      result(null, resobj);
    }
  });
};

Region.updateById = function(id, user, result) {
  sql.query(
    "UPDATE Region SET task = ? WHERE faqid = ?",
    [task.task, id],
    function(err, res) {
      if (err) {
        console.log("error: ", err);
        result(null, err);
      } else {
        result(null, res);
      }
    }
  );
};

Region.remove = function(id, result) {
  sql.query("DELETE FROM Query_questions WHERE faqid = ?", [id], function(
    err,
    res
  ) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {
      result(null, res);
    }
  });
};


// Region.create_a_radius_limit_by_admin = function create_a_radius_limit_by_admin(req, result) {
 
 
//   client.set("radius", req.radius);
//   console.log(req.radius);
// client.quit();
// }


// Region.get_a_radius_limit_by_admin = function get_a_radius_limit_by_admin(req, result) {
 
// // This will return a Buffer since original key is specified as a Buffer
// client.get(new Buffer("radius"), function (err, reply) {
//     console.log(reply.toString()); // Will print `<Buffer 4f 4b>`
// });s
// client.quit();
// }
Region.search_a_search_region = function search_a_search_region(req, result) {
  sql.query("Select * from Region where regionname LIKE '%"+req.search+"%'", function(err, res) {
    if (err) {
      console.log("error: ", err);
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
module.exports = Region;
