const db =require ('../db');

exports.deleteUser =function(id, callback){
    db.query('DELETE FROM users WHERE id=?',[id],callback);
};

exports.toggleUser=function(id,callback){
    db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?',[id],callback);
};

exports.userDetail=function(email,callback){
    db.query('Select * from users where email=?',[email],callback);
}