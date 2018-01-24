const Element = require("./../elements/element");
const MidiWriter = require('midi-writer-js');
const Fraction = require("./../math/fraction.js");

let ElementConverter = function(elements, baseDuration, basePitch) {
    this.elements = elements;
    this.baseDuration = baseDuration;
    this.basePitch = basePitch;
    this.baseVelocity = 50;

    this.numTracks = -1;
    this.tracksLength = [];
};

let EventWrapper = function(onTime, offTime, pitch, velocity) {
    // Allow constructor usage without 'new'
    if (!(this instanceof EventWrapper)) {
        return new EventWrapper(onTime, offTime, pitch, velocity);
    }

    this.onTime = Number.parseInt(onTime);
    this.offTime = Number.parseInt(offTime);
    this.pitch = Number.parseInt(pitch);
    this.velocity = Number.parseInt(velocity);
};


ElementConverter.prototype.convert = function() {
    let tracks = [];
    this.convertElements(tracks, 0, this.elements, 0);
    this.numTracks = tracks.length;

    let numberToMidiNumArr = function(n) {
        if (n < 0.001) return [0];

        let res = [];
        while (n > 0.001) {
            res.unshift(n % 128 + 128);
            n = Math.floor(n / 128);
        }
        res[res.length - 1] -= 128;
        return res;
    };

    let midiTracks = [];
    for (let i = 0; i < tracks.length; i++) {
        let cur = 0;
        midiTracks[i] = [];
        for (let j = 0; j < tracks[i].length; j++) {
            let w = tracks[i][j];
            if (Number.isNaN(w.pitch)) {
                continue;
            }
            midiTracks[i].push(new MidiWriter.NoteOnEvent(
                {data: [...numberToMidiNumArr(w.onTime - cur), 144 + i, w.pitch, w.velocity]}
            ));
            midiTracks[i].push(new MidiWriter.NoteOffEvent(
                {data: [...numberToMidiNumArr(w.offTime - w.onTime), 128 + i, w.pitch, w.velocity]}
            ));
            cur = w.offTime;
        }
        this.tracksLength.push(Fraction.fromFloat(cur));
    }
    return midiTracks;
};

ElementConverter.prototype.convertElements = function(tracks, trackNum, elements, time) {
    let arr = elements.getArray();
    let maxTrackNum = -1;
    for (let i = 0; i < arr.length; i++) {
        let resTrackNum;
        [time, resTrackNum] = this.convertElement(tracks, trackNum, arr[i], time);
        maxTrackNum = Math.max(maxTrackNum, resTrackNum);
    }
    return [time, maxTrackNum];
};

ElementConverter.prototype.convertElement = function(tracks, trackNum, element, time) {
    switch (element.type) {
        case Element.LIST:
            return this.convertList(tracks, trackNum, element, time);
        case Element.NOTE:
            return this.convertNote(tracks, trackNum, element, time);
        case Element.WRAPPER:
            return this.convertWrapper(tracks, trackNum, element, time);
        default:
            console.log(element);
            throw new Error("Mysterious element", element);
    }
};

ElementConverter.prototype.convertNote = function(tracks, trackNum, note, time) {
    let duration = note.duration.toFloat() * this.baseDuration;
    let newTime = time + duration;
    if (tracks[trackNum] === undefined) tracks[trackNum] = [];
    tracks[trackNum].push(EventWrapper(time, time + duration * 0.4, note.pitch + this.basePitch, this.baseVelocity));
    return [newTime, trackNum];
};

ElementConverter.prototype.convertList = function(tracks, trackNum, list, time) {
    let newTime;
    let lastTrack = trackNum - 1;
    for (let i = 0; i < list.size; i++) {
        [tmpTime, tmpTrack] = this.convertElements(tracks, lastTrack + 1, list.getElements(i), time);
        if (i == 0) {
            newTime = tmpTime;
        }
        lastTrack = tmpTrack;
    }
    return [newTime, lastTrack];
};

ElementConverter.prototype.convertWrapper = function(tracks, trackNum, wrapper, time) {
    return this.convertElements(tracks, trackNum, wrapper.getElements(), time);
};

module.exports = ElementConverter;