const moment = require('moment');

function formatMessage(sender, receiver, text, type ) {
  return {
    sender,
    receiver,
    text,
    type,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
