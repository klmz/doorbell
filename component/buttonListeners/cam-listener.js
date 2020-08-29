var NodeWebcam = require("node-webcam");
var { addEvent } = require('../../utils')
const URL = require('url');

class CamListener{
    constructor(notificationService, doorbellId, db, camera, storage, button){
        this.notificationService = notificationService;
        this.opts = {
            callbackReturn: "buffer",
            rotation: 180
        };
        this.image = null;
        this.doorbellId = doorbellId;
        this.db = db;
        this.camera = camera;
        this.storage = storage;
        this.button = button;
    }
    async getImageUrl(url){
         const path = URL.parse(url).pathname.split(".")[0].substring(1);
         const files = await this.storage.getFiles({
             prefix: path,
             delimiter: "/",
             autoPaginate: false
         });

         if(files[0].length == 0){
             console.error(`[ERROR] could not find ${imageUrl}.`);
             return;
         }
         
         let imageUrl = (await files[0][0].getSignedUrl({
                 expires: new Date().getTime() + 604800000,
                 action: 'read'
             }))[0]
        return imageUrl;
    }
    onDown(eventId){
        if (this.button.ignoreEvent){
            console.log("[DEBUG] Ignoring double presses, no event generated.");
        }
        if (!this.button.ignoreEvent){
            addEvent(this.db, this.doorbellId, "RING", { tag: eventId});
            this.image = this.camera.captureToDownloadLink();
        }
    }
    onUp(eventId){
        if (!this.button.ignoreEvent) {
            if (!this.image) {
                return
            }
    
            let tag = eventId
            this.image.then(async (url) =>{
                addEvent(this.db, this.doorbellId, "RING", { tag: eventId, url: url});
                // convert url to signed url
                const imageUrl = await this.getImageUrl(url);
                
                this.notificationService.sendNotification(this.doorbellId, {
                    notification: {
                        title: 'Er belde iemand aan!',
                        body: `Bij de deurbel ${this.doorbellId}.`,
                        type: 'RING',
                        image: imageUrl,
                        tag
                    }
                })
                this.image = null;
            }).catch((e) => {
                console.log("[DEBUG] Something went wrong with capturing the image: ",e);
            }) 
        }  
    }
}

module.exports = CamListener;
