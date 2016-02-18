'use strict'

module.exports = (sequence) => {
    try {
        let seq = parseInt(sequence, 10);        
        if (isNaN(seq)) {
            return 1;
        }
        return seq + 1;
    } catch (e) {
        return 1;
    }
}
