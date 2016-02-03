// Hexdump.js 0.1.1
// (c) 2011 Dustin Willis Webber
// Hexdump is freely distributable under the MIT license.
// For all details and documentation:
// http://github.com/mephux/hexdump.js

var Hexdump;

Hexdump = (function() {
  
  // Hexdump Initializer
  // data => The string payload.
  // options => hexdump configurations
  function Hexdump(data, options) {
    var self = this;
    self.hexdump = [];
    self.hex = false;
    self.options = {
        container: options.container || ''
      , width: options.width || 16
      , byteGrouping: options.byteGrouping || 0
      , ascii: options.ascii
      , lineNumber: options.lineNumber
      , endian: options.endian || 'big'
      , html: options.html
      , base: options.base || 'hexadecimal'
      , nonPrintable: options.nonPrintable || '.'
      , style: {
          lineNumberLeft: options.style.lineNumberLeft || ''
        , lineNumberRight: options.style.lineNumberRight || ':'
        , stringLeft: options.style.stringLeft || '|'
        , stringRight: options.style.stringRight || '|'
        , hexLeft: options.style.hexLeft || ''
        , hexRight: options.style.hexRight || ''
        , hexNull: options.style.hexNull || '.'
        , stringNull: options.style.stringNull || ' '
      }
    };

    if (self.options.base == 'hex') {
      self.hex = true;
    } else if (self.options.base == 'hexadecimal') {
      self.hex = true;
    };

    // Check for the line number option and turn it off 
    // if not set unless it has been explicitly turned
    // off by the user.
    var ln = self.options.lineNumber;
    if (typeof ln == "undefined" || ln == null) {
      self.options.lineNumber = true;
    };

    var askey = self.options.ascii;
    if (typeof askey == "undefined" || askey == null) {
      self.options.ascii = false;
    };

    
    var html = self.options.html;
    if (typeof html == "undefined" || html == null) {
      self.options.html = true;
    };
    
    if (self.endian != ('little' || 'big')) {
      self.endian = 'big';
    };

    // Make sure spacing is within proper range.
    if (self.options.byteGrouping > data.length) {
      self.options.byteGrouping = data.length;
    };
    self.options.byteGrouping--;

    // Make sure width is within proper range.
    if (self.options.width > data.length) {
      self.options.width = data.length;
    };
    
    // Base padding
    self.padding = {
      hex: 4,
      dec: 5,
      bin: 8
    };
    
    // Base conversion logic
    switch(self.options.base) {
      case 'hexadecimal': case 'hex': case 16:
        self.setNullPadding(self.padding.hex);
        self.baseConvert = function(characters) {
          
          for (var i=0; i < characters.length; i++) {
            return self.addPadding(characters[i].charCodeAt(0).toString(16), self.padding.hex);
          };

        }; break;
      case 'decimal': case 'dec': case 10:
        self.setNullPadding(self.padding.dec);
        self.baseConvert = function(characters) {
          
          for (var i=0; i < characters.length; i++) {
            return self.addPadding(characters[i].charCodeAt(0), self.padding.dec);
          };

        }; break;
      case 'binary': case 'bin': case 2:
        self.setNullPadding(self.padding.bin);
        self.baseConvert = function(characters) {
          for (var i=0; i < characters.length; i++) {
            var ddx = characters[i].charCodeAt(0), r = "";
            
            for (var bbx = 0; bbx < 8; bbx++) { 
              r = (ddx%2) + r; ddx = Math.floor(ddx/2);
            };

            return self.addPadding(r, self.padding.bin);
          };
        }; break;
      default:
        self.options.base = 'hex';
        self.hex = true;

        self.setNullPadding(self.padding.hex);
        self.baseConvert = function(characters) {

          for (var i=0; i < characters.length; i++) {
            return self.addPadding(characters[i].charCodeAt(0).toString(16), self.padding.hex);
          };

      };
    };
    
    var regex = new RegExp('.{1,' + this.options.width + '}', 'g');

    self.data = data.match(regex);
    
    self.nullCount = (self.options.width - self.data[self.data.length - 1].length);
    
    self.hexCounter = 0;
    
    self.stringCounter = 0;
    
    for (var i=0; i < self.data.length; i++) {
      var tempData = self.process(self.data[i]);
      
      self.hexdump.push({
        data: tempData.data,
        string: tempData.string,
        length: self.data[i].length,
        missing: (self.options.width - self.data[i].length)
      });
    };
    
    self.dump();
  }
  
  Hexdump.prototype.dump = function() {
    var self = this;
    
    self.output = '';
    for (var i=0; i < self.hexdump.length; i++) {
      
      if (self.options.lineNumber) { 
        var tempLineNumberStyle = '';
        tempLineNumberStyle += self.options.style.lineNumberLeft;
        
        var currentLineCount = (i * self.options.width); //.toString(16);
        var temLineCount = 8 - currentLineCount.toString().length;
        for (var l=0; l < temLineCount; l++) {
          tempLineNumberStyle += '0';
        };
        
        tempLineNumberStyle += currentLineCount;
        tempLineNumberStyle += self.options.style.lineNumberRight + ' ';
        
        if (self.options.html) {
          self.output += '<span id="line-number">'+tempLineNumberStyle+'</span>';
        } else {
          self.output += tempLineNumberStyle;
        };
      };
      
      var spacingCount = 0;
      var breakPoint = Math.floor(self.options.width / 2);
      
      self.output += self.options.style.hexLeft;
      
      for (var x=0; x < self.hexdump[i].data.length; x++) {
        
        if (spacingCount == self.options.byteGrouping) {
          if (x == self.hexdump[i].data.length - 1) {
            self.output += self.hexdump[i].data[x];
          } else {
            self.output += self.hexdump[i].data[x] + ' ';
          };
          spacingCount = 0;
        } else {
          self.output += self.hexdump[i].data[x];
          spacingCount++;
        };
      };

      self.output += self.options.style.hexRight;
      
      self.appendString(self.hexdump[i]);
      self.output += "\n";
    };
    
    var hexdump_container = document.getElementById(this.options.container);
    hexdump_container.innerHTML = this.output;
  };
  
  Hexdump.prototype.appendString = function(data) {
    var self = this;
    self.output += ' ' + self.options.style.stringLeft;
    self.output += data.string;
    self.output += self.options.style.stringRight;
  };
  
  Hexdump.prototype.splitNulls = function(code) {
    var split = [];
    var buffer = "";
    
    if (code && code.length > 2) {
      for (var cc = 0; cc < code.length; cc++) {
        var tempi = cc + 1;

        if (tempi % 2 == 0) {
          
          buffer += code[cc].toString();
          split.push(buffer);

          buffer = "";

        } else {

          buffer += code[cc].toString();

        };

      };
    };
    
    return split;
  };

  Hexdump.prototype.process = function(data) {
    var self = this;
    var stringArray = [];
    var hexArray = [];
    
    for (var i=0; i < data.length; i++) {
      if (self.options.html) {
        
        var code = self.baseConvert(data[i]);

        if (self.hex) {
          var split = self.splitNulls(code);
          
          for (var y = 0; y < split.length; y++) {
            //english coloring
            if (split[y] == '4a' || split[y] == '5d') {
                hexArray.push('<span data-hex-id="' + self.hexCounter + '">' + 
                    '<span style="background-color:#ff3333">' + split[y] + '</span>'+ '</span>');
            } else {
                hexArray.push('<span data-hex-id="' + self.hexCounter + '">' + 
                split[y] + '</span>');
            }
          };

        } else {

          hexArray.push('<span data-hex-id="' + self.hexCounter + '">' + 
          code + '</span>');

        };
        
        stringArray.push('<span data-string-id="' + self.hexCounter + '">' + 
                         self.checkForNonPrintable(data[i]) + '</span>');

      } else {

        var code = self.baseConvert(data[i]);

        if (self.hex) {
          var split = self.splitNulls(code);
          
          for (var y = 0; y < split.length; y++) {
            hexArray.push(split[y]);
          };

        } else {
          hexArray.push(code);
        };

        stringArray.push(self.checkForNonPrintable(data[i]));

      };

      self.hexCounter++;
    }; 
    
   if (self.hex) {
      var splitHexWidth = self.options.width * 2;
    } else {
      var splitHexWidth = self.options.width;
    };

    if (hexArray.length < splitHexWidth) {
      var amount = (splitHexWidth - hexArray.length);

      for (var i=0; i < amount; i++) {
        var nullHex = '';

        if (self.options.html) {
          nullHex = '<span data-hex-null="true">' + self.options.style.hexNull + '</span>';
        } else {
          nullHex = self.options.style.hexNull;
        };
        
        hexArray.push(nullHex);
      };
    };
    
    if (stringArray.length < self.options.width) {
      var stringAmount = self.options.width - stringArray.length;
      for (var i=0; i < stringAmount; i++) {
        var nullString = '';

        if (self.options.html) {
          nullString = '<span data-string-null="true">' + self.options.style.stringNull + '</span>';
        } else {
          nullString = self.options.style.stringNull;
        };


        stringArray.push(nullString);
      };
    };
    
    return { data: hexArray, string: stringArray.join('') };
  };
  
  Hexdump.prototype.setNullPadding = function(padding) {
    var self = this;
    
    var hexNull = self.options.style.hexNull[0]
    self.options.style.hexNull = "";

    if (self.hex) {
      padding = padding / 2;
    };

    for (var p=0; p < padding; p++) {
      self.options.style.hexNull += hexNull;
    };
  };
  
  Hexdump.prototype.addPadding = function(ch, padding) {
    var self = this, length = ch.toString().length, pad = '';

    for (var i=0; i < (padding - length); i++) {
      //english - got rid of '00' pad for just spaces
      pad += ' '
    };
   
    if (self.options.endian == 'big') {
      return pad + ch;
    } else {
      return ch + pad;
    };
  };
  
  Hexdump.prototype.checkForNonPrintable = function(character) {
    var self = this; 
    var c = character.charCodeAt(0).toString(16);
    
    if (c == 0x9) {
      return '.'
    } else if (c == 0x7F) {
      return '.'
    } else if (c.length > 2 && self.options.ascii) {
      return '.'
    } else {
      return character;
    };

  };
  
  return Hexdump;
})();

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
/*
 * Hold all of the resources we have
 */
Bank = function() 
{
    this.balance = 0;
    this.totalSpent = 0;
    this.totalEarned = 0;
    
    /* withdraw resources - return if success */
    this.withdraw = function(amount) {
        if (this.balance >= amount) {
            this.balance -= amount;
            this.totalSpent += amount;
            return true;
        }
        return false;
    }

    /* deposit resources */
    this.deposit = function(amount) {
        this.balance += amount;
        this.totalEarned += amount;
    }
}
/*
 * Abstraction of all of the earners
 */
Tube = function(name, commonName, desc, price, cps, buyFunction, priceIncrease)
{
    //Unique Id -- Don't think I need this
    this.id = 0; //Game.ObjectsN;
    
    this.name = name;
    this.displayName = this.name;
    
    commonName = commonName.split('|');
    this.single = commonName[0];
    this.plural = commonName[1];
    this.actionName = commonName[2];
    
    this.desc = desc;
    
    this.basePrice = price;
    this.price = this.basePrice;
    this.cps = cps;
    this.totalCookies = 0;
    this.storedCps = 0;
    this.storedTotalCps = 0;
    
    this.buyFunction = buyFunction;
    this.locked = 1;
            
    this.amount = 0;
    this.bought = 0;
            
    this.getPrice = function()
    {
        var price = this.basePrice * Math.pow(this.priceIncrease, this.amount);
        return Math.ceil(price);
    }
            
    this.buy = function(amount)
    {
        var success = false;
        var moni = 0;
        var bought = 0;
        if (!amount) amount = 1;
        
        for (var i = 0; i < amount; i++)
        {
            var price = this.getPrice();
            var bought = Bank.withdraw(price);
            if (bought)
            {
                bought++;
                moni += price;
                this.amount++;
                this.bought++;
                this.price = this.getPrice();
                /* Looks like - this is how things get unlocked
                this.price = price;
                if (this.buyFunction) this.buyFunction();
                Game.recalculateGains = 1;
                if (this.amount == 1 && this.id != 0) 
                    l('row'+this.id).className = 'row enabled';
                Game.BuildingsOwned++;*/
                success = true;
            }
        }
        
        if (success) {this.refresh();}
        //Would love this feature eventually
        //if (moni>0 && amount>1) 
        //Game.Notify(this.name,'Bought <b>'+bought+'</b> for ' + Beautify(moni) + ' cookies','',2);
    }
    
    /*Sells object back at a depreciated price */
    this.sell = function(amount, bypass)
    {
        var success = 0;
        var moni = 0;
        var sold = 0;
        if (amount == -1) amount = this.amount;
        
        if (!amount) amount = 1;
            
        for (var i = 0;i < amount; i++)
        {
            var price = this.getPrice();
            price = Math.floor(price*0.5);
            if (this.amount>0)
            {
                sold++;
                moni+=price;
                Bank.deposit(price);
                this.amount--;
                price=this.getPrice();
                this.price=price;
                /* Again with the unlock stuff..
                if (this.sellFunction) this.sellFunction();
                Game.recalculateGains=1;
                if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
                Game.BuildingsOwned--;
                */
                success = true;
            }
        }
        
        if (success) {this.refresh();}
        //if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
    }
            
    this.tooltip = function()
    {
        var me=this;
        var desc = '';
        var name = '???';
        
        
        if (!me.locked)
        {
            desc = me.desc;
            name = me.name;
        }
                
        var ret = '<div style="min-width:300px;">' +
                  '<div style="float:right;"><span class="price">' + Beautify(Math.round(me.price), false) + '</span></div>' + 
                  '<div class="name">' + name + '</div>' + 
                  '<small>[owned : ' + me.amount + '</small>]' + 
                  '<div class="description">' + desc + '</div>';
        
        if (me.totalCookies > 0) {
            ret += '<div class="data">' 
            if (me.amount > 0) {
                ret += '&bull; each ' me.single + ' produces <b>' +
                        Beautify((me.storedTotalCps / me.amount) * Game.globalCpsMult, false) + '</b> ' +
                        ((me.storedTotalCps/me.amount) * Game.globalCpsMult == 1 ? 'cookie':'cookies') + ' per second<br>' : '') +
                        '&bull; ' + me.amount + ' ' + (me.amount == 1 ? me.single : me.plural) + ' producing <b>' +
                        Beautify(me.storedTotalCps * Game.globalCpsMult, false) + '</b> ' + 
                        (me.storedTotalCps * Game.globalCpsMult == 1 ? 'cookie':'cookies') + ' per second<br>' + 
                        '&bull; <b>' + Beautify(me.totalCookies, false) + '</b> ' + 
                        (Math.floor(me.totalCookies) == 1 ? 'cookie':'cookies') + ' ' + me.actionName+' so far</div>';
            }
        }
        
        ret += "</div>";
        return  ret
    }
    
    this.setSpecial = function(what)//change whether we're on the special overlay for this object or not
    {
                return;//blocked temporarily
                if (what==1) this.onSpecial=1;
                else this.onSpecial=0;
                if (this.id!=0)
                {
                    if (this.onSpecial)
                    {
                        l('rowSpecial'+this.id).style.display='block';
                        if (this.specialDrawFunction) this.specialDrawFunction();
                    }
                    else
                    {
                        l('rowSpecial'+this.id).style.display='none';
                        this.draw();
                    }
                }
    }
    
    this.unlockSpecial=function()
    {
        if (this.specialUnlocked==0 && 1==0)
        {
            this.specialUnlocked=1;
            this.setSpecial(0);
            if (this.special) this.special();
            this.refresh();
        }
    }
            
    this.refresh = function()//show/hide the building display based on its amount, and redraw it
    {
            this.price=this.getPrice();
            this.rebuild();
            if (this.amount == 0 && this.id != 0) l('row' + this.id).className='row';
            else if (this.amount>0 && this.id!=0) l('row' + this.id).className='row enabled';
            //if (!this.onSpecial) this.draw();
            //else if (this.specialDrawFunction && this.onSpecial) this.specialDrawFunction();
    }
    
    /* This is the display things mostly I think */
    this.rebuild = function()
    {
        var me=this;
        var classes='product';
        var price=me.price;
        if (Game.cookiesEarned>=me.basePrice) {classes+=' unlocked';me.locked=0;} else {classes+=' locked';me.locked=1;}
        if (Game.cookies>=price) classes+=' enabled'; else classes+=' disabled';
        if (me.l.className.indexOf('toggledOff')!=-1) classes+=' toggledOff';
                
        var iconOff='';
        var icon='';
        if (typeof me.icon=='string')
        {
            icon=me.icon+'.png';
            iconOff=me.icon+'Off.png';
        }
        else
        {
            icon=me.icon()+'.png';
            iconOff=me.icon('off')+'Off.png';
        }

        var desc=me.desc;
        var name=me.name;
        var displayName=me.displayName;
        if (Game.season=='fools')
        {
            if (!Game.foolIcons[me.name])
            {
                icon=Game.foolIcons['Unknown']+'.png';
                name=Game.foolNames['Unknown'];
                desc=Game.foolDescs['Unknown'];
            }
            else
            {
                icon=Game.foolIcons[me.name]+'.png';
                name=Game.foolNames[me.name];
                desc=Game.foolDescs[me.name];
            }
            iconOff=icon;
            displayName=name;
            if (name.length>16) displayName='<span style="font-size:75%;">'+name+'</span>';
        }
                
        me.l.className=classes;
        l('productIcon'+me.id).style.backgroundImage='url(img/'+icon+')';
        l('productIconOff'+me.id).style.backgroundImage='url(img/'+iconOff+')';
        l('productName'+me.id).innerHTML=displayName;
        l('productOwned'+me.id).innerHTML=me.amount?me.amount:'';
        l('productPrice'+me.id).innerHTML=Beautify(Math.round(me.price));
    }
            
    this.draw=function(){};
}
