export type FieldType = "text" | "textarea" | "number" | "boolean" | "json";
export type FieldSpec = { key: string; type?: FieldType; readOnly?: boolean };

export type Resource = {
  slug: string;
  title: string;
  group: string;
  table: string;
  idColumn?: string;
  orderBy?: string;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  fields?: FieldSpec[];
};

const id: FieldSpec = { key: "id", readOnly: true };
const createdAt: FieldSpec = { key: "created_at", readOnly: true };

export const resources: Resource[] = [
  // Prompt pipeline
  {
    slug: "prompt-chains",
    title: "Prompt Chains",
    group: "Prompt Pipeline",
    table: "prompt_chains",
    fields: [id, { key: "name" }, { key: "description", type: "textarea" }, createdAt],
  },
  {
    slug: "prompt-chain-steps",
    title: "Prompt Chain Steps",
    group: "Prompt Pipeline",
    table: "prompt_chain_steps",
    fields: [
      id,
      { key: "chain_id", type: "number" },
      { key: "step_number", type: "number" },
      { key: "system_prompt", type: "textarea" },
      { key: "user_prompt", type: "textarea" },
      { key: "llm_model_id", type: "number" },
      createdAt,
    ],
  },
  {
    slug: "prompt-chain-mix",
    title: "Prompt Chain Mix",
    group: "Prompt Pipeline",
    table: "prompt_chain_mix",
    canUpdate: true,
    fields: [id, { key: "chain_id", type: "number", readOnly: true }, { key: "weight", type: "number" }, createdAt],
  },

  // Content
  {
    slug: "terms",
    title: "Terms",
    group: "Content",
    table: "terms",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [id, { key: "term" }, { key: "definition", type: "textarea" }, createdAt],
  },
  {
    slug: "generation-requests",
    title: "Generation Requests",
    group: "Content",
    table: "generation_requests",
    fields: [
      id,
      { key: "user_id" },
      { key: "image_id", type: "number" },
      { key: "chain_id", type: "number" },
      { key: "status" },
      createdAt,
    ],
  },
  {
    slug: "generation-examples",
    title: "Generation Examples",
    group: "Content",
    table: "generation_examples",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      id,
      { key: "image_url" },
      { key: "description", type: "textarea" },
      { key: "caption", type: "textarea" },
      createdAt,
    ],
  },

  // LLM
  {
    slug: "llm-models",
    title: "LLM Models",
    group: "LLM",
    table: "llm_models",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [
      id,
      { key: "name" },
      { key: "provider_id", type: "number" },
      { key: "model_identifier" },
      { key: "is_active", type: "boolean" },
      createdAt,
    ],
  },
  {
    slug: "llm-providers",
    title: "LLM Providers",
    group: "LLM",
    table: "llm_providers",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [id, { key: "name" }, { key: "base_url" }, createdAt],
  },
  {
    slug: "llm-responses",
    title: "LLM Responses",
    group: "LLM",
    table: "llm_responses",
    fields: [
      id,
      { key: "request_id", type: "number" },
      { key: "step_id", type: "number" },
      { key: "model_id", type: "number" },
      { key: "system_prompt", type: "textarea" },
      { key: "user_prompt", type: "textarea" },
      { key: "response_text", type: "textarea" },
      { key: "processing_ms", type: "number" },
      createdAt,
    ],
  },

  // Access control
  {
    slug: "allowed-domains",
    title: "Allowed Signup Domains",
    group: "Access",
    table: "allowed_signup_domains",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [id, { key: "domain" }, createdAt],
  },
  {
    slug: "whitelisted-emails",
    title: "Whitelisted Emails",
    group: "Access",
    table: "whitelisted_emails",
    canCreate: true,
    canUpdate: true,
    canDelete: true,
    fields: [id, { key: "email" }, createdAt],
  },
];

export const getResource = (slug: string) => resources.find((r) => r.slug === slug);