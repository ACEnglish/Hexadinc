var payload = document.getElementById("payload");
payloadBuffer = [];
var payloadDump = function() { payload.value = payloadBuffer.join(""); };

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

var getRandomChar = function() {
    x = getRandomInt(32, 127);
    return String.fromCharCode(x)
};

for( var i = 0; i < 200; i++) {
    payloadBuffer.push(getRandomChar());
};

payloadDump();

hexdumpProperties = {container: 'hexdump',
                    base: 'hex',
                    width: 10,
                    html: true,
                    ascii: true,
                    bytegroup: 0,
                    lineNumber: true,
                    style: {
                        lineNumberLeft: '',
                        lineNumberRight: ':',
                        stringLeft: '|',
                        stringRight: '|',
                        hexLeft: '',
                        hexRight: '',
                        hexNull: '',
                        stringNull: ''
                    }};

var hexdump = new Hexdump(payload.value, hexdumpProperties);

var hexRefresh = function() { hexdump.constructor(payload.value, hexdumpProperties); }

setInterval(function() {
    payloadBuffer.shift(); payloadBuffer.push(getRandomChar());
    payloadDump();
    hexRefresh();
}, 50);

