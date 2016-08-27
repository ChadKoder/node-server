function HttpHandler (router, responseHandler) {
	return {
		handleGetRequest: function (res, req){
			router.get(res, req);
			return;
		},
		handlePostRequest: function (res, req){
			router.post(res, req);
			return;
		},
		
		handlePutRequest: function(res, req){
			responseHandler.write405MethodNotAllowed(res);
			return;
		},
		handleDeleteRequest: function(res, req){
			responseHandler.write405MethodNotAllowed(res);
			return;
		}
	};
} 

module.exports = HttpHandler;