const express = require("express"),
  app = express(),
  bodyParser = require("body-parser");
  ////// Demon Url ////
  domainname = "http://68.183.87.233";
  /// Live Url ////
  // domainname = "http://dailylocally.co.in/";


port = process.env.PORT || 4000;
var cors = require("cors");



app.listen(port);
const fileUpload = require("express-fileupload");

console.log("API server started on: " + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// default options
app.use(fileUpload());
app.use(express.static(__dirname));

 //importing routes
var dlRoutes = require("./routes/dlRoutes"); //importing route
var webhookRoutes = require("./routes/webhookRoutes"); //importing webhook route
var categoryRoutes = require("./routes/categoryRoutes");
var adminRoutes = require("./routes/adminRoutes");
var moveitRoutes = require("./routes/moveitRoutes");

dlRoutes(app); //register the dailyLocally routes
webhookRoutes(app); //register the webhookRoutes routes
categoryRoutes(app); //register the categoryRoutes routes
adminRoutes(app); //register the adminRoutes routes
moveitRoutes(app);