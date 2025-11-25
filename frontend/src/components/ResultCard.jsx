const CATEGORY_STYLES = {
  Low: 'bg-risk-low/10 text-risk-low border-risk-low/30',
  Moderate: 'bg-risk-moderate/10 text-risk-moderate border-risk-moderate/30',
  High: 'bg-risk-high/10 text-risk-high border-risk-high/30',
}

const ResultCard = ({ result }) => {
  if (!result) {
    return (
      <div className="rounded-2xl border border-dashed border-brand/30 bg-white/60 p-6 text-center text-sm text-slate-500">
        Submit the form to view the full risk breakdown.
      </div>
    )
  }

  const categoryClass = CATEGORY_STYLES[result.category] ?? CATEGORY_STYLES.Low

  return (
    <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Final Score</p>
          <p className="text-4xl font-semibold text-slate-900">{result.final_score}</p>
        </div>
        <span className={`rounded-full border px-4 py-2 text-sm font-semibold ${categoryClass}`}>
          {result.category} risk
        </span>
      </div>

      <dl className="mt-6 grid gap-4 text-sm text-slate-600 md:grid-cols-3">
        <div className="rounded-xl bg-slate-50/70 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">ML Model</dt>
          <dd className="text-2xl font-semibold text-slate-900">{result.ml_score}</dd>
          <p className="text-xs text-slate-500">Probability {(result.ml_probability * 100).toFixed(1)}%</p>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">Lifestyle</dt>
          <dd className="text-2xl font-semibold text-slate-900">{result.lifestyle_score}</dd>
          <ul className="mt-2 text-xs text-slate-500">
            {Object.entries(result.lifestyle_breakdown).map(([key, value]) => (
              <li key={key} className="flex justify-between capitalize">
                <span>{key}</span>
                <span>{value}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-slate-50/70 p-4">
          <dt className="text-xs uppercase tracking-wide text-slate-400">NFHS Context</dt>
          <dd className="text-2xl font-semibold text-slate-900">{result.nfhs_score}</dd>
          <p className="text-xs text-slate-500">State benchmarks incorporated</p>
        </div>
      </dl>

      {result.vitals ? (
        <div className="mt-6 rounded-xl bg-slate-50/70 p-4 text-sm text-slate-500">
          <h4 className="text-xs uppercase tracking-wide text-slate-400">Derived vitals</h4>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {Object.entries(result.vitals).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between font-medium text-slate-700">
                <span>{key}</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ResultCard
