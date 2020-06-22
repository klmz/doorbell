var { capitalize, addEvent } = require('../utils');

class SensorService {
    constructor(db, doorbellId) {
        this.db = db;
        this.doorbellId = doorbellId;
        this.mapping = {};
    }

    setMapping(mapping) {
        this.mapping = mapping;
    }

    addToMapping(mappingEntry) {
        this.mapping = {
            ...this.mapping,
            mappingEntry
        }
        return this;
    }

    init() {
        const sensorRegex = /\[([A-Z0-9]*)\]StateEvent: sensor_type=([a-z]*), state=([a-z]*), battery=([0-9]*), signal=([0-9]*)/;
        var spawn = require('child_process').spawn;
        this.py = spawn('python', ['/home/pi/wyzesense/WyzeSensePy/sample.py'], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
        var errorString = '';
        var dataString = '';

        this.py.stdout.on('data', (data) => {
            dataString += data.toString();
            var sensorData = data.toString('utf8')
            if (!sensorData.includes('StateEvent')) return;

            const [match, sensorId, sensorType, state, battery, signal] = sensorData.match(sensorRegex);
            const sensorName = this.mapping[sensorId] ? this.mapping[sensorId] : sensorId;
            
            let message;
            switch (sensorType) {
                case 'motion':
                    message = `${sensorName} ${state === "active" ? "detected" : "no longer detects"} motion.`
                    break;
                case 'switch':
                    message = `${sensorName} was ${state == "open" ? "opened" : "closed"}.`
                    break;
            }
            if (battery < 30) {
                addEvent(this.db, this.doorbellId, "BATTERY_LOW", { sensorId })
            }
            message = capitalize(message);
            addEvent(this.db, this.doorbellId, "SENSOR_TRIGGERED", { sensorId, sensorName, state, message })
        });

        /*Once the stream is done (on 'end') we want to simply log the received data to the console.*/
        this.py.stdout.on('end', () => {
            console.log('End:', dataString);
        });

        this.py.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        /*Once the stream is done (on 'end') we want to simply log the received data to the console.*/
        this.py.stderr.on('end', () => {
            console.log('Error end:', errorString);
        });
    }

    kill(){
        console.log("[INFO] Killing python");
        this.py.kill();
    }
}

module.exports = SensorService;