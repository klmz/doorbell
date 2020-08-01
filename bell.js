var firebase = require('firebase');
var gpio = require('rpi-gpio');
var admin = require("firebase-admin");
var { addEvent } = require('./utils')
var NotificationService = require('./services/notification-service')
var SensorService = require('./services/sensor-service')
var DoorbellStateService = require('./services/doorbell-state-service')
var EventService = require('./services/event-service');
var Gong = require('./component/gong');
var Button = require('./component/button');
var CamListener = require('./component/buttonListeners/cam-listener');
var GongListener = require('./component/buttonListeners/gong-listener');
var DiscoveryModeListener = require('./component/buttonListeners/discovery-mode-listener');
var Camera = require('./component/camera');
const URL = require('url');
// Setup gracefull terminiation
process.on('SIGINT', function () {
    console.log("Caught interrupt signal");
    console.log("[INFO] Going offline");
    sensorService.kill();
    console.log("[INFO] Done!");
    addEvent(db, doorbellId, 'OFFLINE');
    process.exit()
});


var serviceAccount = require("./admin-cred.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});
var storage = admin.storage().bucket(`${serviceAccount.project_id}.appspot.com`);
var db = admin.database();

//Setup GPIO
gpio.setMode(gpio.MODE_BCM)

// Setup all my 'services'
// Setup doorbell components
let doorbellId = "voordeur";
const notificationService = new NotificationService(admin, doorbellId);

let sensorService = new SensorService(db, doorbellId);
sensorService.setMapping({
    "777C09A1": 'de la',
    "777D55B1": "achterdeur",
    "777D54F3": "voordeur"
})
sensorService.init();

let doorbellStateService = new DoorbellStateService(db, doorbellId);

let eventService = new EventService(db, doorbellId);
eventService.addListener({
    handlesEventType: (type) => type === "REMOTE_RING",
    onEvent: async (event) => {
        const { n, delay } = event.payload;
        await gong.beepOnce(delay, n);
    }
})

let gong = new Gong(gpio, 20);
doorbellStateService.addOnStateChangedListener(gong);
let button = new Button(gpio, gong, 17); //p0

let gongListener = new GongListener(gong, db, doorbellId, notificationService);
button.addOnButtonDownListener(gongListener);
button.addOnButtonUpListener(gongListener);

let camera  = new Camera(storage);
let camListener = new CamListener(notificationService, doorbellId, db, camera, storage);
button.addOnButtonDownListener(camListener);
button.addOnButtonUpListener(camListener);
eventService.addListener({
    handlesEventType: (type) => type === "CAPTURE_IMAGE",
    onEvent: async (event) => {
        console.log('CAPUTREIMAGE', event);
        if(event.payload.url){
            return;
        }

        const imageUrl = await camera.captureToDownloadLink();

        addEvent(db, doorbellId, 'CAPTURE_IMAGE', {
            ...event.payload,
            url: imageUrl
        })
    }
})


let discoveryModeListener = new DiscoveryModeListener(doorbellId, db, gong);
doorbellStateService.addOnStateChangedListener(discoveryModeListener);
button.addOnButtonUpListener(discoveryModeListener);


//Initialize the state service after all components and services are connected to it,
// this will get the intial state from firebase and listen to changes
doorbellStateService.init()

addEvent(db, doorbellId, 'ONLINE')
console.log("[INFO] Going online");
setTimeout(() => {
    console.log('Simulating ring');
    button.simulateRing();
}, 4000)

