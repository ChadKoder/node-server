function FileHandler(formidable, fileSystem, path, os, responseHandler, databaseService) {
	return {
		handle: function (res, req){
			var form = new formidable.IncomingForm();
			form.parse(req, function(err, fields, files) { 
				//res.writeHead(200, {'content-type': 'text/plain'});
				//res.write('received upload:\n\n');
				//res.end();
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
				responseHandler.write500InternalError(res, 'An error has occurred during upload');
				return;
			});
		 
			form.on('end', function(fields, files) {
				var ctr = 1;
				
				for (var i = 0; i < this.openedFiles.length; i++){
					var tempPath = this.openedFiles[i].path;
					
					var date = new Date();
					var month = date.getMonth();
					var day = date.getDate();
					var fileExt = path.extname(this.openedFiles[i].name);
					var fileName = month + '_' + day + '_' + (date.getUTCMilliseconds() + 100000) + '_' + ctr + fileExt;
					console.log('fileName: ' + fileName);
					var newLocation = './photos/';
			 
					fileSystem.copy(tempPath, newLocation + fileName, function(err) {  
						if (err) {
							console.log('Error: ' + err);
							responseHandler.write500InternalError(res, err);
							return;
						}
						
					});
					
					ctr++;
				}
				
				console.log("success!")
				res.writeHead(200, {'Content-Type': 'Text/Plain' });
				res.write('Upload Complete.\n\n');
				res.end();
				return;
			});
			
		}
	}
}

module.exports = FileHandler;