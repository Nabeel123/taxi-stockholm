import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookYourRide from "@/components/BookYourRide";
import Testimonials from "@/components/Testimonials";
import AboutOperations from "@/components/AboutOperations";
import CTASection from "@/components/CTASection";
import MapSection from "@/components/MapSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-100">
      <Header />
      <main className="w-full min-w-0">
        <Hero />
        <BookYourRide />
        <CTASection />
        <Testimonials />
        <AboutOperations />
        <MapSection />
        <Footer />
      </main>
    </div>
  );
}
