import { useEffect, useMemo, useState } from 'react'
import InputField from '../components/InputField.jsx'
import ResultCard from '../components/ResultCard.jsx'
import SectionCard from '../components/SectionCard.jsx'
import { generateRandomCase } from '../utils/randomizer.js'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const initialForm = {
  age: 30,
  systolic_bp: 120,
  heart_rate: 82,
  sleep_hours: 7,
  stress_level: 4,
  hydration: 2,
  activity_minutes: 45,
  state: '',
}

const Home = () => {
  const [formData, setFormData] = useState(initialForm)
  const [states, setStates] = useState([])
  const [statesStatus, setStatesStatus] = useState({ loading: true, error: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [presetLabel, setPresetLabel] = useState('Custom input')

  useEffect(() => {
    const controller = new AbortController()

    const loadStates = async () => {
      try {
        const response = await fetch(`${API_BASE}/states`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Unable to load NFHS states')
        }
        const data = await response.json()
        setStates(data.states ?? [])
        setStatesStatus({ loading: false, error: '' })
        setFormData((prev) => ({ ...prev, state: data.states?.[0] ?? '' }))
      } catch (err) {
        if (err.name === 'AbortError') return
        setStatesStatus({ loading: false, error: err.message })
      }
    }

    loadStates()
    return () => controller.abort()
  }, [])

  const handleChange = (field) => (event) => {
    const { value } = event.target
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'state' ? value : value === '' ? '' : Number(value),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!formData.state) {
      setError('Please pick an NFHS state to continue.')
      return
    }

    const payload = {
      ...formData,
      age: Number(formData.age),
      systolic_bp: Number(formData.systolic_bp),
      heart_rate: Number(formData.heart_rate),
      sleep_hours: Number(formData.sleep_hours),
      stress_level: Number(formData.stress_level),
      hydration: Number(formData.hydration),
      activity_minutes: Number(formData.activity_minutes),
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const details = await response.json().catch(() => ({}))
        throw new Error(details.detail || 'Prediction failed')
      }
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRandom = () => {
    const { preset, form } = generateRandomCase(states)
    setFormData((prev) => ({
      ...prev,
      ...form,
      state: form.state || prev.state,
    }))
    setPresetLabel(`${preset} scenario`)
  }

  const stateOptions = useMemo(() => {
    if (statesStatus.loading) return [{ label: 'Loading states…', value: '' }]
    if (statesStatus.error) return [{ label: 'NFHS data unavailable', value: '' }]
    return states.map((state) => ({ label: state, value: state }))
  }, [states, statesStatus])

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-brand">Maternal Health</p>
          <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">
            Maternal Health Risk Calculator
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500 md:text-base">
            Combine machine learning predictions, lifestyle inputs, and NFHS benchmarks to generate
            a balanced risk profile and actionable insights.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRandom}
          className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-white/80 px-5 py-2 text-sm font-semibold text-brand shadow-sm transition hover:border-brand hover:bg-brand/10"
        >
          Generate random test case
          <span className="text-xs text-slate-400">{presetLabel}</span>
        </button>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-risk-high/30 bg-risk-high/10 px-4 py-3 text-sm text-risk-high">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-6 lg:col-span-2">
          <SectionCard title="Clinical inputs" description="Baseline vitals the ML model needs.">
            <div className="grid gap-4 md:grid-cols-3">
              <InputField
                label="Age"
                name="age"
                value={formData.age}
                onChange={handleChange('age')}
                min={18}
                max={50}
                step={1}
                suffix="yrs"
              />
              <InputField
                label="Systolic BP"
                name="systolic_bp"
                value={formData.systolic_bp}
                onChange={handleChange('systolic_bp')}
                min={90}
                max={180}
                step={1}
                suffix="mmHg"
              />
              <InputField
                label="Heart rate"
                name="heart_rate"
                value={formData.heart_rate}
                onChange={handleChange('heart_rate')}
                min={50}
                max={140}
                step={1}
                suffix="bpm"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Lifestyle influences"
            description="Lifestyle score (0-20) derived from rest, stress, hydration, and activity."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <InputField
                label="Sleep duration"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleChange('sleep_hours')}
                min={0}
                max={12}
                step={0.1}
                suffix="hrs"
              />
              <InputField
                label="Stress level"
                name="stress_level"
                value={formData.stress_level}
                onChange={handleChange('stress_level')}
                min={1}
                max={10}
                step={0.1}
                placeholder="1 (calm) – 10 (max)"
              />
              <InputField
                label="Daily hydration"
                name="hydration"
                value={formData.hydration}
                onChange={handleChange('hydration')}
                min={0.5}
                max={3}
                step={0.1}
                suffix="L"
              />
              <InputField
                label="Physical activity"
                name="activity_minutes"
                value={formData.activity_minutes}
                onChange={handleChange('activity_minutes')}
                min={0}
                max={240}
                step={1}
                suffix="mins"
              />
            </div>
          </SectionCard>

          <SectionCard
            title="NFHS state context"
            description="Benchmark against NFHS-5 factsheet indicators."
          >
            <label className="text-sm font-medium text-slate-600">
              <span className="mb-2 block">State / UT</span>
              <select
                value={formData.state}
                onChange={handleChange('state')}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-base font-semibold text-slate-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
              >
                {stateOptions.map((option) => (
                  <option key={option.value || option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            {statesStatus.error ? (
              <p className="text-xs text-risk-high">{statesStatus.error}</p>
            ) : null}
          </SectionCard>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 text-base font-semibold text-white shadow-card transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Generating risk profile…' : 'Calculate risk'}
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...initialForm,
                  state: states[0] || '',
                })
                setPresetLabel('Custom input')
                setResult(null)
              }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-500 transition hover:border-brand hover:text-brand"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <ResultCard result={result} />
          <div className="rounded-2xl border border-slate-100 bg-white/70 p-5 text-sm text-slate-500">
            <h3 className="text-sm font-semibold text-slate-900">How scoring works</h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li>• ML model contributes up to 60 points (probability × 60).</li>
              <li>• Lifestyle behaviours add up to 20 points (higher = higher risk).</li>
              <li>• NFHS indicators add up to 20 contextual points per state.</li>
              <li>• Categories: 0-30 Low, 31-60 Moderate, 61-100 High.</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home
