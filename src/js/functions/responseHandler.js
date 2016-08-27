function ResponseHandler() {
	return {
		write200Success: function (res, file, fileName){ 
			 	if (file){
					res.writeHeader(200);
					res.write(file, 'binary');
					res.end();
					return;
				} else {
					res.writeHeader(200);
					res.write('200 OK');
					res.end();
					return;
				}
		},
		write200OKWithData: function (res, object) {
			console.log('sending object: ' + object);
			res.writeHeader(200, {'Content-Type': 'application/json'});
			res.write(object);
			res.end();
		},
		write204NoContent: function (res){
			res.writeHeader(204);
			res.write('204 No Content');
			res.end();
		},
		write400BadRequest: function (res) {
			res.writeHeader(400);
			res.write('400 Bad Request');
			res.end();
		},
		write401Unauthorized: function (res){
			res.writeHeader(401);
			res.write('401 Unauthorized');
			res.end();
		},
		write404NotFound: function (res){
			res.writeHeader(404);
			res.write('404 Not Found');
			res.end();
		},
		write405MethodNotAllowed: function (res){
			res.writeHeader(405, {'Allow': 'GET'});
			res.write('405 Method Not Allowed');
			res.end();
		},
		write500InternalError: function (res, err){
			res.writeHeader(500);
			res.write('500 Internal Server Error: ' + err + '\n');
			res.end();
		}
	};
}

module.exports = ResponseHandler;