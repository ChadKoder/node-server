var qs = require('querystring'),
	formidable = require('formidable'),
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
	app = express(), 
	qs = require('querystring');
		
var server = this;
	
server.renderFile = function (res, fileName){
	fileSystem.readFile(fileName, 'binary', function(err, file){
			if (err) {
				responseHandler.write500InternalError(res, err);
				return;
			}
			
			responseHandler.write200Success(res, file);
		});
};
	
var DatabaseService = require('./js/functions/databaseService.js');
var ResponseHandler = require('./js/functions/responseHandler.js');
var Authentication = require('./js/functions/authentication.js');
var authentication = new Authentication(users);
var responseHandler = new ResponseHandler();
var databaseService = new DatabaseService(MongoClient, assert, responseHandler);
var FileHandler = require('./js/functions/fileHandler.js');
var fileHandler = new FileHandler(formidable, fs, path, os, responseHandler, databaseService);

const PORT = 8888;
var clearTempFilesInterval = 60 * 10000;// run every 10 minutes..
var isProcessRunning = false;
var serverAdd = 'http://localhost:' + PORT;

var deleteTempFiles = function (){
	var files = fs.readdirSync(os.tmpdir());
	var filesToDelete = [];
	console.log('checking for uploads to delete... total files to check -->' + files.length);
	for (var i = 0; i < files.length; i++){
		var uploadString = files[i].substring(0, 7);
		if (uploadString === 'upload_'){
			filesToDelete.push(files[i]);
		}
	}
	
	if (filesToDelete.length === 0){
		console.log('No Uploads Found...........');
	} else {
		for (var d = 0; d < filesToDelete.length; d++){
			var deleteMe = path.join(os.tmpdir(), filesToDelete[d]);
			console.log('deleting file===> ' + deleteMe);
			fs.unlinkSync(deleteMe);
		}	
	}
	
	//start timer to check for and delete temp files that we created.
	setInterval(function() {
		//Ensure process is not running...
		if(!isProcessRunning){
			deleteTempFiles();
		}		
	}, clearTempFilesInterval); 
	
};

app.get('/notes', function (req, res){	
	var allNotes = [];
	
	var notes = require("ios-gmail-notes").bind({
		user: 'chadk241@gmail.com',
		password: 'GMMay72011'
	});
	
	notes.openConnection({
		success: function(list) {
		for (var i = 0; i < list.length; i++){
			var noteObjList = [];
			var noteStrArray = list[25].split('\n');
			
			note = {
				body: '',
				subject:'',
				from: '',
				date: ''
			};
			
			for (var n = 0; n < noteStrArray.length; n++){
				//This probably needs to be more complex (multi line subjects, etc?), but should work for my own use right now
				if (noteStrArray[n].trim().includes('Subject:')){
					var stripSub = noteStrArray[n].replace('Subject:', '');
					var cleanedSubject = stripSub.replace('\r','');
					note.subject = cleanedSubject;
				} else if (noteStrArray[n].includes('From:')){
					var stripFrom = noteStrArray[n].replace('From:', '');
					var cleanedFrom = stripFrom.replace('\r','');
					note.from = cleanedFrom;
				}else if (noteStrArray[n].includes('Date:')){
					var stripDate = noteStrArray[n].replace('Date:', '');
					var cleanedDate = stripDate.replace('\r', '');
					note.date = cleanedDate;
				} else {
					
					note.body += noteStrArray[n];
				}			
			}
			
			allNotes.push(note);
		}
		},

		error: function(error) {
			console.log("ERROR: " + error);
		}
	});
});	

app.post('/files', function(req, res) {
	console.log('got http POST /files...');
	isProcessRunning = true;
	var url_parts = url.parse(req.url, true);
	console.log('url_parts.albumName -- ' + url_parts.query.albumName);
	var albumName = url_parts.query.albumName;
	var uploadDir = url_parts.query.uploadDir;

	var saveFolder = path.join(uploadDir, albumName); 	
	
	databaseService.getSettings(function(result) {
		fs.mkdirs(saveFolder, function (err) {
			console.log('attempting to mkdir...');
			if (!err) {
				console.log('no error, moving on...');
				var authHeader = req.headers['authorization']; 
				if (authHeader){
					var auth = authHeader.split(' ')[1];
					var credString = Buffer(auth, 'base64').toString();
					var creds = credString.split(':');
										
					if (creds) {
						var userName = creds[0];
						var pass = creds[1];
						
						if (!authentication.validateUser(userName, pass)) {
							console.log('invalid user.');
							isProcessRunning = false;
							responseHandler.write401Unauthorized(res);
							return;
						} else {								
							fileHandler.handle(res, req, saveFolder, function(success){
								if (success){
									isProcessRunning = false;
								} else {
									isProcessRunning = false;
									console.log('failed to handle files...');
								}
							});
						}
					}
				} else {
					console.log('unauthorized user...');
					isProcessRunning = false;
					responseHandler.write401Unauthorized(res);
					return;
				}
				
			} else {
				console.log('failed to make dir...');
				isProcessRunning = false;
			}
			
		});
	});		 
});

app.delete('/settings', function (req, res) {
	var success = databaseService.deleteSettings();
	if (success) {
		responseHandler.res(res);
	} else {
		responseHandler.write500InternalError(res, 'Failed to delete settings.');
	}
});

app.get('/settings', function (req, res) {
	databaseService.getSettings(function(settings){
		responseHandler.write200OKWithData(res, JSON.stringify(settings));
	});
}); 

app.get('/contacts', function (req, res){
	console.log('got GET /contacts');
	databaseService.getContacts(function (contacts) {			
		console.log('got total contacts: ' + contacts.length);
		responseHandler.write200OKWithData(res, JSON.stringify(contacts));
	});
});		

 
app.post('/contacts', function (req, res) {
	var data = '';
	req.on('data', function (chunk) {
		if (chunk) {
			data += chunk;
		}
	});
	
	req.on('end', function (){
		if (data.length > 0){
			var contacts = JSON.parse(data);
			
			console.log('******** Total Contacts received ---> ' + contacts.length);
			
			if (contacts){					
			  databaseService.saveContacts(res, contacts, function(success){
					if (success){
						console.log('saved contacts successfully!!');
					} else {
						console.log('error occurred while saving contacts...');
					}
			  });					
			}
		}
	});
	
	res.writeHead(200, {'Content-Type': 'Text/Plain' });
	res.write('Upload Complete.\n\n');
	res.end();
	
});

app.post('/settings', function (req, res) {
	console.log('POST /settings.........');
	var data = '';
	req.on('data', function (chunk) {
		if (chunk) {
			data += chunk;
		}
	});
	
	req.on('end', function (){
		console.log('received data -- data.length === ' + data.length);
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
				responseHandler.write204NoContent(res);
				return;
			}
		} else {
			responseHandler.write500InternalError(res, "something went wrong...")
		}
	});
});

//call on startup, then on timer
deleteTempFiles();

app.listen(PORT);

console.log('Listening on port --> ' + PORT + '/\nCTRL+C to shutdown');
