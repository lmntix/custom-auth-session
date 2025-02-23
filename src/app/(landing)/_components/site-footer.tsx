import { Mail, Phone, FileText, Shield } from "lucide-react";
import Link from "next/link";

export default function LandingFooter() {
  return (
    <footer className="border-t">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              href="/terms"
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">Terms</span>
            </Link>
            <Link
              href="/privacy"
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              <Shield className="h-4 w-4" />
              <span className="text-sm">Privacy</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="mailto:lmntixdev@gmail.com"
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">
                lmntixdev@gmail.com
              </span>
            </a>
            <a
              href="tel:+919885483934"
              className="flex items-center space-x-1 hover:opacity-70 transition-opacity"
            >
              <Phone className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">+91-9885483934</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
