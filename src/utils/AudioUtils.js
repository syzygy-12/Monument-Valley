export function fadeIn(audio, duration, maxVolume) {
    duration = duration * 1000;
    new TWEEN.Tween({ volume: 0 })
      .to({ volume: maxVolume }, duration)
      .onUpdate(({ volume }) => {
        audio.volume = volume;
      })
      .onStart(() => audio.play())
      .start();
  }

export function fadeOut(audio, duration) {
    duration = duration * 1000;
    new TWEEN.Tween({ volume: audio.volume })
      .to({ volume: 0 }, duration)
      .onUpdate(({ volume }) => {
        audio.volume = volume;
      })
      .onComplete(() => audio.pause())
      .start();
  }