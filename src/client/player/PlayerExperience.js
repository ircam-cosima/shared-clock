import * as soundworks from 'soundworks/client';
import * as masters from 'waves-masters';
import ClockView from './ClockView';
import { centToLinear } from 'soundworks/utils/math';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;

// class ClockEngine extends audio.TimeEngine {
//   constructor(view, sync) {
//     super();

//     // this.view = view;
//     // this.sync = sync;
//     // this.startTime = null;

//     this.period = 1;
//     // this._timeoutId = null;
//   }

//   syncPosition(time, position) {
//     return position;
//   }

//   advancePosition(time, position) {
//     return position + this.period;
//   }
// }

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sharedParams = this.require('shared-params');

    // this.syncScheduler = this.require('sync-scheduler');
    this.sync = this.require('sync');
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
    // this.clock = new ClockEngine(this.view, this.sync);
    // this.transport.add(this.clock);

    // init view
    this.view = new ClockView(this.transport, {
      currentTime: 'No time, yet',
      state: '',
      position: '',
    });

    this.receive('start', (position, applyAt) => {
      const syncTime = this.sync.getSyncTime();
      const dt = applyAt - syncTime;

      if (dt > 0) {
        setTimeout(() => {
          this.playControl.seek(position);
          this.playControl.start();
        }, dt * 1000);
      } else {
        this.playControl.seek(position - dt); // compensate late message
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
        this.playControl.seek(position); // compensate late message
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

    this.show().then(() => {
      // view is ready
    });
  }

  // playSound(buffer, randomPitchVar = 0) {
  //   const src = audioContext.createBufferSource();
  //   src.connect(audioContext.destination);
  //   src.buffer = buffer;
  //   src.start(audioContext.currentTime);
  //   src.playbackRate.value = centToLinear((Math.random() * 2 - 1) * randomPitchVar);
  // }
}

export default PlayerExperience;
