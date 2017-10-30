var sql = require('./components/GlobeModules/mssql');
var request = new sql.Request();

var AGIServer = require('ding-dong');

var haveUser = false;


function isInt(n) {
   return n % 1 === 0;
}

function getqueuesip(phone, acc, billsec, cb){
    request.query("exec TELESHOP.dbo.sipGetQueuesipmany @phone='"+phone+"',@accountcodeout='"+acc+"',@billsec='"+billsec+"'")
	.then(function(recordset){ 
        if(recordset.length){
			cb(recordset[0].sip);
			//cb('false|0930422801|0');
        }
    })
	.catch(function(err) {
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log(err);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
		cb(false);
    })
    return;
}

function getContactID(phone, acc, sip, cb){
    request.query("exec TELESHOP.dbo.sipGetContactID @phone='"+phone+"',@accountcode='"+acc+"',@sip='"+sip+"'")
	.then(function(recordset){ 
        if(recordset.length){
			cb(recordset[0].IDCONTACT);
        }
    })
	.catch(function(err) {
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log(err);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
		cb(false);
    })
    return;
}

function callTerminated(context, phone, contactId, end){
	//console.log(phone)
	//console.log(contactId)
	//console.log(end)
    request.query("exec TELESHOP.dbo.sipCallTerminated @phone='"+phone+"',@IDCONTACT='"+contactId+"'")
	.catch(function(err) {
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
        console.log(err);
        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++")
		cb(false);
    })
	if(end){
		context.end();
	}
    return;
}
function dial(context,contactid,phone,cb){
	console.log('contactid===',contactid)
	console.log('phone===',phone)
	context.exec('SET', 'CALLERID(num)='+contactid)
	context.exec('SET', 'CALLERID(RDNIS)='+phone)
	context.exec('Dial', 'Local/0952750527@outgoing')
		.then(function(r){
			cb(r)
		});
}

function dialToUser(context,contactid, users){
	console.log(contactid)
	console.log(users)
	if(users&&users.length>0){
		if(!isInt(users[0])){
		context.exec('Dial', 'SIP/'+users[0])
			.then(function(r){
				console.log(r)
				users = users.slice(1);
				dialToUser(context,contactid,users);
			});
		}else{
			ivr(context,users);
		}
	}else{
		return context.end();
	}
}

function ivr(context, ivrs){
	if(ivrs&&ivrs.length>0){
		if(isInt(ivrs[0])){
			context.streamFile('/etc/asterisk/IVR/'+ivrs[0])
			.then(function(result){
				ivrs = ivrs.slice(1);
				ivr(context,ivrs);
			});
		}else{
			getContactID(context.variables.agi_callerid, context.variables.agi_extension, '',function(contactId){
				console.log('contactId==',contactId)
				if(contactId){
					dialToUser(context,contactId,ivrs)
				}else{
					return context.end();
				}
			})
		}
	}else{
		return context.end();
	}
}

function homer(context, params){
	//console.log("=====================")
	//console.log(context.variables)
	//console.log("=====================")
	if(params&&params.length>2){
		var cicle = params[0];
		var arr = params.slice(1);
		getContactID(context.variables.agi_callerid, arr[0], params,function(contactId){
			if(contactId){
				console.log('contactId==',contactId)
				dial(context, contactId, arr[0],function(e){
					console.log("====================1=")
					console.log(e)
					callTerminated(context,context.variables.agi_callerid,contactId,false);
					if(cicle){
						context.channelStatus(context.variables.agi_channel).then(function(r){
							console.log("====================2=",context.variables.agi_channel)
							console.log(r)
							if(r&&r.result!=-1){
								getqueuesip(context.variables.agi_callerid, context.variables.agi_extension,0, function (e){
									if(!e){
										return context.end();
									}else{
										maps(context,e);
									}
								})
							}else{
								return context.end();
							}
						})
					}
				})
			}else{
				return context.end();
			}
		})
	}
}

function maps(context, params){
	//console.log(params)
	var s = new RegExp("|");
	
	if(s.test(params)){
		var arr = params.split("|")
		if(arr[0]=='true'||arr[0]=='false'){
			context.answer();
			homer(context, arr);
		}else{
			context.answer();
			ivr(context, arr);
		}
	}
}

var handler = function (context) {
	
    context.onEvent('variables')
        .then(function (vars) {
			if(vars){
				//console.log(vars)
				getqueuesip(vars.agi_callerid, vars.agi_extension,0, function (e){
					if(!e){
						return context.end();
					}else{
						maps(context,e);
					}
				})
			}else{
				return context.end();
			}
        })
      //  .then(function () {
		//	console.log(entity)
       //     return context.streamFile('/etc/asterisk/IVR/1');
       // })
	/*	  .then(function () {
            return context.exec('Dial', 'SIP/192.168.10.216/0636404052')
				.then(function(result){
					console.log(result)
				});
        })*/
        //.then(function (result) {
        //    return context.setVariable('DIALPLAN_VARIABLE', 'helloWorld');
        //}) 
        .then(function (result) {     
			//console.log("result")		
			//console.log("result",result)		
       //    return context.end();
        });
		
};

var agi = new AGIServer(handler);
agi.start(5000);


/*
		context.onEvent('incoming')
        .then(function (vars) {
            return context.answer();
         })
        .then(function () {
            return context.streamFile('beep');
        })
		  .then(function () {
            return context.exec('Dial', 'SIP/192.168.10.226/0952750527')
				.then(function(result){
					console.log(result)
				});
        })
        .then(function (result) {
            return context.setVariable('DIALPLAN_VARIABLE', 'helloWorld');
        }) 
        .then(function (result) {       
            return context.end();
        })

*/