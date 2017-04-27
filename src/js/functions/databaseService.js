var connectionStr = 'mongodb://localhost:27077/photodash';

function DatabaseService(mongoClient, assert) {
	return {
		deleteSettings: function (){
			mongoClient.connect(connectionStr, function (err, db) {
				if (!err) {
					console.log('starting to delete settings...');
					db.dropDatabase();
					return true;					
				} else {
					console.log('Error while retrieving settings: ' + err);
					return false;
				}
			});
			
			return false;
		},
		getSettings: function (callback) {
			mongoClient.connect(connectionStr, function (err, db){
				if (!err) {
					var collection = db.collection('settings');
					collection.find().toArray(function (err, result){
						if (err){
							console.log('ERROR: ' + err);
							return false;
						} else {							
							callback(result);
							return true;
						}						
					});
				} else {
					console.log('error while getting settings...');
					return false;
				}
			});
		},
		getContacts: function (callback) {
			mongoClient.connect(connectionStr, function (err, db){
				if (!err) {
					var collection = db.collection('contacts');
					collection.find().toArray(function (err, result){
						if (err){
							console.log('ERROR: ' + err);
							return false;
						} else {
							console.log('GOT RESULTS!!! ==> TOTAL: ' + result.length);
							callback(result);
							return true;
						}
						
					});
				} else {
					console.log('error while getting settings...');
					return false;
				}
			});
		},
		saveContacts: function (res, contacts, callback){
			mongoClient.connect(connectionStr, function (err, db) {
				if (!err) {
					console.log('Connected to database...');
					db.dropDatabase();
					 					
					db.collection('contacts').insertMany(contacts, function(err, result) {
						assert.equal(err, null);
						console.log('Inserted contacts into photodash...');
						callback(true);
						return;
					});
				} else {
					console.log('Could not connect to the database: ' + err);
					callback(false);
					return;
				}				
			});
		},
		saveSettings: function (res, ipAddress, encodedCreds, uploadDir, deviceName, albumName, callback) {
			mongoClient.connect(connectionStr, function (err, db) {
				if (!err) {
					console.log('Connected to database...');
					console.log('Deleting existing settings...');
					db.dropDatabase();
					
					var settings = {
						ipAddress: ipAddress,
						creds: encodedCreds,
						uploadDir:uploadDir,
						deviceName: deviceName,
						albumName: albumName
					};
					
					db.collection('settings').insertOne(settings, function(err, result) {
						assert.equal(err, null);
						console.log('Inserted settings into photodash...');
						callback(true);
						return;
					});
				} else {
					console.log('Could not connect to the database: ' + err);
					callback(false);
					return;
				}				
			});
		}
	}
};
	
module.exports = DatabaseService;