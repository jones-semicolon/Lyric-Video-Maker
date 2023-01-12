export async function Fade(apf, delay, alpha, isFade = true) {
     isFade ? (alpha += apf) : (alpha -= apf);
     if (isFade && alpha > 1) {
          alpha = 1;
          await sleep(delay);
          isFade = false;
     }
     if (!isFade && alpha < 0) {
          alpha = 0;
          cancelAnimationFrame(Fade)
     }
}

export function sleep(ms) {
     new Promise((resolve) => setTimeout(resolve, ms));
}
