import { Lrc } from "lrc-kit";
import React, {useState, useEffect} from "react"
import raw from './assets/lyrics.lrc'

export function Lyric(){
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
  
  class lrcClass{
    lyrics = lyrics
  }
  return lrcClass
};
