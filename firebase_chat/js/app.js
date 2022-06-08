
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import {
    getDatabase,
    set,
    get,
    ref,
    push,
    child,
    onValue,
    onChildAdded,
    query,
    startAt,
    endAt,
    orderByKey,
    orderByValue,
    orderByChild,
} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-database.js";


 // Firebase configuration
 const firebaseConfig = {
     apiKey: "AIzaSyANfAlgBuibS-nBz5zgmaMAT3_Y8Mzvg1M",
     authDomain: "chat-application-93ecd.firebaseapp.com",
     databaseURL: "https://chat-application-93ecd-default-rtdb.firebaseio.com",
     projectId: "chat-application-93ecd",
     storageBucket: "chat-application-93ecd.appspot.com",
     messagingSenderId: "722447353250",
     appId: "1:722447353250:web:d0405c9990bfba52a9defb",
     measurementId: "G-CXN36TRL6T"
  };

// Get username and room from URL
const username = getParamValueFromURL("username");
let chatWith;

 // Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


// For curUser icon background-color
$("#curUsername").html( username );

var randomColor = Math.floor(Math.random()*16777215).toString(16);
$("#curUserIcon").html( username.substring( 0, 2 ).toUpperCase() );
$("#curUserIcon").css("backgroundColor", "#" + randomColor);
$("#curUserIcon").css("color", "#" + invertColor( randomColor ));



const getUserInfoRef = ref(database, `users/${username}`);
onValue(getUserInfoRef, (snapshot) => {
  const data = snapshot.val();
  const contacts = data.contacts;
  for( var i=0;i<contacts.length; i++ )
  {
    const firstChar = contacts[i].substring(0, 2).toUpperCase();
    var userTag = $(`<li class="clearfix" username="${contacts[i]}">
            <div class="user-icon">${firstChar}</div>
            <div class="about">
            <div class="name">${contacts[i]}</div>
            <div class="status">
                <i class="fa fa-circle online"></i> online
            </div>
            </div>
        </li>`);

    selectUser( userTag );

    $('#users').prepend( userTag );
  }
  console.log(data);
});


function selectUser( userTag ) {
    userTag.click(function(e){
        chatWith = userTag.attr("username");
        $(".chat-with").html(`Chat with ${chatWith}`);


        
        const msgList = query(ref(database, 'messages'), orderByChild("time"));
        onValue(msgList, (snapshotList) => {
            $('.chat-history').find("ul").html("");
console.log("selectUser");
            const keys = Object.keys( snapshotList.val() );
            for( var i in keys )
            {
              const data = snapshotList.val()[keys[i]];

              if( ( data.sender == username && data.receiver == chatWith ) 
              || ( data.sender == chatWith && data.receiver == username ) )
                {
                    var divData = `<li class="clearfix">
                                    <div class="message-data align-right">
                                    <span class="message-data-time" >${data.time}</span> &nbsp; &nbsp;
                                    <span class="message-data-name" >${data.sender}</span> <i class="fa fa-circle me"></i>
                                    
                                    </div>
                                    <div class="message other-message float-right">
                                        ${data.text}
                                    </div>
                                </li>`;
            
                    var d1 = $('.chat-history').find("ul");
                    d1.append(divData);
                }
                
            }
            const msgNo = $('.chat-history').find("ul > li").length;
            $(".chat-num-messages").html(`already ${msgNo} messages`);
          });

        //
    });
}


// $('#users').html("");
// const usersRef = query(ref(database, 'users'), orderByChild("contacts/0"), startAt(username));
// onChildAdded(usersRef, (data) => {
   
//     const userInfo = data.val();
//     const firstChar = userInfo.fullName.substring(0, 2).toUpperCase();
//     var userTag = $(`<li class="clearfix">
//             <div class="user-icon">${firstChar}</div>
//             <div class="about">
//             <div class="name">${userInfo.fullName}</div>
//             <div class="status">
//                 <i class="fa fa-circle online"></i> online
//             </div>
//             </div>
//         </li>`);

//     $('#users').prepend( userTag );
// });



// Add Emoji in Emoji Dashboard
for( var i=0; i<emojiCodes.length; i++ )
{
	var liTag = $("<li></li>");
	liTag.val("&#" + emojiCodes[i]+ ";")
	liTag.append("&#" + emojiCodes[i]+ ";");

	$("#emojiDashboard").find("ul").append(liTag);
}





// ---------------------------------------------------------------------------

function submitChatMessage() {
     var message = $("#msg").val();
     const id = push(child(ref(database), 'messages')).key;

     const data = formatMessage( username, chatWith, message);
     set(ref(database, 'messages/' + id), data );
     $("#msg").val("");

 }

const newMsg = ref(database, 'messages');

// onChildAdded(newMsg, (data) => {
//     if( ( data.val().sender == username && data.val().receiver == chatWith ) 
//         || ( data.val().sender == chatWith && data.val().receiver == username ) )
//     {
//         var divData = `<li class="clearfix">
//                         <div class="message-data align-right">
//                         <span class="message-data-time" >${data.val().time}</span> &nbsp; &nbsp;
//                         <span class="message-data-name" >${data.val().sender}</span> <i class="fa fa-circle me"></i>
                        
//                         </div>
//                         <div class="message other-message float-right">
//                             ${data.val().text}
//                         </div>
//                     </li>`;

//         var d1 = $('.chat-history').find("ul");
//         d1.append(divData);
//     }
// });


// ---------------------------------------------------------------------------
// HTML Element events

$("#sendBtn").click( function(e){
    submitChatMessage( e )
});


$("#msg").keypress( function(e){
    if (e.key === "Enter") {
        submitChatMessage( e )
    }
});


$('.leave-btn').click(function() {
    const leaveRoom = confirm('Are you sure you want to log-out ?');
    if (leaveRoom) {
        window.location = 'index.html';
    } 
    else {
    }
});

// --------------------------------
// Show Emoji Dashboard

$("#showEmojiDashboard").click( function(e){
    $('.emoji-dashboard').slideToggle('fast');
    e.stopPropagation();
});

$("#emojiDashboard").find("ul").find("li").click( function() {
    insertText( $("#msg"), $(this).html() );
    $(".emoji-dashboard").slideUp('fast');
});

$(document).click(function(e){
    $(".emoji-dashboard").slideUp('fast');
});