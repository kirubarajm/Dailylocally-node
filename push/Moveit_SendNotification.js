const firebase = require("firebase-admin");
var geoFires = require('geofire');
var geodist = require('geodist')
var moment = require("moment");
var zone =require("../model/common/zoneModel")
var constant = require("../model/constant");

var MoveitserverKey = require("../moveit-a9128-firebase-adminsdk-3h0b8-6315acfc79");
var Move_it = null;
var geoFire =null;
function initializeAppName() {
  if (!Move_it) {
    Move_it = firebase.initializeApp(
      {
        credential: firebase.credential.cert(MoveitserverKey),
        databaseURL: "https://moveit-a9128.firebaseio.com/"
      },
      "move-it-app"
    );
    var firebaseRef = Move_it.database().ref('location');
    geoFire = new geoFires.GeoFire(firebaseRef);
    
  }else{
    
    console.log("Move_it name--->" + Move_it.name);
  }
};


exports.geoFireInsert= function(id,geoLocation,result){
  initializeAppName();
  if(!geoFire)  result(false,null);
  else{
  geoFire.set(id, geoLocation).then(function() {
    console.log("Provided key has been added to GeoFire");
    result(null,true);
  }, function(error) {
    console.log("Error: " + error);
    result(error,null);
  });
}
}

async function onGetKeyEntered(){
  var make_it_id=[];
   geoQuery.on("key_entered", function(key, location, distance) {
    //console.log(key + " entered query at " + location + " (" + distance + " km from center)");
    make_it_id.push(key)
  });

  
  return make_it_id;
}

exports.geoFireGetKeyByGeo= function(geoLocation,radius,result){
  initializeAppName();
  //console.log("geoLocation-->"+geoLocation);
  var make_it_id=[];
  var geoQuery = geoFire.query({
    center: geoLocation,
    radius: radius
  });
  
  var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
    console.log(key + " entered query at " + location + " (" + distance + " km from center)");
    make_it_id.push(key);
  });

  var onReadyRegistration = geoQuery.on("ready", function() {
    console.log("GeoQuery has loaded and fired all other events for initial data-->"+make_it_id);
    result(null,make_it_id);
    geoQuery.cancel();
  });
}

exports.geoFireGetKeyByGeoMakeit= async function(geoLocation,make_it_list,result){
  initializeAppName();
   var make_it_id=[];
  // var geoQuery = geoFire.query({
  //   center: geoLocation,
  //   radius: radius
  // });
  
  // var onKeyEnteredRegistration = geoQuery.on("key_entered", function(key, location, distance) {
  //   console.log(key + " entered query at " + location + " (" + distance + " km from center)");
  //   make_it_id.push(key);
  // });

  // var onReadyRegistration = geoQuery.on("ready", function() {
  //   console.log("GeoQuery has loaded and fired all other events for initial data-->"+make_it_id);
  //   geoQuery.cancel();
  //   return make_it_id;
  // });
   make_it_id=await getRandomNumber(make_it_list,geoLocation);
   result(null,make_it_id)
}

async function getRandomNumber(make_it_id,geoLocation) {
  var filterarray=[]
  await Promise.all(make_it_id.map(async function(item){
    await geoFire.get(""+item.userid).then(function(location) {
      if (location === null) {
        console.log("Provided key is not in GeoFire");
        item.islocation=false;
        item.distance=0;
      }else{
        var dist = geodist(geoLocation, location,{exact: true, unit: 'km'});
        console.log("Provided key has a location of " +geoLocation);
        item.distance= dist.toFixed(2);//new geoFires.GeoFire.distance(location1,location2);
        item.location= location;
        item.islocation=true;
       
      }
    }, function(error) {
      console.log("Error: " + error);
      item.islocation=false;
      item.distance=0;
    });
    // await firebaseRef.child(item).once('value').then(function(snapshot) {
    //     console.log(snapshot.val().online_status + "username at order_status--"+snapshot.val().order_status);
    //     if(snapshot.val().online_status===1&&snapshot.val().order_status===0)
    //     filterarray.push(item)
    //     console.log("make_it_id--",filterarray)
    //   });
    }))
    console.log("make-it--->",make_it_id);
  return make_it_id;
}

exports.geoFireGetMoveitLocation= async function(make_it_list,result){
  initializeAppName();
   var make_it_id=[];
   make_it_id=await getcurrentLocation(make_it_list);
   result(null,make_it_id)
}

async function getcurrentLocation(make_it_id) {
  var filterarray=[]
  await Promise.all(make_it_id.map(async function(item){
    await geoFire.get(""+item.userid).then(function(location) {
      if (location === null) {
        console.log("Provided key is not in GeoFire");
        item.islocation=false;
        item.distance=0;
      }else{
        item.location= location;
        item.islocation=true;
       
      }
    }, function(error) {
      item.islocation=false;
      item.distance=0;
    });
    console.log("make-it--->",make_it_id);
  }))
  return make_it_id;
}

exports.sendNotificationAndroid = function(
  token,
  dat,
) {
  initializeAppName();
  const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24 // 1 day
  };
  console.log("token moveit:-"+token);
  var payload = {
    data: dat
  };
  console.log("payload title:"+payload.data.title);
  console.log("payload orderid:"+payload.data.orderid);
  console.log("payload name:"+payload.data.name);
  console.log("moveit notification payload:"+payload);
  Move_it.messaging().sendToDevice(token, payload, options);
};


// exports.geoFireGetKeyByGeomoveitbydistance= async function(geoLocation,radius,result){
//   initializeAppName();
   
  

//   // var timeoutid = setTimeout(async function () {
  
//   //   move_it_id = await getmoveitlist(geoLocation,radius);
//   //   console.log(move_it_id);
//   //   result(null,move_it_id)
//   // },2000);
  
// }


// exports.geoFireGetKeyByGeomoveitbydistance = async function geoFireGetKeyByGeomoveitbydistance(geoLocation,radius,result) {
//   initializeAppName();

//   // var move_it_id=[];
//   // var geoQuery = geoFire.query({
//   //   center: geoLocation,
//   //   radius: radius
//   // });
  
//   // var onKeyEnteredRegistration = geoQuery.on("key_entered",async function(key, location, distance) {
//   //   console.log(key + " entered query at " + location + " (" + distance + " km from center)");
//   //  move_it_id.push(key);
//   //  //console.log(move_it_id);
//   // });
//   var move_it_id_distance_below_2=[];
//   var move_it_id_distance_above_2=[];
//   var move_data={};
//   var geoQuery = geoFire.query({
//     center: geoLocation,
//     radius: radius
//   });

//   const delay = ms => new Promise(res => setTimeout(res, ms))
//   //console.log("onKeyEnteredRegistration---->"+moment().format("YYYY-MM-DD HH:mm:ss"));
//   var onKeyEnteredRegistration = geoQuery.on("key_entered",async function(key, location, distance) {
//      console.log(key + " entered query at " + location + " (" + distance + " km from center)");
//   //  console.log("onKeyEnteredRegistration---->"+moment().format("YYYY-MM-DD HH:mm:ss"));

   
//     if(distance<=constant.order_assign_first_radius)  move_it_id_distance_below_2.push(key);
//     if(distance>constant.order_assign_first_radius && distance<=constant.order_assign_second_radius)  move_it_id_distance_above_2.push(key);
//     // move_data[key] = {};
//     // move_data[key].distance=distance;
//     // move_data[key].location=location;
//   });
  
//   var onReadyRegistration = geoQuery.on("ready", function (key, location, distance) {
//   });
 
//  await delay(2000);
//  move_data.moveitid_below_2=move_it_id_distance_below_2.toString();
//  move_data.moveitid_above_2=move_it_id_distance_above_2.toString();
//  result(null,move_data)
// }


exports.geoFireGetKeyByGeomoveitbydistance = async function geoFireGetKeyByGeomoveitbydistance(geoLocation,radius,result) {
  initializeAppName();

  // var move_it_id=[];
  // var geoQuery = geoFire.query({
  //   center: geoLocation,
  //   radius: radius
  // });
  
  // var onKeyEnteredRegistration = geoQuery.on("key_entered",async function(key, location, distance) {
  //   console.log(key + " entered query at " + location + " (" + distance + " km from center)");
  //  move_it_id.push(key);
  //  //console.log(move_it_id);
  // });
  var move_it_id_distance_below_2=[];
  var move_it_id_distance_above_2=[];
  var moveit_data_result = [];
  var move_data={};
  var geoQuery = geoFire.query({
    center: geoLocation,
    radius: radius
  });

  
  //let userPosition = CLLocation(geoLocation[0] , geoLocation[1])


  
  const delay = ms => new Promise(res => setTimeout(res, ms))
  //console.log("onKeyEnteredRegistration---->"+moment().format("YYYY-MM-DD HH:mm:ss"));
  var onKeyEnteredRegistration = geoQuery.on("key_entered",async function(key, location, distance) {
 // console.log(key + " entered query at " + location + " (" + distance + " km from center)");
  //  console.log("onKeyEnteredRegistration---->"+moment().format("YYYY-MM-DD HH:mm:ss"));

   
    // if(distance<=constant.order_assign_first_radius)  move_it_id_distance_below_2.push(key);
    // if(distance>constant.order_assign_first_radius && distance<=constant.order_assign_second_radius)  move_it_id_distance_above_2.push(key);
    // move_data[key] = {};
    // move_data[key].distance=distance;
    // move_data[key].location=location;
    // move_data[key].key=key;

    move_data = {};
    move_data.distance=distance;
    move_data.location=location;
    move_data.moveit_id=key;
    moveit_data_result.push(move_data);
  });
  
  var onReadyRegistration = geoQuery.on("ready", function (key, location, distance) {
  });
 
 await delay(2000);
//  move_data.moveitid_below_2=move_it_id_distance_below_2.toString();
//  move_data.moveitid_above_2=move_it_id_distance_above_2.toString();

 result(null,moveit_data_result)
}


async function get_moveit_list(geoLocation,radius) {
 
  var move_it_id=[];
  var geoQuery = geoFire.query({
    center: geoLocation,
    radius: radius
  });

  const delay = ms => new Promise(res => setTimeout(res, ms))
  var onKeyEnteredRegistration = geoQuery.on("key_entered",async function(key, location, distance) {
    console.log(key + " entered query at " + location + " (" + distance + " km from center)");
  
    move_it_id.push(key);
  
  });
 
 await delay(5000);
  console.log("test2"+move_it_id);
  return move_it_id;

  //return move_it_id;
}
// return new Promise(resolve => {
//   geoQuery.on("key_entered", function(key, location, distance) {
//       var temp = key;
//       temp.subscribe(data =>{
//          self.finalData.push(data);
//       });
//   });
// });

async function get_moveit_distance(move_it_id,geoLocation) {
  var filterarray=[]
  await Promise.all(move_it_id.map(async function(item){
    await geoFire.get(""+item.userid).then(function(location) {
      if (location === null) {
        console.log("Provided key is not in GeoFire");
        item.islocation=false;
        item.distance=0;
      }else{
        var dist = geodist(geoLocation, location,{exact: true, unit: 'km'});
        console.log("Provided key has a location of " +geoLocation);
        item.distance= dist.toFixed(2);//new geoFires.GeoFire.distance(location1,location2);
        item.location= location;
        item.islocation=true;
       
      }
    }, function(error) {
      console.log("Error: " + error);
      item.islocation=false;
      item.distance=0;
    });
    // await firebaseRef.child(item).once('value').then(function(snapshot) {
    //     console.log(snapshot.val().online_status + "username at order_status--"+snapshot.val().order_status);
    //     if(snapshot.val().online_status===1&&snapshot.val().order_status===0)
    //     filterarray.push(item)
    //     console.log("make_it_id--",filterarray)
    //   });
    }))
    console.log("make-it--->",move_it_id);
  return move_it_id;
}

exports.getInsideZoneMoveitList = async function getInsideZoneMoveitList(makeitLocation,make_it_list,result){
  initializeAppName();
   var make_it_id=[];
   await Promise.all(make_it_list.map(async function(item){
    await geoFire.get(""+item.userid).then(function(location) {
      if (location === null) {
        console.log("Provided key is not in GeoFire");
        item.islocation=false;
        item.distance=0;
      }else{
        var isZone =zone.pointInPolygon(JSON.parse(item.boundaries), { lat: ""+location[0], lng: ""+location[1] })
        console.log("lat-->",location[0]);
        console.log("lon-->",location[1]);
        console.log(item.boundaries);
        console.log("moveit--inside-->",isZone);
        if(isZone){
          var dist = geodist(makeitLocation, location,{exact: true, unit: 'km'});
          item.distance= dist.toFixed(2);
          item.location= location;
          item.islocation=true;
          make_it_id.push(item);
        }
      }
    }, function(error) {
      item.islocation=false;
      item.distance=0;
    });
  }))
  result(null,make_it_id)
}

exports.get_moveit_lat_long=async function get_moveit_lat_long(moveit_id,result) {
  console.log(moveit_id);
  var moveit_info={};
  initializeAppName()
 // await Promise.all(moveit_id.map(async function(item){
    await geoFire.get(""+moveit_id).then(function(location) {

     console.log(location);
     
       moveit_info.userid=moveit_id;
       if (location) {
       moveit_info.lat=location[0];
       moveit_info.long=location[1];
       }else{
        moveit_info.lat=0;
        moveit_info.long=0;
       }
      // if (location === null) {
      //   console.log("Provided key is not in GeoFire");
      //   item.islocation=false;
      //   item.distance=0;
      // }else{
      //   var dist = geodist(geoLocation, location,{exact: true, unit: 'km'});
      //   console.log("Provided key has a location of " +geoLocation);
      //   item.distance= dist.toFixed(2);//new geoFires.GeoFire.distance(location1,location2);
      //   item.location= location;
      //   item.islocation=true;
       
      // }
    }, function(error) {
      console.log("Error: " + error);
      // item.islocation=false;
      // item.distance=0;
    });
    // await firebaseRef.child(item).once('value').then(function(snapshot) {
    //     console.log(snapshot.val().online_status + "username at order_status--"+snapshot.val().order_status);
    //     if(snapshot.val().online_status===1&&snapshot.val().order_status===0)
    //     filterarray.push(item)
    //     console.log("make_it_id--",filterarray)
    //   });
    // }))
     console.log("moveit_info--->",moveit_info);
  // return moveit_info;
  result(null,moveit_info)
}