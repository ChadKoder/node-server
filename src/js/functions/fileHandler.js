	 var qs = require('querystring');
		
function FileHandler(formidable, fileSystem, path, os, responseHandler, databaseService) {
	return {
		handle: function (res, req, saveLocation){
			
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
		 
				//res.writeHead(200, {'content-type': 'text/plain'});
				//res.write('received upload:\n\n');
				//res.end();
				console.log('total files --- ' + JSON.stringify(files));
				
				if (err){
					
					console.log('error: ' + err);
					
				}
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
					
					
					
					
					
					
					
					/* getFile(tempFilePath).then(function(file){
						 	var date = new Date();
							var month = date.getMonth();
							var day = date.getDate();
							var fileExt = path.extname(this.openedFiles[i].name);
							var fileName = month + '_' + day + '_' + (date.getUTCMilliseconds() + 100000) + '_' + ctr + fileExt;
							console.log('FileName---> ' + fileName);
								
							
							console.log('successfully read file!');
							console.log('reading file : ' + fileName);
							
							var bitmap = new Buffer(file, 'base64');
							
						fileSystem.writeFile(path.join(saveLocation, fileName), bitmap, function(err){
							if (err){
								console.log('error writing file: ' + err);
							} else {
								console.log('wrote file name  successfully... --> ' + fileName);
								
							}
							
							
						});
					 },
					 function(err){
						console.log('ERR: ' + err);
					 });*/
					 
					 
					 
					 
					
				/*	fileSystem.readFile(tempFilePath, 'base64', function (err, data){
						if (err){
							
							console.log('hit error: ' + err);
						} else {
							
						var date = new Date();
						var month = date.getMonth();
						var day = date.getDate();
						var fileExt = path.extname(this.openedFiles[i].name);
						var fileName = month + '_' + day + '_' + (date.getUTCMilliseconds() + 100000) + '_' + ctr + fileExt;
						console.log('FileName---> ' + fileName);
							
							
							console.log('successfully read file!');
							console.log('reading file : ' + fileName);
							
							var bitmap = new Buffer(data, 'base64');
							
					fileSystem.writeFile(path.join(saveLocation, fileName), bitmap, function(err){
						if (err){
							console.log('error writing file: ' + err);
						} else {
							console.log('wrote file name  successfully... --> ' + fileName);
							
						}
						
						
					});
								
							 
							
						}
						
					});
					*/
					
					
				
					
				/*	fileSystem.readFile(tempFilePath, 'utf8', function (err,data) {
						  if (err) {
							return console.log(err);
						  }
						  
						  var blob = new Buffer(data, 'base64');
						  console.log(blob);
					});*/
					//console.log('***** -->' + JSON.parse(req.body) + '<*****');
					//var file = req;
					//var buf = new Buffer(file, 'base64');
					//fileSystem.mkdirpSync(contactsPath);
					
					/*
					var tempPath = this.openedFiles[i].path;
					
					var date = new Date();
					var month = date.getMonth();
					var day = date.getDate();
					var fileExt = path.extname(this.openedFiles[i].name);
					var fileName = month + '_' + day + '_' + (date.getUTCMilliseconds() + 100000) + '_' + ctr + fileExt;
					
					
					
					
					
					console.log('save location: ' + path.join(saveLocation, fileName));
					
					fileSystem.writeFile(path.join(saveLocation, fileName), buf, function(err){
						if (err){
							console.log('error writing file: ' + err);
						} else {
							console.log('wrote blob successfully...');
							
						}
						
						
					});*/
					
					//fileSystem.mkdirpSync(path.join(saveLocation, fileName))
					
					/*fileSystem.copy(tempPath,  path.join(saveLocation, fileName), function(err) {  
						if (err) {
							console.log('Error: ' + err);
							responseHandler.write500InternalError(res, err);
							return;
						}
					});*/
					
					ctr++;
				}
				
				console.log("success!")
				/*es.writeHead(200, {'Content-Type': 'Text/Plain' });
				res.write('Upload Complete.\n\n');
				res.end();*/
				
				responseHandler.write200Success(res);
				return;
			});
			
		}
	}
}

module.exports = FileHandler;