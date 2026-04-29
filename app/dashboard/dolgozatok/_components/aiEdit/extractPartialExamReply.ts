/**
 * Extracts the partial decoded string value of `reply` from streamed JSON
 * (Gemini exam edit response). Same escape handling as messageToClient draft helper.
 */
export function extractPartialReplyFromExamEditBuffer(buffer: string): string {
   const key = '"reply"';
   const keyIdx = buffer.indexOf(key);
   if (keyIdx === -1) return "";

   let pos = keyIdx + key.length;
   while (pos < buffer.length && /\s/.test(buffer[pos]!)) pos++;
   if (buffer[pos] !== ":") return "";
   pos++;
   while (pos < buffer.length && /\s/.test(buffer[pos]!)) pos++;
   if (buffer[pos] !== '"') return "";
   pos++;

   let out = "";
   while (pos < buffer.length) {
      const c = buffer[pos]!;
      if (c === '"') break;
      if (c === "\\" && pos + 1 < buffer.length) {
         const n = buffer[pos + 1]!;
         if (n === '"' || n === "\\" || n === "/") {
            out += n;
            pos += 2;
            continue;
         }
         if (n === "n") {
            out += "\n";
            pos += 2;
            continue;
         }
         if (n === "r") {
            out += "\r";
            pos += 2;
            continue;
         }
         if (n === "t") {
            out += "\t";
            pos += 2;
            continue;
         }
         if (n === "u" && pos + 5 < buffer.length) {
            const hex = buffer.slice(pos + 2, pos + 6);
            if (/^[0-9a-fA-F]{4}$/.test(hex)) {
               out += String.fromCharCode(Number.parseInt(hex, 16));
               pos += 6;
               continue;
            }
         }
         out += n;
         pos += 2;
         continue;
      }
      out += c;
      pos++;
   }
   return out;
}
