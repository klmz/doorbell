var NodeWebcam = require("node-webcam");
var { generateId } = require('../utils')
var serviceAccount = require("../admin-cred.json");

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
            NodeWebcam.capture("test_picture", this.opts, function (err, data) {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
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
                let file = await this.storage.file(filename)
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