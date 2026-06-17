import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PrivacyContent from "./PrivacyContent";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />
      <main className="flex-1 pt-24">
        <PrivacyContent />
      </main>
      <Footer />
    </div>
  );
}
