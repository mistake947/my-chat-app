 //generate the message
 const generateMessage=(username,text) =>{
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

//generate the location message
const generateLocationMessage=(username,URL) =>{
    return{
        username,
        URL,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocationMessage
}