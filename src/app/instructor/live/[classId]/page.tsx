"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import {
  Video,
  Send,
  Users,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Mic,
  Video as VideoIcon,
  HelpCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function InstructorLiveClassPage({
  params,
}: {
  params: { classId: string };
}) {
  const { classId } = params;
  const router = useRouter();
  const supabase = createClient();
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [classDetails, setClassDetails] = useState<any>(null);
  const [jitsiApi, setJitsiApi] = useState<any>(null);
  const [permissionBanner, setPermissionBanner] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Mobile active tab: "video" or "chat"
  const [mobileTab, setMobileTab] = useState<"video" | "chat">("video");

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const broadcastChannelRef = useRef<any>(null);

  useEffect(() => {
    // Fetch Class Details (which handles role verification)
    const fetchClassInfo = async () => {
      try {
        const response = await fetch(`/api/live-classes/${classId}/token`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || "Failed to join live class");
        }
        const data = await response.json();

        // Verify role
        if (data.user.role !== "admin" && data.user.role !== "instructor") {
          throw new Error("Forbidden: Only instructors can start live classes.");
        }

        setClassDetails(data);
        setUserProfile(data.user);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClassInfo();
  }, [classId]);

  // Set up Supabase Realtime for live chat & presence
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

    // Listen to messages
    channel.on("broadcast", { event: "chat-msg" }, ({ payload }) => {
      setMessages((prev) => [...prev, payload]);
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
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [classDetails, userProfile, classId, supabase]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mobileTab]);

  // Proactively test media device permissions on client
  const testPermissions = async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        stream.getTracks().forEach((track) => track.stop());
        setPermissionBanner(false);
        if (jitsiApi) {
          jitsiApi.executeCommand("toggleVideo");
          jitsiApi.executeCommand("toggleAudio");
        }
      }
    } catch (err: any) {
      console.warn("Media devices permission error:", err);
      setPermissionBanner(true);
    }
  };

  const jitsiInitializedRef = useRef(false);

  // Initialize Jitsi as Moderator
  const startMeeting = () => {
    if (!classDetails || !jitsiContainerRef.current || typeof window === "undefined" || jitsiInitializedRef.current) return;

    // @ts-ignore
    if (typeof window.JitsiMeetExternalAPI === "undefined") {
      return;
    }

    jitsiInitializedRef.current = true;

    try {
      jitsiContainerRef.current.innerHTML = "";
      // @ts-ignore
      const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName: classDetails.roomName,
        width: "100%",
        height: "100%",
        parentNode: jitsiContainerRef.current,
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "closedcaptions",
            "desktop",
            "fullscreen",
            "fodeviceselection",
            "hangup",
            "profile",
            "chat",
            "recording",
            "settings",
            "raisehand",
            "videoquality",
            "filmstrip",
            "tileview",
            "videobackgroundblur",
            "mute-everyone",
            "security",
          ],
          SETTINGS_SECTIONS: ["devices", "language", "moderator", "profile"],
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          HIDE_DEEP_LINKING_LOGO: true,
        },
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, // Bypass prejoin screen to avoid device permission race conditions
          disableDeepLinking: true,   // Allow in-browser running on mobile
          enableWelcomePage: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          resolution: 720,
          constraints: {
            video: {
              height: { ideal: 720, max: 720, min: 240 },
              width: { ideal: 1280, max: 1280, min: 320 },
            },
          },
        },
        userInfo: {
          displayName: `${userProfile?.name} (Instructor)`,
          email: userProfile?.email || "",
        },
      });

      setJitsiApi(api);

      // Force allow attributes on Jitsi iframe for camera/mic
      setTimeout(() => {
        const iframe = jitsiContainerRef.current?.querySelector("iframe");
        if (iframe) {
          iframe.setAttribute(
            "allow",
            "camera *; microphone *; display-capture *; autoplay *; clipboard-write *; fullscreen *"
          );
        }
      }, 300);

      // Secure room automatically with class password
      api.addEventListener("videoConferenceJoined", () => {
        api.executeCommand("password", classDetails.roomPassword);
      });

      // Catch device permission errors
      api.addEventListener("cameraError", () => {
        setPermissionBanner(true);
      });
      api.addEventListener("micError", () => {
        setPermissionBanner(true);
      });

      api.addEventListener("readyToClose", () => {
        router.push("/instructor/courses");
      });
    } catch (err: any) {
      console.error("Failed to initialize Jitsi meeting:", err);
      setError("Unable to launch video meeting engine. Please try again.");
    }
  };

  // Dynamic script loader: starts immediately when host credentials & class details are ready
  useEffect(() => {
    if (loading || !classDetails || jitsiInitializedRef.current) return;

    if (typeof (window as any).JitsiMeetExternalAPI !== "undefined") {
      startMeeting();
      return;
    }

    let script = document.getElementById("jitsi-external-api-script") as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = "jitsi-external-api-script";
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = () => {
        startMeeting();
      };
      script.onerror = () => {
        setError("Failed to load live video engine. Please check your internet connection and refresh.");
      };
      document.body.appendChild(script);
    } else {
      const interval = setInterval(() => {
        if (typeof (window as any).JitsiMeetExternalAPI !== "undefined") {
          clearInterval(interval);
          startMeeting();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loading, classDetails]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !broadcastChannelRef.current) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: `${userProfile.name} (Instructor)`,
      senderId: userProfile.email,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    broadcastChannelRef.current.send({
      type: "broadcast",
      event: "chat-msg",
      payload: newMsg,
    });

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  const externalRoomUrl = classDetails
    ? `https://meet.jit.si/${classDetails.roomName}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName=${encodeURIComponent(
        `${userProfile?.name || "Instructor"} (Host)`
      )}`
    : "#";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-semibold">Authorizing host credentials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md w-full text-center space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-extrabold text-white">Access Denied</h2>
          <p className="text-slate-400 text-sm">{error}</p>
          <Button asChild className="w-full bg-slate-800 hover:bg-slate-700 text-white">
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Panel
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col overflow-hidden">

      {/* Permission Warning Banner */}
      {permissionBanner && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              <strong>Camera / Microphone blocked:</strong> Click the 🔒 lock icon in your address bar and set Camera &amp; Microphone to <strong>Allow</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              onClick={testPermissions}
              className="bg-amber-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg hover:bg-amber-400 text-[11px]"
            >
              Retry Access
            </button>
            <button
              onClick={() => setPermissionBanner(false)}
              className="text-amber-400 hover:text-white p-0.5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 sm:h-16 shrink-0 bg-slate-900/80 border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between backdrop-blur-xl z-20">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0">
            <Link href="/instructor/courses">
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-base font-extrabold text-white truncate max-w-[160px] sm:max-w-md">
              {classDetails?.title || "Host Live Lecture"}
            </h1>
            <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              HOST MODE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* External Launch Fallback (Ideal for mobile or dedicated Jitsi App) */}
          <a
            href={externalRoomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
            title="Open dedicated classroom window (Useful on mobile or if video is blocked)"
          >
            <ExternalLink className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden md:inline">Open in Dedicated Window</span>
            <span className="md:hidden">External</span>
          </a>

          {/* Help Button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
            title="Camera & Microphone Setup Guide"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 px-3 py-1 rounded-full text-xs font-bold text-slate-300">
            <Users className="h-3.5 w-3.5 text-emerald-400" />
            <span>{activeUsers.length} Online</span>
          </div>
        </div>
      </header>

      {/* Mobile Tab Switcher (Visible only on < lg screens) */}
      <div className="lg:hidden flex items-center bg-slate-900 border-b border-slate-800 px-3 py-1.5 gap-2 shrink-0">
        <button
          onClick={() => setMobileTab("video")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === "video"
              ? "bg-emerald-600 text-white shadow"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <VideoIcon className="h-3.5 w-3.5" />
          <span>Classroom Video</span>
        </button>
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            mobileTab === "chat"
              ? "bg-emerald-600 text-white shadow"
              : "bg-slate-800/60 text-slate-400 hover:text-white"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Live Chat ({messages.length})</span>
        </button>
      </div>

      {/* Main Classroom Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Video Column */}
        <div
          className={`flex-1 bg-slate-950 relative flex flex-col justify-between p-2 sm:p-4 lg:p-5 overflow-hidden ${
            mobileTab === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-900/40 shadow-2xl flex items-center justify-center">
            <div ref={jitsiContainerRef} className="absolute inset-0 w-full h-full" />

            {!jitsiApi && (
              <div className="text-center space-y-3 p-4">
                <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto" />
                <p className="text-slate-400 text-sm font-semibold">Initializing host camera &amp; audio...</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button
                    onClick={testPermissions}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                  >
                    <Mic className="h-3.5 w-3.5 mr-1.5" />
                    Enable Camera &amp; Mic
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Chat Column */}
        <div
          className={`w-full lg:w-96 shrink-0 bg-slate-900/40 lg:border-l border-slate-800/80 flex flex-col overflow-hidden ${
            mobileTab === "video" ? "hidden lg:flex" : "flex flex-1"
          }`}
        >
          <div className="h-12 border-b border-slate-800/80 px-4 flex items-center justify-between bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-slate-200">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>Classroom Live Chat</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-500/20">
              Host View
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MessageSquare className="h-8 w-8 text-slate-700" />
                <p className="text-slate-500 text-xs sm:text-sm font-bold">No messages yet</p>
                <p className="text-slate-600 text-[11px]">Send a greeting to your students!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === userProfile.email;
                return (
                  <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-7 w-7 ring-1 ring-slate-800">
                      <AvatarFallback className="text-[9px] bg-slate-800 text-slate-300 font-bold">
                        {initials(msg.sender)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-baseline gap-1.5 mb-0.5">
                        <span className="text-[11px] font-extrabold text-slate-300">{msg.sender}</span>
                        <span className="text-[8px] text-slate-500 font-semibold">{msg.timestamp}</span>
                      </div>
                      <div
                        className={`rounded-2xl px-3 py-1.5 text-xs leading-relaxed ${
                          isMe
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : "bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/30"
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
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800/80 bg-slate-900/30 shrink-0">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Type question or answer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="bg-slate-950 border-slate-800/80 text-white placeholder-slate-500 rounded-xl h-9 text-xs focus:ring-1 focus:ring-emerald-500"
              />
              <Button type="submit" size="icon" className="h-9 w-9 shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl">
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Camera & Mic Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-extrabold text-base">
                <VideoIcon className="h-5 w-5 text-emerald-400" />
                <span>Fix Camera &amp; Mic Access</span>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-1.5">
                <strong className="text-white block font-bold">In Google Chrome / Edge / Brave:</strong>
                <p>1. Look at your address bar at the top of the browser.</p>
                <p>2. Click the 🔒 <strong>lock icon</strong> (or tune slider) to the left of the website address.</p>
                <p>3. Toggle <strong>Camera</strong> and <strong>Microphone</strong> to <strong>Allow</strong>.</p>
                <p>4. Refresh the page to start your video stream.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/50 space-y-1.5">
                <strong className="text-white block font-bold">On Mobile (Android / iPhone):</strong>
                <p>1. Check that your browser app has camera permission in phone Settings.</p>
                <p>2. You can also tap <strong>"Open in Dedicated Window"</strong> at the top right to open full-screen in the native Jitsi mobile interface.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={testPermissions}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Test &amp; Prompt Camera Now
              </Button>
              <Button
                onClick={() => setShowHelpModal(false)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
