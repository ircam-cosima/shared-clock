import { Experience } from 'soundworks/server';

// server-side 'player' experience.
export default class PlayerExperience extends Experience {
  constructor(clientType) {
    super(clientType);

    this.checkin = this.require('checkin');
    this.sharedParams = this.require('shared-params');

    this.syncScheduler = this.require('sync-scheduler');
    this.sync = this.require('sync-scheduler');

    this.startTime = null;
    this.position = 0;
    this.state = 'stop';
  }

  start() {
    this.sharedParams.addParamListener('/position', value => {
      this.position = value;
      this.broadcast('player', null, 'position', this.position);
    });

    this.sharedParams.addParamListener('/start-stop', value => {
      if (value === 'start') {
        this.startTime = this.sync.syncTime - this.position;
        this.broadcast('player', null, 'start', this.startTime);
      } else if (value === 'stop') {
        this.startTime = null;
        this.broadcast('player', null, 'stop');
      }

      this.state = value;
    });
  }

  enter(client) {
    super.enter(client);

    if (this.state === 'start')
      this.send(client, 'start', this.startTime);
  }

  exit(client) {
    super.exit(client);
  }
}
