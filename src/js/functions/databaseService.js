var connectionStr = 'mongodb://localhost:27077/photodash';

function DatabaseService(mongoClient, assert) {
	return {
		deleteSettings: function (){
			mongoClient.connect(connectionStr, function (err, db) {
				if (!err) {
					console.log('starting to delete settings...');
					db.dropDatabase();
					return true;
					/*settings.each(function (err, setting) {
						assert.equal(err, null);
						if (setting != null){
							//responseHandler.write200Success(res);
						}
					});*/
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
		saveSettings: function (res, ipAddress, encodedCreds, uploadDir, deviceName, albumName, callback) {
			mongoClient.connect(connectionStr, function (err, db) {
				if (!err) {
					console.log('Connected to database...');
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