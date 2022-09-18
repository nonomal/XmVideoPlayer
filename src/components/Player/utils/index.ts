import Hls from 'hls.js';
import flv from 'flv.js';
import dash from 'dashjs';
import pinyinMatch from 'pinyin-match';

export function formatVideo(url: string, type?: string) {
  // HLS流媒体
  const isHls = type === 'hls' || /^https?:\/\/.+(\.)?m3u8(\.php)?(\?(.*))?$/.test(url);
  if (isHls) {
    return {
      url: url,
      type: 'customHls',
      customType: {
        customHls: function (video: HTMLVideoElement /* player */) {
          const hls = new Hls();
          hls.loadSource(video.src);
          hls.attachMedia(video);
        },
      },
    };
  }
  // FLV 流媒体
  const isFlv = type === 'flv' || /^https?:\/\/.+\.(flv|xs)(\?(.*))?$/.test(url);
  if (isFlv) {
    return {
      url: url,
      type: 'customFlv',
      customType: {
        customFlv: function (video: HTMLVideoElement /* player */) {
          const flvPlayer = flv.createPlayer({
            type: 'flv',
            url: video.src,
          });
          flvPlayer.attachMediaElement(video);
          flvPlayer.load();
        },
      },
    };
  }
  // MPEG-DASH 流媒体
  const isMpd = type === 'mpd' || /^https?:\/\/.+\.(mpd)(\?(.*))?$/.test(url);
  if (isMpd) {
    return {
      url: url,
      type: 'customDash',
      customType: {
        customDash: function (video: HTMLVideoElement /* player */) {
          dash.MediaPlayer().create().initialize(video, video.src, false);
        },
      },
    };
  }
  return {
    url,
    type: 'normal',
  };
}

//
export function checkPinYin(name: string, keyword: string) {
  const matchRes = pinyinMatch.match(name, keyword);
  return typeof matchRes === 'object' ? matchRes.length > 0 : matchRes;
}
