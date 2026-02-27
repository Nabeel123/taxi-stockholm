"use client";

const MAP_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d325728.09589225493!2d17.644481!3d59.3293235!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x465f763119640bcb%3A0xa80d27d3679d7766!2sStockholm%2C%20Sweden!5e0!3m2!1sen!2s!4v1709000000000!5m2!1sen!2s";

export default function MapSection() {
  return (
    <section
      className="relative h-screen w-full overflow-hidden scroll-mt-20 sm:scroll-mt-24"
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
          title="Office location"
          className="absolute inset-0 h-full w-full"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>
    </section>
  );
}
