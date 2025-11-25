const InputField = ({
  label,
  name,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step = 'any',
  suffix,
  placeholder,
}) => {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
      <span>{label}</span>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold uppercase text-brand">
            {suffix}
          </span>
        ) : null}
      </div>
      {min !== undefined && max !== undefined ? (
        <span className="text-xs font-normal text-slate-400">
          Range {min} – {max}
        </span>
      ) : null}
    </label>
  )
}

export default InputField
