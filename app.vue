<script lang="ts" setup>
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}
import { ref, onMounted, onUnmounted } from 'vue'

const mouseX = ref(0)
const mouseY = ref(0)
const gradientBall = useTemplateRef("gradient-ball")

const updateMousePosition = (event: MouseEvent) => {
  mouseX.value = event.clientX
  mouseY.value = event.clientY
  gradientBall.value!.style.left = `${mouseX.value - (gradientBall.value!.clientWidth / 2)}px`;
  gradientBall.value!.style.top = `${mouseY.value - (gradientBall.value!.clientHeight / 2)}px`;
}

onMounted(() => {
  window.addEventListener('mousemove', updateMousePosition)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updateMousePosition)
})

const canvas = useTemplateRef("gradient-line")

onMounted(() => {
  const ctx = canvas.value!.getContext("2d")!;

  if(window.innerWidth < 1024) {
    canvas.value!.height = 100;
  } else {
    canvas.value!.height = 150;
  }

  const gradient = ctx!.createLinearGradient(0, 0, 0, canvas.value!.height)
  gradient.addColorStop(0, 'black'); // From slate-500
  gradient.addColorStop(0.25, 'slategray'); // From slate-500
  gradient.addColorStop(0.5, 'skyblue'); // Via sky-500
  gradient.addColorStop(1, '#EC6EAD');  // To custom color (#EC6EAD)

  ctx.lineWidth = 2
  ctx.strokeStyle = gradient

  let start = 0;
  let animationId: number;

  const animate = (timestamp: number) => {
    if (!start) start = timestamp;
    const progress = Math.min(timestamp - start, 2000); // 3 seconds animation, capped
    const percent = progress / 2000;

    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height);
    ctx.beginPath();
    ctx.moveTo(5, 0);
    ctx.lineTo(5, canvas.value!.height * percent);
    ctx.stroke();

    if (percent < 1) {
      animationId = requestAnimationFrame(animate);
    }
  };

  animationId = requestAnimationFrame(animate);

  // Clean up animation on component unmount
  onUnmounted(() => {
    cancelAnimationFrame(animationId);
  });
})

const vidLink = ref("");
const vidId = ref("")

const extractYouTubeId = (url: string): string | null => {
  const match = url.match(/(?:vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
  console.log(match && match[1], ":")
  return match ? match[1] : null;
};

const checkAndExtractYouTubeId = (link: string): string | null => {
  try {
    const url = new URL(link);
    return (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be'))
      ? extractYouTubeId(url.href)
      : null;
  } catch {
    return null;
  }
};

const player = ref<YT.Player | null>(null)

watch(vidLink, () => {
  const vidId = checkAndExtractYouTubeId(vidLink.value)
  if(vidId) {
    if(player.value) {
      player.value?.loadVideoById(vidId)
    } else {
      initializeYouTubePlayer(vidId)
    }
  } else {
  }
})

const initializeYouTubePlayer = (vidId: string) => {
  player.value = new window.YT.Player('ytPlayer', {
    height: '390',
    width: '640',
    videoId: vidId,
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

const loadYouTubeAPI = () => {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
}

onMounted(() => {
  loadYouTubeAPI();
})

const onPlayerReady = (event: any) => {
  // Player is ready
}

const onPlayerStateChange = (event: any) => {
  // Player state has changed
}
</script>

<template>
  <main class="bg-black text-white w-screen h-screen">
    <div ref="gradient-ball" class="z-0 fixed size-[70vh] rounded-full gradient-ball"></div>
    
    <section class="h-screen w-screen fixed top-0 left-0 bg-transparent flex flex-col">
      <div class="w-full flex flex-col items-center pb-5">
        <h1 class="text-2xl lg:text-6xl font-serif gradient-text">Yt-Vid Downloader</h1>
      </div>

      <section class="flex flex-col items-center p-10 w-full flex-1">
        <input 
          type="text" 
          name="vid-link" 
          id="vid-link" 
          placeholder="video link"
          v-model="vidLink"
          class="blockAppear text-white text-sm p-3 w-60 lg:w-80 bg-transparent border shadow-sm border-slate-500 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:shadow-lg focus:shadow-sky-600 rounded-lg focus:ring-1"
        />

        <canvas ref="gradient-line" width="10"></canvas>

        <div 
          class="blockAppear rounded-lg lg:rounded-2xl h-[200px] lg:h-3/6 w-screen lg:w-7/12 border-dashed border-[#EC6EAD] border"
          id="ytPlayer"
        >
        </div>

        <Transition name="fade">
          <button 
            v-if="vidLink !== ''" 
            class="gradient-text my-5 font-serif lg:text-lg py-1 px-3 border-y-0 hover:border-[#EC6EAD] border-2 border-[#3494E6] rounded-lg"
          >
            Download
          </button>
        </Transition>
      </section>
    </section>
  </main>
</template>

<style scoped>
.gradient-ball {
  background: radial-gradient(circle at center, #01374d 10%, transparent 70%);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}
.gradient-text {
  background: linear-gradient(45deg, #3494E6, #EC6EAD);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

@keyframes appear {
  from {
    opacity: 0;
    scale: 0.5;
  }
  to {
    opacity: 1;
    scale: 1;
  }
}
.blockAppear {
  animation: appear linear;
  animation-timeline: view();
  animation-range: entry 0% cover 40%;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
