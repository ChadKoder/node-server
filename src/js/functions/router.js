function Router(responseHandler, Buffer, fileHandler, authentication, fileSystem, databaseService, path, urlService) {
	return {
		renderFile: function (res, fileName){
			fileSystem.readFile(fileName, 'binary', function(err, file){
				if (err) {
					console.log('error rendering file : ' + fileName + ' err: ' + err);
					responseHandler.write500InternalError(res, err);
					return;
				}
				
				responseHandler.write200Success(res, file);
			});
		},
		get: function (res, req) {
			var uri = urlService.parse(req.url).pathname;
			var fileName = path.join(process.cwd(), uri);
			var url = req.url;
			
			switch (uri) {
				case '/':
					fileName += './output/views/index-server.html';
					this.renderFile(res, fileName);
					break;
				case '/settings':
					databaseService.getSettings();
					break;
				default:
					this.renderFile(res, fileName);
			}
		},
		post: function (res, req) {
			console.log('POST RECEIVED...');
			
			var url = req.url;
			
			switch (url) {
				case '/files':
					//authentication.validateUserRequest(req);
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
					return;
				case '/settings':
					var data = '';
					req.on('data', function (chunk) {
						if (chunk) {
							data += chunk;
						}
					});
					
					req.on('end', function (){
						if (data.length > 0){
							var settings = JSON.parse(data).settings;
							
							if (settings){
								var ipAddress = settings.ipAddress;
								var credStr = Buffer(settings.credentials, 'base64').toString();
								
								var creds = credStr.split(':');
								var username = creds[0];
								var pass = creds[1];
								
								if (!authentication.validateUser(username, pass)) {
									console.log('unauthorized user: ' + username);
									responseHandler.write401Unauthorized(res);
								return;
								} else {
									console.log('saving settings...');
									//var encodedUserCreds = new Buffer(username + ':' + pass).toString('base64');
									databaseService.saveSettings(ipAddress, settings.credentials);
									return;
								}
							}
						}
					});
					
					console.log('no settings to save...');
					responseHandler.write204NoContent(res);
					
					return;
					default: 
					console.log('what happened????');
						responseHandler.write500InternalError(res);
						return;
			}
			  
		  return;
		}
	}
};
	
module.exports = Router;