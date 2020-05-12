const firebase = require("firebase-admin");
var EatserverKey = require("../eat-app-9c47f-firebase-adminsdk-dgp75-7c570f4349.json");
var EAT = null;


function initializeAppName () {
  if (!EAT) {
    EAT=firebase.initializeApp(
      {
        credential: firebase.credential.cert(EatserverKey),
        databaseURL: "https://eat-app.firebaseio.com"
      },
      "eat-app"
    );
  } else{
    console.log("EAT name--->" + EAT.name);
  }
  
  
};


exports.sendNotificationAndroid = function(token,dat,app_type) {
  initializeAppName();
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24 // 1 day
  };
 // dat.content_available = '1';
  var payload = {
    data: dat,
    // notification: {
    //   title: dat.title,
    //   body: dat.message, // <= CHANGE
    //   sound : "default"
    // }
  };
  if (app_type===2) {
    dat.app_type=''+app_type;
    payload.notification= {
      title: dat.title,
      body: dat.message, // <= CHANGE
      sound : "default"
    }
  }
  console.log("token-->",token+""+payload.data);
  EAT.messaging().sendToDevice(token, payload, options);
};
