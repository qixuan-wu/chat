//required for front end communication between client and server
const socket = io();
const inboxPeople = document.querySelector(".inbox__people");

let storedUsername;
document.addEventListener('DOMContentLoaded', function () {
    storedUsername = localStorage.getItem('userList');
  
    if (storedUsername) {
    newUserConnected(storedUsername);
}
            
           
});

let userName = "";
let id;
const newUserConnected = function (data) {
    
     
    userName =storedUsername;
    //console.log(typeof(userName));   
    

    //emit an event with the user id
    socket.emit("new user", userName);
    //call
    addToUsersBox(userName);
};

const addToUsersBox = function (userName) {
    //This if statement checks whether an element of the user-userlist
    //exists and then inverts the result of the expression in the condition
    //to true, while also casting from an object to boolean
    if (!userName) {
        return;
    }

    if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
    
    }
    
    //setup the divs for displaying the connected users
    //id is set to a string including the username
    const userBox = `
<div class="chat_id ${userName}-userlist">
  <h5>${userName}</h5>
</div>
`;
;
    //set the inboxPeople div with the value of userbox
    inboxPeople.innerHTML += userBox;
};

//call 
if (storedUsername) {
        newUserConnected();
    }


//when a new user event is detected
socket.on("new user", function (data) {
    addToUsersBox(data); // 直接调用 addToUsersBox
});

//when a user leaves
socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
});

const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
         <span class="time_date">${userName}</span>
      </div>
    </div>
  </div>`;

  //is the message sent or received
  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});

socket.on('new user', function (activeUsers) {
  const newUser = activeUsers[activeUsers.length - 1];
  alert(`${newUser} 加入了聊天室`);
});

socket.on('user disconnected', function (userId) {
  alert(`${userId} 离开了聊天室`);
});




const messageInputField = document.querySelector('.message_form__input');
const typingStatus = document.getElementById('typing-status');

if (messageInputField) {
  messageInputField.addEventListener('input', function () {
    socket.emit('user typing');
  });
}


messageInputField.addEventListener('blur', function () {
  socket.emit('user stopped typing');
});

socket.on('user typing', function (userName) {
  typingStatus.textContent = `${userName} 正在输入...`;
});

socket.on('user stopped typing', function () {
  typingStatus.textContent = '';
});


