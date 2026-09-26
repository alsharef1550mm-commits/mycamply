import { getStore } from "@netlify/blobs";
// The v11 emulator omits GET ETags, though it exposes them on list and PUT.
// This adapter is only for sequential local preview/tests, never production.
export function localStore(options) {
  const store = getStore(options);
  return {
    setJSON: (...args) => store.setJSON(...args),
    async getWithMetadata(key, options) {
      const entry = await store.getWithMetadata(key, options);
      if (entry && !entry.etag) {
        const { blobs } = await store.list({ prefix: key });
        entry.etag = blobs.find((b) => b.key === key)?.etag;
      }
      return entry;
    },
  };
}
