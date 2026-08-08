// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

declare const Deno: {
  env: {
    get(key: string): string | undefined
  }
}

serve(async (req: Request) => {
  try {
    // Parse the incoming JSON payload from the Android SMS Forwarder
    const payload = await req.json()
    const smsText = payload.text || payload.message // Adjust based on your Android app's specific JSON structure

    // Initialize Supabase Client with Service Role Key (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Example logic: Extract Transaction ID from SMS (e.g., Telebirr or CBE format)
    // You will need to adjust the regex to match exact Ethiopian banking SMS formats
    const txIdMatch = smsText.match(/[A-Z0-9]{8,12}/) 

    if (txIdMatch) {
      const transactionId = txIdMatch[0]

      // Find pending order with this payment ID
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('id')
        .eq('payment_id', transactionId)
        .eq('payment_status', 'pending')
        .single()

      if (order) {
        // Mark as verified
        await supabase
          .from('orders')
          .update({ payment_status: 'verified' })
          .eq('id', order.id)

        return new Response(JSON.stringify({ success: true, message: "Order verified" }), {
          headers: { "Content-Type": "application/json" },
          status: 200,
        })
      }
    }

    return new Response(JSON.stringify({ success: false, message: "No matching order found" }), {
      headers: { "Content-Type": "application/json" },
      status: 200, // Return 200 so the Android app stops retrying
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || String(error) }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
