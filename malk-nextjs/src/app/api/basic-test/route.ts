export async function GET() {
  return new Response(
    JSON.stringify({
      success: true,
      message: 'Basic test endpoint working',
      timestamp: new Date().toISOString()
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 