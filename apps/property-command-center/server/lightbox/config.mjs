const normalize=value=>String(value??'').trim();

export function getLightBoxConfig(env=process.env){
  const apiKey=normalize(env.LIGHTBOX_API_KEY);
  const baseUrl=normalize(env.LIGHTBOX_BASE_URL)||'https://api.lightboxre.com/v1';
  const port=Number(env.LIGHTBOX_PROXY_PORT||8787);
  const allowedOrigins=(normalize(env.LIGHTBOX_ALLOWED_ORIGINS)||'http://localhost:5173,http://localhost:5174')
    .split(',').map(value=>value.trim()).filter(Boolean);

  return Object.freeze({
    enabled:Boolean(apiKey),
    apiKey,
    baseUrl:baseUrl.replace(/\/+$/,''),
    port:Number.isFinite(port)?port:8787,
    allowedOrigins:Object.freeze(allowedOrigins),
    timeoutMs:Math.max(1000,Number(env.LIGHTBOX_TIMEOUT_MS||8000))
  });
}

export function publicLightBoxConfig(config=getLightBoxConfig()){
  return Object.freeze({
    enabled:config.enabled,
    baseUrlConfigured:Boolean(config.baseUrl),
    port:config.port,
    allowedOrigins:config.allowedOrigins,
    timeoutMs:config.timeoutMs
  });
}
