'user strict';

var authentication = require('../dbConnection.js');

var mysql = require('mysql');

//local mysql db connection
var connection = mysql.createConnection(authentication);

connection.connect(function(err) {
    if (err) throw err;
});

module.exports = connection;



//'user strict';

//var authentication = require('../dbConnection.js');
// var fs = require('fs');
// var path = require('path')
// var EatserverKey = fs.readFileSync(path.resolve(__dirname, '../eat.pem'));
// var mysql2 = require('mysql2');
// var SSH2Client = require('ssh2').Client;

// //const filename = fs.readFileSync(EatserverKey);

// async function newconnection(){
//   var connection;
//   var sshConf = {
//     host: '13.127.100.137',
//     port: 22,
//     username: 'ubuntu',
//     privateKey: EatserverKey,
//   };
//   var sqlConf = {
//     host: 'localhost',
//     port: 3306,
//     user: 'eattovo',
//     password: 'Eat_2020',
//     database: 'eattovo',
//   };
  
//   var ssh = new SSH2Client();
//   await ssh.on('ready', function() {
//     ssh.forwardOut(
//       // source IP the connection would have came from. this can be anything since we
//       // are connecting in-process
//       '127.0.0.1',
//       // source port. again this can be randomized and technically should be unique
//       24000,
//       // destination IP on the remote server
//       '127.0.0.1',
//       // destination port at the destination IP
//       3306,
//        function(err, stream) {
        
//         // you will probably want to handle this better,
//         // in case the tunnel couldn't be created due to server restrictions
//         if (err) throw err;
  
//         // if you use `sqlConf` elsewhere, be aware that the following will
//         // mutate that object by adding the stream object for simplification purposes
//         sqlConf.stream = stream;
//         connection = mysql2.createConnection(sqlConf);
//         connection.connect(function(err){
//           if(!err) {
//             console.log("Database is connected--->"+connection);
//             connection.query("SELECT * FROM User", function(err, rows) {
//               // Connection is automatically released when query resolves.
//               console.log("Database is connected--->"+rows);
//            })
//             console.log("Database is connected");
//           }else {
//             console.log("Error while connecting with database");
//             }
//         })
  
//         // now use `db` to make your queries
//       }
//     );
//   });
//   ssh.connect(sshConf);
//   return connection;
// };
//  var connection = newconnection();
// module.exports=connection;