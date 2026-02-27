import { useState, useEffect } from "react";
import { decrypt } from "../lib/crypto";
import { API, copyToClipboard, downloadEnv } from "../lib/helpers";

export default function ReceiveForm({ lockedId = null }) {
  const [id, setId] = useState(lockedId || "");
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [decryptedEnv, setDecryptedEnv] = useState("");
  const [meta, setMeta] = useState(null);
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch live metadata (reads left, TTL) without consuming a read
  useEffect(() => {
    const raw = (lockedId || id).trim();
    const cleanId = raw.replace(/.*\/decrypt\//, "").split("?")[0];
    if (cleanId.length !== 32) {
      setInfo(null);
      return;
    }
    fetch(`${API}/api/info/${cleanId}`)
      .then((r) => r.json())
      .then((d) => (!d.error ? setInfo(d) : setInfo(null)))
      .catch(() => setInfo(null));
  }, [id, lockedId]);

  const handleDecrypt = async () => {
    setError("");
    setDecryptedEnv("");
    setMeta(null);
    const raw = (lockedId || id).trim();
    const cleanId = raw.replace(/.*\/decrypt\//, "").split("?")[0];
    if (!cleanId) return setError("Please enter a share ID or paste the full link.");
    if (!key.trim()) return setError("Please enter the decryption key.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/retrieve/${cleanId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      let plain;
      try {
        plain = await decrypt(data.encryptedData, data.iv, key, data.salt);
      } catch {
        throw new Error("Wrong key — decryption failed. Check the key and try again.");
      }
      setDecryptedEnv(plain);
      setMeta(data);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {!lockedId && (
        <div className="field">
          <label>Share link or ID</label>
          <input
            type="text"
            placeholder="https://envsecure.github.io/decrypt/abc123…  or just the 32-char ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
          />
        </div>
      )}

      {info && (
        <div className="notice info" style={{ marginBottom: 16 }}>
          <strong>Link is valid.</strong>
          <div className="meta-row">
            <span className="meta-pill">
              Reads left: {info.readsLeft} / {info.maxReads}
            </span>
            <span className="meta-pill">
              Expires in: {Math.floor(info.ttlSeconds / 60)}m {info.ttlSeconds % 60}s
            </span>
          </div>
          <div className="read-dots">
            {Array.from({ length: info.maxReads }).map((_, i) => (
              <div key={i} className={`dot ${i < info.reads ? "used" : ""}`} />
            ))}
          </div>
        </div>
      )}

      <div className="field">
        <label>Decryption key</label>
        <input
          type="password"
          placeholder="Enter the key you received via WhatsApp / Slack"
          value={key}
          autoFocus={!!lockedId}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
        />
      </div>

      <button className="btn-primary" onClick={handleDecrypt} disabled={loading}>
        {loading ? "Decrypting…" : "Decrypt .env"}
      </button>

      {error && <div className="notice error">⚠ {error}</div>}

      {decryptedEnv && (
        <>
          <div className="success-header">
            <strong>✓ Decrypted successfully.</strong>
            {meta && (
              <div className="meta-row" style={{ marginTop: 4 }}>
                <span className="meta-pill">
                  Read {meta.readsUsed} of {meta.maxReads}
                </span>
              </div>
            )}
          </div>
          <div className="decrypted-output">{decryptedEnv}</div>
          <div className="btn-row">
            <button
              className="btn-secondary"
              onClick={() => {
                copyToClipboard(decryptedEnv);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "✓ Copied!" : "Copy to clipboard"}
            </button>
            <button className="btn-secondary" onClick={() => downloadEnv(decryptedEnv)}>
              Download .env
            </button>
          </div>
        </>
      )}
    </div>
  );
}
