var NodeWebcam = require("node-webcam");
var { generateId } = require('../utils')
var serviceAccount = require("../admin-cred.json");
var onvif = require('node-onvif');
var config = require('../config');
class Camera {
    constructor(storage) {
        this.storage = storage;
        this.opts = {
            callbackReturn: "buffer",
            rotation: 180
        };
    }

    captureImage() {
        return new Promise((resolve, reject) => {
        
            if (config.camType == "USB"){
                NodeWebcam.capture("test_picture", this.opts, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
                });
            }
            if (config.camType == "ONVIF"){
            console.log(`[DEBUG] Starting image capture using: ${config.xaddrOnvif}`)
        
            // Create an OnvifDevice object
            let device = new onvif.OnvifDevice({
            xaddr: config.xaddrOnvif,
            user : config.userOnvif,
            pass : config.passOnvif
            });
            
            // Initialize the OnvifDevice object
            device.init().then(() => {
            // Get the data of the snapshot
            console.log('[DEBUG] Fetching the snapshot...');
            return device.fetchSnapshot();
            }).then((res) => {
                console.log('[DEBUG] Done!');
                resolve(res.body);
            });
        }
        }).catch(error => {
            if (error.message == "No webcam found") {
                console.log('[WARN] webcam not connected');
                this.image = null;
                return;
            }
            throw error;
        });
    }

    captureToDownloadLink() {
        return new Promise((resolve, reject) => {
            this.captureImage().then(async (imageData) => {
                let filename = `images/${generateId(10)}.jpg`;
                console.log(`[DEBUG] Saving ${filename}`);
                let file = await this.storage.file(filename);
                await file.save(imageData);

                // let url = (await file.getSignedUrl({
                //     expires: new Date().getTime() + 604800,
                //     action: 'read'
                // }))[0]
                const url = `gs://${serviceAccount.project_id}.appspot.com/${filename}`
                resolve(url);
            }).catch(e => reject(e));
        });
    }
}

module.exports = Camera;