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
        addEvent(this.db, this.doorbellId, "RING", { tag: eventId})
        //this.notificationService.sendNotification(this.doorbellId, {
        //    notification: {
        //        title: 'Er belde iemand aan!',
        //        body: `Bij de deurbel ${this.doorbellId}.`,
        //        type: 'RING',
        //        tag: eventId
         //   }
        //})
    }
    onUp(){
        this.gong.off();
    }
}

module.exports = GongListener;
