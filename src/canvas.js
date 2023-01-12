import React, { useRef, useEffect } from "react";
import "./App.css";
import picture from "./assets/picture.jpeg";
import { sleep } from "./animation";

export default function Canvas() {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    var background = new Image();
    background.src = picture;
    const image = imageRef.current;
    const stream = canvas.captureStream();
    const recorder = new MediaRecorder(stream, {
      mimeType: "video/webm",
    });
    const intro = document.getElementById("intro");
    //console.log(intro)
    const video = document.querySelector("video");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    let alpha = 0;
    let delay = 2000;
    let apf = 0.02;
    let isFade = true;
    const fontSize = canvas.offsetWidth / 5;
    const artistSize = fontSize / 2;

    background.onload = () => {
      //ctx.clearRect(0, 0, canvas.width, canvas.height);
      //ctx.fillStyle = "black";
      //ctx.fullRect(0, 0, canvas.width, canvas.height);
      //ctx.globalAlpha = 0.5;
      ctx.drawImage(background, 0, 0);
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    async function fade() {
      isFade ? (alpha += apf) : (alpha -= apf);
      if (isFade && alpha > 1) {
        alpha = 1;
        await sleep(delay);
        isFade = false;
      }
      if (!isFade && alpha <= 0) {
        alpha = 0;
        cancelAnimationFrame(fade);
        reset()
      }
      ctx.globalAlpha = alpha;

      //ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(background, 0, 0);
      ctx.fillStyle = "white";
      ctx.font = `${fontSize}px Edo`;
      ctx.textAlign = "center";
      ctx.fillText("Fade", canvas.width / 2, canvas.height / 2);
      ctx.font = `${artistSize}px Patrick Hand SC`;
      ctx.fillText("Artist", canvas.width / 2, canvas.height / 2 + 30);
      requestAnimationFrame(fade);
    }

    if (alpha == 0) {
      recorder.start();
      requestAnimationFrame(fade);
    }

    function reset() {
      new Promise(() => {
        ctx.clearReact(0, 0);
        ctx.globalAlpha = 0;
        ctx.drawImage(background, 0, 0);
      });
    }

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    setTimeout(() => recorder.stop(), 5000);
    recorder.ondataavailable = async (event) => {
      const url = URL.createObjectURL(event.data);
      video.src = url;
      await reset();
      //return () => cancelAnimationFrame(fadeInterval);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} id="canvas" />
      <video controls></video>
    </div>
  );
}
