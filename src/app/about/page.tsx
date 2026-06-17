import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AboutContent from "./AboutContent";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />
      <main className="flex-1 pt-24">
        <AboutContent />
      </main>
      <Footer />
    </div>
  );
}
