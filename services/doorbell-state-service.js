class DoorbellStateService {
    constructor(db, doorbellId) {
        this.db = db;
        this.doorbellId = doorbellId;
        this.state = {};
        this.listeners = [];
    }

    addOnStateChangedListener( listener){
        this.listeners.push(listener);
    }

    onStateChanged(key, value){
        console.log(`[DEBUG]  ${key} is now:`, value);
        this.listeners.forEach(listener => {
            if(listener.handlesKey(key)){
                listener.onStateChanged(key, value);    
            }
        })
    }

    init() {
        // Get initial values
        let statePath = `doorbells/${this.doorbellId}/state`;
        this.db.ref(statePath).once('value').then((snapshot) => {
            const state = snapshot.val();
            Object.keys(state).forEach(key =>{
                this.onStateChanged(key, state[key])
            })
        });

        this.db.ref(statePath).on('child_changed', (snapshot) => {
            this.onStateChanged(snapshot.key, snapshot.val());
        });
    }



}

module.exports = DoorbellStateService;