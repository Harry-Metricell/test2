// Large image-rich DOCX files can stall on chunked HTTPS through this host's
// proxy. Buffer the request and fail a genuinely stalled transfer explicitly.
export function reportPushArgs() {
  return ['-c', 'http.version=HTTP/1.1', '-c', 'http.postBuffer=524288000',
    '-c', 'http.lowSpeedLimit=1024', '-c', 'http.lowSpeedTime=60',
    'push', 'origin', 'HEAD:refs/heads/main'];
}

// A second network lookup can return a newer commit than the preceding fetch.
// Build from the fetched snapshot; a later push rejection triggers a fresh fetch.
export function fetchedPublicationSha(runGit) {
  const sha = runGit(['rev-parse', '--verify', 'origin/main^{commit}']).trim();
  if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error('Fetched origin/main has no usable commit SHA');
  return sha;
}
