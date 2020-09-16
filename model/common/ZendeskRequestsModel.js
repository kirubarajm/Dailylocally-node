"user strict";
var sql = require("../db.js");
const util = require('util');
const query = util.promisify(sql.query).bind(sql);
const constant = require('../constant.js');

//Task object constructor
var Zendeskrequest = function(zendeskrequest) {
  this.doid = zendeskrequest.doid;
  this.userid = zendeskrequest.userid;
  this.ticketid = zendeskrequest.ticketid;
  this.zendeskuserid = zendeskrequest.zendeskuserid;
  this.type = zendeskrequest.type;
  this.app_type = zendeskrequest.app_type || 0;
  this.tagid = zendeskrequest.tagid;
  this.issueid = zendeskrequest.issueid;
};

Zendeskrequest.createZendeskrequest =async function createZendeskrequest(req, result) {

  //  console.log("---------------->new_zendesk_request_create",req);

var get_zendesk= await query("select * from Zendesk_chat_requests where doid= "+req.doid+"  and issueid= "+req.issueid+" ")

var get_ticketid= await query("select * from Zendesk_chat_requests where doid= "+req.doid+"  order by id desc limit 1 ")

    if (get_zendesk.length==0) {

        if (get_ticketid.length !=0) {
            req.ticketid = get_ticketid[0].ticketid;
           
      

            Zendeskrequest.update_tags(get_ticketid[0].ticketid,req.issueid,req.community_status);
        }

        sql.query("INSERT INTO Zendesk_chat_requests  set ?", req, function(err, res) {
            if (err) {
              result(err, null);
              console.log(err);
            } else {
              console.log(res);
            //   let resobj = {
            //     success: true,
            //     status:true,
            //     message: "Zendesk requests created successfully"
            //   };
            //   result(null, resobj);
            }
          });
    }
  
};

Zendeskrequest.update_tags= async function update_tags(ticketid,issueid,community_status){
  var auth = "Basic " + Buffer.from(constant.Username + ":" + constant.Password).toString("base64");
  var headers= {
    'Content-Type': 'application/json',
    'Authorization': auth,
   };
    var getUrl="api/v2/tickets/"+ticketid+".json"
    var ticketURL=constant.zendesk_url+getUrl;
    var select_tags_query= "select zt.tag_name from Zendesk_issues zi left join Zendesk_tag zt on zt.tid=zi.tid where id ="+issueid
    var select_tags= await query(select_tags_query);
    request.get({headers: headers, url:ticketURL,method: 'GET'},async function (e, r, body) {
      // console.log("tags e--",e);
      // console.log("tags body--",body);
      var data = body;
      try {
         data = JSON.parse(body);
      } catch (e) {
          // console.log("e--",e);
      }
      if(data.ticket){
        var tags= data.ticket.tags;
        tags=tags.concat(select_tags);
      
        if (community_status==1) {
          dle_user = [
            {
                "dle_user": "dle_user",
            }
        ]
          tags=tags.concat(dle_user);
        }
        if(tags.length>0){
           var userdetails={
               ticket:{
                 tags: select_tags
               }
           }
           request.put({headers: headers, url:ticketURL, json: userdetails,method: 'PUT'},async function (e, r, body) {
            // console.log("tags e--",e);
            // console.log("tags body--",body);
        });
        }
      }
      
  });
    
};



module.exports = Zendeskrequest;
