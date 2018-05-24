import * as soundworks from 'soundworks/client';
import { centToLinear } from 'soundworks/utils/math';
import { ClockView, template } from './ClockView';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;

class ClockEngine extends audio.TimeEngine {
  constructor(view, syncScheduler) {
    super();

    this.view = view;
    this.syncScheduler = syncScheduler;
    this.startTime = null;
  }

  advanceTime(syncTime) {
    const delta = syncTime - this.startTime;

    this.syncScheduler.defer(() => {
      this.view.setTime(delta);
    }, syncTime);

    return syncTime + 0.05;
  }
}

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.sharedParams = this.require('shared-params');

    this.syncScheduler = this.require('sync-scheduler');
    this.sync = this.require('sync');
  }

  start() {
    super.start(); // don't forget this

    // initialize the view
    this.view = new ClockView(template, {
      currentTime: '00:00',
      state: '',
      position: '',
    }, {}, {
      id: this.id,
    });

    this.clock = new ClockEngine(this.view, this.syncScheduler);

    this.receive('start', syncStartTime => {
      if (!this.clock.master) {
        this.clock.startTime = syncStartTime;
        this.syncScheduler.add(this.clock);
      }
    });

    this.receive('stop', () => {
      if (this.clock.master) {
        this.clock.startTime = null;
        this.syncScheduler.remove(this.clock);

        this.view.setTime(0);
      }
    });

    // as show can be async, we make sure that the view is actually rendered
    this.show().then(() => {

    });
  }

  playSound(buffer, randomPitchVar = 0) {
    const src = audioContext.createBufferSource();
    src.connect(audioContext.destination);
    src.buffer = buffer;
    src.start(audioContext.currentTime);
    src.playbackRate.value = centToLinear((Math.random() * 2 - 1) * randomPitchVar);
  }
}

export default PlayerExperience;
