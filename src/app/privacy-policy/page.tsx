import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Last updated: {new Date().toLocaleDateString("en-GB")}
          </p>

          <div className="mt-8 space-y-6 text-sm text-white/80 sm:text-base">
            <section>
              <h2 className="text-xl font-semibold text-white">
                1. Information We Collect
              </h2>
              <p className="mt-2">
                We collect information you provide when booking a ride, including
                your name, email address, phone number, pickup and drop-off
                locations, and any special instructions. This information is
                used solely to provide our taxi services and improve your
                experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                2. How We Use Your Information
              </h2>
              <p className="mt-2">
                Your information is used to process bookings, communicate with
                you about your ride, and ensure driver coordination. We do not
                sell or share your personal data with third parties for
                marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                3. Data Security
              </h2>
              <p className="mt-2">
                We implement appropriate technical and organisational measures
                to protect your personal data against unauthorised access,
                alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">
                4. Contact Us
              </h2>
              <p className="mt-2">
                For questions about this privacy policy or your data, contact us
                at +46 700 123 456 or via our contact form.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
