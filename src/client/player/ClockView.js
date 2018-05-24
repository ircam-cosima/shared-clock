import * as soundworks from 'soundworks/client';

export const template = `
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

function format_time(t)
{    // [-][hh:]mm:ss
    let sign = '';
    if (t < 0)
    {
        t = -t;
        sign = '-';
    }

    let sec_num = Math.floor(t);
    let sec_frac = t - sec_num;	// fractional seconds
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);
    
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    
    return sign + (hours != '00' ? hours + ':' : '') + minutes +':'+ seconds;
    // todo: flash separating ':' every 0.5 s
}
    
export class ClockView extends soundworks.SegmentedView {
  constructor(...args) {
    super(...args);
  }

  onRender(...args) {
    super.onRender(...args);

    this.$time = this.$el.querySelector('#time');
  }

  setTime(time) {
    // format time
    this.$time.textContent = format_time(time);
  }
}

//export default { ClockView, template };