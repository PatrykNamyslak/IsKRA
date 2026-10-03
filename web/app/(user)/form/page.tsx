export default function page_form() {
  return (
    <>
      <form action="POST" target="" className="mx-auto flex w-full max-w-xl flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 mt-8 shadow-sm">
        <textarea
          name="innovation_descrition"
          placeholder="Opisz swój problem"
          className="min-h-40 w-full resize-y rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
        ></textarea>

        <input
          type="submit"
          value="Wyślij"
          className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:translate-y-0"
        />
      </form>
    </>
  );
}