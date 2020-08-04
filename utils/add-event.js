function now(){
    return new Date().getTime();
}
function addEvent(db, did, event, payload){
    console.log('[DEBUG] addEvent', event, payload);
    if(typeof event === "string"){
        event = {
            type: event,
        }
    }
    
    if(payload){
        event.payload = payload;
    }
    

    return db.ref('doorbells/' + did + '/events/'+now()).set(event);
}


module.exports = addEvent;