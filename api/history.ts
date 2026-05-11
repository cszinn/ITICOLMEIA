
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const hiveId = url.searchParams.get('hive_id');
  const start = url.searchParams.get('start');
  const end = url.searchParams.get('end');
  
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!hiveId) return new Response(JSON.stringify({ error: 'hive_id is required' }), { status: 400, headers });
  if (!SUPABASE_URL || !SUPABASE_KEY) return new Response(JSON.stringify({ error: 'Supabase config missing' }), { status: 500, headers });

  try {
    let query = `${SUPABASE_URL}/rest/v1/telemetry_logs?hive_id=eq.${hiveId}&order=created_at.desc&limit=500`;
    
    if (start) query += `&created_at=gte.${start}`;
    if (end) query += `&created_at=lte.${end}`;

    const response = await fetch(query, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!response.ok) throw new Error(`Supabase Error: ${response.status}`);
    const data = await response.json();
    
    const mapped = data.map((curr: any) => ({
        timestamp: curr.created_at,
        temperature: Number(curr.temperature) || 0,
        humidity: Number(curr.humidity) || 0,
        total_weight: Number(curr.total_weight) || 0
    }));

    return new Response(JSON.stringify(mapped.reverse()), { status: 200, headers });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}
