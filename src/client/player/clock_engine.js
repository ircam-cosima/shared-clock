import * as audio from 'waves-audio';
//const audio = this.require('audio');

function format_time(t)
{    // [hh:]mm:ss
    let sec_num = Math.floor(t);
    let sec_frac = t - sec_num;	// fractional seconds
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);
    
    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    
    return (hours != '00' ? hours + ':' : '') + minutes +':'+ seconds;
    // todo: flash :
}
    
class ClockEngine extends audio.TimeEngine {
    constructor(p$, step = 1) {
	super(); // call base class constructor

	this.el$ = p$;
	this._period = step;
	console.log('clock ctor', this.el$);
    }

    set step(s) { // define setter for myobj.bpm = x
	this._period = s;
    }

    start(t) {
	this._running = 1;
	this._starttime = t;
	this.update();
    }

    stop(t) {
	this._running = 0;
    }
    
    update() {
	this.el$.textContent = format_time(this._time - this._starttime);
    }
    
    advanceTime(time) { // audiotime
	this._time = time;
	if (this._running) {
	    this.update();
	}
	return time + this._period;
    }
}
