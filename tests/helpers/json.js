export default function jsonFactory(status, payload) {
  return function json() {
    return [
      status,
      {"Content-Type": "application/json"},
      JSON.stringify(payload)
    ];
  };
}
