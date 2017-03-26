var imap = require('imap'),
	inspect = require('util').inspect;
var list = [];
exports.bind = function(options, callback) {
//	//console.log('binding...');
	return new gmailConnection(options, callback);
};

var iosGmailNotes = this;

iosGmailNotes.imap = {};
iosGmailNotes.list = [];

function gmailConnection(options) {
	iosGmailNotes.imap = new imap({
		user: options.user,
		password: options.password,
		host: 'imap.gmail.com',
		port: 993,
		tls: true
	});
	

}

gmailConnection.prototype.open = function(callback) {
	callback = callback || {};
	callback.success = callback.success;
	callback.error = callback.error;
	
	var imap = iosGmailNotes.imap;
	
//	//console.log('opening imap connection...');
	
	iosGmailNotes.imap.once('ready', function(){
		imap.openBox('Notes', true, function(err, mailbox) {
			if (err){ 
				return callback(err);
			} 

			iosGmailNotes.imap.search(['SEEN', ['ALL']], function(err, results) {
				////console.log('searching...');
				var total = results.length;
				
				if (err){
					//console.log('error searching! ---> ' + err);
					return options.error(err);
				} 
				
				var f = iosGmailNotes.imap.seq.fetch('1:' + results.length, 
				{	bodies:  ['HEADER.FIELDS (DATE SUBJECT)','TEXT'],
					body: true
				});
		 
				f.on('message', function (msg, seqno){
					////console.log('got msg: ' + JSON.stringify(msg));
					var isNote = true;
					var note = {
						text: ''
					};

					msg.on('headers', function(hdrs) {
						console.log('HEADERS MSG: ' + JSON.stringify(hdrs));
						note.date = hdrs.date[0];
						note.subject = hdrs.subject[0];
						if (typeof hdrs['x-uniform-type-identifier'] == "undefined") {
							isNote = false;
						}
					});
					
					var buffer = '';
					var seqnoList = [];
					//console.log('msg: ' + JSON.stringify(msg));
					
					msg.on('body', function (stream, info){
						stream.on('data', function (chunk){
							buffer += chunk.toString('utf8');
						});
						
						stream.on('headers', function(hdrs) {
							console.log('HEADER: ' + JSON.stringify(hdrs));
							note.date = hdrs.date[0];
							note.subject = hdrs.subject[0];
							if (typeof hdrs['x-uniform-type-identifier'] == "undefined") {
								isNote = false;
							}
						});
					
						stream.once('end', function(){	
					 	//if (typeof hdrs['x-uniform-type-identifier'] == "undefined") {
						//	isNote = false;
						//}
							if (seqnoList.indexOf(info.seqno) === -1){
								//console.log('seqno NOT in list.. addiing...');
								seqnoList.push(info.seqno);
								iosGmailNotes.list.push(buffer);
								console.log('WRITNING : ' + buffer);
								//buffer += chunk.toString('utf8'))
							} else {
								console.log('NOT WRITING: ' + buffer);
								//console.log('seqno IS IN LIST... DOIN?G NOTH?ING...');
							}
							
							//iosGmailNotes.list.push(buffer);
							
							//total--;
							////console.log(total);
							//if(total === 0){
							//	callback.success(iosGmailNotes.list);
							//}
						});
						
					});
					 msg.once('attributes', function(attrs) {
					  ////console.log(prefix + 'Attributes: %s', inspect(attrs, false, 8));
					});

					msg.on('end', function() {
						if (isNote) list.push(note);

						total--;
						if (total === 0) {
							////console.log('END..');
							console.log('FINISHED: ' + iosGmailNotes.list.length);
							callback.success(iosGmailNotes.list);
						}
					});
				});
			});
		});
	});
	
	imap.connect();	
};
 
gmailConnection.prototype.getAll = function(){
	////console.log('gettting all notes from iogMGNotes to server.js');
	return iosGmailNotes.list;
};
gmailConnection.prototype.openConnection = function (cb){
	this.open(cb);
};

function doNothing() {
	// :-|
}