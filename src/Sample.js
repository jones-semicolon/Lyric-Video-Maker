import React, { useRef, useEffect, useState } from "react";
import { FilePicker } from 'react-file-picker'
import { Lrc } from "lrc-kit";
import raw from "./assets/Golden Hour.lrc";
import picture from "./assets/picture.jpeg";
import music from "./assets/JVKE - golden hour (official music video).m4a";
import { Lyric } from "./Lrc";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const Canvs = (props) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [lyrics, setLyrics] = useState(null);
  const [error, setError] = useState(null);
  const [backgroundFile, setBackground] = useState(null);
  const [audioFile, setAudio] = useState('');
  const [lrcFile, setLyric] = useState(null);
  var length = ''
  const image = new Image();
  // image.src = backgroundFile;
  const form = document.querySelector("#form");
  const audio = new Audio();
  // audio.src = audioFile;
  var ctx = "";
  var isFade = true;
  var alpha = 0;
  var start = 0;
  var end = 0;
  var fontSize = "";
  var introState = true;
  var index = 0;

  function backgroundChange(event) {
    event = URL.createObjectURL(event)
    image.src = event
    console.log("Background Satisfied")
    setBackground(event)
  }

  function handleFileRead(e) {
    const content = e.target.result;
    // Do something with the file content
    audio.src = content
    setAudio(content)
    console.log("Audio Satisfied")
  }

  function handleFileReadError(e) {
    console.log("File read error: ", e);
  }

  function audioChange(event) {
    const file = event.target.files[0]
    const reader = new FileReader()
    reader.onloadend = handleFileRead;
    reader.onerror = handleFileReadError;
    reader.readAsDataURL(file)
    setAudio(reader.result)
    // console.log(`Audio Satisfied: ${reader.result}`)
  }

  function lyricChange(event) {
    event = URL.createObjectURL(event)
    console.log("Lyric Satisfied")
    setLyric(event)
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    setCanvas(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    async function fetchLyrics() {
      try {
          if (lrcFile) {
          const response = await fetch(lrcFile);
          const lrcString = await response.text();
          const parsedLyrics = await Lrc.parse(lrcString);
          // console.log(parsedLyrics)
          setLyrics(parsedLyrics);
        }} catch (err) {
          setError(err);
        }
      }
    fetchLyrics();
  }, []);

  console.log(`audioFile: ${lyrics}`)
  console.log(`error: ${error}`)
  image.onload = () => {
    if (error) {
      return <h1>There is an error: {error.message}</h1>;
    } else if (canvas && lyrics && image) {
      form.style.display = "block";
      __init__();
    }
  };

  function setTimestamp(timestamp) {
    timestamp = timestamp.split(":");
    const min = parseInt(timestamp[0]) * 60;
    const seconds = min + parseFloat(timestamp[1]);
    return seconds;
  }

  async function __init__() {
    ctx = canvas.getContext("2d");
    length = setTimestamp(lyrics.info.length);
    fontSize = setFontSize();
    console.log(length)
    background();
  }

  function background() {
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, canvas.width / 2 - image.width / 2, canvas.height / 2 - image.height / 2);
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  async function textCanvas() {
    isFade ? (alpha += 0.1) : (alpha -= 0.1);
    if (isFade && alpha > 1) {
      alpha = 1;
      await sleep((end - start - 0.375) * 1000);
      isFade = false;
    }
    if (!isFade && alpha < 0) {
      alpha = 0;
      index += 1;
      introState = false;
      start = end;
      isFade = true;
      //console.log("hello");
      cancelAnimationFrame(textCanvas);
    }
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    background();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "white";
    introState ? intro() : lyric();
    index >= lyrics.lyrics.length ? end = length : end = lyrics.lyrics[index].timestamp;
    requestAnimationFrame(textCanvas);
  }

  function intro() {
    ctx.font = `${fontSize}px Edo`;
    ctx.textAlign = "center";
    let wrappedText = wrapText(
      ctx,
      lyrics.info.ti,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width,
      fontSize
    );
    wrappedText.forEach(function (item) {
      ctx.fillText(item[0], item[1], item[2]);
    });
    const parent = wrappedText.findLast((x) => true);
    const arSize = parent.findLast((x) => true) + fontSize / 2;
    ctx.font = `${fontSize / 2}px Helvetica`;
    ctx.fillStyle = "hsla(0 50% 100% / 0.8)";
    wrappedText = wrapText(
      ctx,
      lyrics.info.ar.toUpperCase(),
      canvas.width / 2,
      arSize,
      canvas.width,
      fontSize / 2
    );
    wrappedText.forEach(function (item) {
      ctx.fillText(item[0], item[1], item[2]);
    });
  }

  function playNow() {
    if (lrcFile && audioFile && backgroundFile) {
      form.style.display = "none";
      audio.play();
      textCanvas();
    } else {
      console.log("Please Select File")
    }
  }

  function lyric() {
    ctx.font = `${fontSize / 2}px Patrick Hand SC`;
    let wrappedText = wrapText(
      ctx,
      checkLyric(),
      canvas.width / 2,
      canvas.height / 2,
      canvas.width,
      fontSize / 2
    );
    wrappedText.forEach(function (item) {
      ctx.fillText(item[0], item[1], item[2]);
    });
  }

  function checkLyric() {
    const lrcLine = lyrics.lyrics[index - 1].content;
    const note = '\u266a \u266a \u266a'
    // console.log(lyrics.lyrics[lyrics.lyrics.length - 1].content == "" ? note : lrcLine)
    return lrcLine === "" ? note : lrcLine;
  }

  function setFontSize() {
    return canvas.width <= 360
      ? canvas.offsetWidth / 5
      : canvas.offsetWidth / 10;
  }

  const wrapText = function (ctx, text, x, y, maxWidth, lineHeight) {
    let words = text.split(" ");
    let line = "";
    let testLine = "";
    let lineArray = [];

    for (var n = 0; n < words.length; n++) {
      testLine += `${words[n]} `;
      let metrics = ctx.measureText(testLine);
      let testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        lineArray.push([line, x, y]);
        y += lineHeight;
        line = `${words[n]} `;
        testLine = `${words[n]} `;
      } else {
        line += `${words[n]} `;
      }
      if (n === words.length - 1) {
        lineArray.push([line, x, y]);
      }
    }
    return lineArray;
  };

  return (
    <>
      <div id="form">
        <FilePicker accept=".png, .mp4, .jpg, .jpeg" onChange={backgroundChange}>
          <button id="filePicker">Select Backgound File</button>
        </FilePicker>
        {/* <FilePicker onChange={audioChange} onError={(err) => console.log(error)}>
          <button id="filePicker">Select Music File</button>
        </FilePicker> */}
        <>
          <label for="audioPicker">Pick a File</label>
          <input
            type="file"
            id="audioPicker" onChange={audioChange}></input>
        </>
        <FilePicker accept=".lrc" onChange={lyricChange}>
          <button id="filePicker">Select Lyric File</button>
        </FilePicker>
        <button onClick={playNow}>Play Now</button>
      </div>
      <canvas ref={canvasRef} {...props} />
      <audio src={audioFile} controls />
    </>
  );
};

export default Canvs;
