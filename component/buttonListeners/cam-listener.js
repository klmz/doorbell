var NodeWebcam = require("node-webcam");
var { generateId, addEvent } = require('../../utils')


class CamListener{
    constructor(storage, notificationService){
        this.storage = storage;
        this.notificationService = notificationService;
        this.opts = {
            callbackReturn: "buffer"
        };
        this.image = null;
        
    }
    onDown(eventId){
        this.image = new Promise((resolve, reject) => {
            NodeWebcam.capture("test_picture", this.opts, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        }).catch(error=>{
            if(error.message == "No webcam found"){
                console.log('[WARN] webcam not connected');
                this.image = null;
                return;
            }
            throw error;
        });
    }
    onUp(eventId){
        if (!this.image) {
            return
        }

        let filename = `images/${generateId(10)}.jpg`;
        let tag = eventId
        this.image.then(async (imageData) => {
                let file = await this.storage.file(filename)
                await file.save(imageData);
                
                let url = (await file.getSignedUrl({
                    expires: new Date().getTime() + 604800,
                    action: 'read'
                }))[0]

                console.log('Saving for tag: '+ eventId);
                console.log(url);
                this.notificationService.sendNotification(doorbellId, {
                    notification: {
                        title: 'Er belde iemand aan!',
                        body: `Bij de deurbel ${doorbellId}.`,
                        type: 'RING',
                        image: url,
                        tag
                    }
                })
                this.image = null;
            })
            .catch(() => {
                console.log("[DEBUG] No camera was found.")
            })
    }
}

module.exports = CamListener;