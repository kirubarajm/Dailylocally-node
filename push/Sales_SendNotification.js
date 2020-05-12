const firebase = require("firebase-admin");
var SalesserverKey = require("../eat-sales-firebase-adminsdk-hq74m-40547586be.json");
var Sales = null;

function initializeAppName() {
  if (!Sales) {
    Sales=firebase.initializeApp(
      {
        credential: firebase.credential.cert(SalesserverKey),
        databaseURL: "https://eat-sales.firebaseio.com"
      },
      "eat-sales"
    );
  } else{
    console.log("Sales name--->" + Sales.name);
  }
};

exports.sendNotificationAndroid = function(
  token,
  dat,
) {
 initializeAppName();
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24 // 1 day
  };
  console.log("token:"+token);
  var payload = {
    data: dat
  };
  console.log("payload:"+payload.data.title);
  Sales.messaging().sendToDevice(token, payload, options);
};

