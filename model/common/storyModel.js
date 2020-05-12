"user strict";
var sql = require("../db.js");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);

const SubStories =  require("../../model/common/substoriesModel");

var Stories = function(stories) {
    this.thumb = stories.thumb;
    this.thumb_title   = stories.thumb_title;
    this.title = stories.title;
    this.description  = stories.description;
    this.story_img  = stories.story_img;
    this.first_story_duration  = stories.first_story_duration;

   // this.aid  = story.aid;    //this.created_at = new Date();
  };
  

  Stories.createnewstory = function createnewstory(createnewstory,storylist,result) {
     
    sql.query("INSERT INTO Stories set ?", createnewstory, function(err, res) {
      if (err) {          
        result(err, null);
      } else{

        var storyid = res.insertId;
        for (var i = 0; i < storylist.length; i++) {
          var SubStories_item = new SubStories(storylist[i]);
          SubStories_item.storyid = storyid;
          SubStories.createnewSubStories(SubStories_item, function(err, res1) {
            if (err) {          
              result(err, null);
            }  
          });
        }
  
  
        let resobj = {
          success: true,
          status : true,
          message: "Stories created successfully"
          
        };
  
        result(null, resobj);
      } 
  
    });
  };


  Stories.getAllStories = async function getAllStories(req,result) {

    var storyquery = "select * from Stories";
  
 
       sql.query(storyquery,async function(err, res) {
        if (err) {
          console.log("error: ", err);
          result(null, err);
        } else {
         
          for (let i = 0; i < res.length; i++) {
                    //console.log(res[i].storyid);
                    var stories = await query("select * from Story where storyid = '"+res[i].storyid+"'");
                    
                    
                    res[i].stories= stories;
            }

          let resobj = {
            success: true,
            status:true,
            result: res
          };
          result(null, resobj);
        }
      });


  };
  
  
  
module.exports = Stories;