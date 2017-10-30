var ami = require('../GlobeModules/ami');
var sql = require('../GlobeModules/mssql');
var request = new sql.Request();

var resp, prog = 0 ;

var i =1;
function timer(){
    i++;
    //getArr(request);
    trank(request);
    setTimeout(timer, 2000);
}
timer();


function getArr(request){
    request.query('exec TELESHOP.dbo.sipGetProgressiveDial').then(function(recordset) {
        if(recordset.length){
            console.log(recordset)
            for(var i=0; i<recordset.length;i++){
                if(recordset[i].command=="Call"){
                    prog = recordset.length;
                    sendToAmi(recordset[i])
                }else{
                    getChanel(recordset[i].phone+'|'+recordset[i].idcontact);
                }
            }
        }
    }).catch(function(err) {
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log(err);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
    })
    return;
}
function getChanel(phone){
    var strTest = new RegExp(phone);
    var getChanel = new RegExp('progressive');
    var ring = new RegExp('Ring');
    var dial = new RegExp('Dial');
    var local = new RegExp('Local');
    var h;
    var space;
    ami.action({
        'action' :'Command',
        'Command'	: 'core show channels concise',
    }, function(err, res) {
        space = res.content.split("\n")
        for(var a = 0; a<space.length; a++){
            if(getChanel.test(space[a])){
                if(ring.test(space[a])||dial.test(space[a])){
                    channelArr = space[a].split("!")
                    for(var i = 0; i<channelArr.length; i++){
                        if(strTest.test(channelArr[i])){
                            if(local.test(channelArr[i])){
                                h = space[a].split("!")[0];
                                ami.action({
                                    'action' :'Command',
                                    'Command' : "hangup request " + h
                                }, function(err, res) {
                                })
                            }
                        }
                    }
                }
            }
        }
    });
}
function sn(sip){
    var input = '';
    if(sip){
        input = sip;
    }
    return input;
}
function sendToAmi(arr){
    var channel = 'Local/'+arr.phone+'|'+ arr.idcontact +'|'+ arr.sequence +'@progressive';
    var exten2 = arr.idcontact+"|"+
        sn(arr.sip)+
        sn(arr.sip01)+
        sn(arr.sip02)+
        sn(arr.sip03)+
        sn(arr.sip04)+
        sn(arr.sip05)+
        sn(arr.sip06)+
        sn(arr.sip07)+
        sn(arr.sip08)+
        sn(arr.sip09)+
        sn(arr.sip10)
    //console.log(exten2)
    var exten = exten2;
    var callerid = arr.phone+'|'+ arr.idcontact +' <' +arr.phone+'|'+ arr.idcontact+'>';
    console.log(exten)
    ami.action({
        'action'	:'Originate',
        'channel'	: channel,
        'context'	: 'progressive',
        'exten' 	: exten,
        'account' 	: exten,
        'callerid'	: callerid,
        'async' 	:true,
        'priority'	:1
    }, function(err, res) {
        if(err){
            console.log(err);
        }
    });
}
function trank(request){
   // var mtc = new RegExp('MTC');
    var mtc = new RegExp('192.168.10.220');
    var mtcV = 0;
    var kc1 = new RegExp('192.168.10.222');
    //var kc1 = new RegExp('KC1');
    var kc1V = 0;
    var kc2 = new RegExp('192.168.10.226');
    //var kc2 = new RegExp('KC2');
    var kc2V = 0;
    var YKPTEL = new RegExp('0442907007');
    var YKPTELV = 0;
    var DATAGROUP = new RegExp('0443640710');
    var DATAGROUPV = 0;
    //var life = new RegExp('slave16000');
    var life = new RegExp('slave16000');
    var lifeV = 0;
    var trankLen;
    ami.action({
        'action' :'Command',
        'Command'	: 'core show channels verbose',
    }, function(err, res) {
        try {
            trankLen = res.content.split(" ");
            for (var i = 0; i < trankLen.length; i++) {
                //console.log(trankLen[i]);
                if (mtc.test(trankLen[i])) {
                    mtcV++;
                } else if (kc1.test(trankLen[i])) {
                    kc1V++;
                } else if (kc2.test(trankLen[i])) {
                    kc2V++;
                } else if (YKPTEL.test(trankLen[i])) {
                    YKPTELV++;
                } else if (DATAGROUP.test(trankLen[i])) {
                    DATAGROUPV++;
                } else if (life.test(trankLen[i])) {
                    lifeV++;
                }
            }
            var sum = (mtcV + kc1V + kc2V + YKPTELV + DATAGROUPV + lifeV) / 2;
            resp = '<html><table>' +
                '<tr><td>MTC</td><td>' + mtcV / 2 + '</td></tr>' +
                '<tr><td>KC(222)</td><td>' + kc1V / 2 + '</td></tr>' +
                '<tr><td>KC(226)</td><td>' + kc2V / 2 + '</td></tr>' +
                '<tr><td>UKRTELECOM</td><td>' + YKPTELV / 2 + '</td></tr>' +
                '<tr><td>DATAGROUP</td><td>' + DATAGROUPV / 2 + '</td></tr>' +
                '<tr><td>Life</td><td>' + lifeV / 2 + '</td></tr>' +
                '<tr><td>ALL</td><td>' + sum + '</td></tr>';
            request.query("exec TELESHOP.dbo.sipTrankStat @trunkname='MTC',@Qsessions=" + mtcV)
            request.query("exec TELESHOP.dbo.sipTrankStat @trunkname='KC1',@Qsessions=" + kc1V)
            request.query("exec TELESHOP.dbo.sipTrankStat @trunkname='KC2',@Qsessions=" + kc2V)
            request.query("exec TELESHOP.dbo.sipTrankStat @trunkname='YKPTEL',@Qsessions=" + YKPTELV)
            request.query("exec TELESHOP.dbo.sipTrankStat @trunkname='DATAGROUP',@Qsessions=" + DATAGROUPV)
            request.query("exec TELESHOP.dbo.sipTrankStat @trunkname='LIFE',@Qsessions=" + lifeV)
        }catch(e){
            console.log(e)
        }
    })
}

module.exports = (function() {
    function ProgressService(req, res) {}

    ProgressService.prototype = {
        get: function (req, res) {
            res.send(resp+  '<tr><td>Get to progres</td><td>'+prog+'</td></tr>' +
                '</table></html>')
        }
    }
    return ProgressService;
})()