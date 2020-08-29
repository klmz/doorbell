var config = module.exports = {};

// Configuration for the camera type 
config.camType = 'ONVIF'; // ONVIF | USB | NONE

config.xaddrOnvif = 'http://192.168.1.4:9001/onvif/devices'; //Replace axample with ONVIF address
config.userOnvif = 'username';
config.passOnvif = 'password';

// Configuration for sensorservice
config.sensorEnabled = false; // TRUE | FALSE
