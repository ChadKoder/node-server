var qs = require('querystring');
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
		 
		 var qs = require('querystring');
		
		var resumable = require('./js/resumable-node.js')('./uploads/')
		//imap = require('imap'),
		//inspect = require('util').inspect;
	
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
	const MINUTES = 50;
	var interval = MINUTES * 60 * 1000;
	var serverAdd = 'http://localhost:' + PORT;

	var deleteTempFiles = function (){
		
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
	
	/*
	{ id: 1,
  rawId: null,
  displayName: null,
  name:
   { givenName: 'Bill',
     honorificSuffix: null,
     formatted: 'Bill Dorendetto?',
     middleName: null,
     familyName: 'Dorendetto?',
     honorificPrefix: null },
  nickname: null,
  phoneNumbers:
   [ { value: '(540) 931-2822', pref: false, id: 0, type: 'mobile' },
     { value: '1 (234) 567-8900', pref: false, id: 1, type: 'home' } ],
  emails:
   [ { value: 'testemail@gmail.com', pref: false, id: 0, type: 'home' },
     { value: 'anotherwemail@gmail.com',
       pref: false,
       id: 1,
       type: 'work' } ],
  addresses:
   [ { pref: 'false',
       locality: 'Apollo',
       region: 'PA',
       id: 0,
       postalCode: '15613',
       country: 'United States',
       type: 'home',
       streetAddress: '123\nMaple Lane' },
     { pref: 'false',
       locality: 'Cranberry ',
       region: 'PA',
       id: 1,
       postalCode: '16066',
       country: 'United States',
       type: 'work',
       streetAddress: 'Work Add\nWork Street' } ],
  ims: null,
  organizations: null,
  birthday: '1975-10-04T12:00:00.000Z',
  note: 'Test Notes',
  photos: null,
  categories: null,
  urls:
   [ { value: 'www.url.com', pref: false, id: 0, type: 'profile' },
     { value: 'wew.url2.com', pref: false, id: 1, type: 'home' } ] }
	 
	 
	
	BEGIN:VCARD
N:Keibler;Chad;Allen;ContactTitle;Mr
ADR;INTL;PARCEL;WORK:;;500 Cranberry Dr;Pittsburgh;PA;15238;United States
ADR;DOM;PARCEL;HOME:;;111 home Ave;homestate;PA;15613;USA
EMAIL;INTERNET:chadtest@gmail.com
EMAIL;INTERNET:chad2@gmail.com
EMAIL;INTERNET:chad3@gmail.com
ORG:Omnicell
TEL;WORK:7247418115
TEL;FAX;WORK:7247411111
TEL;CELL:7241234567
TEL;HOME:7244781234
TITLE:Software Engineer
URL;WORK:www.worksite.com
URL:www.mysite.com
END:VCARD
*/
	var removeUndefined = function (str){
		str = str.replace(/undefined/g, '');
		str = str.replace(/null/g, '');
		str = str.replace(/[^a-zA-Z0-9 :;]/g, '');
		return str;
	};
	
	var saveContact = function(contact){
		var vCardArray = [];
		var contactFileName = contact.name.formatted.replace("/[^a-zA-Z0-9 ]/g",'');
		contactFileName = contactFileName.replace('?', '');
		
		var contactsPath = 'C:/Users/Chad/Desktop/Desktop/CHAD-CONTACTS';
		fs.mkdirpSync(contactsPath);
		
		
		var tempNameData = contact.name.familyName + ';' + contact.name.givenName + ';' + contact.name.middleName + ';' + contact.title + ';' + contact.name.honorificPrefix;
		var nameData = "N;" + tempNameData;
		
		vCardArray.push(nameData);
		
		if (contact.addresses){
			var workAddressData = 	removeUndefined('ADR;INTL;PARCEL;WORK:;;' 
				+ contact.addresses[1].streetAddress + ';' + contact.addresses[1].locality + ';' + contact.addresses[1].region + ';'
				+ contact.addresses[1].postalCode + ';' + contact.addresses[1].country);
		
			var homeAddressData = removeUndefined(
				'ADR;DOM;PARCEL;HOME:;;' 
				+ contact.addresses[0].streetAddress + ';' + contact.addresses[0].locality + ';' + contact.addresses[0].region + ';'
				+ contact.addresses[0].postalCode + ';' + contact.addresses[0].country);
		
			//ADR;INTL;PARCEL;WORK:;;500 Cranberry Dr;Pittsburgh;PA;15238;United States
			vCardArray.push(workAddressData);
			//ADR;DOM;PARCEL;HOME:;;111 home Ave;homestate;PA;15613;USA				
			vCardArray.push(homeAddressData);
			
		}
		
		if (contact.phoneNumbers){
			for (var phoneIndex = 0; phoneIndex < contact.phoneNumbers.length; phoneIndex++){
				if (contact.phoneNumbers[phoneIndex].type.toLowerCase() === 'work'){
					var workPhoneNum = 'TEL;WORK:' + contact.phoneNumbers[phoneIndex].value;
					vCardArray.push(workPhoneNum);
				}
				if (contact.phoneNumbers[phoneIndex].type.toLowerCase() === 'mobile'){
					var cellNumber = 'TEL;CELL:' + contact.phoneNumbers[phoneIndex].value;
					vCardArray.push(cellNumber);
				}
				
			}
		}
		
		if (contact.emails){
			for (var emailIndex = 0; emailIndex < contact.emails.length; emailIndex++){
				var workEmailData = 'EMAIL;INTERNET:' + contact.emails[emailIndex].value;
				vCardArray.push(workEmailData);
			}
		}
		
		vCardArray.push('END:VCARD');
		 
		fs.writeFileSync(path.join(contactsPath, contactFileName + '.vcf'), 'BEGIN:VCARD');
		 
		for (var i = 0; i < vCardArray.length; i++){ 
			fs.appendFileSync(path.join(contactsPath, contactFileName + '.vcf'), '\n');
			
			fs.appendFileSync(path.join(contactsPath, contactFileName + '.vcf'), vCardArray[i]);
		}
		 
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
	
	/*
	
// retrieve file id. invoke with /fileid?filename=my-file.jpg
app.get('/fileid', function(req, res){
	  console.log('app.get/FILEID');
  if(!req.query.filename){
    return res.status(500).end('query parameter missing');
  }
  // create md5 hash from filename
  res.end(
    crypto.createHash('md5')
    .update(req.query.filename)
    .digest('hex')
  );
});

// Handle uploads through Resumable.js
app.post('/upload', function(req, res){
	 console.log('AP.POST /upload');
  resumable.post(req, function(status, filename, original_filename, identifier){
    if (status === 'done') {
		  console.log('status is DONE');
      var stream = fs.createWriteStream('./uploads/' + filename);

      //stich the chunks
      resumable.write(identifier, stream);
      stream.on('data', function(data){});
      stream.on('end', function(){});

      //delete chunks
      resumable.clean(identifier);
    }
    res.send(status, {
        // NOTE: Uncomment this funciton to enable cross-domain request.
        //'Access-Control-Allow-Origin': '*'
    });
  });
});

// Handle uploads through Resumable.js
app.post('/upload', function(req, res){
    resumable.post(req, function(status, filename, original_filename, identifier){
        console.log('POST', status, original_filename, identifier);

        //res.send(status);
		res.status(status).send('upload handled?');
    });
});

// Handle status checks on chunks through Resumable.js
app.get('/upload', function(req, res){
	console.log('Got resumable upload....');
    resumable.get(req, function(status, filename, original_filename, identifier){
        console.log('GETtttttt', status);
      //  res.send((status == 'found' ? 200 : 404), status);
		res.status(status == 'found' ? 200 : 404).send(status);
    });
});

app.get('/download/:identifier', function(req, res){
	resumable.write(req.params.identifier, res);
});
app.get('./js/resumable.js', function (req, res) {
  var fs = require('fs');
  res.setHeader("content-type", "application/javascript");
  fs.createReadStream("./js/resumable.js").pipe(res);
});
	*/
	
	
app.post('/files', function(req, res) {
		console.log('got http POST /files...');
		
		var url_parts = url.parse(req.url, true); 
		var albumName = url_parts.query.albumName;
		var uploadDir = url_parts.query.uploadDir;
		 
		var saveFolder = path.join(uploadDir, albumName); //USE THIS TO SAVE TO...
			 
		databaseService.getSettings(function(result) {
			fs.mkdirs(saveFolder, function (err) { 
				if (!err) { 
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
								responseHandler.write401Unauthorized(res);
								return;
							} else {
								 console.log('its a valid user!');
								 
								 

								fileHandler.handle(res, req, saveFolder);
							}
						}
					} else {
						console.log('unauthorized user...');
						responseHandler.write401Unauthorized(res);
						return;
					}
					 
				} else {
					console.log('failed to make dir...');
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
			////console.log('GETTING CONTACTS');
			console.log('got total contacts: ' + contacts.length);
			responseHandler.write200OKWithData(res, JSON.stringify(contacts));
		});
	});
	
	/*
	{ id: 1,
  rawId: null,
  displayName: null,
  name:
   { givenName: 'Bill',
     honorificSuffix: null,
     formatted: 'Bill Dorendetto?',
     middleName: null,
     familyName: 'Dorendetto?',
     honorificPrefix: null },
  nickname: null,
  phoneNumbers:
   [ { value: '(540) 931-2822', pref: false, id: 0, type: 'mobile' },
     { value: '1 (234) 567-8900', pref: false, id: 1, type: 'home' } ],
  emails:
   [ { value: 'testemail@gmail.com', pref: false, id: 0, type: 'home' },
     { value: 'anotherwemail@gmail.com',
       pref: false,
       id: 1,
       type: 'work' } ],
  addresses:
   [ { pref: 'false',
       locality: 'Apollo',
       region: 'PA',
       id: 0,
       postalCode: '15613',
       country: 'United States',
       type: 'home',
       streetAddress: '123\nMaple Lane' },
     { pref: 'false',
       locality: 'Cranberry ',
       region: 'PA',
       id: 1,
       postalCode: '16066',
       country: 'United States',
       type: 'work',
       streetAddress: 'Work Add\nWork Street' } ],
  ims: null,
  organizations: null,
  birthday: '1975-10-04T12:00:00.000Z',
  note: 'Test Notes',
  photos: null,
  categories: null,
  urls:
   [ { value: 'www.url.com', pref: false, id: 0, type: 'profile' },
     { value: 'wew.url2.com', pref: false, id: 1, type: 'home' } ] }
	 */
	
	var removeNonAlphaNumeric = function(str){
		if (str === null || str === undefined){
			return '';
		}
		
		return str.replace(/[^a-zA-Z0-9 ]/g, '');
	};
	
	var cleanContactData = function (contact){
		//First Name
		if (contact.name.givenName !== null && contact.name.givenName !== undefined){
			contact.name.givenName = removeNonAlphaNumeric(contact.name.givenName.trim());
		} else {
			contact.name.givenName = '';
		}
		
		//Middle Name
		if (contact.name.middleName !== null && contact.name.middleName !== undefined){
			contact.name.middleName = removeNonAlphaNumeric(contact.name.middleName.trim());
		} else {
			contact.name.middleName = '';
		}
		//Formatted (first last)
		if (contact.name.formatted !== null && contact.name.formatted !== undefined){
			contact.name.formatted = removeNonAlphaNumeric(contact.name.formatted.trim());
		} else {
			ncontact.ame.formatted = '';
		}
		
		
		//Family name - last name
		if (contact.name.familyName !== null && contact.name.familyName !== undefined){
			contact.name.familyName = removeNonAlphaNumeric(contact.name.familyName.trim());
		} else {
			contact.name.familyName = '';
		}
		
		//Formatted (first last)
		if (contact.name.formatted !== null && contact.name.formatted !== undefined){
			contact.name.formatted = contact.name.formatted.trim();
		} else {
			contact.name.formatted = '';
		}
		
		//honorificPrefix  
	//	////console.log('PREprefix: ' + name.honorificPrefix);
		if (contact.name.honorificPrefix !== null && contact.name.honorificPrefix !== undefined){
			contact.name.honorificPrefix = contact.contact.name.honorificPrefix.trim();
		} else {
			contact.name.honorificPrefix = '';
		}
		
		/*ar workAddressData = 	removeUndefined('ADR;INTL;PARCEL;WORK:;;' 
			+ contact.addresses[1].streetAddress + ';' + contact.addresses[1].locality + ';' + contact.addresses[1].region + ';'
			+ contact.addresses[1].postalCode + ';' + contact.addresses[1].country);
		*/
		
		if (contact.addresses){
			for (var addIndex = 0; addIndex < contact.addresses.length; addIndex++){
				if (contact.addresses[addIndex].streetAddress !== null && contact.addresses[addIndex].streetAddress !== undefined){
					contact.addresses[addIndex].streetAddress = contact.addresses[addIndex].streetAddress.trim();
				} else {
					contact.addresses[addIndex].streetAddress = '';
				}
				
				if (contact.addresses[addIndex].locality !== null && contact.addresses[addIndex].locality !== undefined){
					contact.addresses[addIndex].locality = contact.addresses[addIndex].locality.trim();
				} else {
					contact.addresses[addIndex].locality = '';
				}
				
				if (contact.addresses[addIndex].region !== null && contact.addresses[addIndex].region !== undefined){
					contact.addresses[addIndex].region = contact.addresses[addIndex].region.trim();
				} else {
					contact.addresses[addIndex].region = '';
				}
				
				if (contact.addresses[addIndex].postalCode !== null && contact.addresses[addIndex].postalCode !== undefined){
					contact.addresses[addIndex].postalCode = contact.addresses[addIndex].postalCode.trim();
				} else {
					contact.addresses[addIndex].postalCode = '';
				}
				
					if (contact.addresses[addIndex].country !== null && contact.addresses[addIndex].country !== undefined){
					contact.addresses[addIndex].country = contact.addresses[addIndex].country.trim();
				} else {
					contact.addresses[addIndex].country = '';
				}
			}  
		}
		
		//honorificSuffix
		if (contact.name.honorificSuffix !== null && contact.name.honorificSuffix !== undefined){
			contact.name.honorificSuffix = contact.name.honorificSuffix.trim();
		} else {
			contact.name.honorificSuffix = '';
		}
		
		//Title
		if (contact.title !== null && contact.title !== undefined){
			contact.title = removeNonAlphaNumeric(contact.title.trim());
		} else {
			contact.title = '';
		}
	}
	
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
				
				if (contacts){
					
					var vcfContacts = [];
					
					for (var i = 0; i < contacts.length; i++){
						var currContact = contacts[i];
						
						var success = databaseService.saveContact(res, currContact,
						function (success){
							if (success){
								//responseHandler.write200Success(res);
								console.log('saved contact to database.');
								return;
							} else {
								
								responseHandler.write500InternalError(res, 'error');
								return;
							}
						});
						
						cleanContactData(currContact);
						
						
						//////console.log('PHONEN UMBERS: ' + currContact.phoneNumbers);
						
						/*TODO: SAVE ALL PHONE NUMBERS, NOT JUST THE FIRST! */
						
						
						//fName, mName, lName, uniqueNumber, number, fileName, title, prefix){
						
						//TODO FIX THIS....saveContact(currContact);
					} 
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
						////console.log('unauthorized user: ' + username);
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
					////console.log('no settings to save...');
					responseHandler.write204NoContent(res);
					return;
				}
			} else {
				responseHandler.write500InternalError(res, "something went wrong...")
			}
		});
	});

	//Call once to clean temp files instead of waiting for timer, if any
	deleteTempFiles();
	
	app.listen(PORT);
	
	console.log('Listening on port --> ' + PORT + '/\nCTRL+C to shutdown');
	