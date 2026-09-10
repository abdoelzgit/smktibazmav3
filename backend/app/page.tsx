export default function Home() {
  return (
    <main className="flex min-h-full flex-1 flex-col bg-slate-50 text-slate-950">
      <header className="flex h-16 items-center border-b border-slate-200 bg-white px-6 sm:px-10">
        <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
          Backend dashboard
        </p>
      </header>
      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl rounded-xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center shadow-sm">
          <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-400">
            &mdash;
          </div>
          <img src="favicon" alt="" />
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard kosong</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Belum ada data atau modul backend yang ditampilkan.
          </p>
        </div>
      </section>
    </main>
  );
}
