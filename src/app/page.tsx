import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookYourRide from "@/components/BookYourRide";
import Testimonials from "@/components/Testimonials";
import AboutOperations from "@/components/AboutOperations";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { getMasthead } from "@/lib/sanity/masthead";

export const revalidate = 60;

export default async function Home() {
  const masthead = await getMasthead();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-100">
      <Header />
      <main className="w-full min-w-0">
        <Hero content={masthead} />
        <AboutOperations />
        <CTASection />
        <BookYourRide />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}
