var { sleep } = require('../utils')

class Gong {

    constructor(gpio, channel){
        this.isOn = true;
        this.isIgnoring = false;
        this.gpio = gpio;
        this.channel = channel;

        //setup gpio
        this.gpio.setup(this.channel, this.gpio.DIR_OUT, () => {
            this.off();
        });
    }


    // This is a state listener function
    handlesKey(key){
        return key === 'gong';
    }

    // This is a state listener function
    onStateChanged(key, isOn){
        if(key != 'gong') return;
        this.isOn = isOn;
    }

    toggle(isOn){
        if(typeof isOn === "undefined"){
            this.isOn = !this.isOn;
            return
        }
        this.isOn = isOn;
    }
    ignore() {
        this.isIgnoring = true;
        setTimeout(() => this.isIgnoring = false, 30);
    }

    on() {
        if (this.isIgnoring || !this.isOn) return;
        this.gpio.write(this.channel, false)
        this.ignore();
    };
    
    off() {
        if (this.isIgnoring || !this.isOn) return;
        this.gpio.write(this.channel, true)
        this.ignore();
    };

    async beepOnce(delay, n) {
        if (delay <= 30) {
            console.error('Delay needs to be bigger than 30 ms');
            return;
        }
        while (n > 0) {
            this.on();
            await sleep(delay);
            this.off();
            await sleep(delay);
            n--;
        }

    }
}

module.exports = Gong;