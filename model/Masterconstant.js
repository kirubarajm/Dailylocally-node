
//const paymentstatus ={"not_paid":"0","paid":"1"};
//const regionlist ={"1":"Tamil nadu","2":"Kerala specialist","3":"punjabi"};
'user strict';

var paymentstatus = Object.freeze({   
    0 : "not paid",
    1     : "padi"
  });

 var regionlist = Object.freeze({   
    1 : "Tamil nadu",
    2 : "Kerala specialist",
    3 : "punjabi"
});


function convert_NodeObj_To_AndroidJson(obj,keyname,valuename){
var result = Object.keys(obj,keyname).map(function(key) {
  return { key:Number(key), value:obj[key]};
});
return result;
}



//console.log(Object.entries(regionlist))
console.log(convert_NodeObj_To_AndroidJson(regionlist));

