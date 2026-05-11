
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization'
  };

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuração do Supabase ausente.' }), { status: 500, headers });
  }

  try {
    const body = await req.json();
    const hiveId = body.hive_id || body.COLMEIA;

    if (!hiveId) {
      return new Response(JSON.stringify({ error: 'Campo hive_id ou COLMEIA é obrigatório.' }), { status: 400, headers });
    }

    const sbHeaders = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/hives?id=eq.${hiveId}&select=id`, { headers: sbHeaders });
    const exists = await checkRes.json();

    if (!exists || exists.length === 0) {
      return new Response(JSON.stringify({ error: 'Colmeia não cadastrada. Registre-a via interface primeiro.' }), { status: 404, headers });
    }

    const temp = Number(body.temperature || body.TEMP || 0);
    const hum = Number(body.humidity || body.UMID || 0);
    
    let framesToUpdate: { position: number, weight: number }[] = [];
    if (Array.isArray(body.frames)) {
      framesToUpdate = body.frames.map((f: any) => ({ position: Number(f.position), weight: Number(f.weight) }));
    } else {
      framesToUpdate = Object.keys(body)
        .filter(k => k.startsWith('FAVO'))
        .map(k => ({ position: parseInt(k.replace('FAVO', '')), weight: Number(body[k]) }));
    }

    const totalWeight = framesToUpdate.reduce((acc, f) => acc + f.weight, 0);

    // Patch Hive
    await fetch(`${SUPABASE_URL}/rest/v1/hives?id=eq.${hiveId}`, {
      method: 'PATCH',
      headers: sbHeaders,
      body: JSON.stringify({
        temperature: temp,
        humidity: hum,
        total_weight: totalWeight,
        last_updated: new Date().toISOString(),
        status: 'healthy'
      })
    });

    // Update Frames and Insert Logs
    for (const f of framesToUpdate) {
      await fetch(`${SUPABASE_URL}/rest/v1/frames?hive_id=eq.${hiveId}&position=eq.${f.position}`, {
        method: 'PATCH',
        headers: sbHeaders,
        body: JSON.stringify({ weight: f.weight, last_updated: new Date().toISOString() })
      });

      await fetch(`${SUPABASE_URL}/rest/v1/frame_logs`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify({ hive_id: hiveId, position: f.position, weight: f.weight })
      });
    }

    // General Telemetry Log
    await fetch(`${SUPABASE_URL}/rest/v1/telemetry_logs`, {
      method: 'POST',
      headers: sbHeaders,
      body: JSON.stringify({
        hive_id: hiveId,
        temperature: temp,
        humidity: hum,
        total_weight: totalWeight
      })
    });

    return new Response(JSON.stringify({ success: true, hiveId }), { status: 200, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
