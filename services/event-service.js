class EventService{
    constructor(db, doorbellId){
        this.db = db;
        this.doorbellId = doorbellId;
        this.setupDbListeners();
        this.listeners = [];
    }

    addListener(listener){
        this.listeners.push(listener);
    }

    onEvent(event){
        this.listeners.forEach(async listener => {
            if(!listener.handlesEventType(event.type)){
                return;
            }

            await listener.onEvent(event);
        })
    }

    setupDbListeners(){
        var startup = true;
        setTimeout(()=>startup=false, 5000);
        this.db.ref(`doorbells/${this.doorbellId}/events/`).on('child_added', async (value) =>{
            if(startup){
                return;
            }
            
            var event = value.val();
            console.log('Event', event);
            this.onEvent(event);
        })
    }
}

module.exports = EventService;