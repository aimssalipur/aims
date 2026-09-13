"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, GraduationCap } from "lucide-react";
import { dummyTestimonials } from "@/lib/dummy-data";
import Autoplay from "embla-carousel-autoplay";
import { useGSAP } from "@/lib/use-gsap-animation";
import { useFrontendImages } from "@/lib/frontend-images";
import gsap from "gsap";

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const frontendImages = useFrontendImages();

  useGSAP(() => {
    gsap.from(".testimonials-text-reveal", {
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".testimonials-header",
        start: "top 85%",
      },
    });

    gsap.from(".testimonials-carousel-wrap", {
      y: 25,
      opacity: 0,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".testimonials-carousel-wrap",
        start: "top 85%",
      },
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-aims-green/[0.02] to-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-aims-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-aims-navy/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-1 sm:px-6 relative">
        {/* Compact Header for Fast Scanning on Mobile */}
        <div className="testimonials-header text-center max-w-3xl mx-auto mb-6 sm:mb-10 md:mb-14">
          <div className="testimonials-text-reveal inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-aims-gold/10 mb-2.5 sm:mb-3.5">
            <Star className="h-3.5 w-3.5 text-amber-600 fill-amber-500" />
            <span className="text-[11px] sm:text-sm font-bold uppercase tracking-wider text-amber-700">
              Student Testimonials
            </span>
          </div>
          <h2 className="testimonials-text-reveal text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            What Our <span className="gradient-text">Students Say</span>
          </h2>
          <p className="testimonials-text-reveal mt-2 text-xs sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
            Real stories from nursing candidates who cleared recruitment exams with AIMS Salipur.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="testimonials-carousel-wrap relative max-w-6xl mx-auto">
          <Carousel
            opts={{ loop: true, align: "start", slidesToScroll: 1 }}
            plugins={[
              Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true }),
            ]}
            className="w-full"
          >
            <CarouselContent className="-ml-3 sm:-ml-6">
              {dummyTestimonials.map((testimonial, i) => {
                const avatarUrl = frontendImages[`testimonial_${i + 1}`] || testimonial.avatar;

                return (
                  <CarouselItem
                    key={testimonial.id}
                    className="pl-3 sm:pl-6 basis-full sm:basis-1/2 lg:basis-1/2"
                  >
                    <div className="h-full">
                      <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl">
                        <CardContent className="p-0 flex flex-col h-full">
                          {/* Compact Card Header */}
                          <div className="bg-gradient-to-br from-aims-navy via-aims-navy to-aims-navy-light p-3.5 sm:p-6 relative">
                            <div className="absolute top-3 right-4 opacity-15">
                              <Quote className="h-9 w-9 sm:h-14 sm:w-14 text-white -scale-x-100" />
                            </div>
                            <div className="relative flex items-center gap-2.5 sm:gap-3.5">
                              <div className="relative shrink-0">
                                <Image
                                  src={avatarUrl}
                                  alt={testimonial.name}
                                  width={52}
                                  height={52}
                                  className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover ring-2 ring-white shadow"
                                  unoptimized={avatarUrl.startsWith("data:")}
                                />
                              </div>
                            <div className="relative min-w-0">
                              <h4 className="text-sm sm:text-base font-extrabold text-white truncate">
                                {testimonial.name}
                              </h4>
                              <div className="flex items-center gap-1 mt-0.5">
                                <GraduationCap className="h-3 w-3 text-aims-green shrink-0" />
                                <p className="text-[11px] sm:text-xs font-semibold text-white/80 truncate">
                                  {testimonial.role}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Compact Card Body */}
                        <div className="p-3.5 sm:p-6 bg-white flex-1 flex flex-col justify-between">
                          <div className="flex items-center gap-0.5 mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star
                                key={i}
                                className="h-3.5 w-3.5 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 leading-snug sm:leading-relaxed text-xs sm:text-sm line-clamp-3 sm:line-clamp-none">
                            {testimonial.quote}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
            </CarouselContent>
            <div className="hidden sm:block">
              <CarouselPrevious className="left-0 h-10 w-10 -translate-y-[150%] shadow hover:bg-aims-navy hover:text-white" />
              <CarouselNext className="right-0 h-10 w-10 -translate-y-[150%] shadow hover:bg-aims-navy hover:text-white" />
            </div>
          </Carousel>
        </div>

        {/* Compact Achievement Strip: 4 stats in 2 rows on mobile */}
        <div className="mt-8 sm:mt-12 md:mt-16 relative">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 md:p-8 grid grid-cols-4 gap-2 sm:gap-6 border border-white/60 shadow-lg">
            {[
              { value: "5000+", label: "Selections", icon: "👨‍🎓" },
              { value: "95%", label: "Placement", icon: "💼" },
              { value: "7+", label: "Batches", icon: "📚" },
              { value: "15+", label: "Mentors", icon: "👩‍🏫" },
            ].map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-lg sm:text-2xl mb-0.5">
                  {stat.icon}
                </div>
                <div className="text-base sm:text-2xl md:text-3xl font-extrabold gradient-text leading-tight">
                  {stat.value}
                </div>
                <div className="text-[9px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5 truncate">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
