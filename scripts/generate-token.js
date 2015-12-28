'use strict'
var program = require('commander');
var genToken = require('../src/lib/generate-token');

function main(args) {
	try {
		var opts = {
        	userid: args.userid
	    };

	    console.error('');
	    console.error('Generate Auth Token');
	    //console.error('  ' + JSON.stringify(opts, null, 4));
	    console.error('');

        var token = {
            token: "",
            type: "access",
            clientId: null,
            userId: opts.userid,
            expires: new Date(new Date().getTime() + (5 * 365 * 1440 * 60000))
        };
        genToken()
        .then((authtoken) => {
            token.token = authtoken;
            console.log(JSON.stringify(token, null, 4));
    	    console.error('');
    	    console.error('done');
        })
        .catch((err) => {
            console.error(err);
        });

	    return 0;

	} catch(ex) {
		console.error('Failed to generate auth token: ' + ex);
	    return -1;
	}
}

program
	.version('0.0.1')
	.description('Generate Auth Token')
	.option('-u, --userid <s>', 'User Id')
	.parse(process.argv);

main(program);
