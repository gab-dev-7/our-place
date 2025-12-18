import React, { useEffect, useState, useRef } from "react";
import { ArrowLeft, Loader } from "lucide-react";
import YouTube from "react-youtube";
import { supabase } from "../supabaseClient";

// Debounce function to limit the rate of function calls
const debounce = (func, delay) => {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

export function LivingRoom({ onBack, session }) {
  const user = session.user;
  const [mediaState, setMediaState] = useState({
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Default video
    is_playing: false,
    progress: 0,
  });
  const playerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState("");
  const [inputVideoUrl, setInputVideoUrl] = useState("");

  const getYoutubeVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // Debounced function to update Supabase
  const debouncedUpdateSupabase = useRef(
    debounce(async (newState) => {
      await supabase
        .from("media_state")
        .update({ ...newState, updated_by: user.id, updated_at: new Date() })
        .eq("id", 1);
    }, 500)
  ).current;

  // --- Supabase Realtime Subscription and Initial Fetch ---
  useEffect(() => {
    const fetchInitialMediaState = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("media_state")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("Error fetching initial media state:", error);
      } else if (data) {
        setMediaState(data);
        setInputVideoUrl(data.video_url);
      }
      setIsLoading(false);
    };

    fetchInitialMediaState();

    const channel = supabase
      .channel("media_state_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "media_state", filter: `id=eq.1` },
        (payload) => {
          const newMediaState = payload.new;
          // Only update state if the change was from the other user
          if (newMediaState.updated_by !== user.id) {
            setMediaState(newMediaState);

            if (playerRef.current) {
                const player = playerRef.current;
                if (newMediaState.is_playing && player.getPlayerState() !== 1) {
                  player.seekTo(newMediaState.progress);
                  player.playVideo();
                } else if (!newMediaState.is_playing && player.getPlayerState() !== 2) {
                  player.seekTo(newMediaState.progress);
                  player.pauseVideo();
                } else if (Math.abs(player.getCurrentTime() - newMediaState.progress) > 2) {
                  player.seekTo(newMediaState.progress);
                }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  // Handle video ID change
  useEffect(() => {
    let youtubeId = getYoutubeVideoId(mediaState.video_url);
    if (youtubeId) {
      setCurrentVideoId(youtubeId);
    }
  }, [mediaState.video_url]);

  // --- YouTube Player Handlers ---
  const onPlayerReady = (event) => {
    playerRef.current = event.target;
    // Sync player to current state from Supabase if not playing
    if (!mediaState.is_playing) {
      event.target.seekTo(mediaState.progress);
      event.target.pauseVideo();
    }
  };

  const onPlayerStateChange = (event) => {
    const player = event.target;
    const playerState = player.getPlayerState(); // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)

    const newIsPlaying = playerState === 1;
    const newProgress = player.getCurrentTime();

    if (newIsPlaying !== mediaState.is_playing || Math.abs(newProgress - mediaState.progress) > 1) {
      setMediaState((prev) => ({
        ...prev,
        is_playing: newIsPlaying,
        progress: newProgress,
      }));
      debouncedUpdateSupabase({ is_playing: newIsPlaying, progress: newProgress });
    }
  };

  const onPlayVideo = (event) => {
    setMediaState((prev) => ({ ...prev, is_playing: true }));
    debouncedUpdateSupabase({ is_playing: true, progress: event.target.getCurrentTime() });
  };

  const onPauseVideo = (event) => {
    setMediaState((prev) => ({ ...prev, is_playing: false }));
    debouncedUpdateSupabase({ is_playing: false, progress: event.target.getCurrentTime() });
  };

  const handleUrlChange = (e) => {
    setInputVideoUrl(e.target.value);
  };

  const handleSetVideo = async () => {
    const videoId = getYoutubeVideoId(inputVideoUrl);
    if (videoId) {
      const newUrl = `https://www.youtube.com/watch?v=${videoId}`;
      await supabase
        .from("media_state")
        .update({ video_url: newUrl, is_playing: false, progress: 0, updated_by: user.id })
        .eq("id", 1);
      // setMediaState is updated via subscription
    } else {
      alert("Please enter a valid YouTube URL.");
    }
  };

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0, // No autoplay on load
      controls: 1, // Show controls
      rel: 0, // Do not show related videos
      modestbranding: 1, // Less YouTube branding
    },
  };

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white p-6 flex flex-col items-center justify-center">
      {/* Header & Back Button */}
      <div className="absolute top-5 left-5 z-50">
        <button
          onClick={onBack}
          className="bg-white/90 hover:bg-white p-2 rounded-full shadow-lg text-slate-800 flex items-center gap-2"
        >
          <ArrowLeft size={24} /> Back to Room
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-8">Virtual Living Room 🎬</h1>

      {isLoading ? (
        <div className="w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center">
          <Loader className="animate-spin text-blue-500" size={48} />
          <p className="ml-4 text-slate-400">Loading shared media state...</p>
        </div>
      ) : (
        <div className="w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden relative">
          {currentVideoId ? (
            <div className="absolute top-0 left-0 w-full h-full">
              <YouTube
                videoId={currentVideoId}
                opts={opts}
                onReady={onPlayerReady}
                onPlay={onPlayVideo}
                onPause={onPauseVideo}
                onStateChange={onPlayerStateChange}
                className="w-full h-full" // For potential CSS targeting
              />
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              No video set. Enter a YouTube URL below.
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex flex-col items-center w-full max-w-4xl">
        <div className="flex w-full gap-2 mb-4">
          <input
            type="text"
            className="flex-grow p-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            placeholder="Enter YouTube video URL"
            value={inputVideoUrl}
            onChange={handleUrlChange}
          />
          <button
            onClick={handleSetVideo}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-all"
          >
            Set Video
          </button>
        </div>

        <div className="mt-4 text-center text-slate-400">
          <p>This will be our shared screen for watching videos together.</p>
          <p>When one person plays or pauses, the other will see it happen in real-time.</p>
        </div>
      </div>
    </div>
  );
}
