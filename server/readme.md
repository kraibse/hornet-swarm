# 00. Prerequisites

- [ ] node.js

  > This module is needed in order to connect to the main server. Also, the base of the client is built on top of that.
  >
  > The client will host a local server accessible from the outside (for safety reasons only from one IP). 

  

- [ ] Git

  > This module is needed for automatically updating the client and retrieving the configurations from the main server.



# 01. To-Do

- [x] main server application

  > The main server application should be only hosted locally and not via the Internet. This just avoids the risk of getting hacked by another individual.
  >
  > The interface will be available through a password protected web service. On the dashboard you will see all the connected clients and common tasks and schedules you specifically marked as a favorite.
  - [ ] send command to socket
  - [ ] get correct path every time
  - [ ] authenticweb-interface
    - [ ] online status
    - [ ] device name
  - [ ] IP-address // location
  - [ ] MAC-address
  - [ ] data collection (last online, usage schedule)



- [x] client with sockets

  > The client will update automatically after connecting to the Github repository.

  - [ ] background service
  - [ ] implement updater
  - [ ] autostart as administrator

---

- [ ] dynamic configurations
  - [ ] hard coded
  - [ ] fetch from server
- [ ] remote command execution
- [ ] updating via git