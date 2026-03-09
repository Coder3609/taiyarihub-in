import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Exams",
    links: [
      { label: "GATE", href: "/exams/central" },
      { label: "UPSC", href: "/exams/central" },
      { label: "JEE", href: "/exams/school" },
      { label: "SSC", href: "/exams/central" },
      { label: "Banking", href: "/exams/central" },
      { label: "GRE/TOEFL", href: "/exams/foreign" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "PYQ Bank", href: "/" },
      { label: "Mock Tests", href: "/" },
      { label: "Video Solutions", href: "/" },
      { label: "Study Plans", href: "/" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund" },
    ],
  },
];

const Footer = () => {
  return (
    <footer id="about" className="border-t border-border/50 py-16 bg-gradient-surface">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-7 w-7 text-primary" />
              <span className="font-display text-lg font-bold text-foreground">
                Taiyari<span className="text-primary"> Hub</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              India's most comprehensive exam preparation platform. Learn smarter, score higher.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-semibold text-sm text-foreground mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} EDUMask. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
