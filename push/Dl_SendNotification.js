const firebase = require("firebase-admin");
var DLserverKey = require("../dl-app-9c47f-firebase-adminsdk-dgp75-7c570f4349.json");
var DL = null;


function initializeAppName () {
  if (!DL) {
    DL=firebase.initializeApp(
      {
        credential: firebase.credential.cert(DLserverKey),
        databaseURL: "https://daily-locally-v2.firebaseio.com"
      },
      "DL-app"
    );
  } else{
    console.log("DL name--->" + DL.name);
  }
  
  
};


exports.sendNotificationAndroid = function(token,dat,app_type) {
  initializeAppName();
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24 // 1 day
  };
 // dat.content_available = '1';
 console.log(token);
 console.log(dat);
 console.log(app_type);
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
  DL.messaging().sendToDevice(token, payload, options);
};
