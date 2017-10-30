module.exports = (function() {
    function UserModel() {  }
    UserModel.prototype = {
        get: function (p) {
            var i ={};
            i.Username 		= p.Username;
            i.SurnameU 		= p.SurnameU;
            i.Operatorname 	= p.Operatorname;
            i.UserTypeID 	= p.UserTypeID;
            i.UserStatusID 	= p.UserStatusID;
            i.ParantUser 	= p.ParantUser;
            i.CallStatus 	= p.CallStatus;
            i.CallAdmin 	= p.CallAdmin;
            i.UserID 		= p.UserID;
            i.PasswordHash  = p.PasswordHash;
     //       this.Time 			= p.Time;
            return i;
        }
    }
    return UserModel;
})()