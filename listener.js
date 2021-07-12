var ncp = require("copy-paste");
const ClipboardListener = require('clipboard-listener');


class Listener {
    constructor() {
        this.listener = new ClipboardListener({
            timeInterval: 250,
            immediate: true
          });
          this.listener.on('change', value => {
            if(value === this.currentValue) {
                return;
            }
            this.currentValue = value;
            if(this.handleCallback) {
                this.handleCallback(value);
            }
        });
    }

    writeToClipboard(value) {
        this.currentValue = value;
        ncp.copy(value);
    }

    handleClipboardChange(callback) {
        this.handleCallback = callback;
    }
}

module.exports = new Listener();