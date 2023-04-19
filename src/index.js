const path=require('path')
const http=require('http')
const express=require('express')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocationMessage}=require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)


const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

//server(emit) => client(receive) =>acknowledgement => server
//client(emit) => server(receive) =>acknowledgement => client


//Listen for new connection
io.on('connection',(socket)=>{
  console.log('New WebSocket connection')
  

  //listen to event sent client contain username and roomname
  //it help user to join the particular room
  //options object contain username and roomname
  socket.on('join', (options,callback) => {
    //add the user to user array(utils/user.js)
    //use spread operator(...options) to add to user
    const {error,user}=addUser({id:socket.id , ...options})

    //if error return error
    if(error){
       return callback(error)
    }

    // Join the room
    socket.join(user.room)

    // Welcome the user to the room
    //send the message from server to client
    socket.emit('message', generateMessage('Admin','Welcome!'))

    // Broadcast an event to everyone in the room
    //send the message to every client telling that a new user is joined
    //.broadcast ensure that message is send to all user except 
    //the user that is joined
    socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username}
   has joined!`))

   //send list of all user from server to client in a particular room
   io.to(user.room).emit('roomData',{
     room:user.room,
     users:getUsersInRoom(user.room)
   })

   callback()
   })
   

   //listen for message send by client
   //'sendMessage' is name of event same as client

   //callback is for acknowledgement of event 
   //i.e. message is received by server and also we
   //can send message to client through callback
   socket.on('sendMessage',(message,callback) => {
      
      //get the user by its id
      const user=getUser(socket.id)
      const filter=new Filter()

      //To check the if message contain bad language
      //if message contain profane anguage send message to
      //client as acknowledgement
      if(filter.isProfane(message)){
        return callback('Profanity is not allowed')
      }
      //send message to every single connected client to a particular room
      io.to(user.room).emit('message',generateMessage(user.username,message))
      callback() 
  })

  //listener for sendlocation
  socket.on('sendLocation',(coords,callback) => {
    //get the uesr from user array
    const user=getUser(socket.id)
    
    //share the location with everyone in particular room as google map
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    callback()
})

  //This runs when a user is disconnected
  socket.on('disconnect',() =>{
    //remove the user by its id
    const user= removeUser(socket.id)
    
    //if user is available
    if(user){
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))


      //when uesr leaves user is removed so send the modofied user list
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  })


})

server.listen(port,() =>{
    console.log(`Server is up on port ${port}!`)
})