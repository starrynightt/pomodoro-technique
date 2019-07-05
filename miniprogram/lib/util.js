module.exports = {
    dateFomater: {
        hhmmss: function(msec) {
            msec = parseInt(msec);
            var sec = Math.floor(msec / 1000);
            var hour = Math.floor(sec / 3600);
            var min = Math.floor((sec % 3600) / 60);
            var ss = sec % 60;
            if(hour < 10) {
                hour = '0' + hour;
            }
            if(min < 10) {
                min = '0' + min;
            }
            if(ss < 10) {
                ss = '0' + ss;
            }
            return `${hour}:${min}:${ss}`;
        }
    }
}