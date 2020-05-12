const firebase = require("firebase-admin");
var MakeitserverKey = require("../eat-make-it-firebase-adminsdk-e2nig-ce55a4bc4c.json");
var Makeit = null;

function initializeAppName (){
  if (!Makeit) {
    Makeit=firebase.initializeApp(
      {
        credential: firebase.credential.cert(MakeitserverKey),
        databaseURL: "https://eat-make-it.firebaseio.com"
      },
      "eat-make-it"
    );
  } else{
    console.log("Makeit name--->" + Makeit.name);
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
 // console.log("token:"+token);
  var payload = {
    data: dat
  };
//console.log("-------->",dat.app_type);
payload.data.app_type=''+dat.app_type;
  if (dat.app_type===2) {
  //  dat.app_type=''+dat.app_type;
    payload.notification= {
      title: dat.title,
      body: dat.message, // <= CHANGE
      sound : "default"
    }
  }
  //console.log("payload:"+payload.data.title);
  Makeit.messaging().sendToDevice(token, payload, options);
};

