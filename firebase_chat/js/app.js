
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
    startAt
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

 // Initialize Firebase
 const app = initializeApp(firebaseConfig);
 const database = getDatabase(app);






//  const dbRef = ref(getDatabase());
//  get(child(dbRef, `users`)).then((snapshot) => {
//     if (snapshot.exists()) {
//       console.log(snapshot.val());

//     //   const friends = snapshot.val().friends.split(", ");

//     } else {
//       console.log("No data available");
//     }
//   }).catch((error) => {
//     console.error(error);
//   });


// Add Emoji in Emoji Dashboard
for( var i=0; i<emojiCodes.length; i++ )
{
	var liTag = $("<li></li>");
	liTag.val("&#" + emojiCodes[i]+ ";")
	liTag.append("&#" + emojiCodes[i]+ ";");

	$("#emojiDashboard").find("ul").append(liTag);
}

// Get username and room from URL
const username = getParamValueFromURL("username");

// For curUser icon background-color
$("#curUsername").html( username );

var randomColor = Math.floor(Math.random()*16777215).toString(16);
$("#curUserIcon").html( username.charAt(0).toUpperCase() );
$("#curUserIcon").css("backgroundColor", "#" + randomColor);
$("#curUserIcon").css("color", "#" + invertColor( randomColor ));




// ---------------------------------------------------------------------------

function submitChatMessage() {
     var message = $("#msg").val();
     const id = push(child(ref(database), 'messages')).key;

     const data = formatMessage( username, message);
     set(ref(database, 'messages/' + id), data );
     $("#msg").val("");

 }

const newMsg = ref(database, 'messages/');

onChildAdded(newMsg, (data) => {

        var divData = `<li class="clearfix">
                        <div class="message-data align-right">
                        <span class="message-data-time" >${data.val().time}</span> &nbsp; &nbsp;
                        <span class="message-data-name" >${data.val().username}</span> <i class="fa fa-circle me"></i>
                        
                        </div>
                        <div class="message other-message float-right">
                            ${data.val().text}
                        </div>
                    </li>`;

        var d1 = $('.chat-history').find("ul");
        d1.append(divData);
});


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