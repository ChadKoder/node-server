	 var qs = require('querystring');
		
function FileHandler(formidable, fileSystem, path, os, responseHandler, databaseService) {
	return {
		handle: function (res, req, saveLocation, callback){
			
			var getFile = function(tempFilePath){
				return new Promise(function(resolve, reject){
					fileSystem.readFile(tempFilePath, 'base64', function (err, data){
						if (err){
							
							console.log('hit error: ' + err);
							reject('error reading file from temp dir');
						} else {
							resolve(data);
						}						
					});
				});
				
			};
			
			console.log('handling the file....');
			var form = new formidable.IncomingForm();
			form.parse(req, function(err, fields, files) { 
		 
				console.log('total files --- ' + JSON.stringify(files));
				
				if (err){					
					console.log('error: ' + err);					
				}				
				
				console.log('files[0]===> ' + files[0]);				
			});			
		 
				form.on('progress', function(bytesReceived, bytesExpected) {
					var percentComplete = (bytesReceived / bytesExpected) * 100;
					process.stdout.write('Progress: ' + percentComplete);
					process.stdout.clearLine();
					process.stdout.cursorTo(0);
					
					if (parseInt(percentComplete) === 100){
						console.log('Upload Progress: ' + percentComplete + '%');
						return;
					} else {
						process.stdout.write('Upload Progress: ' + percentComplete.toFixed(2) + '%');
					}
					
				});
		 
			form.on('error', function(err) {
				console.log('Error occurred while reading form: ' + err);
				callback(false);
				responseHandler.write500InternalError(res, 'An error has occurred during upload');
				return;
			});
		 
			form.on('end', function(fields, files) {
				var ctr = 1;
				
				console.log('opened files count: ' + this.openedFiles.length);
				 
				for (var i = 0; i < this.openedFiles.length; i++){
					
					var tempFilePath = this.openedFiles[i].path;
					var date = new Date();
					var month = date.getMonth();
					var day = date.getDate();
					
				    var fileName = this.openedFiles[i].name;
							
					fileSystem.copy(tempFilePath,  path.join(saveLocation, fileName), function(err) {  
						if (err) {
							console.log('Error: ' + err);
							responseHandler.write500InternalError(res, err);
							return;
						}
					});			
					
					ctr++;
				}
				
				console.log("success!")
				
				responseHandler.write200Success(res);
				callback(true);
				return;
			});
			
			callback(false);
		}
	}
}

module.exports = FileHandler;