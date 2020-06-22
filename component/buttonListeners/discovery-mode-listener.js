
class DiscoveryModeListener{
    constructor(doorbellId, db, gong){
        this.doorbellId = doorbellId;
        this.db = db;
        this.discoveryMode = null;
        this.gong = gong;
    }

    // This is a state listener function
    handlesKey(key){
        return key === 'discoveryMode';
    }
    
    // This is a state listener function
    onStateChanged(key, discoveryMode){
        if(key != 'discoveryMode') return;
        this.discoveryMode = discoveryMode;
    }

    isInDiscoveryMode(){
        return this.discoveryMode ? this.discoveryMode.enabled : false;
    }
    
    discoveryUser(){
        return this.discoveryMode && this.discoveryMode.uid ? this.discoveryMode.uid : null;
    }

    async onUp(eventId){
        if (this.isInDiscoveryMode()) {
            console.log(`${this.discoveryUser()} has discovered this doorbell`);
            this.db.ref(`doorbells/${this.doorbellId}/users/${this.discoveryUser()}`).set(true);
            this.db.ref(`users/${this.discoveryUser()}/doorbells/${this.doorbellId}`).set(true);
            this.db.ref(`doorbells/${this.doorbellId}/state/discoveryMode`).set({
                enabled: false
            });
            await this.gong.beepOnce(100, 2);
        }
    }
}

module.exports = DiscoveryModeListener;