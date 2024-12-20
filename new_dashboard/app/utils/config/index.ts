import { z } from "zod";
import { ModelConfig, EmbeddingModelConfig } from "./models";
import { parse } from "smol-toml";
import { promises as fs } from "fs";
import { FunctionConfig, RawFunctionConfig } from "./function";
import { MetricConfig } from "./metric";
import { ToolConfig } from "./tool";

const CONFIG_PATH =
  process.env.CONFIG_PATH || "fixtures/config/tensorzero.toml";

// Create singleton
let configPromise: ReturnType<typeof loadConfig>;

export function getConfig() {
  if (!configPromise) {
    configPromise = loadConfig(CONFIG_PATH);
  }
  return configPromise;
}

export const GatewayConfig = z.object({
  bind_address: z.string().optional(), // Socket address as string
  disable_observability: z.boolean().default(false),
});
export type GatewayConfig = z.infer<typeof GatewayConfig>;

export const RawConfig = z
  .object({
    gateway: GatewayConfig.optional().default({}),
    models: z.record(z.string(), ModelConfig),
    embedding_models: z
      .record(z.string(), EmbeddingModelConfig)
      .optional()
      .default({}),
    functions: z.record(z.string(), RawFunctionConfig),
    metrics: z.record(z.string(), MetricConfig),
    tools: z.record(z.string(), ToolConfig).optional().default({}),
  })
  .transform((raw) => {
    const config = { ...raw };
    return {
      ...config,
      load: async function (config_path: string): Promise<Config> {
        const loadedFunctions: Record<string, FunctionConfig> = {};
        for (const [key, func] of Object.entries(config.functions)) {
          loadedFunctions[key] = await func.load(config_path);
        }
        return {
          gateway: config.gateway,
          models: config.models,
          embedding_models: config.embedding_models,
          functions: loadedFunctions,
          metrics: config.metrics,
          tools: config.tools,
        };
      },
    };
  });
export type RawConfig = z.infer<typeof RawConfig>;

export const Config = z.object({
  gateway: GatewayConfig.optional().default({}),
  models: z.record(z.string(), ModelConfig),
  embedding_models: z
    .record(z.string(), EmbeddingModelConfig)
    .optional()
    .default({}),
  functions: z.record(z.string(), FunctionConfig),
  metrics: z.record(z.string(), MetricConfig),
  tools: z.record(z.string(), ToolConfig).optional().default({}),
});
export type Config = z.infer<typeof Config>;

export async function loadConfig(config_path: string): Promise<Config> {
  const tomlContent = await fs.readFile(config_path, "utf-8");
  const parsedConfig = parse(tomlContent);
  const validatedConfig = RawConfig.parse(parsedConfig);

  const loadedConfig = await validatedConfig.load(config_path);

  return loadedConfig;
}
