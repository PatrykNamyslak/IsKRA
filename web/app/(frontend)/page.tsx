import SampleComponent from "@/app/sample_component";
import AiChat from "@/app/components/AiChat";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 sm:p-8">
      <SampleComponent />
      <div className="w-full max-w-3xl mt-4">
        <AiChat />
      </div>
    </main>
  );
}
