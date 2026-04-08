async function run() {
  const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:5000";
  const results = [];

  const healthRes = await fetch(`${baseUrl}/api/health`);
  results.push({
    name: "GET /api/health",
    ok: healthRes.status === 200,
    status: healthRes.status,
  });

  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "", password: "" }),
  });
  results.push({
    name: "POST /api/auth/login (invalid payload)",
    ok: loginRes.status === 400,
    status: loginRes.status,
  });

  let failed = 0;
  for (const item of results) {
    const mark = item.ok ? "PASS" : "FAIL";
    console.log(`${mark} ${item.name} -> ${item.status}`);
    if (!item.ok) failed += 1;
  }

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((error) => {
  console.error("Smoke test failed:", error.message);
  process.exit(1);
});
