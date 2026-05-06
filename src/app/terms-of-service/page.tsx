import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[var(--dark-slate)]">
      <Header />
      <main className="pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-28 md:pb-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="mb-6 inline-block text-white/60 hover:text-white transition-colors"
          >
            ← Back to home
          </Link>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString("en-GB")}
          </p>

          <div className="mt-8 space-y-6 text-sm text-white/80 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-white">
                1. Service Description
              </h2>
              <p className="mt-2">
                Sahotra Services AB provides premium taxi and transfer services in the
                Stockholm region, including Arlanda and Skavsta airport routes. Our services include airport transfers, city
                tours, and custom route bookings. All prices displayed are fixed
                and in Swedish Kronor (SEK).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                2. Booking and Cancellation
              </h2>
              <p className="mt-2">
                Bookings are confirmed upon submission. We recommend cancelling
                at least 24 hours in advance for airport transfers. Late
                cancellations may incur fees as specified at the time of booking.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                3. Distance Restriction
              </h2>
              <p className="mt-2">
                Our standard service covers routes up to 47 km. For longer
                distances, please contact us directly for a custom quote.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                4. Liability
              </h2>
              <p className="mt-2">
                We are not liable for delays caused by circumstances beyond our
                control, including traffic, weather, or flight delays. We
                strive to provide accurate pickup estimates and will communicate
                any significant changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                5. Contact
              </h2>
              <p className="mt-2">
                For support or questions about these terms, contact us at +46
                700 123 456 or via WhatsApp.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
