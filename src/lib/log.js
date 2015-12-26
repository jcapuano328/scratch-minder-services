'use strict'
var config = require('config'),
    cons = require('./console'),
    colors = require('colors'),
	_ = require('lodash');

/* Logger
	API:
		logger[level](<msg>[, company, product, user, platform])

        	level is a configured level: trace, debug, etc.
            msg is required (the message)
            company, product, etc are optional

		logger[level](<msg>[, {company: '', product: '', user: '', platform: ''}])

        	level is a configured level: trace, debug, etc.
            msg is required (the message)
            object containing company, product, etc is optional (as are the individual properties)

	Configuration:
		log: {
		  server: { // server-side logging parameters
          	  levels: ['error', 'warn', 'info', 'debug'],
		      expressFormat: ':remote-addr - - [:date] ":method :url HTTP/:http-version" (:status) :res[content-length] ":referrer" ":user-agent"',
		      transports: { // logging transports
		      	console: {
                  format: ['date', 'level', 'message', 'company', 'product', 'user', 'platform', 'locale', 'stack'],
		          level: 'info', // maximum level of logged messages
		          enabled: false, // this switch can be used to easily toggle use of a given transport
		          colorize: true, // this switch can be used to easily toggle use of colors
	              json: false	 // plain text or json output
		        }
		      }
		  },
		  client: { // client-side logging parameters
	      	transports: {
		      	console: {
		          level: 'debug', // maximum level of logged messages
		          enabled: true // this switch can be used to easily toggle use of a given transport
		        },
	            server: {
		          level: 'debug', // maximum level of logged messages
		          enabled: false, // this switch can be used to easily toggle use of a given transport
	              buffer: {
	              	interval: 2000,
	                limit: 500
	              }
	            }
		    }
		  }
		}
*/

colors.setTheme({
	trace: 'green',
    debug: 'cyan',
    info: 'blue',
    warn: 'yellow',
    error: 'red',
    fatal: 'magenta'
});

var defaultExpressFormat = ':remote-addr - - [:date] ":method :url HTTP/:http-version" (:status) :res[content-length] ":referrer" ":user-agent"';
var defaultFormat = ['date', 'level', 'message', 'company', 'product', 'user', 'platform', 'locale', 'stack'];
var defaultLevels = {
	trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5
};
var defaultTransports = {
	console: {
    	level: 'info',
        enabled: true,
        json: false
	}
};

function makeLevels(cfg) {
	if (!cfg.levels) {
    	return defaultLevels;
    }
    var idx = cfg.levels.length;
    return _.object(cfg.levels, _.map(cfg.levels, function(level) {return idx--;}));
}

function makeTransports(cfg) {
    var transports = _.cloneDeep(cfg.transports || defaultTransports);
    var wtransports = {};
    _.each(transports, function(transport, type) {
    	if (typeof transport.enabled === 'undefined' || transport.enabled) {
            wtransports[type] = _.extend(defaultTransports[type]||{}, transport);
            if (type === 'console') {
            	wtransports[type].out = cons.log;
			} else {
            	wtransports[type].out = function(){}
            }
        }
    });
    return wtransports;
}

var cfg = _.get(config, 'log.server');
var levels = makeLevels(cfg);
var transports = makeTransports(cfg);

/*
pad(
 input // (int or string) or undefined,NaN,false,empty string
       // default:0 or PadCharacter
 // optional
 ,PadLength // (int) default:2
 ,PadCharacter // (string or int) default:'0'
 ,PadDirection // (bolean) default:0 (padLeft) - (true or 1) is padRight
)
*/
function pad(a,b,c,d){
	return a=(a||c||0)+'',b=new Array((++b||3)-a.length).join(c||0),d?a+b:b+a;
}
function formatToken(token, args, json) {
	if (token == 'date') {
    	var d = new Date();
        return d.toISOString();
    }
	if (token == 'stack') {
    	var e = new Error();
        return e.stack;
    }
    if (token == 'level' && !json) {
    	return pad(args[token] || '', 5, ' ', true);
    }
    return args[token] || '';
}

function format(format, args, json, colorizefn) {
	format = format || defaultFormat;
    var props = _.extend({level: args[0],message: args[1]}, (args.length > 2 && _.isObject(args[2]))
    	? args[2]
        : _.object(_.pull(_.clone(format), 'level','message'), _.rest(args,2))
	);
    var formatted = _.map(format, function(fmt) {
    	var v = formatToken(fmt, props, json);
        if (colorizefn && fmt == 'level') {
        	v = colorizefn(v);
        }
        return v;
	});
	if (json) {
    	return JSON.stringify(_.object(format, formatted));
    }

    return _.filter(formatted, function(t) {return !!t;}).join(' - ');
}

function colorize(transport, level) {
	if (typeof transport.colorize === 'undefined' || transport.colorize) {
    	return colors[level];
    }
    return null;
}

function log(args) {
	var level = _.first(args);
	_.each(transports, function(transport, type) {
    	if ((levels[level] || 99) >= (levels[transport.level] || 0)) {
        	var msg = format(transport.format, args, transport.json, colorize(transport, level));
            transport.out(msg);
        }
    });
}

function getExpressFormat() {
	return cfg.expressFormat || defaultExpressFormat;
}

var logger = {
	getExpressFormat: getExpressFormat
};
_.each(levels, function(level, type) {
	logger[type] = function() {
    	log(Array.prototype.concat.apply([type], arguments));
    }
});

exports = module.exports = logger;
/*
module.exports = {
	trace: function() {console.log(arguments);},
	debug: function() {console.log(arguments);},
    info: function() {console.log(arguments);},
    warn: function() {console.log(arguments);},
    error: function() {console.log(arguments);},
    fatal: function() {console.log(arguments);}
};
*/
