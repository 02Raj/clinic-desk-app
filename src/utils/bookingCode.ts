const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generate a short alphanumeric booking code (4 chars by default). */
export const generateBookingCode = (length = 4): string => {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
};
