import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <img src={logo} alt="MindForge AI" className="h-[120px] w-auto" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} MindForge AI. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
