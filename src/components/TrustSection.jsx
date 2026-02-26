import { GITHUB_URL } from "../lib/helpers";

export default function TrustSection() {
  return (
    <div className="trust-section">
      <div className="trust-title">How is this actually secure?</div>
      <div className="trust-items">
        <div className="trust-item">
          <span className="trust-icon">🔐</span>
          <span>
            <strong>Your key never leaves your browser.</strong> Encryption and decryption
            both run locally using the Web Crypto API (AES-256-GCM + PBKDF2). We only ever
            receive an unreadable blob of ciphertext.
          </span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">🙈</span>
          <span>
            <strong>The server is completely blind.</strong> Our backend stores only the
            encrypted bytes — there is no way to read your .env values from our end, even
            if we wanted to.
          </span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">💨</span>
          <span>
            <strong>Links self-destruct.</strong> After the read limit or TTL is hit, the
            data is permanently deleted from Redis. No copies, no logs, no backups.
          </span>
        </div>
        <div className="trust-item">
          <span className="trust-icon">✂️</span>
          <span>
            <strong>Link and key travel separately.</strong> The share link goes via email
            or chat. The key goes via WhatsApp or Slack. An attacker would need both —
            intercepting one alone is useless.
          </span>
        </div>
      </div>
      <div className="trust-proof">
        Still not convinced? That's fair.{" "}
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
          Read the source on GitHub →
        </a>{" "}
        The encryption is ~30 lines of vanilla Web Crypto. You can verify the key never
        touches our API before trusting us with your secrets.
      </div>
    </div>
  );
}
