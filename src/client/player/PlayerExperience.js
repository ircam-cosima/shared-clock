import * as soundworks from 'soundworks/client';
import { centToLinear } from 'soundworks/utils/math';

const audioContext = soundworks.audioContext;

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle"></div>
    <div class="section-center flex-center">
      <p class="big" id="time"><%= currentTime %></p>
    </div>
    <div class="section-bottom flex-middle"></div>
  </div>
`;

const model = { title: `Let's go!` };

// this experience plays a sound when it starts, and plays another sound when
// other clients join the experience
class PlayerExperience extends soundworks.Experience {
  constructor(assetsDomain) {
    super();

    this.platform = this.require('platform', { features: ['web-audio'] });
    this.checkin = this.require('checkin', { showDialog: false });
    this.audioBufferManager = this.require('audio-buffer-manager', {
      assetsDomain: assetsDomain,
      directories: { path: 'sounds', recursive: true },
    });
  }

  start() {
    super.start(); // don't forget this

    // initialize the view
    this.view = new soundworks.View(template, model, {}, {
      id: this.id,
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
