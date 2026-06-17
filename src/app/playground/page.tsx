import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlaygroundContent from "./PlaygroundContent";

export default function PlaygroundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-dot-pattern">
      <Header />
      <main className="flex-1 pt-24">
        <PlaygroundContent />
      </main>
      <Footer />
    </div>
  );
}
