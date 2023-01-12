import raw from "./assets/lyrics.lrc";
import React, { useState, useEffect } from "react";
import { Lrc } from "lrc-kit";
import "./App.css";
import Canvas from "./canvas";
import Canvs from "./Sample";
import { recorder } from "./recorder";

function App() {
  const [lyrics, setLyrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLyrics() {
      try {
        const response = await fetch(raw);
        const lrcString = await response.text();
        const parsedLyrics = await Lrc.parse(lrcString);
        setLyrics(parsedLyrics);
      } catch (err) {
        setError(err);
      }
    }
    fetchLyrics();
  }, []);

  if (error) {
    return <div>An error occured: {error.message}</div>;
  }

  if (!lyrics) {
    return <div>Loading lyrics...</div>;
  } else {
    const title = lyrics.info.ti;
    const artist = lyrics.info.ar;
    const length = lyrics.info.length;
    const lyric = lyrics.lyrics;
    const currentTime = 0;
    // console.log(length)
    return <Canvs />;
  }
}
export default App;
