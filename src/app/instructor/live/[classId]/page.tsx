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
  ShieldCheck,
  Radio,
  ExternalLink,
  HelpCircle,
  X,
  CheckCircle2,
  Tv,
  Settings2,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProtectedVideoPlayer } from "@/components/ui/protected-video-player";
import { extractYouTubeId, isValidYouTubeSource } from "@/lib/youtube";
import { useToast } from "@/components/ui/use-toast";

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: string;
  role?: string;
}

export default function InstructorLiveClassPage({
  params,
}: {
  params: { classId: string };
}) {
  const { classId } = params;
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [youtubeId, setYoutubeId] = useState<string>("");
  const [streamInput, setStreamInput] = useState<string>("");
  const [updatingStream, setUpdatingStream] = useState<boolean>(false);
  const [showObsGuide, setShowObsGuide] = useState<boolean>(false);
  const [showEditStreamInput, setShowEditStreamInput] = useState<boolean>(false);

  // Mobile active tab: "video" or "chat"
  const [mobileTab, setMobileTab] = useState<"video" | "chat">("video");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<any>(null);

  // 1. Fetch Class Info and Validate Instructor / Admin Role
  useEffect(() => {
    let isMounted = true;

    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/live-classes/${classId}/token`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to enter instructor console");
        }
        const data = await response.json();

        if (data.user.role !== "admin" && data.user.role !== "instructor") {
          throw new Error("Forbidden: Only instructors and administrators can host live classes.");
        }

        if (isMounted) {
          setClassDetails(data);
          setUserProfile(data.user);
          const url = data.youtubeUrl || "";
          const id = data.youtubeId || extractYouTubeId(url);
          setYoutubeUrl(url);
          setYoutubeId(id);
          setStreamInput(url);
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

  // 2. Realtime Channel for Live Doubt Chat, Presence & Stream Sync
  useEffect(() => {
    if (!classDetails || !userProfile) return;

    const channel = supabase.channel(`live-chat:${classId}`, {
      config: {
        presence: {
          key: `${userProfile.name} (Instructor)`,
        },
      },
    });

    broadcastChannelRef.current = channel;

    // Listen to messages
    channel.on("broadcast", { event: "chat-msg" }, ({ payload }) => {
      setMessages((prev) => [...prev, payload]);
    });

    // Listen to stream updates
    channel.on("broadcast", { event: "stream-updated" }, ({ payload }) => {
      if (payload?.youtubeId) {
        setYoutubeId(payload.youtubeId);
      }
    });

    // Listen to presence
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      setActiveUsers(Object.keys(state));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          user_id: userProfile.email,
          role: "instructor",
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [classDetails, userProfile, classId, supabase]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mobileTab]);

  // Save / Update Stream URL
  const handleUpdateStream = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawVal = streamInput.trim();

    if (!rawVal) {
      toast({
        title: "URL Required",
        description: "Please enter your YouTube Live Stream URL or Video ID.",
        variant: "destructive",
      });
      return;
    }

    const extractedId = extractYouTubeId(rawVal);
    if (!extractedId) {
      toast({
        title: "Invalid YouTube Link",
        description: "Please enter a valid YouTube Live link (e.g. https://youtu.be/... or https://youtube.com/live/...).",
        variant: "destructive",
      });
      return;
    }

    setUpdatingStream(true);
    try {
      const res = await fetch(`/api/live-classes/${classId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: rawVal }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update stream");
      }

      setYoutubeUrl(rawVal);
      setYoutubeId(extractedId);
      setShowEditStreamInput(false);

      // Broadcast to all active students in the room
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.send({
          type: "broadcast",
          event: "stream-updated",
          payload: {
            youtubeUrl: rawVal,
            youtubeId: extractedId,
          },
        });
      }

      toast({
        title: "Broadcast Active!",
        description: "Stream updated. All enrolled students will now receive your live video.",
      });
    } catch (err: any) {
      toast({
        title: "Update Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingStream(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !broadcastChannelRef.current || !userProfile) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: `${userProfile.name} (Instructor)`,
      senderId: userProfile.email,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      role: "instructor",
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
        <p className="text-slate-400 font-semibold text-sm">Initializing instructor broadcast console...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <ShieldAlert className="h-14 w-14 text-red-500 mx-auto" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Access Forbidden</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
          <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl h-11">
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Instructor Panel
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Console Header */}
      <header className="h-14 sm:h-16 shrink-0 bg-slate-900/90 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 rounded-xl"
          >
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-extrabold text-white truncate max-w-[180px] sm:max-w-md">
              {classDetails?.title || "Host Live Lecture"}
            </h1>
            <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>INSTRUCTOR LIVE CONSOLE (OBS + YOUTUBE LIVE)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* OBS Setup Guide Trigger */}
          <button
            onClick={() => setShowObsGuide(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            title="OBS Studio setup instructions"
          >
            <HelpCircle className="h-4 w-4 text-emerald-400" />
            <span className="hidden sm:inline">OBS Setup Guide</span>
          </button>

          {/* Online Roster Pill */}
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/50 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>{activeUsers.length} In Classroom</span>
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
          <span>Stream Broadcast</span>
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
          <span>Student Doubts ({messages.length})</span>
        </button>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Column: Stream Monitor & Broadcast Controls */}
        <div
          className={`flex-1 bg-slate-950 relative flex flex-col p-3 sm:p-5 lg:p-6 overflow-y-auto space-y-4 ${
            mobileTab === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          {youtubeId ? (
            /* Stream Active: Live Monitor + Quick URL update bar */
            <div className="space-y-4 max-w-6xl mx-auto w-full">
              {/* Broadcast Status Bar */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                      Broadcasting Live to Students
                    </span>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                      Stream Source: {youtubeUrl}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEditStreamInput(!showEditStreamInput)}
                    className="border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold rounded-xl h-9"
                  >
                    <Settings2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                    {showEditStreamInput ? "Cancel" : "Change Stream Link"}
                  </Button>
                </div>
              </div>

              {/* Collapsible Edit Stream Input Bar */}
              {showEditStreamInput && (
                <form
                  onSubmit={handleUpdateStream}
                  className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2"
                >
                  <label className="text-xs font-extrabold text-slate-200 block">
                    Update YouTube Live Stream URL or Video ID:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      value={streamInput}
                      onChange={(e) => setStreamInput(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-white text-xs h-10 rounded-xl flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={updatingStream}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl h-10 px-5 shadow-lg"
                    >
                      {updatingStream ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                      Save &amp; Broadcast
                    </Button>
                  </div>
                </form>
              )}

              {/* Host Stream Monitor (Protected Video Player) */}
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
                <ProtectedVideoPlayer
                  videoId={youtubeId}
                  title={`Instructor Preview: ${classDetails?.title || "Live Lecture"}`}
                  isLive={true}
                />
              </div>

              {/* Stream Protection Notice */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Anti-Piracy Shield Active:</strong> Dynamic watermarks with individual student name &amp; email are rendered on student screens. Direct YouTube links are fully blocked.
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Stream Inactive: OBS Setup Guide & Stream Link Prompt */
            <div className="max-w-2xl mx-auto my-auto w-full space-y-6 p-6 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Radio className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Start Your Live Lecture
                  </h2>
                  <p className="text-xs text-slate-400">
                    Connect your OBS Studio live stream with AIMS secure classroom
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="flex h-5 w-5 rounded-full bg-emerald-600 text-white items-center justify-center text-[10px]">1</span>
                    <span>Set up Unlisted Live Stream on YouTube</span>
                  </div>
                  <p className="text-slate-400 pl-7 leading-relaxed">
                    Go to <strong>YouTube Studio &gt; Go Live</strong>. Set visibility to <strong>Unlisted</strong> (so only enrolled AIMS students can access it).
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="flex h-5 w-5 rounded-full bg-emerald-600 text-white items-center justify-center text-[10px]">2</span>
                    <span>Start Streaming in OBS Studio</span>
                  </div>
                  <p className="text-slate-400 pl-7 leading-relaxed">
                    Paste your YouTube Stream Key into OBS (Settings &gt; Stream), then click <strong>"Start Streaming"</strong> in OBS.
                  </p>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="flex h-5 w-5 rounded-full bg-emerald-600 text-white items-center justify-center text-[10px]">3</span>
                    <span>Paste your YouTube Live Link below</span>
                  </div>
                  <form onSubmit={handleUpdateStream} className="pl-7 pt-1 space-y-2">
                    <Input
                      placeholder="Paste YouTube Live URL (e.g. https://youtu.be/...)"
                      value={streamInput}
                      onChange={(e) => setStreamInput(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white text-xs h-11 rounded-xl"
                    />
                    <Button
                      type="submit"
                      disabled={updatingStream || !streamInput.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-11 rounded-xl text-xs shadow-xl"
                    >
                      {updatingStream ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tv className="h-4 w-4 mr-2" />}
                      Start Broadcast to Students
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Classroom Live Doubt Chat */}
        <div
          className={`w-full lg:w-96 shrink-0 bg-slate-900/60 lg:border-l border-slate-800/80 flex flex-col overflow-hidden ${
            mobileTab === "video" ? "hidden lg:flex" : "flex flex-1"
          }`}
        >
          {/* Chat Header */}
          <div className="h-14 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/80 shrink-0">
            <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-slate-200">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Student Live Doubts</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Instructor
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MessageSquare className="h-9 w-9 text-slate-700" />
                <p className="text-slate-400 text-xs sm:text-sm font-bold">No student doubts yet</p>
                <p className="text-slate-500 text-[11px] max-w-[200px]">
                  Student questions submitted during the stream will appear here in real time.
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

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-900/60 shrink-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Reply to student questions..."
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

      {/* OBS Studio Setup Guide Modal */}
      {showObsGuide && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <Tv className="h-5 w-5 text-emerald-400" />
                <span>OBS Studio Quick Setup Guide</span>
              </div>
              <button
                onClick={() => setShowObsGuide(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <strong className="text-white block font-bold text-xs">1. In YouTube Studio:</strong>
                <p>• Click <strong>Create &gt; Go Live</strong>.</p>
                <p>• Set Stream Visibility to <strong>Unlisted</strong> (Crucial: prevents public viewing).</p>
                <p>• Copy your <strong>Stream Key</strong> and note your watch URL.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <strong className="text-white block font-bold text-xs">2. In OBS Studio:</strong>
                <p>• Open <strong>Settings &gt; Stream</strong>.</p>
                <p>• Service: <strong>YouTube - RTMPS</strong>.</p>
                <p>• Paste your <strong>Stream Key</strong> and click OK.</p>
                <p>• In <strong>Settings &gt; Output</strong>: Video Bitrate <strong>2500 - 4500 Kbps</strong>.</p>
                <p>• Click <strong>"Start Streaming"</strong>.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <strong className="text-white block font-bold text-xs">3. In AIMS Console:</strong>
                <p>• Paste the YouTube watch link in the broadcast box and click <strong>"Save &amp; Broadcast"</strong>.</p>
                <p>• Students automatically receive the stream with dynamic anti-piracy watermarks.</p>
              </div>
            </div>

            <Button
              onClick={() => setShowObsGuide(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl h-10"
            >
              Got It, Close Guide
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
