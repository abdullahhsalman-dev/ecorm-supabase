import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SaleBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-red-700 text-white">
      <div className="absolute inset-0 bg-[url('/sale-pattern-bg.png')] opacity-10"></div>
      <div className="relative z-10 px-6 py-16 text-center md:py-24">
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
          GRAND FESTIVE
          <br />
          <span className="font-light italic">Celebrations</span>
        </h1>
        <div className="mb-6 flex flex-wrap items-center justify-center gap-4">
          <div className="text-center">
            <div className="text-7xl font-bold md:text-9xl">25</div>
            <div className="text-xl font-semibold md:text-2xl">%OFF</div>
          </div>
          <div className="text-6xl font-bold md:text-8xl">|</div>
          <div className="text-center">
            <div className="text-7xl font-bold md:text-9xl">50</div>
            <div className="text-xl font-semibold md:text-2xl">%OFF</div>
          </div>
        </div>
        <p className="mb-8 text-lg md:text-xl">STARTING FROM 14th MAY TILL EID</p>
        <Button size="lg" asChild className="bg-white text-red-700 hover:bg-gray-100">
          <Link href="#sale-products">SHOP NOW</Link>
        </Button>
      </div>
    </div>
  )
}
