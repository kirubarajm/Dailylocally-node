"user strict";
var sql = require("../db.js");
const nodemailer = require("nodemailer");
var constant = require("../constant");
const util = require("util");
const query = util.promisify(sql.query).bind(sql);
//Task object constructor
var Email = function(email) {
  this.faqid = email.faqid;
  this.question = email.question;
  this.answer = email.answer;
  this.type = email.type;
  // this.created_at = new Date();
};



// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'tovologies@tovogroup.com',
//       pass: 'Tovologies12!'
//     }
//   });

//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 465,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: 'tovologies@tovogroup.com', // generated ethereal user
//       pass: 'Tovologies12!' // generated ethereal password
//     }
//   })

Email.sendMailProductQuantity =async function sendMailProductQuantity(req, result) {

console.log("email service",req);

    var orderitems = await query("select productid from OrderItem where orderid= '"+req.orderid+"'");
    var product_list = [];
   

  if (orderitems.length !=0) {
    
  
   for (let i = 0; i < orderitems.length; i++) {
              var products = await query("select mh.address as HubName,pt.productid,pt.product_name as productName,mk.brandname,pt.quantity from Product as pt left Join MakeitUser as mk on mk.userid=pt.makeit_userid left join Makeit_hubs as mh on mk.makeithub_id=mh.makeithub_id where pt.productid ='"+orderitems[i].productid+"' and quantity=0 ");
              console.log(products);
              if (products.length !=0) {
           
                product_list = product_list.concat(products);
                // product_list.push(products);
              }
   }


    
    if (product_list.length !=0) {
   
      let message = (
        '<table style="border: 1px solid #333; width: 100% ">' +
        '<thead>' +
        '<th> HubName </th>' +
        '<th> productid </th>'  +
        '<th> productName </th>' +
        '<th> brandname </th>'  +
        '<th> quantity </th>'  +
        /*...*/
        '</thead>'
      ); 
      
      for(const { HubName, productid, productName,brandname, quantity/*...*/ } of product_list) {
         message += (
           '<tr>' +
            '<td>' + HubName + '</td>' +
            '<td>' + productid + '</td>' +
            '<td>' + productName + '</td>' +
            '<td>' + brandname + '</td>' +
            '<td>' + quantity + '</td>' +
            /*...*/
          '</tr>'
         );
      }
      
      message +=  '</table>';

    //   var results = [ { 
    //     asin: 'B01571L1Z4',
    //     url: 'domain.com',
    //     favourite: false,
    //     createdAt: '2016-11-18T19:08:41.662Z',
    //     updatedAt: '2016-11-18T19:08:41.662Z',
    //     id: '582f51b94581a7f21a884f40' 
    //   },
    //   { 
    //     asin: 'B01IM0K0R2',
    //     url: 'domain2.com',
    //     favourite: false,
    //     createdAt: '2016-11-16T17:56:21.696Z',
    //     updatedAt: '2016-11-16T17:56:21.696Z',
    //     id: 'B01IM0K0R2' 
    //    }];
    
    // var content = results.reduce(function(a, b) {
    //   console.log(b.asin);
    //   console.log(a.asin);
    //   return a + '<tr><td>' + b.asin + '</a></td><td>' + b.url + '</td><td>' + b.favourite + '</td><td>' + b.reatedAt + '</td></tr>';
    // }, '');
    
    // console.log(content);

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: constant.email_user,
          pass: constant.email_pass
        }
      });
      


      var maillist = [
        'Waziq@tovogroup.com',
        'Ashok@tovogroup.com',
        'runima@tovogroup.com',
      ];


      for (let i = 0; i < maillist.length; i++) {
       
        var mailOptions = {
          from: constant.email_user,
          to: maillist[i],
          subject: 'Dailylocally Low Quantity Alert',
          html: message,
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Message sent: ' + info.response);
            // let resobj = {
            //   success: true,
            //   status : true,
            //   message: info
            // };
      
            // result(null, resobj);
          }
        });
        
      }

     
    } 
    }
      
};


Email.send_commands_Mail =async function send_commands_Mail(email_list,ordercomments, result) {

  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: constant.email_user,
      pass: constant.email_pass
    }
  });
  


  // var maillist = [
  //   'Waziq@tovogroup.com',
  //   'Ashok@tovogroup.com',
  //   'runima@tovogroup.com',
  // ];

  if (email_list.length !=0) {
    var mailOptions = {
      from: constant.email_user,
      // to: email_list[i],
      subject: 'Dailylocally Commands Alert Dayorderid '+ordercomments.doid,
      html: ordercomments.comments,
    };
    
   
    

    email_list.forEach(function (to, i , array) {
      mailOptions.to = to;
    
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Message sent: ' + info.response);
         
        }
      });
    });
   
  }



  };

module.exports = Email;