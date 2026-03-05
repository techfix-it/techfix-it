export function cn(...inputs: (string | undefined | null | false | number)[]) {
  return inputs.filter(Boolean).join(" ");
}
