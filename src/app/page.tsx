import Header from "@/components/Header";
import HeroWithLiveMasthead from "@/components/HeroWithLiveMasthead";
import BookYourRide from "@/components/BookYourRide";
import Testimonials from "@/components/Testimonials";
import AboutOperations from "@/components/AboutOperations";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { getMasthead } from "@/lib/sanity/masthead";

/** ISR interval (seconds); must match `MASTHEAD_REVALIDATE_SECONDS` in `@/lib/sanity/constants`. */
export const revalidate = 60;

export default async function Home() {
  const masthead = await getMasthead();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-100">
      <Header />
      <main className="w-full min-w-0">
        <HeroWithLiveMasthead initial={masthead} />
        <AboutOperations />
        <CTASection />
        <BookYourRide />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}
