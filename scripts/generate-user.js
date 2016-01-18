'use strict'
var program = require('commander');
var uuid = require('node-uuid');
var easyPbkdf2 = require("easy-pbkdf2")();

function collect(val, memo) {
  memo.push(val);
  return memo;
}

function main(args) {
	try {
		var opts = {
            email: args.email,
            firstname: args.firstname,
            lastname: args.lastname,
        	username: args.username,
            password: args.password,
			roles: args.roles || ['user']
	    };

	    console.error('');
	    console.error('Generate User');
	    //console.error('  ' + JSON.stringify(opts, null, 4));
	    console.error('');

        var user = opts;
        user.userid = uuid.v1();
        user.status = 'active';
        user.preferredAccount = null;
        easyPbkdf2.secureHash( opts.password, easyPbkdf2.generateSalt(), function( err, passwordHash, originalSalt ) {
            user.password = {
                salt: originalSalt,
                hash: passwordHash
            };
            console.log(JSON.stringify(user, null, 4));
    	    console.error('');
    	    console.error('done');
        });

	    return 0;

	} catch(ex) {
		console.error('Failed to generate user: ' + ex);
	    return -1;
	}
}

program
	.version('0.0.1')
	.description('Generate User')
	.option('-u, --username <s>', 'User Name')
    .option('-p, --password <s>', 'Password')
    .option('-f, --firstname <s>', 'First Name')
    .option('-l, --lastname <s>', 'Last Name')
    .option('-e, --email <s>', 'Email Address')
	.option('-r, --role [r]', 'Role(s)', collect, [])
	.parse(process.argv);

main(program);
