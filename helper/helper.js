'use strict'

exports.splitNoPhone = (hp) =>{
    let hasil = hp.split('');
    if (hasil[0] == 0){
        hasil[0]='62'
    }
    return hasil.join('');
};