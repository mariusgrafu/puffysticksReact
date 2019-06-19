
import WarnMessages from "./WarnMessages";

class Controller{

    constructor(){
        this.warnMessages = new WarnMessages();

        this.socket = null;
        this.update = null;
    }

    setUpdate = (updt) => {
        this.update = updt;
    }

    setSocket = (socket) => {
        this.socket = socket;
    }

}

export default Controller;