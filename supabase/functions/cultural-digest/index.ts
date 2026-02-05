import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log("Iniciando cultural-digest...");

    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY não configurada nos Secrets.");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Configurações do Supabase ausentes.");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Buscar itens culturais dos últimos 7 dias
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    console.log(`Buscando itens criados após: ${sevenDaysAgo.toISOString()}`);

    const { data: items, error: itemsError } = await supabase
      .from("cultural_items")
      .select("*")
      .gt("created_at", sevenDaysAgo.toISOString());

    if (itemsError) throw itemsError;
    console.log(`Itens encontrados: ${items?.length || 0}`);

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ message: "No new items found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Buscar e-mails dos clientes
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("email")
      .eq("role", "CLIENTE");

    if (profilesError) throw profilesError;
    const emails = profiles.map((p: any) => p.email).filter(Boolean);
    console.log(`Assinantes encontrados: ${emails.length}`);

    if (emails.length === 0) {
      return new Response(JSON.stringify({ message: "No subscribers found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Montar Template HTML
    const itemsHtml = items.map(item => `
      <div style="margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px;">
        <img src="${item.image}" style="width: 100%; border-radius: 20px; margin-bottom: 15px;" />
        <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; color: #1a1a1a; margin: 0 0 10px 0;">${item.title}</h2>
        <p style="font-size: 14px; color: #666; font-weight: 500;">${item.type} • ${item.date ? new Date(item.date).toLocaleDateString('pt-BR') : '-'}</p>
        <p style="font-size: 14px; color: #444; line-height: 1.6;">${item.description || ''}</p>
      </div>
    `).join('');

    const mainHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; background-color: #f9f9f9; padding: 20px; margin: 0; }
          .container { max-width: 600px; background: #fff; margin: 20px auto; border-radius: 40px; overflow: hidden; border: 1px solid #eee; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
          .btn { display: inline-block; padding: 18px 36px; background-color: #10b981; color: #ffffff !important; text-decoration: none; border-radius: 18px; font-weight: 900; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="text-align: center; margin-bottom: 40px;">
             <h1 style="font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1.5px; color: #000; margin: 0;">Vitrine<span style="color: #10b981;">Frutal</span></h1>
             <p style="color: #999; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 5px;">Giro Cultural • Resumo Semanal</p>
          </div>
          ${itemsHtml}
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://vitrine-frutal.vercel.app/cultural" class="btn">Ver Todos os Eventos</a>
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Enviar via Resend
    console.log("Enviando e-mail via Resend...");
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Giro Cultural <onboarding@resend.dev>",
        to: emails,
        subject: "🎨 Giro Cultural: Novidades da Semana em Frutal!",
        html: mainHtml,
      }),
    });

    const resData = await res.json();
    console.log("Resposta do Resend:", JSON.stringify(resData));

    if (!res.ok) {
      throw new Error(`Erro no Resend: ${resData.message || JSON.stringify(resData)}`);
    }

    return new Response(JSON.stringify({ success: true, data: resData }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Erro fatal na função:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
