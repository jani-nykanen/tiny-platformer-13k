import { Ramp, Sample } from "./sample.js";


export class AudioPlayer {


    private ctx : AudioContext;

    private globalVolume : number;
    private enabled : boolean;


    constructor(ctx : AudioContext, globalVolume : number = 0.60) {

        this.ctx = ctx;

        this.enabled = true;
        this.globalVolume = globalVolume;
    }


    public createSample = (sequence : number[], 
        baseVolume : number = 1.0,
        type : OscillatorType = "square",
        ramp : Ramp = Ramp.Exponential,
        attackTime : number = 2) : Sample => new Sample(this.ctx, sequence, baseVolume, type, ramp, attackTime);


    public playSample(sample : Sample | undefined, volume : number = 1.0) : void {

        if (!this.enabled) {

            return;
        }

        try {

            sample?.play(volume*this.globalVolume);
        }
        catch (e) {}
    }


    public toggle = (state : boolean = !this.enabled) : boolean => (this.enabled = state);


    public setGlobalVolume(vol : number) : void {

        this.globalVolume = vol;
    }


    public isEnabled = () : boolean => this.enabled;

}
