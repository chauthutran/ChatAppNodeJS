
(function() {
    if(window.localStorage)
      console.log("Local Storage Supported")
    else
      console.log("Local Storage Not Supported")
  })();


function saveOfflineMessage( messageData )
{
    var dataList = getOfflineMessages();
    dataList.push( messageData );
    localStorage.setItem("messages", JSON.stringify( dataList ) );
}

function getOfflineMessages()
{
    if (!localStorage.getItem("messages")) {
        localStorage.setItem("messages", JSON.stringify([]));
        return [];
    }

    return JSON.parse(localStorage.getItem("messages") )
}


function removeOfflineMessage( messageData )
{
    var dataList = getOfflineMessages();
    dataList = Utils.removeFromArray( dataList, messageData.id, "id" );
    localStorage.setItem("messages", JSON.stringify( dataList ) );
}
