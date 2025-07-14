import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/src/app/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-muted">
      <div className="container px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">About Us</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Diners is a premier fashion destination offering the latest trends
              for men, women, and kids. Quality products, exceptional service,
              and stylish designs.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </Link>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-muted-foreground hover:text-foreground"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/men"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Men
                </Link>
              </li>
              <li>
                <Link
                  href="/women"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Women
                </Link>
              </li>
              <li>
                <Link
                  href="/kids"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Kids
                </Link>
              </li>
              <li>
                <Link
                  href="/footwear"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Footwear
                </Link>
              </li>
              <li>
                <Link
                  href="/fragrance"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Fragrance
                </Link>
              </li>
              <li>
                <Link
                  href="/sale"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sale
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Us</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 shrink-0" />
                <span className="text-muted-foreground">
                  123 Fashion Street, Karachi, Pakistan
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 shrink-0" />
                <a
                  href="tel:+923001234567"
                  className="text-muted-foreground hover:text-foreground"
                >
                  +92 300 123 4567
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 shrink-0" />
                <a
                  href="mailto:info@diners.com.pk"
                  className="text-muted-foreground hover:text-foreground"
                >
                  info@diners.com.pk
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Diners. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              {/* <img src="" alt="Visa" className="h-8" />
              <img src="" alt="Mastercard" className="h-8" />
              <img src="" alt="PayPal" className="h-8" /> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
