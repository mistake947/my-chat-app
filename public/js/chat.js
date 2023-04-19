const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
//.innerHTML because we are rendering html using templete
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

 //Get the data from the login page
 //Username and the room name from queryString 
 //ignoreQueryPrefix:true makes ? goes away
 //we are getting object so we parse it
const {username,room}= Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoScroll=() =>{
    //New message element
    const $newMessage=$messages.lastElementChild

    //Height of the newMessage
    const newMessageStyles=getComputedStyle($newMessage)
    //parse the bottom margin into int
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight +newMessageMargin

    //Visible Height
    const visibleHeight=$messages.offsetHeight

    //Height of message container
    const containerHeight=$messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset=$messages.scrollTop +visibleHeight
 
    if(containerHeight-newMessageHeight <= scrollOffset){
       $messages.scrollTop=$messages.scrollHeight
    }


}




//Listener for message from the server 
socket.on('message',(message) =>{
    console.log(message)

    //get the message you want to render
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        //'moment' library to foramt the time
        createdAt:moment(message.createdAt).format('h:mm a')
    })

    //render the message to 'messages' div in chat.html
    //'beforeend' becoz new message goes to end
    $messages.insertAdjacentHTML('beforeend',html)
    //auto scroll if possible
    autoScroll()
})

//Listener for loaction
socket.on('locationMessage',(message) =>{
    console.log(message)
    //get the location using template
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.URL,
         //'moment' library to foramt the time
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    //render the location as link
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//Listener for roomData(for list of user in a particular room)
socket.on('roomData',({room,users}) => {
  const html=Mustache.render(sidebarTemplate,{
      room,
      users
  })
  //render in div name='sidebar'
  document.querySelector('#sidebar').innerHTML=html
})


//event listener for typed message
$messageForm.addEventListener('submit',(e) =>{
       e.preventDefault()
       //disable the button when once message is sent
       $messageFormButton.setAttribute('disabled','disabled')

       //getting the message from form
       const message=e.target.elements.message.value
       //message send to the server
       //'sendMessage' is name of event
       //listen to this at server(index.js)
       //error is acknowledgement send by server
        socket.emit('sendMessage',message,(error) =>{

            //enable the button when sending is complete
            $messageFormButton.removeAttribute('disabled')
            //Clear the message when message is sent
            $messageFormInput.value=''
            //Bought cursor on form 
            $messageFormInput.focus()

            //here error is if message contain the profane language
            //then display the error to client that send that message
            if(error){
                return console.log(error)
            }
            console.log('The message is delived!')
        })
})

//listener for send Location button
//Geolocation API for location
$sendLocationButton.addEventListener('click',() =>{

    //If browner has no support for geolocation
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

     //disable the button when once clicked
     $sendLocationButton.setAttribute('disabled','disabled')

     //fetching the location
    navigator.geolocation.getCurrentPosition((position) =>{
      //console.log(position.coords.latitude,position.coords.longitude)

      //send location to server
      socket.emit('sendLocation',{
          latitude:position.coords.latitude,
          longitude:position.coords.longitude
        },() =>{
        //enable the button when fetching is complete
        $sendLocationButton.removeAttribute('disabled')
          console.log('Location shared!')
      })
    })

})

//send usename and roomname to server as join event
socket.emit('join',{username,room},(error) =>{
    if(error){
        //if error send error
        alert(error)
        //push to login page
        location.href='/'
    }
})