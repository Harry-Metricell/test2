// Large image-rich DOCX files can stall on chunked HTTPS through this host's
// proxy. Buffer the request and fail a genuinely stalled transfer explicitly.
export function reportPushArgs() {
  return ['-c', 'http.version=HTTP/1.1', '-c', 'http.postBuffer=524288000',
    '-c', 'http.lowSpeedLimit=1024', '-c', 'http.lowSpeedTime=60',
    'push', 'origin', 'HEAD:refs/heads/main'];
}
