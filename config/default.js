module.exports = {
    port: 3000,
    paths: {
        routes: './routes'
    },
    log: {
        server: { // server-side logging parameters
            levels: ['error', 'warn', 'info', 'debug', 'trace'],
            transports: { // logging transports
                console: {
                    format: ['date', 'level', 'message', 'user', 'platform', 'locale', 'stack'],
                    level: 'info', // maximum level of logged messages
                    enabled: false, // this switch can be used to easily toggle use of a given transport
                    colorize: true, // this switch can be used to easily toggle use of colors
                    json: false	 // plain text or json output
                }
            }
        }
    }
};
