import AiChat from "@/app/components/AiChat";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">Witamy na stronie głównej</h1>
      <a
        href="/form"
        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-7 py-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700"
      >
        MASZ PROBLEM? WYŚLIJ NAM GO!
      </a>
      <div className="w-full">
        <AiChat />
      </div>
    </div>
  );
}