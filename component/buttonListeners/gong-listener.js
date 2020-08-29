var { generateId, addEvent } = require('../../utils')


class GongListener{
    constructor(gong, db, doorbellId, notificationService){
        this.gong = gong;
        this.db = db;
        this.doorbellId = doorbellId;
        this.notificationService = notificationService;
    }
    onReset(){
        this.gong.off();
    }
    onDown(eventId){
        this.gong.on();
    }
    onUp(){
        this.gong.off();
    }
}

module.exports = GongListener;
