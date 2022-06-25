/* abstract */ class SessionStore {
	findSession(id) {}
	saveSession(id, session) {}
	findAllSessions() {}
	getAllUsers() {}
}


/**
 * 	{
	*  	<section-id-1> : {  
			userID: socket.userID,
			username: socket.username,
			connected: true,
		},
		<section-id-2> : {  
			userID: socket.userID,
			username: socket.username,
			connected: true,
		},
		....
	}
 */
  
class InMemorySessionStore extends SessionStore {
    constructor() {
      super();
      this.sessions = new Map();
    }
  
    findSession(id) {
      return this.sessions.get(id);
    }

    saveSession(id, session) {
      this.sessions.set(id, session);
    }
  
    findAllSessions() {
      return [...this.sessions.values()];
    }

	getAllUsers() {
		let users = [];
		this.findAllSessions().forEach((session) => {
			users.push({
				userID: session.userID,
				username: session.username,
				connected: session.connected,
			});
		});
		return users;
	}

  }
  
  module.exports = {
    InMemorySessionStore
  };
  