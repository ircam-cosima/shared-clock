import * as soundworks from 'soundworks/client';

const template = `
  <canvas class="background"></canvas>
  <div class="foreground">
    <div class="section-top flex-middle">
      <p class="" id="state"><%= state %></p>
    </div>
    <div class="section-center flex-center">
      <p class="huge" id="time"><%= currentTime %></p>
    </div>
    <div class="section-bottom flex-middle">
      <%= position %>
    </div>
  </div>
`;

function padLeft(value, char, length) {
  value = value + ''; // cast to string

  while (value.length < length)
    value = char + value;

  return value;
}

function formatTime(time) {   // [-][hh:]mm:ss
    // time display options: (to be configurable somewhere)
    const hoursDigits     = 1;		// pad hour to n digits by prepending "0"
    const hoursAlways     = false;	// always show hours, even when 0
    const separatorFlash  = false;	// todo: flash separating ':' every 0.5 s
    const separator       = ':';	// symbol separating digits

    const sign = time < 0 ? '-' : '';
    const timeInSeconds = Math.abs(Math.floor(time));
    // const secFrac = Math.abs(t) - timeInSeconds;	// fractional seconds (not used)
    const hours   = Math.floor(timeInSeconds / 3600);
    const hourstr = padLeft(hours, '0', hoursDigits);
    const minutes = padLeft(Math.floor((timeInSeconds - (hours * 3600)) / 60), '0', 2);
    const seconds = padLeft(timeInSeconds - (hours * 3600) - (minutes * 60),   '0', 2);

    return sign + (hours !== 0  ||  hoursAlways  ?  hourstr + separator  :  '')
	   + minutes + separator + seconds;
}

class ClockView extends soundworks.SegmentedView {
  constructor(model, events, options) {
    super(template, model, events, options);
  }

  onRender(...args) {
    super.onRender(...args);

    this.$time = this.$el.querySelector('#time');
  }

  setTime(time) {
    this.$time.textContent = formatTime(time);
  }
}

export default ClockView;
