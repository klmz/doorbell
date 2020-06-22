var { generateId } = require('../utils');
class Button {

    constructor(gpio, gong, channel) {
        this.gpio = gpio;
        this.gong = gong;
        this.channel = channel;
        this.buttonDown = false;
        this.image = null;
        this.onDownListeners = [];
        this.onUpListeners = [];
        this.onResetListeners = [];
        this.latestEventId = null;
        this.setupButton();
    }

    setupButton() {
        this.gpio.on('change', this.onChange.bind(this));
        this.gpio.setup(this.channel, this.gpio.DIR_IN, this.gpio.EDGE_BOTH);
    }

    addOnButtonUpListener(listener) {
        this.onUpListeners.push(listener);
    }

    onUp(eventId) {
        this.onUpListeners.forEach(async listener => {
            await listener.onUp(eventId);
        })
    }

    addOnButtonDownListener(listener) {
        this.onDownListeners.push(listener);
    }

    onDown(eventId) {
        this.onDownListeners.forEach(async listener => {
            await listener.onDown(eventId);
        })
    }

    addOnResetListener(listener) {
        this.onResetListeners.push(listener);
    }

    onReset(eventId) {
        this.onResetListeners.forEach(async listener => {
            await listener.onReset(eventId);
        })
    }

    reset(eventId) {
        if (this.buttonDown) {
            this.onReset(eventId);
        }
        this.buttonDown = false;
    }
    
    async onChange(channel, pressed) {
        if (this.gong.isIgnoring) return;
        
        switch (true) {
            case channel == this.channel: //handle button press
                if (pressed) {
                    this.latestEventId = generateId(30);
                    this.onDown(this.latestEventId)
                    this.buttonDown = true;
                    setTimeout(() => this.reset(this.latestEventId), 10000)
                } else {
                    this.onUp(this.latestEventId)
                    this.buttonDown = false;
                }
                break;
            default:
                console.log('Unknown button');
        }
    }

    simulateRing(){
        this.onChange(this.channel, true)
        setTimeout(() => this.onChange(this.channel, false), 1000);
        console.log('done');
    }
}

module.exports = Button;