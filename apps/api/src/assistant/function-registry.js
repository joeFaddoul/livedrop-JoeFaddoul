const registry = new Map();

export function registerAssistantFunction(metadata, handler) {
  if (!metadata || !metadata.name) {
    throw new Error('Assistant function metadata requires a name');
  }

  const entry = {
    ...metadata,
    handler,
  };

  registry.set(metadata.name, entry);
  return handler;
}

export function assistantFunction(metadata) {
  return function decorator(handler) {
    return registerAssistantFunction(metadata, handler);
  };
}

export function listAssistantFunctions() {
  return Array.from(registry.values()).map(({ handler, ...metadata }) => metadata);
}

export async function invokeAssistantFunction(name, args, context = {}) {
  const entry = registry.get(name);
  if (!entry) {
    throw new Error(`Unknown assistant function: ${name}`);
  }

  return entry.handler({ args, context });
}

export function clearAssistantFunctions() {
  registry.clear();
}

// Assignment-friendly API aliases
export const register = registerAssistantFunction;
export const getAllSchemas = listAssistantFunctions;
export const execute = invokeAssistantFunction;
