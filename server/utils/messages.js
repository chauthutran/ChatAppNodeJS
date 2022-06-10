const moment = require('moment');

function formatMessage(sender, receiver, text) {
  return {
    sender,
    receiver,
    text,
    time: moment().format('h:mm a')
  };
}

module.exports = formatMessage;
