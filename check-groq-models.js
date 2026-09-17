#!/usr/bin/env node

/**
 * Script to check available Groq models
 * Run: node check-groq-models.js
 */

const apiKey = process.env.GROQ_API_KEY

if (!apiKey) {
  console.error('❌ Error: GROQ_API_KEY not found in environment')
  console.log('Set it with: export GROQ_API_KEY=gsk_...')
  process.exit(1)
}

async function checkModels() {
  try {
    console.log('🔍 Fetching available Groq models...\n')

    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
      const error = await response.json()
      console.error(error)
      process.exit(1)
    }

    const data = await response.json()
    const models = data.data || []

    if (models.length === 0) {
      console.error('❌ No models found')
      process.exit(1)
    }

    console.log('✅ Available Groq Models:\n')
    models.forEach((model, idx) => {
      console.log(`${idx + 1}. ${model.id}`)
    })

    console.log('\n📝 Recommended (fastest, free):\n')

    // Common fast models
    const recommended = models.filter(m =>
      m.id.includes('mixtral') ||
      m.id.includes('llama') ||
      m.id.includes('gemma')
    )

    if (recommended.length > 0) {
      recommended.forEach(m => console.log(`  ✓ ${m.id}`))
    } else {
      console.log(`  ✓ ${models[0].id} (first available)`)
    }

    console.log('\n💡 To use, update: app/api/interpret-chart/route.ts')
    console.log('   Change: groq(\'mixtral-8x7b-32768\')')
    console.log(`   To:     groq('${recommended[0]?.id || models[0].id}')`)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

checkModels()
