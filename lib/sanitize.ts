const CONTROL_CHARACTERS_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const MULTIPLE_SPACES = /[ \t]{2,}/g;

export function sanitizeText(value: string) {
  return value
    .replace(CONTROL_CHARACTERS_EXCEPT_WHITESPACE, "")
    .replace(MULTIPLE_SPACES, " ")
    .trim();
}

export function sanitizeCode(value: string) {
  return value.replace(CONTROL_CHARACTERS_EXCEPT_WHITESPACE, "").trimEnd();
}
