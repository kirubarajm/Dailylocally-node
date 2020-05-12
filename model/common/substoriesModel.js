"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

var SubStories = function(substories) {
    this.mediatype = substories.mediatype;
    this.url   = substories.url;
    this.storyid = substories.storyid;
    this.pos  = substories.pos;
    this.title  = substories.title;
    this.subtitle  = substories.subtitle;
    this.cat_type  = substories.cat_type;
    this.cat_ids  = substories.cat_ids;
    this.duration  = substories.duration;

   // this.aid  = story.aid;    //this.created_at = new Date();
  };
  

  SubStories.createnewSubStories = function createnewSubStories(SubStories,result) {
     
    sql.query("INSERT INTO Story set ?", SubStories, function(err, res) {
        if (err) {          
            result(err, null);
          } else{
    
            var storyid = res.insertId;
        
      
            let resobj = {
              success: true,
              status : true,
              message: "Stories created successfully"
              
            };
      
            result(null, resobj);
          } 
  

          
      });
  };

   
module.exports = SubStories;