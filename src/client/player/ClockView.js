import * as soundworks from 'soundworks/client';

function padLeft(value, char, length) {
  value = value + ''; // cast to string

  while (value.length < length)
    value = char + value;

  return value;
}

function formatTime(time) {   // [-][hh:]mm:ss
    // possible options (really needed ? if not remove that):
    // const hoursTwoDigits = false;   // always pad hour to two digits by prepending "0"
    // const hoursAlways = false;       // todo
    // const colonFlash  = false;       // todo: flash separating ':' every 0.5 s
    // const colonSymbol = ':';         // todo

    const sign = time < 0 ? '-' : '';
    const timeInSeconds = Math.abs(Math.floor(time));
    const secFrac = Math.abs(time) - timeInSeconds;	// fractional seconds (not used)
    const hours = padLeft(Math.floor(timeInSeconds / 3600), '0', 2);
    const minutes = padLeft(Math.floor((timeInSeconds - (hours * 3600)) / 60), '0', 2);
    const seconds = padLeft(timeInSeconds - (hours * 3600) - (minutes * 60), '0', 2);
    const millis = padLeft(Math.floor(secFrac * 1000), '0', 3);

    return sign + (hours !== '00' ? hours + ':' : '') + minutes + ':' + seconds + ':' + millis;
}

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

class Renderer extends soundworks.Canvas2dRenderer {
  constructor(transport) {
    super();

    this.transport = transport;
  }

  update() {
    if (this.$time) {
      const position = this.transport.currentPosition;
      const formattedPosition = formatTime(position);

      this.$time.textContent = formattedPosition;
    }
  }
}

class ClockView extends soundworks.CanvasView {
  constructor(transport, model) {
    super(template, model, {}, { id: 'clock' });

    this.renderer = new Renderer(transport);
    this.addRenderer(this.renderer);
  }

  onRender() {
    super.onRender();

    this.$time = this.$el.querySelector('#time');
    this.renderer.$time = this.$time;
  }

  // onRender(...args) {
  //   super.onRender(...args);

  //   this.$time = this.$el.querySelector('#time');
  // }

  // setTime(time) {
  //   this.$time.textContent = formatTime(time);
  // }
}

export default ClockView;
