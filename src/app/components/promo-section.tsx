import { Container, Section } from "@/src/app/components/ui/container";
import Image from "next/image";
import Link from "next/link";

const PROMOS = [
  {
    title: "Men's Collection",
    description: "Shirts, layers and everyday staples built for the long run.",
    href: "/men",
    image: "/assets/kids.webp",
  },
  {
    title: "Women's Collection",
    description: "Considered silhouettes and fabrics that move with you.",
    href: "/women",
    image: "/assets/kids.webp",
  },
];

export function PromoSection() {
  return (
    <Section>
      <Container>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {PROMOS.map((promo) => (
            <Link
              key={promo.href}
              href={promo.href}
              className="group relative flex min-h-[320px] overflow-hidden rounded-2xl bg-neutral-900 sm:min-h-[380px]"
            >
              <Image
                src={promo.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover opacity-60 transition-all duration-500 ease-out group-hover:scale-105 group-hover:opacity-70"
              />

              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-neutral-950/85 via-neutral-950/35 to-transparent"
              />

              <div className="relative mt-auto w-full p-7 sm:p-9">
                <h3 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {promo.title}
                </h3>

                <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
                  {promo.description}
                </p>

                {/*
                  The whole tile is the link, so this is a
                  visual affordance rather than a nested anchor.
                */}
                <span className="mt-6 inline-flex h-10 items-center rounded-full bg-white px-6 text-sm font-medium text-neutral-950 transition-colors group-hover:bg-white/90">
                  Shop now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
