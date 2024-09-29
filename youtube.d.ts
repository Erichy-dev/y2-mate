// youtube.d.ts
declare global {
    interface Window {
      YT: typeof YT;
      onYouTubeIframeAPIReady: () => void;
    }
  
    namespace YT {
      class Player {
        constructor(elementId: string, options: PlayerOptions);
  
        cueVideoById(videoId: string): void;
        loadVideoById(videoId: string): void;
        playVideo(): void;
        pauseVideo(): void;
        stopVideo(): void;
        destroy(): void;
      }
  
      interface PlayerOptions {
        height: string;
        width: string;
        videoId: string;
        playerVars?: PlayerVars;
        events?: PlayerEvents;
      }
  
      interface PlayerVars {
        autoplay?: 0 | 1;
        controls?: 0 | 1;
        disablekb?: 0 | 1;
        loop?: 0 | 1;
        playlist?: string;
        playsinline?: 0 | 1;
        rel?: 0 | 1;
        start?: number;
        end?: number;
        modestbranding?: 0 | 1;
      }
  
      interface PlayerEvents {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerStateChangeEvent) => void;
        onError?: (event: PlayerErrorEvent) => void;
      }
  
      interface PlayerEvent {
        target: Player;
      }
  
      interface PlayerStateChangeEvent extends PlayerEvent {
        data: number;
      }
  
      interface PlayerErrorEvent extends PlayerEvent {
        data: number;
      }
  
      enum PlayerState {
        UNSTARTED = -1,
        ENDED = 0,
        PLAYING = 1,
        PAUSED = 2,
        BUFFERING = 3,
        CUED = 5,
      }
    }
  }
  
  export {};
  