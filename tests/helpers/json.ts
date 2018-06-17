export function jsonResponse(status = 200, payload = {}) {
  return [
    status,
    { 'Content-Type': 'application/json' },
    JSON.stringify(payload)
  ];
}

export function jsonFactory(status: number, payload: object) {
  return function json() {
    return jsonResponse(status, payload);
  };
}
