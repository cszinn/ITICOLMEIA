
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, apikey, Authorization'
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Configuração do Supabase ausente no servidor.' }), { status: 500, headers });
  }

  const sbHeaders = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    if (req.method === 'GET') {
      const [hivesRes, framesRes] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/hives?select=*&order=id`, { headers: sbHeaders }),
        fetch(`${SUPABASE_URL}/rest/v1/frames?select=*&order=hive_id,position`, { headers: sbHeaders })
      ]);

      if (!hivesRes.ok) throw new Error(`Supabase Hives Error: ${hivesRes.status}`);
      if (!framesRes.ok) throw new Error(`Supabase Frames Error: ${framesRes.status}`);

      const hives = await hivesRes.json();
      const allFrames = await framesRes.json();

      const data = hives.map((h: any) => ({
        ...h,
        total_weight: Number(h.total_weight) || 0,
        frames: allFrames.filter((f: any) => f.hive_id === h.id)
      }));

      return new Response(JSON.stringify(data), { status: 200, headers });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      
      if (!/^COLMEIA[0-9]+$/.test(body.id)) {
        return new Response(JSON.stringify({ error: 'Formato de ID inválido. Use COLMEIA + número (ex: COLMEIA5).' }), { status: 400, headers });
      }

      const hiveRes = await fetch(`${SUPABASE_URL}/rest/v1/hives`, {
        method: 'POST',
        headers: { ...sbHeaders, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          id: body.id,
          name: body.name,
          location: body.location || '',
          status: 'offline',
          temperature: 0,
          humidity: 0,
          total_weight: 0
        })
      });

      if (!hiveRes.ok) {
        const err = await hiveRes.json().catch(() => ({ message: 'Erro desconhecido no banco' }));
        return new Response(JSON.stringify({ 
            error: `Erro no banco de dados: ${err.message || 'Violação de restrição'}.` 
        }), { status: hiveRes.status, headers });
      }

      const numFrames = body.num_frames || 5;
      const frames = Array.from({ length: numFrames }, (_, i) => ({
        hive_id: body.id,
        position: i + 1,
        weight: 0
      }));

      await fetch(`${SUPABASE_URL}/rest/v1/frames`, {
        method: 'POST',
        headers: sbHeaders,
        body: JSON.stringify(frames)
      });

      return new Response(JSON.stringify({ success: true }), { status: 201, headers });
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/hives?id=eq.${id}`, { method: 'DELETE', headers: sbHeaders });
      if (!deleteRes.ok) throw new Error(`Delete Error: ${deleteRes.status}`);
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
