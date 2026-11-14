"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const scenes = [
  {
    image: "/images/gallery/hogar.png",
    category: "Hogar",
    title: "Tranquilidad, desde la entrada.",
    alt: "Escena ilustrativa de una casa al anochecer con una cámara bajo el alero",
    detail:
      "Cada acceso cuenta. Evaluamos el lugar para recomendar ubicación, ángulo y equipos adecuados para tu hogar.",
    tag: "01 / Espacios para vivir",
  },
  {
    image: "/images/gallery/negocio.png",
    category: "Negocio",
    title: "Una nueva perspectiva de tu negocio.",
    alt: "Escena ilustrativa de un local iluminado con una cámara exterior",
    detail:
      "Entradas, circulación y zonas de atención: una propuesta pensada para tu operación y el respeto a la privacidad.",
    tag: "02 / Espacios para crecer",
  },
  {
    image: "/images/gallery/camara.png",
    category: "Tecnología",
    title: "El detalle hace la diferencia.",
    alt: "Imagen conceptual de una cámara de seguridad con iluminación azul",
    detail:
      "La elección va más allá de la apariencia. Revisamos iluminación, conectividad, ubicación y necesidades de uso antes de recomendar un equipo.",
    tag: "03 / Diseño con propósito",
  },
];

function ExpandedImage({ scene }: { scene: (typeof scenes)[number] }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  return (
    <>
      <div
        className="absolute inset-0 grid place-items-center text-sm text-slate-400"
        role="status"
      >
        {status === "loading"
          ? "Cargando imagen…"
          : status === "error"
            ? "No pudimos cargar la imagen. Prueba con la siguiente."
            : ""}
      </div>
      <Image
        src={scene.image}
        alt={scene.alt}
        fill
        sizes="(max-width: 767px) 100vw, 75vw"
        quality={85}
        loading="eager"
        className={`object-contain transition-opacity duration-300 ${status === "ready" ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setStatus("ready")}
        onError={() => setStatus("error")}
      />
    </>
  );
}

export default function VisualGallery() {
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const touchStart = useRef<number | null>(null);
  const selected = scenes[current];
  const change = (direction: number) =>
    setCurrent((index) => (index + direction + scenes.length) % scenes.length);

  useEffect(() => {
    if (!isOpen) return;
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      opener.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <section
      id="galeria"
      className="visual-gallery"
      aria-labelledby="gallery-title"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-10">
          <div>
            <p className="text-cyan-300 uppercase tracking-[.22em] text-xs mb-4">
              Imagina lo que viene
            </p>
            <h2
              id="gallery-title"
              className="text-3xl sm:text-5xl tracking-tight font-semibold"
            >
              Tu espacio.
              <br />
              <span className="text-slate-400">Otra forma de verlo.</span>
            </h2>
          </div>
          <p className="max-w-xs text-sm text-slate-400">
            Toca una imagen y explora los detalles.
            <br />
            Conceptos visuales creados con IA; no son instalaciones de clientes.
          </p>
        </div>
        <div className="gallery-grid">
          {scenes.map((scene, index) => (
            <button
              type="button"
              key={scene.image}
              className={`gallery-tile ${index === 0 ? "gallery-tile-featured" : ""}`}
              aria-label={`Ampliar imagen: ${scene.category}`}
              aria-haspopup="dialog"
              onClick={(event) => {
                opener.current = event.currentTarget;
                setCurrent(index);
                setIsOpen(true);
              }}
            >
              <Image
                src={scene.image}
                alt={scene.alt}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 767px) 100vw, 60vw"
                    : "(max-width: 767px) 100vw, 40vw"
                }
                quality={80}
                className="gallery-image"
              />
              <span className="gallery-shade" />
              <span className="gallery-category">{scene.category}</span>
              <span className="gallery-expand" aria-hidden="true">
                ↗
              </span>
              <span className="gallery-caption">
                <span className="block text-[10px] uppercase tracking-[.2em] text-cyan-200 mb-2">
                  {scene.tag}
                </span>
                <span className="block text-xl sm:text-2xl font-semibold tracking-tight">
                  {scene.title}
                </span>
                <span className="gallery-open-label">
                  Explorar imagen <span aria-hidden="true">↗</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <dialog
        ref={dialog}
        className="gallery-dialog"
        aria-labelledby="gallery-dialog-title"
        aria-describedby="gallery-dialog-note"
        onClose={() => setIsOpen(false)}
        onClick={(event) => {
          if (event.target === dialog.current) setIsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            change(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            change(-1);
          }
        }}
      >
        {isOpen && (
          <div className="gallery-dialog-content">
            <div className="gallery-toolbar">
              <span className="text-xs tracking-widest uppercase text-slate-300">
                Innovar / inspiración{" "}
                <span className="text-cyan-300 ml-3">
                  {current + 1} / {scenes.length}
                </span>
              </span>
              <button
                autoFocus
                type="button"
                className="gallery-control"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar imagen"
              >
                ✕
              </button>
            </div>
            <div className="gallery-dialog-grid">
              <div
                className="gallery-large-image"
                onTouchStart={(event) => {
                  touchStart.current = event.touches[0].clientX;
                }}
                onTouchEnd={(event) => {
                  if (touchStart.current !== null) {
                    const delta =
                      event.changedTouches[0].clientX - touchStart.current;
                    if (Math.abs(delta) > 55) change(delta < 0 ? 1 : -1);
                    touchStart.current = null;
                  }
                }}
              >
                <ExpandedImage key={selected.image} scene={selected} />
                <div className="gallery-image-controls">
                  <button
                    type="button"
                    className="gallery-control"
                    onClick={() => change(-1)}
                    aria-label="Imagen anterior"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="gallery-control"
                    onClick={() => change(1)}
                    aria-label="Imagen siguiente"
                  >
                    →
                  </button>
                </div>
              </div>
              <div
                className="gallery-detail"
                aria-live="polite"
                aria-atomic="true"
              >
                <p className="text-cyan-300 uppercase tracking-widest text-xs mb-4">
                  {selected.category}
                </p>
                <h3
                  id="gallery-dialog-title"
                  className="text-2xl sm:text-3xl font-semibold tracking-tight mb-5"
                >
                  {selected.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {selected.detail}
                </p>
                <div
                  className="flex gap-2 my-6"
                  role="group"
                  aria-label="Elegir imagen"
                >
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.image}
                      type="button"
                      aria-label={`Ver ${scene.category}`}
                      aria-pressed={current === index}
                      className={`gallery-dot ${current === index ? "gallery-dot-active" : ""}`}
                      onClick={() => setCurrent(index)}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </button>
                  ))}
                </div>
                <a
                  href={`https://wa.me/573044451436?text=${encodeURIComponent(`Hola, quiero asesoría para ${selected.category.toLowerCase()}.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-cyan-300 font-semibold text-sm hover:underline"
                >
                  Quiero una propuesta para mi espacio ↗
                </a>
                <p
                  id="gallery-dialog-note"
                  className="text-xs text-slate-400 mt-6"
                >
                  Imagen ilustrativa generada con IA. No representa un trabajo
                  realizado ni especificaciones de un equipo en venta.
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Puedes usar las flechas del teclado o deslizar sobre la
                  imagen. Esc para cerrar.
                </p>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
