//Beautify and number-formatting adapted from the Frozen Cookies add-on
//(http://cookieclicker.wikia.com/wiki/Frozen_Cookies_%28JavaScript_Add-on%29)
function formatEveryThirdPower(notations)
{
    return function (value)
    {
        var base = 0,
        notationValue = '';
        if (value >= 1000000 && isFinite(value))
        {
            value /= 1000;
            while(Math.round(value) >= 1000)
            {
                value /= 1000;
                base++;
            }
            if (base > notations.length) {return 'Infinity';} else {notationValue = notations[base];}
        }
        return ( Math.round(value * 1000) / 1000 ) + notationValue;
    };
}

function rawFormatter(value) {return Math.round(value * 1000) / 1000;}

var numberFormatters =
[
    rawFormatter,
    formatEveryThirdPower([
        '',
        ' million',
        ' billion',
        ' trillion',
        ' quadrillion',
        ' quintillion',
        ' sextillion',
        ' septillion',
        ' octillion',
        ' nonillion',
        ' decillion'
    ]),
    formatEveryThirdPower([
        '',
        ' M',
        ' B',
        ' T',
        ' Qa',
        ' Qi',
        ' Sx',
        ' Sp',
        ' Oc',
        ' No',
        ' Dc'
    ])
];

function Beautify(value, full)
{
    floats = 2
    var negative=(value<0);
    var decimal='';
    if (value < 1000000 && floats > 0) decimal = '.' + (value.toFixed(floats).toString()).split('.')[1];
    value = Math.floor(Math.abs(value));
    if (full == undefined)
        var formatter = numberFormatters[0];
    else
        var formatter = numberFormatters[full ? 1 : 2];
    var output = formatter(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');
    return negative ? '-' + output:output+decimal;
}

beautifyInTextFilter = /(([\d]+[,]*)+)/g; //new regex
var a = /\d\d?\d?(?:,\d\d\d)*/g; //old regex
function BeautifyInTextFunction(str){return Beautify(parseInt(str.replace(/,/g,''),10));};
function BeautifyInText(str) {return str.replace(beautifyInTextFilter, BeautifyInTextFunction);}//reformat every number inside a string

function BeautifyAll()//run through upgrades and achievements to reformat the numbers
{
    var func=function(what){what.desc=BeautifyInText(what.baseDesc);}
    Game.UpgradesById.forEach(func);
    Game.AchievementsById.forEach(func);
}
