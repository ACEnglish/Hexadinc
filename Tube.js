Tube = function(name, commonName, desc, icon, art, price, cps, buyFunction, priceIncrease)
{
    this.id = Game.ObjectsN;
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
    this.icon = icon;
    this.art = art;
    if (art.base)
    {
        art.pic = art.base+'.png'; 
        art.bg=art.base+'Background.png';
    }
    this.buyFunction = buyFunction;
    this.locked = 1;
    this.vanilla = Game.vanilla;
            
    this.special = null;//special is a function that should be triggered when the object's special is unlocked, or on load (if it's already unlocked). For example, creating a new dungeon.
    this.onSpecial = 0;//are we on this object's special screen (dungeons etc)?
    this.specialUnlocked = 0;
    this.specialDrawFunction = null;
    this.drawSpecialButton = null;
    
    this.amount = 0;
    this.bought = 0;
            
    this.getPrice = function()
    {
        var price = this.basePrice * Math.pow(Game.priceIncrease, this.amount);
        if (Game.Has('Season savings')) price *= 0.99;
        if (Game.Has('Santa\'s dominion')) price *= 0.99;
        if (Game.Has('Faberge egg')) price *= 0.99;
        return Math.ceil(price);
    }
            
    this.buy=function(amount)
    {
        var success = 0;
        var moni = 0;
        var bought = 0;
        if (!amount) amount = 1;
        
        for (var i = 0; i < amount; i++)
        {
            var price = this.getPrice();
            if (Game.cookies >= price)
            {
                bought++;
                moni += price;
                Game.Spend(price);
                this.amount++;
                this.bought++;
                price = this.getPrice();
                this.price = price;
                if (this.buyFunction) this.buyFunction();
                Game.recalculateGains = 1;
                if (this.amount == 1 && this.id != 0) 
                    l('row'+this.id).className = 'row enabled';
                Game.BuildingsOwned++;
                success = 1;
            }
        }
        
        if (success) {this.refresh();}
        if (moni>0 && amount>1) 
            Game.Notify(this.name,'Bought <b>'+bought+'</b> for ' + Beautify(moni) + ' cookies','',2);
    }

    this.sell = function(amount, bypass)
    {
        var success = 0;
        var moni = 0;
        var sold = 0;
        if (amount == -1) amount = this.amount;
        if (!amount) amount = 1;
            
        for (var i = 0;i < amount; i++)
        {
            var price=this.getPrice();
            price=Math.floor(price*0.5);
            if (this.amount>0)
            {
                sold++;
                moni+=price;
                Game.cookies+=price;
                this.amount--;
                price=this.getPrice();
                this.price=price;
                if (this.sellFunction) this.sellFunction();
                Game.recalculateGains=1;
                if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
                Game.BuildingsOwned--;
                success=1;
            }
        }
        
        if (success) {this.refresh();}
        if (moni>0) Game.Notify(this.name,'Sold <b>'+sold+'</b> for '+Beautify(moni)+' cookies','',2);
    }
            
    this.tooltip=function()
    {
        var me=this;
        var desc=me.desc;
        var name=me.name;
        if (Game.season=='fools')
        {
            if (!Game.foolIcons[me.name])
            {
                name=Game.foolNames['Unknown'];
                desc=Game.foolDescs['Unknown'];
            } else {
                name=Game.foolNames[me.name];
                desc=Game.foolDescs[me.name];
            }
        }
        
        if (me.locked)
        {
            name='???';
            desc='';
        }
                
        return '<div style="min-width:300px;"><div style="float:right;"><span class="price">'+Beautify(Math.round(me.price))+'</span></div><div class="name">'+name+'</div>'+'<small>[owned : '+me.amount+'</small>]'+
                '<div class="description">'+desc+'</div>'+
                (me.totalCookies>0?(
                    '<div class="data">'+
                    (me.amount>0?'&bull; each '+me.single+' produces <b>'+Beautify((me.storedTotalCps/me.amount)*Game.globalCpsMult,1)+'</b> '+((me.storedTotalCps/me.amount)*Game.globalCpsMult==1?'cookie':'cookies')+' per second<br>':'')+
                    '&bull; '+me.amount+' '+(me.amount==1?me.single:me.plural)+' producing <b>'+Beautify(me.storedTotalCps*Game.globalCpsMult,1)+'</b> '+(me.storedTotalCps*Game.globalCpsMult==1?'cookie':'cookies')+' per second<br>'+
                    '&bull; <b>'+Beautify(me.totalCookies)+'</b> '+(Math.floor(me.totalCookies)==1?'cookie':'cookies')+' '+me.actionName+' so far</div>'
                ):'')+
                '</div>';
    }
            
    this.setSpecial=function(what)//change whether we're on the special overlay for this object or not
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
            
    this.refresh=function()//show/hide the building display based on its amount, and redraw it
    {
            this.price=this.getPrice();
            this.rebuild();
            if (this.amount==0 && this.id!=0) l('row'+this.id).className='row';
            else if (this.amount>0 && this.id!=0) l('row'+this.id).className='row enabled';
            if (!this.onSpecial) this.draw();
            //else if (this.specialDrawFunction && this.onSpecial) this.specialDrawFunction();
    }

    this.rebuild=function()
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
