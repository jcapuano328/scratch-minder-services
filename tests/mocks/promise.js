module.exports = {
	accept: function(value) {		
		return new Promise((resolve, reject) => {
	    	return resolve(value);
	    });
	},
	reject: function(err) {
		return new Promise((resolve, reject) => {
	        return reject(err);
	    });
	}
};
