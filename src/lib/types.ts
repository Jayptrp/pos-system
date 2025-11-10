// Add this type definition to the top of your hook file
export type HookResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};