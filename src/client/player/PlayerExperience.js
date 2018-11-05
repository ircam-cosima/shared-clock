import * as soundworks from 'soundworks/client';
import * as masters from 'waves-masters';
import ClockView from './ClockView';
import { centToLinear } from 'soundworks/utils/math';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;

class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sync = this.require('sync');
    this.sharedParams = this.require('shared-params');
  }

  start() {
    super.start(); // don't forget this

    this.scheduler = new masters.Scheduler(() => {
      return this.sync.getSyncTime();
    }, {
      currentTimeToAudioTimeFunction: (currentTime) => {
        return this.sync.getAudioTime(currentTime);
      },
    });

    this.transport = new masters.Transport(this.scheduler);
    this.playControl = new masters.PlayControl(this.scheduler, this.transport);

    // init view
    this.view = new ClockView(this.transport, {
      currentTime: '00:00',
      state: '',
      position: '',
    });

    this.receive('start', (position, applyAt) => {
      const syncTime = this.sync.getSyncTime();
      const dt = applyAt - syncTime;

      if (dt > 0) {
        this.playControl.seek(position);
        setTimeout(() => {
          this.playControl.start();
        }, dt * 1000);
      } else {
        this.playControl.seek(position - dt);
        this.playControl.start();
      }
    });

    this.receive('pause', (position, applyAt) => {
      const syncTime = this.sync.getSyncTime();
      const dt = applyAt - syncTime;

      if (dt > 0) {
        setTimeout(() => {
          this.playControl.pause();
          this.playControl.seek(position);
        }, dt * 1000);
      } else {
        this.playControl.pause();
        this.playControl.seek(position - dt);
      }
    });

    this.receive('stop', (applyAt) => {
      const syncTime = this.sync.getSyncTime();
      const dt = applyAt - syncTime;

      if (dt > 0) {
        setTimeout(() => {
          this.playControl.stop();
        }, dt * 1000);
      } else {
        this.playControl.stop();
      }
    });

    this.receive('seek', (position, applyAt) => {
      // this.position = position;
      // if the clock is not running update
      // if (!this.clock.master)
      //   this.view.setTime(this.position);
    });

    this.show().then(() => {});
  }
}

export default PlayerExperience;
