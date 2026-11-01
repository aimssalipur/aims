"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import {
  Video as VideoIcon,
  Send,
  Users,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  Radio,
  Clock,
  Sparkles,
  Maximize2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedVideoPlayer } from "@/components/ui/protected-video-player";
import { extractYouTubeId } from "@/lib/youtube";

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: string;
  role?: string;
}

export default function StudentLiveClassPage({
  params,
}: {
  params: { classId: string };
}) {
  const { classId } = params;
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [youtubeId, setYoutubeId] = useState<string>("");

  // Mobile active tab: "video" or "chat"
  const [mobileTab, setMobileTab] = useState<"video" | "chat">("video");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<any>(null);

  // 1. Fetch Class Details & Validate Access
  useEffect(() => {
    let isMounted = true;

    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/live-classes/${classId}/token`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to join live class");
        }
        const data = await response.json();
        if (isMounted) {
          setClassDetails(data);
          setUserProfile(data.user);
          const ytId = data.youtubeId || extractYouTubeId(data.youtubeUrl);
          setYoutubeId(ytId);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClassInfo();

    return () => {
      isMounted = false;
    };
  }, [classId]);

  // 2. Realtime Channel for Chat, Presence & Stream Sync
  useEffect(() => {
    if (!classDetails || !userProfile) return;

    const channel = supabase.channel(`live-chat:${classId}`, {
      config: {
        presence: {
          key: userProfile.name,
        },
      },
    });

    broadcastChannelRef.current = channel;

    // Listen to incoming chat messages
    channel.on("broadcast", { event: "chat-msg" }, ({ payload }) => {
      setMessages((prev) => [...prev, payload]);
    });

    // Listen to stream updates broadcasted by instructor
    channel.on("broadcast", { event: "stream-updated" }, ({ payload }) => {
      if (payload?.youtubeId) {
        setYoutubeId(payload.youtubeId);
      } else if (payload?.youtubeUrl) {
        setYoutubeId(extractYouTubeId(payload.youtubeUrl));
      }
    });

    // Listen to online presence state
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setActiveUsers(Object.keys(state));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userProfile.email,
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [classDetails, userProfile, classId, supabase]);

  // 3. Fallback poll to detect if instructor started stream while student is waiting
  useEffect(() => {
    if (youtubeId) return; // Already has stream

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/live-classes/${classId}/token`);
        if (res.ok) {
          const data = await res.json();
          const ytId = data.youtubeId || extractYouTubeId(data.youtubeUrl);
          if (ytId) {
            setYoutubeId(ytId);
          }
        }
      } catch (e) {
        // Silent catch
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [classId, youtubeId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mobileTab]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !broadcastChannelRef.current || !userProfile) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: userProfile.name,
      senderId: userProfile.email,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role: "student",
    };

    broadcastChannelRef.current.send({
      type: "broadcast",
      event: "chat-msg",
      payload: newMsg,
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-semibold text-sm">Entering secure live classroom...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-14 w-14 text-red-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Access Restricted</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl h-11">
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Courses
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Classroom Header */}
      <header className="h-14 sm:h-16 shrink-0 bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 rounded-xl"
          >
            <Link href="/student/courses">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-extrabold text-white truncate max-w-[180px] sm:max-w-md">
              {classDetails?.title || "Live Lecture"}
            </h1>
            <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              <span>AIMS SECURE LIVE CLASSROOM</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>{activeUsers.length} Online</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center bg-slate-900 border-b border-slate-800 px-3 py-1.5 gap-2 shrink-0">
        <button
          onClick={() => setMobileTab("video")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === "video"
              ? "bg-emerald-600 text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <VideoIcon className="h-3.5 w-3.5" />
          <span>Live Video</span>
        </button>
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === "chat"
              ? "bg-emerald-600 text-white shadow-lg"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Live Chat ({messages.length})</span>
        </button>
      </div>

      {/* Main Classroom Split Screen */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Column: Protected Video Player or Waiting Room */}
        <div
          className={`flex-1 bg-slate-950 relative flex flex-col justify-center p-2 sm:p-4 lg:p-6 overflow-hidden ${
            mobileTab === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          {youtubeId ? (
            <div className="w-full flex-1 flex flex-col justify-center max-w-6xl mx-auto">
              <ProtectedVideoPlayer
                videoId={youtubeId}
                title={classDetails?.title || "Live Lecture"}
                isLive={true}
                watermark={{
                  name: userProfile?.name || "Student",
                  email: userProfile?.email || "",
                  phone: userProfile?.phone || "",
                }}
              />
            </div>
          ) : (
            /* Waiting for Instructor Screen */
            <div className="w-full max-w-2xl mx-auto my-auto text-center p-6 sm:p-10 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl space-y-6">
              <div className="relative inline-flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-20 w-20 rounded-full bg-emerald-500/20" />
                <div className="relative h-20 w-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xl">
                  <Radio className="h-9 w-9 animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-extrabold uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  Live Room Active
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Welcome to {classDetails?.title || "Live Lecture"}
                </h2>
                <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Your instructor is preparing the broadcast from OBS Studio. As soon as the live stream begins, it will automatically connect on your screen.
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-white">{userProfile?.name}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Course:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{classDetails?.courseTitle || "Course"}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Security:</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    🔒 Dynamic Anti-Leak Watermark Active
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                You can say hello or ask preliminary questions in the Live Doubt Chat on the right.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Live Doubt Clearing Chat */}
        <div
          className={`w-full lg:w-96 shrink-0 bg-slate-900/60 lg:border-l border-slate-800/80 flex flex-col overflow-hidden ${
            mobileTab === "video" ? "hidden lg:flex" : "flex flex-1"
          }`}
        >
          {/* Chat Header */}
          <div className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-slate-200">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Live Doubt Clearing Chat</span>
            </div>
            <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Student
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MessageSquare className="h-9 w-9 text-slate-700" />
                <p className="text-slate-400 text-xs sm:text-sm font-bold">No questions yet</p>
                <p className="text-slate-500 text-[11px] max-w-[200px]">
                  Have a doubt regarding today's lecture? Type your question below to ask your instructor.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === userProfile?.email;
                const isInstructor = msg.role === "instructor" || msg.sender.includes("(Instructor)");
                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className={`h-7 w-7 ring-1 ${isInstructor ? "ring-emerald-500" : "ring-slate-800"}`}>
                      <AvatarFallback
                        className={`text-[9px] font-bold ${
                          isInstructor ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {initials(msg.sender)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[82%] ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-baseline gap-1.5 mb-1">
                        <span className={`text-[11px] font-extrabold ${isInstructor ? "text-emerald-400" : "text-slate-300"}`}>
                          {msg.sender}
                        </span>
                        <span className="text-[8px] text-slate-500 font-semibold">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : isInstructor
                            ? "bg-emerald-950/60 border border-emerald-500/40 text-emerald-100 rounded-tl-none"
                            : "bg-slate-800/90 text-slate-200 rounded-tl-none border border-slate-700/40"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ask your doubt to the instructor..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-slate-950 border-slate-800 text-white placeholder-slate-500 rounded-xl h-10 text-xs focus:ring-1 focus:ring-emerald-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputText.trim()}
                className="h-10 w-10 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
