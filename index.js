// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var ParseDashboard = require('parse-dashboard');
var path = require('path');

var port = process.env.PORT || 1337;
var app_name = "Parse-Dashboard"
var app_id = "myAppId";
var master_key = "myMasterKey";
var server_url = "http://localhost:"+port+"/parse";
var database_uri = "mongodb://localhost:27017/"+app_name || "mongodb://localhost:27017/dev";

var api = new ParseServer({
  databaseURI: process.env.DATABASE_URI || process.env.MONGODB_URI || database_uri,
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || app_id,
  masterKey: process.env.MASTER_KEY || master_key, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || server_url,  // Don't forget to change to https if needed
  liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var options = { allowInsecureHTTP: false };

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": server_url,
      "appId": app_id,
      "masterKey": master_key,
      "appName": app_name
    },
    {
      "serverURL": server_url,
      "appId": "dkMnPHZlsj2E8w8fm6vTa4rWWhYBCljHoJL8lUMR",
      "masterKey": "3pkvzP4mRFuW650XauJobuJ45N0UVcpg0ETB5jLI",
      "appName": "instagram-clone"
    },
    {
      "serverURL": server_url,
      "appId": "sMCqrsyO4j9mRY3EpS5GCvpgjOquXaL7BVPfSisH",
      "masterKey": "jUlBX8nnDLLWrQ3hUQyXZC1qTtMENEQ0pnh2BDUw",
      "appName": "twitter-clone"
    }
  ]
}, options);

var app = express();

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server Dashboard on the /dashboard prefix
app.use('/dashboard', dashboard);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('Parse server is running');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});


var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
