var ami = require('../GlobeModules/ami');
var sql = require('../GlobeModules/mssql');

var conf = require('../../conf/conf');

var request = new sql.Request();

var resp, prog =0;

var i =1;
function timer(){
    i++;
    getArr(request);
    trank(request);
    setTimeout(timer, 2000);
}
timer();


function getArr(request){
    request.query('exec TELESHOP.dbo.sipGetPreDial').then(function(recordset) {
//console.log(recordset)        
if(recordset&&recordset.length){
          //  console.log(recordset)
            for(var i=0; i<recordset.length;i++){
				prog = recordset.length;
                if(recordset[i].command=="Call"){
                    //prog = recordset.length;
                    sendToAmi(recordset[i])
                }else{
                    getChanel(recordset[i].phone+'|'+recordset[i].idcontact);
                }
            }
        }
    }).catch(function(err) {
        console.log("+++++++++++++++exec TELESHOP.dbo.sipGetPreDial++++++++++++++++++++++++++++++++++")
        console.log(err);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
    })
    return;
}
function getChanel(phone){
    try {
        var strTest = new RegExp(phone);
        var getChanel = new RegExp('progressive');
        var ring = new RegExp('Ring');
        var dial = new RegExp('Dial');
        var local = new RegExp('Local');
        var h;
        var space;
        ami.action({
            'action': 'Command',
            'Command': 'core show channels concise',
        }, function (err, res) {
            try {
                space = res.content.split("\n")
                for (var a = 0; a < space.length; a++) {
                    if (getChanel.test(space[a])) {
                        if (ring.test(space[a]) || dial.test(space[a])) {
                            channelArr = space[a].split("!")
                            for (var i = 0; i < channelArr.length; i++) {
                                if (strTest.test(channelArr[i])) {
                                    if (local.test(channelArr[i])) {
                                        h = space[a].split("!")[0];
                                        ami.action({
                                            'action': 'Command',
                                            'Command': "hangup request " + h
                                        }, function (err, res) {
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }catch(e){
                console.log(e);
            }
        });
    }catch(e){
        console.log(e);
    }
}
function sn(sip){
    var input = '';
    if(sip){
        input = sip;
    }
    return input;
}
function sendToAmi(arr){
   //arr.phone = '0952750527' //!!!!!!!!!!!!!!!!!!!!!
    var channel = 'Local/'+arr.phone+'|'+arr.sip+'|'+arr.idcontact+'|'+arr.amd+'@predial';
    console.log(arr.context)
    if(arr.context!='dtmf'){
        arr.context = 'pickUp';
    }
    var exten2 = arr.sip+"."+ arr.idcontact;
    //var exten2 = arr.idcontact+"|"+
    //    sn(arr.sip)+
    //    sn(arr.sip01)+
    //    sn(arr.sip02)+
    //    sn(arr.sip03)+
    //    sn(arr.sip04)+
    //    sn(arr.sip05)+
    //    sn(arr.sip06)+
    //    sn(arr.sip07)+
    //    sn(arr.sip08)+
    //    sn(arr.sip09)+
    //    sn(arr.sip10)
    console.log('exten', exten2)
    var exten = exten2;
    var callerid =  arr.idcontact +' <'+arr.idcontact+'>';
    console.log(channel)
    ami.action({
        'action'	:'Originate',
        'channel'	: channel,
        'context'	: arr.context,
        'exten' 	: exten2,
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
//sendToAmi(
//{ sip: '0',
//    sip01: '',
//    sip02: '',
//    sip03: '',
//    sip04: '',
//    sip05: '',
//    sip06: '',
//    sip07: '',
//    sip08: '',
//    sip09: '',
//   sip10: '',
//    idcontact: 25000,
//    phone: '0952750527',
//    sequence: 0,
//    command: 'Call',
//    IDCONTACTTYPE: 0,
//    context: 'dtmf',
//    amd: 'no' }
//)

function trank(request){
 //var strTest = new RegExp(phone);
    var getChanel = new RegExp('Local');
    var ring = new RegExp('103');
    var dial = new RegExp('|');
    var local = new RegExp('Local');
    var h = 0;
    var space;
    ami.action({
        'action' :'Command',
        'Command'	: 'core show channels verbose',
    }, function(err, res) {
        space = res.content.split(" ")
        for(var a = 0; a<space.length; a++){
            if(getChanel.test(space[a])){
                if(ring.test(space[a])&&ring.test(space[a])){
				//console.log('=========---------============')
					//console.log(space[a])
					h++;
                }
            }
        }
		//console.log('========================')
		resp = '<html><table>' +
					
                    '<tr><td>All in asterisk</td><td>' + h / 5 + '</td></tr>'
				//'</table></html>';
		//console.log(resp)
    });
}

module.exports = (function() {
    function CallbackService(req, res) {}
    CallbackService.prototype = {
        get: function (req, res) {
			var respo = resp + '<tr><td>Get from db</td><td>' + prog + '</td></tr></table></html>'
			res.send(respo)
        }
    }
    return CallbackService;
})()
