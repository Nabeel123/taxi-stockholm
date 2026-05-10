import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BookYourRide from "@/components/BookYourRide";
import Testimonials from "@/components/Testimonials";
import AboutOperations from "@/components/AboutOperations";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { DEFAULT_MASTHEAD } from "@/lib/masthead";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export default async function Home({ params }: HomeProps) {
  await params;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-neutral-100">
      <Header />
      <main className="w-full min-w-0">
        <Hero content={DEFAULT_MASTHEAD} />
        <AboutOperations />
        <CTASection />
        <BookYourRide />
        <Testimonials />
        <Footer />
      </main>
    </div>
  );
}
