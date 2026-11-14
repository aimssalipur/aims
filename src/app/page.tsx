import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { CoursesSection } from "@/components/sections/courses-section";
import { ValuesSection } from "@/components/sections/values-section";
import { ContactSection } from "@/components/sections/contact-section";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col w-full overflow-x-hidden">
        <HeroSection />
        <CoursesSection />
        <ValuesSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
