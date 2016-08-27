function Authentication(usersJson) {
	return {
		validateUser: function(userName, password){
		var users = usersJson.users;
		for (var i = 0; i <= users.length - 1; i++){
			if (userName.toLowerCase() === users[i].username.toLowerCase() && password === users[i].password){
				return true;
			}
		}
		
		return false;
		},
		isAuthorized: function (token){
			if (token){
				return true;
			}
			
			return false;
		}
	}
}

module.exports = Authentication;