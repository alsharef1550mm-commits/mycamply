export type ProgressStore = {
  getWithMetadata(
    key: string,
    options?: { type: "json" },
  ): Promise<{ data: unknown; etag?: string } | null>;
  setJSON(
    key: string,
    data: unknown,
    condition: { onlyIfNew?: true; onlyIfMatch?: string },
  ): Promise<{ modified: boolean; etag?: string }>;
};

export function validState(state: unknown): boolean;

export function createHandler(
  openStore: () => ProgressStore,
  loadMissingRecord?: (input: {
    key: string;
    token: string;
    store: ProgressStore;
  }) => Promise<{ data: unknown; etag?: string } | null>,
): (request: Request) => Promise<Response>;
