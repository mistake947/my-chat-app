const users=[]

// addUser,removeUser,getUser,getUsersInRoom

//every connection to the user has a seprate id
const addUser=({id,username,room}) =>{
  //Clean the data (remove extra space,convert lowercase)
  username=username.trim().toLowerCase()
  room=room.trim().toLowerCase()

  //Validate the data(if username or roomname is not provided)
  if(!username || !room){
      return {
          error:'Username and room are required!'
      }
  }

  //Check for existing user
  const existingUser=users.find((user) => {
    return user.room ===room && user.username ===username
  })

  //Validate username(if username is alraedy used)
  if(existingUser){
      return{
          error:'Username is in use! '
      }
  }

  //Store user
  const user={id,username,room}
  users.push(user)
  return {user}

}


//remove user by id
const removeUser=(id) =>{
    const index=users.findIndex((user) =>{
      return user.id === id
    })

    //if we find the user
    if(index !== -1){
        return users.splice(index,1)[0]
    }


}

//get the user by its id and return undefined of there is not user
const getUser=(id) => {
    return users.find((user) => user.id === id)
}

//get the users list and return undefined if there is no user 
const getUsersInRoom=(room) =>{
    room=room.trim().toLowerCase()
  return users.filter((user) => user.room === room)
}


module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}