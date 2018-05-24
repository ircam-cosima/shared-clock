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
{   // [-][hh:]mm:ss
    //options:
    let hours_two_digits = false;   // always pad hour to two digits by prepending "0"
    let hours_always = false;       // todo
    let colon_flash  = false;       // todo: flash separating ':' every 0.5 s
    let colon_symbol = ':';         // todo

    let sign = '';
    if (t < 0)
    {
        sign = '-';
    }

    let sec_num = Math.abs(Math.floor(t));
    let sec_frac = Math.abs(t) - sec_num;	// fractional seconds
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);
    
    let hourstring = hours;
    if (hours < 10  &&  hours_two_digits) 
    {
        let hourstring  = "0" + hours;
    }
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    
    return sign + (hours != 0 ? hourstring + ':' : '') + minutes +':'+ seconds;
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
    //console.log(time, format_time(time));
  }
}

//export default { ClockView, template };