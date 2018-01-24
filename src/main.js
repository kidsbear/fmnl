const $ = require('jquery');

require('./testGlobals');

const editorInit = require('./editor/editorInit');
const runtime = require('./runtime/runtime');
const MidiPlayerAccess = require('./midi/player.js');

const ElementConverter = require('./midi/elementConverter');
const MidiWriter = require('midi-writer-js');
const LowLag = lowLag;

let files = {
    "tutorial: welcome": require('./library/tutorial-welcome.txt'),
    "tutorial: overview": require('./library/tutorial-overview.txt'),
    "tutorial: notes": require('./library/tutorial-note.txt'),
    "tutorial: notes2": require('./library/tutorial-note2.txt'),
    "tutorial: lists": require('./library/tutorial-list.txt'),
    "tutorial: function": require('./library/tutorial-function.txt'),
    "tutorial: wrapper": require('./library/tutorial-wrapper.txt'),
    "library usage": require('./library/library-usage.txt'),
    "example: mario underground": require("./library/mario-underground.txt"),
    "example: spring festival": require("./library/spring.txt"),
    "example: jungle bell": require("./library/jingle-bell.txt")
};

let lastCompileNum = 0;

let getEditorText = function() {
    return window.editor ? window.editor.getValue() : $("#input").val();
};

let setEditorText = function(text) {
    window.editor ? window.editor.setValue(text) : $("#input").val(text);
};

let initAudioFinished = false;
let initAudio = function() {
    //if (!initAudioFinished) {
        LowLag.load("other_modules/silence.mp3");
        LowLag.play("other_modules/silence.mp3");
        initAudioFinished = true;
    //}
};

let compileAction = function() {
    initAudio();

    let text = getEditorText();

    // Prepend standard library
    let stdLibrary = require('./library/std.txt');

    let res;
    let compileButton = $("#compile");
    compileButton.removeClass("compile-current compile-error").addClass("compile-waiting");
    window.setTimeout(function() {
        try {
            res = runtime().run(stdLibrary + text);
            compileButton.removeClass("compile-waiting compile-error").addClass("compile-current");

            let compileNum = Math.max(0, Math.min(res.length - 1, lastCompileNum));
            lastCompileNum = compileNum;
            let mainData = res[compileNum].evaluated;
            let settings = res[compileNum].settings;
            let midiTracks = [];

            let bpm = parseInt(settings["bpm"]) ? (MidiPlayerAccess.PPQ * 60)/ parseInt(settings["bpm"]) : 100;
            let pitch = parseInt(settings["pitch"]) ? parseInt(settings["pitch"]) : 60;
            let converter = new ElementConverter(mainData, bpm, pitch);
            converter.convert().forEach((track) => {
                let midiTrack = new MidiWriter.Track();

                // Define an instrument (optional):
                midiTrack.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

                // Add some notes:
                track.forEach((x) => midiTrack.addEvent(x));

                midiTracks.push(midiTrack);
            });

            // Generate a data URI
            let write = new MidiWriter.Writer([...midiTracks]);
            MidiPlayerAccess.loadData(write.dataUri());

            // Set download link
            $("#downloadLink")
                .attr("href", "data:application/octet-stream;charset=utf-16le;base64," + write.base64())
                .attr("download", "generated.mid");

            // Display exported elements
            let consoleList = $("<ul>").addClass("console-list").css("list-style-type", "none");
            for (let i = 0; i < res.length; i++) {

                let titleElement = $("<div>").addClass("console-item-title").text("<" + res[i].name + ">");
                titleElement.click(() => {
                    lastCompileNum = i;
                    compileAction();
                });

                let message = "";
                if (i == compileNum) {
                    for (let attribute in res[i].settings) {
                        message += `${attribute}: ${res[i].settings[attribute]}<br />`;
                    }
                    message += "Duration: " + res[i].duration + "<br />";
                    message += "Tracks: " + converter.numTracks + "<br />";
                    titleElement.addClass("console-item-selected");
                }
                let messageElement = $("<div>").addClass("console-item-body").html(message);

                $("<li>").addClass("console-item")
                    .append(titleElement)
                    .append(messageElement)
                    .appendTo(consoleList);
            }
            $("#console").find(".console-main").empty().append(consoleList);

            $("#error").html("");
        } catch (e) {
            compileButton.removeClass("compile-waiting compile-current").addClass("compile-error");
            $("#error").html(e);
            throw e;
        }
    }, 10);
};


let fileAction = function() {
    let filesList = $("<ul>").addClass("files-list").css("list-style-type", "none");
    for (let name in files) {
        let str = files[name];

        let fileElement = $("<div>").addClass("files-item-title").text(name);
        fileElement.click(() => {
            $(".files-item-title").removeClass("files-item-selected");
            fileElement.addClass("files-item-selected");
            editorInit.setAutoSave(false);
            setEditorText(str);
            compileAction();
        });

        $("<li>").addClass("console-item")
            .append(fileElement)
            .appendTo(filesList);
    }

    let name = "custom program (autosave)";
    let fileElement = $("<div>").addClass("files-item-title").text(name);
    fileElement.click(() => {
        let str = window.localStorage.getItem("input");
        if (!str) str = "";

        $(".files-item-title").removeClass("files-item-selected");
        fileElement.addClass("files-item-selected");
        setEditorText(str);
        editorInit.setAutoSave(true);
        compileAction();
    });

    $("<li>").addClass("console-item")
        .append(fileElement)
        .appendTo(filesList);

    $("#files").find(".files-main").empty().append(filesList);

    fileElement.click();
};

module.exports = function() {
    LowLag.init({ debug: "none" });

    let bpmBox = $("#bpm");
    let pitchBox = $("#pitch");
    bpmBox.val(window.localStorage.getItem("bpm") | 64);
    pitchBox.val(window.localStorage.getItem("pitch") | 46);
    bpmBox.change(() => {
        window.localStorage.setItem("bpm", bpmBox.val());
    });
    pitchBox.change(() => {
        window.localStorage.setItem("pitch", pitchBox.val());
    });

    editorInit.init("", () => compileAction());
    $("#compile").click(compileAction);
    $("#play").click(() => {
        initAudio();
        MidiPlayerAccess.play();
    });
    $("#pause").click(MidiPlayerAccess.pause);
    $("#stop").click(MidiPlayerAccess.stop);

    fileAction();
};
