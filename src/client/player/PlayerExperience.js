import * as soundworks from 'soundworks/client';
import ClockView from './ClockView';
import { centToLinear } from 'soundworks/utils/math';

const audio = soundworks.audio;
const audioContext = soundworks.audioContext;

class ClockEngine extends audio.TimeEngine {
  constructor(view, sync) {
    super();

    this.view = view;
    this.sync = sync;
    this.startTime = null;

    this.period = 0.05;
    this._timeoutId = null;
  }

  clear() {
    clearTimeout(this._timeoutId);
  }

  advanceTime(syncTime) {
    const now = this.sync.getSyncTime();
    const currentTime = syncTime - this.startTime;

    // compensate scheduler lookahead
    this._timeoutId = setTimeout(() => {
      this.view.setTime(currentTime);
    }, syncTime - now);

    return syncTime + this.period;
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
    this.view = new ClockView({
      currentTime: '00:00',
      state: '',
      position: '',
    }, {}, {
      id: this.id,
    });

    this.clock = new ClockEngine(this.view, this.sync);

    this.receive('position', position => {
      this.position = position;
      // if the clock is not running update
      if (!this.clock.master)
        this.view.setTime(this.position);
    });

    this.receive('start', syncStartTime => {
      if (!this.clock.master) {
        const startAt = Math.ceil(this.syncScheduler.syncTime);

        this.clock.startTime = syncStartTime;
        this.syncScheduler.add(this.clock, startAt);
      }
    });

    this.receive('stop', () => {
      if (this.clock.master) {
        this.clock.startTime = null;
        this.syncScheduler.remove(this.clock);
        this.clock.clear();

        // we could reset the display to the start position, but the last
        // deferred updates overwrite it anyway, and we can stay at the last time
        this.view.setTime(this.position);
      }
    });

    this.show().then(() => {
      // view is ready
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
