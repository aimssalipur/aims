import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { ValuesSection } from "@/components/sections/values-section";
import { CoursesSection } from "@/components/sections/courses-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { MediaSection } from "@/components/sections/media-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <ValuesSection />
        <CoursesSection />
        <TestimonialsSection />
        <MediaSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
