"use client";

/** Route view: Stockholm city center ↔ Arlanda Airport — shows both ends of typical transfers */
const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m28!1m12!1m3!1d128128.25789478487!2d17.9185305!3d59.4892425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x465f763119640bcb%3A0xa80d27d3679d7766!2sStockholm%20City%20Center!3m2!1d59.3293235!2d18.0685808!4m5!1s0x465f89b80ce8b805%3A0x2d09dc64d9c4b7b5!2sStockholm%20Arlanda%20Airport%20(ARN)!3m2!1d59.64976289999999!2d17.923780699999998!5e0!3m2!1sen!2sse!4v1709120400000!5m2!1sen!2sse";

export default function MapSection() {
  return (
    <section
      className="relative h-[min(85vh,720px)] w-full min-h-[380px] overflow-hidden scroll-mt-20 sm:scroll-mt-24"
      id="contact"
    >
      <div className="absolute inset-0">
        <iframe
          src={MAP_EMBED_URL}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Service area: Stockholm and Arlanda Airport"
          className="absolute inset-0 h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/25" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-[var(--dark-slate)] to-transparent p-4 pb-6 sm:p-6">
        <p className="mx-auto max-w-3xl text-center text-sm font-medium text-white drop-shadow-md sm:text-base">
          Serving Greater Stockholm, Arlanda (ARN), Bromma, and cruise terminals — door-to-door Tesla
          transfers.
        </p>
      </div>
    </section>
  );
}
