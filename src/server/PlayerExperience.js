import { Experience } from 'soundworks/server';

// server-side 'player' experience.
class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');
    this.sync = this.require('sync');

    this.startTime = null;
    this.position = 0;
    this.state = 'stop';
    this.propagationDelay = 0.2; // add 200 ms to startTime
  }

  start() {
    // this.sharedParams.addParamListener('/position', value => {
    //   this.position = value;
    //   this.broadcast('player', null, 'position', this.position);
    // });

    this.sharedParams.addParamListener('/start-stop', value => {
      const now =  this.sync.getSyncTime();
      const applyAt = now + this.propagationDelay;

      switch (value) {
        case 'start':
          if(this.state !== 'start') {
            this.startTime = applyAt;
            this.broadcast('player', null, 'start', this.position, applyAt);
            this.state = value;
          }
          break;
        case 'pause':
          if(this.state === 'start') {
            this.position += applyAt - this.startTime;
            this.broadcast('player', null, 'pause', this.position, applyAt);
            this.state = value;
          }
          break;
        case 'stop':
          if(this.state !== 'stop') {
            this.startTime = null;
            this.position = 0;
            this.broadcast('player', null, 'stop', applyAt);
            this.state = value;
          }
          break;
      }

    });
  }

  enter(client) {
    super.enter(client);

    switch (this.state) {
      case 'start':
        this.send(client, 'start', this.position, this.startTime);
        break;
      case 'pause':
        const now =  this.sync.getSyncTime();
        this.send(client, 'pause', this.position, now);
        break;
    }
  }

  exit(client) {
    super.exit(client);
  }
}

export default PlayerExperience;
