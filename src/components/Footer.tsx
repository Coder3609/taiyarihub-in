import { GraduationCap } from "lucide-react";

const footerLinks = [
  {
    title: "Exams",
    links: ["GATE", "UPSC", "JEE", "SSC", "Banking", "GRE/TOEFL"],
  },
  {
    title: "Resources",
    links: ["PYQ Bank", "Mock Tests", "Video Solutions", "Study Plans"],
  },
  {
    title: "Company",
    links: ["About Us", "Careers", "Blog", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Refund Policy"],
  },
];

const Footer = () => {
  return (
    <footer id="about" className="border-t border-border/50 py-16 bg-gradient-surface">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <a href="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-7 w-7 text-primary" />
              <span className="font-display text-lg font-bold text-foreground">
                EDU<span className="text-primary">Mask</span>
              </span>
            </a>
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
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
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
