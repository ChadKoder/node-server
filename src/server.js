	var formidable = require('formidable'),
		assert = require('assert'),
		MongoClient = require('mongodb').MongoClient,
		os = require('os'),
		http = require('http'),
		util = require('util'),
		fs = require('fs.extra'),
		users = require('./users.json'),
		path = require('path'),
		url = require('url'),
		express = require('express'),
		app = express();
		
	var server = this;
	
	server.renderFile = function (res, fileName){
		fileSystem.readFile(fileName, 'binary', function(err, file){
				if (err) {
					console.log('error rendering file : ' + fileName + ' err: ' + err);
					responseHandler.write500InternalError(res, err);
					return;
				}
				
				responseHandler.write200Success(res, file);
			});
	};
		
	var DatabaseService = require('./js/functions/databaseService.js');
	var ResponseHandler = require('./js/functions/responseHandler.js');
	var Authentication = require('./js/functions/authentication.js');
	var Router = require('./js/functions/router.js');
	
	
	var authentication = new Authentication(users);
	var responseHandler = new ResponseHandler();
	var databaseService = new DatabaseService(MongoClient, assert, responseHandler);
	var FileHandler = require('./js/functions/fileHandler.js');
	var fileHandler = new FileHandler(formidable, fs, path, os, responseHandler, databaseService);
	var router = new Router(responseHandler, Buffer, fileHandler, authentication, fs, databaseService, path, url);
	var httpHandler = require('./js/functions/httpHandler')(router, responseHandler);
	
	const PORT = 8888;
	const MINUTES = 50;
	var interval = MINUTES * 60 * 1000;
	var serverAdd = 'http://localhost:' + PORT;

	var deleteTempFiles = function (){
		console.log('checking for uploads...');
		var files = fs.readdirSync(os.tmpdir());
		var filesToDelete = [];
		
		for (var i = 0; i < files.length; i++){
			var uploadString = files[i].substring(0, 7);
			
			if (uploadString === 'upload_'){
				filesToDelete.push(files[i]);
			}
		}
		
		if (filesToDelete.length === 0){
			console.log('No Uploads Found...........');
			return;
		}
		
		for (var d = 0; d < filesToDelete.length; d++){
			var deleteMe = path.join(os.tmpdir(), filesToDelete[d]);
			console.log('deleting file===> ' + deleteMe);
			fs.unlinkSync(deleteMe);
		}
	};
	
	
	
	/*app.get('/node/express/', function (req, res) {
		fileName += './views/index-server.html';
		server.renderFile(res, fileName);
	});*/
	
	app.post('/files', function(req, res) {
		var settings = databaseService.getSettings();
		var authHeader = req.headers['authorization']; 
		if (authHeader){
			var auth = authHeader.split(' ')[1];
			var credString = Buffer(auth, 'base64').toString();
			var creds = credString.split(':');
		
			if (creds) {
				var userName = creds[0];
				var pass = creds[1];
				
				if (!authentication.validateUser(userName, pass)) {
					responseHandler.write401Unauthorized(res);
					return;
				} else {
					fileHandler.handle(res, req);
				}
			}
		} else {
			console.log('unauthorized user...');
			responseHandler.write401Unauthorized(res);
			return;
		}
	});
	
	app.delete('/settings', function (req, res) {
		console.log('got DELETE settings...');
		var success = databaseService.deleteSettings();
		if (success) {
			responseHandler.res(res);
		} else {
			responseHandler.write500InternalError(res, 'Failed to delete settings.');
		}

	});
	
	app.get('/settings', function (req, res) {
		
		
		
		databaseService.getSettings(function(settings){
			console.log('SetTTINGS: ' + JSON.stringify(settings));
			responseHandler.write200OKWithData(res, JSON.stringify(settings));
		});
	}); 
	
	app.post('/settings', function (req, res) {
		var data = '';
		req.on('data', function (chunk) {
			if (chunk) {
				data += chunk;
			}
		});
		
		req.on('end', function (){
			if (data.length > 0){
				var settings = JSON.parse(data);
				
				if (settings){
					var ipAddress = settings.ipAddress;
					var uploadDir = settings.uploadDir;
					var deviceName = settings.deviceName;
					var credStr = Buffer(settings.credentials, 'base64').toString();
					var albumName = settings.albumName;
					
					var creds = credStr.split(':');
					var username = creds[0];
					var pass = creds[1];
					
					if (!authentication.validateUser(username, pass)) {
						console.log('unauthorized user: ' + username);
						responseHandler.write401Unauthorized(res);
						return;
					} else {
						var success = databaseService.saveSettings(res, ipAddress, settings.credentials,
						uploadDir, deviceName, albumName,
						function (success){
							if (success){
								responseHandler.write200Success(res);
								return;
							} else {
								
								responseHandler.write500InternalError(res, 'error');
								return;
							}
						});
					}
				} else {
					console.log('no settings to save...');
					responseHandler.write204NoContent(res);
					return;
				}
			}
		});
	});

	//Call once to clean temp files instead of waiting for timer, if any
	deleteTempFiles();
	
	app.listen(PORT);
	
	console.log('Listening on port --> ' + PORT + '/\nCTRL+C to shutdown');
	