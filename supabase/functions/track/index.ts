import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.json()
    const { type, data } = body

    if (type === 'visitor') {
      const { data: visitor, error } = await supabase.from('visitors').insert({
        device: data.device || 'unknown',
        source: data.source || 'direct',
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        site: 'store',
      }).select('id').single()

      if (error) throw error

      // Create session
      await supabase.from('sessions').insert({
        visitor_id: visitor.id,
        entry_page: data.entry_page || '/',
      })

      return new Response(
        JSON.stringify({ success: true, visitor_id: visitor.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (type === 'click') {
      const { error } = await supabase.from('clicks').insert({
        visitor_id: data.visitor_id || null,
        button_name: data.button_name,
        redirect_url: data.redirect_url || null,
        site: 'store',
      })

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid type. Use "visitor" or "click".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Track error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
