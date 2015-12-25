module.exports = {
    port: 3000,
    paths: {
        routes: './src/routes'
    },
    log: {
        server: { // server-side logging parameters
            levels: ['error', 'warn', 'info', 'debug', 'trace'],
            transports: { // logging transports
                console: {
                    format: ['date', 'level', 'message'],
                    level: 'warn', // maximum level of logged messages
                    enabled: true, // this switch can be used to easily toggle use of a given transport
                    colorize: true, // this switch can be used to easily toggle use of colors
                    json: false	 // plain text or json output
                }
            }
        }
    }
};
