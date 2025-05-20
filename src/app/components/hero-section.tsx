import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="relative mb-12 overflow-hidden rounded-lg">
      <div className="bg-red-700 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center p-8 text-center md:items-start md:p-12 md:text-left">
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-6xl">
              GRAND FESTIVE
              <br />
              <span className="font-light italic">Celebrations</span>
            </h1>
            <div className="mb-6 flex items-center justify-center gap-4 md:justify-start">
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
            <p className="mb-8 text-lg md:text-xl">
              STARTING FROM 14th MAY TILL EID
            </p>
            <Button
              size="lg"
              asChild
              className="bg-white text-red-700 hover:bg-gray-100"
            >
              <Link href="/sale">SHOP NOW</Link>
            </Button>
          </div>
          <div className="flex items-center justify-center p-8">
            <img
              src="/placeholder-nucat.png"
              alt="Grand Festive Sale"
              className="max-h-[400px] w-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
