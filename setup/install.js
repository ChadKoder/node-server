var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Photo Dash',
  description: 'A Node.js server for saving files from the Photo Dash iOS application.',
  script: 'C:/Users/Chad/Desktop/GitHub/dash-server/server.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
	console.log('Installing Dash Server...');
	svc.start();
	console.log('Dash Server is now running...');
});

svc.install();
