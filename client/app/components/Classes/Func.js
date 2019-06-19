const getSlug = require('speakingurl');

class Func{

    static formatDateFeaturedItems = (d) => {
        let re = "";
        let D = new Date(d);
        let Then = Math.floor(D.getTime()/1000);
        let Now = Math.floor(Date.now()/1000);
        let ago = Now - Then;
        let t = 'ago';
        if(ago < 0){
            t = 'from now';
            ago = Math.abs(ago);
        }
        if(ago > 604800){
            let options = { month: 'short', day: 'numeric' };
            if(ago >= 31556926) options.year = 'numeric';
            re = D.toLocaleDateString('en-US', options)
        }else if(ago >= 86400){
            re = Math.floor(ago/86400) + "d " + t;
        }else if(ago >= 3600){
            re = Math.floor(ago/3600) + "h " + t;
        }else if(ago >= 60){
            re = Math.floor(ago/60) + "m " + t;
        }else if(ago >= 10){
            re = ago + "s " + t;
        }else re = "just now";
        return re;
    }

    static formatDateAgo = (d) => Func.formatDateFeaturedItems(d);

    static formatDatePostPage = (d) => {
        let re = "";
        let D = new Date(d);
        let options = { month: 'short', day: 'numeric', year : 'numeric' };
        re = D.toLocaleDateString('en-US', options);
        return re;
    }

    static fullDate = (d) => {
        let re = "";
        let D = new Date(d);
        let options = { month: 'short', day: 'numeric', year : 'numeric', hour: '2-digit', minute:'2-digit' };
        re = D.toLocaleDateString('en-US', options);
        return re;
    }

    static speakingUrl = (url) => {
        return getSlug(url);
    }

};
export default Func;