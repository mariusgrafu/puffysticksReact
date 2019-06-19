class WarnMessages{

    constructor(){
        this.messages = [
            // {
            //     ok : 0,
            //     message : ''
            // }
        ];
        this.update = null;
    }

    addMessage = (message, ok) => {
        this.messages.push({message, ok});
        this.update();
    }

    removeMessage = (msgIndex) => {
        this.messages.splice(msgIndex, 1);
        this.update();
    }
  
  }; 
  
  export default WarnMessages;
  