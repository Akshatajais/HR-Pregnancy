const SectionCard = ({ title, description, children }) => {
  return (
    <section className="rounded-2xl bg-white/80 p-6 shadow-card ring-1 ring-slate-100 backdrop-blur-sm">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="text-sm text-slate-500">{description}</p>
        ) : null}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  )
}

export default SectionCard
