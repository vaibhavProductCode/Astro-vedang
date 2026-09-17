'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import BirthChartForm from '@/components/BirthChartForm'
import ChartResults from '@/components/ChartResults'
import InfoSection from '@/components/InfoSection'
import Contact from '@/components/Contact'

interface FormSubmitData {
  name: string
  birthDate: string
  birthTime: string
  birthPlace: string
  chartData?: any
  interpretation?: string
  location?: any
  timestamp?: string
}

export default function Home() {
  const [chartData, setChartData] = useState<FormSubmitData | null>(null)

  const handleFormSubmit = (data: FormSubmitData) => {
    setChartData(data)
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleNewChart = () => {
    setChartData(null)
    document.getElementById('chart-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Hero />
      <BirthChartForm onSubmit={handleFormSubmit} />
      {chartData && <ChartResults data={chartData} onNewChart={handleNewChart} />}
      <InfoSection />
      <Contact />
    </>
  )
}
