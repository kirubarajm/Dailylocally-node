const firebase = require("firebase-admin");
var AdminserverKey = require("../eat-admin-firebase-adminsdk-znfbj-1be0493d85.json");
var Admin = null;

function initializeAppName() {
  if (!Admin) {
    Admin=firebase.initializeApp(
      {
        credential: firebase.credential.cert(AdminserverKey),
        databaseURL: "https://eat-admin.firebaseio.com"
      },
      "eat-admin"
    );
  } else{
    console.log("Sales name--->" + Admin.name);
  }
};

exports.sendNotificationWEB = function(
  token,
  dat,
) {
 initializeAppName();
 console.log("token-->",token);
 const options = {
  priority: "high",
  //timeToLive: 60 * 60 * 24 // 1 day
  //timeToLive: 60 * 60 * 2 // 2 hours
  timeToLive: 60 * 60 // 1 hours
};
// dat.content_available = '1';
var payload = {
  data: dat,
};
  
  // Send a message to the device corresponding to the provided
  // registration token.
  Admin.messaging().sendToDevice(token, payload, options)
    .then((response) => {
      // Response is a message ID string.
      console.log('ADMIN PUSH MESSAGE SENDING SUCCESSFULLY:', response);
    })
    .catch((error) => {
      console.log('ADMIN PUSH MESSAGE SENDING ERROR:', error);
    });
};

