import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createVertexClientOpts } from "./index.ts";

describe("createVertexClientOpts", () => {
  it("sets interleaved-thinking header for non-adaptive model with no request headers", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-5",
    );
    assert.deepEqual(opts.defaultHeaders, {
      "anthropic-beta": "interleaved-thinking-2025-05-14",
    });
  });

  it("omits defaultHeaders for adaptive model with no request headers", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-6",
    );
    assert.equal(opts.defaultHeaders, undefined);
  });

  it("preserves non-beta request headers", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-6",
      {
        "x-custom": "value",
      },
    );
    assert.deepEqual(opts.defaultHeaders, { "x-custom": "value" });
  });

  it("merges request beta header with automatic beta", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-5",
      {
        "anthropic-beta": "my-beta",
        "x-other": "keep",
      },
    );
    assert.deepEqual(opts.defaultHeaders, {
      "anthropic-beta": "interleaved-thinking-2025-05-14,my-beta",
      "x-other": "keep",
    });
  });

  it("removes anthropic-beta from headers when empty for adaptive model", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-6",
      {
        "anthropic-beta": "",
        "x-other": "keep",
      },
    );
    assert.deepEqual(opts.defaultHeaders, { "x-other": "keep" });
  });

  it("deduplicates user beta matching automatic beta", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-5",
      {
        "anthropic-beta": "interleaved-thinking-2025-05-14",
      },
    );
    assert.deepEqual(opts.defaultHeaders, {
      "anthropic-beta": "interleaved-thinking-2025-05-14",
    });
  });

  it("trims whitespace and skips empty entries in user betas", () => {
    const opts = createVertexClientOpts(
      "proj",
      "us-east5",
      "claude-sonnet-4-6",
      {
        "anthropic-beta": " beta-a , , beta-b ",
      },
    );
    assert.deepEqual(opts.defaultHeaders, {
      "anthropic-beta": "beta-a,beta-b",
    });
  });

  it("passes projectId and region through", () => {
    const opts = createVertexClientOpts(
      "my-project",
      "europe-west1",
      "claude-sonnet-4-6",
    );
    assert.equal(opts.projectId, "my-project");
    assert.equal(opts.region, "europe-west1");
  });
});
