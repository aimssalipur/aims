"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  ArrowRight,
  Share2,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { useGSAP } from "@/lib/use-gsap-animation";
import gsap from "gsap";

export function ContactSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useGSAP(() => {
    gsap.from(".contact-text-reveal", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".contact-header",
        start: "top 85%",
      },
    });

    gsap.from(".contact-col-left", {
      x: -20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".contact-grid",
        start: "top 82%",
      },
    });

    gsap.from(".contact-col-right", {
      x: 20,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".contact-grid",
        start: "top 82%",
      },
    });
  }, []);

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    course: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter your name and phone number so we can contact you.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast({
        title: "Message Sent Successfully! 🎉",
        description: "Our admission counselor will contact you within 24 hours.",
        variant: "success",
      });
      setFormData({
        name: "",
        phone: "",
        email: "",
        course: "",
        message: "",
      });
    }, 600);
  };

  const handleShare = async () => {
    const shareData = {
      title: "AIMS Salipur - Nursing Coaching Academy",
      text: "Join AIMS Salipur for premier OSSSC, AIIMS NORCET, ESIC, and MNS nursing recruitment coaching.",
      url: typeof window !== "undefined" ? window.location.href : "https://aimssalipur.com",
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* noop */
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({
        title: "Link Copied! 📋",
        description: "Website URL copied to clipboard. Share with your classmates!",
      });
    }
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-aims-navy/[0.02] to-aims-green/[0.02]"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-aims-navy/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-aims-green/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-1 sm:px-6 relative">
        {/* Compact Header for Fast Scanning */}
        <div className="contact-header text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-14">
          <div className="contact-text-reveal inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-aims-green/10 mb-2.5 sm:mb-3.5">
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-aims-green" />
            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-aims-green">
              Get In Touch
            </span>
          </div>
          <h2 className="contact-text-reveal text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Ready to Start Your{" "}
            <span className="gradient-text">Journey?</span>
          </h2>
          <p className="contact-text-reveal mt-2 text-xs sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
            Reach out for admissions, career guidance, or a campus visit. Our counselors are here to help you.
          </p>
        </div>

        <div className="contact-grid grid lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-10">
          {/* Left Column: WhatsApp CTA + Info Cards */}
          <div className="contact-col-left lg:col-span-2 space-y-3 sm:space-y-4">
            {/* WhatsApp CTA Card */}
            <a
              href="https://wa.me/919437959054"
              target="_blank"
              rel="noopener noreferrer"
              className="block group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-4 sm:p-6 md:p-7 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                  <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center ring-2 ring-white/30">
                    <Phone className="h-4.5 w-4.5 sm:h-6 sm:w-6" />
                  </div>
                  <Badge className="bg-white text-emerald-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1">
                    INSTANT RESPONSE
                  </Badge>
                </div>
                <h3 className="text-base sm:text-xl md:text-2xl font-extrabold mb-1 leading-tight">
                  Chat on WhatsApp
                </h3>
                <p className="text-white/90 mb-3 sm:mb-4 leading-snug text-xs sm:text-sm">
                  Get instant replies from our counselors. Available 9 AM - 9 PM daily.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <div>
                    <div className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-white/70">
                      Direct WhatsApp
                    </div>
                    <div className="text-sm sm:text-lg font-extrabold">
                      +91 94379 59054
                    </div>
                  </div>
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white text-emerald-600 flex items-center justify-center shadow transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </a>

            {/* Campus & Email Cards (Compact on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
              <Card className="border-slate-100 hover:border-aims-navy/20 hover:shadow-md transition-all rounded-xl">
                <CardContent className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg bg-aims-navy/10 text-aims-navy flex items-center justify-center">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mb-0.5">
                      Visit Campus
                    </h4>
                    <p className="text-slate-600 text-[11px] sm:text-xs leading-snug">
                      Salipur, Cuttack District, Odisha - 754202
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Mon - Sat: 8:00 AM - 7:00 PM
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-100 hover:border-aims-navy/20 hover:shadow-md transition-all rounded-xl">
                <CardContent className="p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg bg-aims-navy/10 text-aims-navy flex items-center justify-center">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm mb-0.5">
                      Email Us
                    </h4>
                    <a
                      href="mailto:aimssalipur@gmail.com"
                      className="text-slate-600 hover:text-aims-navy text-[11px] sm:text-xs font-semibold truncate block"
                    >
                      aimssalipur@gmail.com
                    </a>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      We reply within 24 hours
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-col-right lg:col-span-3">
            <Card className="overflow-hidden border-0 shadow-xl bg-white rounded-2xl">
              <CardContent className="p-0">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-aims-navy via-aims-navy-light to-aims-navy p-3.5 sm:p-6 relative overflow-hidden">
                  <div className="relative flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-2xl font-extrabold text-white mb-0.5">
                        Send us a Message
                      </h3>
                      <p className="text-white/85 leading-snug text-xs sm:text-sm">
                        Fill in your details and our admission team will get back to you.
                      </p>
                    </div>
                    <div className="hidden sm:block shrink-0">
                      <Image
                        src="/logo.png"
                        alt="AIMS Logo"
                        width={60}
                        height={60}
                        className="h-14 w-14 rounded-xl bg-white p-1 shadow object-contain"
                        quality={100}
                      />
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-3.5 sm:p-6 space-y-2.5 sm:space-y-4">
                  <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-slate-700 text-xs sm:text-sm font-semibold">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="h-9 sm:h-11 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-slate-700 text-xs sm:text-sm font-semibold">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 XXXXX XXXXX"
                        className="h-9 sm:h-11 text-xs sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="email" className="text-slate-700 text-xs sm:text-sm font-semibold">
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="h-9 sm:h-11 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="course" className="text-slate-700 text-xs sm:text-sm font-semibold">
                        Interested Course
                      </Label>
                      <select
                        id="course"
                        value={formData.course}
                        onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                        className="flex h-9 sm:h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm text-slate-900 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aims-navy/30"
                      >
                        <option value="" disabled>
                          Select a course
                        </option>
                        <option>OSSSC Nursing Officer Exam Coaching</option>
                        <option>AIIMS NORCET Coaching</option>
                        <option>ESIC Nursing Officer Coaching</option>
                        <option>MNS Entrance Exam Prep</option>
                        <option>RRB Railway Nursing Superintendent Prep</option>
                        <option>OJEE Nursing Entrance Prep</option>
                        <option>Nursing Lecturer &amp; Tutor Prep</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="message" className="text-slate-700 text-xs sm:text-sm font-semibold">
                      Your Message / Query
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about yourself and any questions you have..."
                      className="min-h-[75px] sm:min-h-[100px] text-xs sm:text-sm p-2.5 sm:p-3"
                    />
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <CheckCircle2 className="h-4 w-4 text-aims-green shrink-0 mt-0.5" />
                    <p className="text-[10px] sm:text-xs text-slate-500 leading-snug">
                      Your information is safe and only used to contact you regarding admissions.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-1">
                    <Button
                      type="submit"
                      disabled={submitting}
                      variant="primary"
                      className="w-full sm:w-auto px-5 h-9 sm:h-11 gap-1.5 text-xs sm:text-sm font-bold shadow-md shadow-aims-navy/20"
                    >
                      <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      {submitting ? "Sending..." : "Send Inquiry"}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share website with friends
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
