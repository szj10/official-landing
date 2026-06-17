import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TermsContent from "./TermsContent";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />
      <main className="flex-1 pt-24">
        <TermsContent />
      </main>
      <Footer />
    </div>
  );
}
