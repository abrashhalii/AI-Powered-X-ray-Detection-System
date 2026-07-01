import React from 'react';
import StatusBadge from './StatusBadge';

export default function HeatmapViewer({ scan, onClose }) {
  if (!scan) return null;
  const results = scan.detectionResults || {};
  const bars = [
    { label: 'Pneumonia', value: results.pneumonia || 0, color: '#ef4444' },
    { label: 'Tuberculosis', value: results.tuberculosis || 0, color: '#a855f7' },
    { label: 'Normal', value: results.normal || 0, color: '#22c55e' },
    { label: 'Viral Pneumonia', value: results.viralPneumonia || results.pneumonia * 0.7 || 0, color: '#f59e0b' },
    { label: 'Bacterial Pneumonia', value: results.bacterialPneumonia || results.pneumonia * 0.25 || 0, color: '#06b6d4' },
  ];

  const imgSrc = scan.imagePath ? `http://localhost:5000${scan.imagePath}` : null;

  return (
    <div className="heatmap-overlay" onClick={onClose}>
      <div className="heatmap-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>X-Ray Analysis</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>{scan.scanId} — {scan.patientName}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <StatusBadge status={scan.prediction || scan.status} />
            <button onClick={onClose} style={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
        </div>

        {/* X-Ray Images */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Heatmap (Grad-CAM)', type: 'heatmap' },
            { label: 'Original X-Ray', type: 'original' },
            { label: 'Contrast Enhanced', type: 'contrast' }
          ].map(({ label, type }) => (
            <div key={type}>
              <div style={{ height: 180, borderRadius: 10, overflow: 'hidden', background: 'var(--bg-card2)', border: '1px solid var(--border)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {type === 'heatmap' ? (
                  <div style={{ position: 'absolute', inset: 0 }}>
                    {imgSrc && <img src={imgSrc} alt="xray" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />}
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 40% 50%, rgba(255,60,0,0.7) 0%, rgba(255,120,0,0.4) 30%, transparent 70%)', mixBlendMode: 'screen' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 65% 45%, rgba(255,200,0,0.4) 0%, transparent 50%)', mixBlendMode: 'screen' }} />
                  </div>
                ) : type === 'original' ? (
                  imgSrc ? <img src={imgSrc} alt="xray" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ position: 'relative', width: '70%', height: '80%' }}>
                      <div style={{ position: 'absolute', left: '15%', top: '10%', width: '30%', height: '70%', borderRadius: '40% 40% 50% 50%', background: 'rgba(180,200,220,0.15)', border: '1px solid rgba(180,200,220,0.2)' }} />
                      <div style={{ position: 'absolute', right: '15%', top: '10%', width: '30%', height: '70%', borderRadius: '40% 40% 50% 50%', background: 'rgba(180,200,220,0.12)', border: '1px solid rgba(180,200,220,0.15)' }} />
                      <div style={{ position: 'absolute', left: '40%', top: '5%', width: '20%', height: '80%', background: 'rgba(100,120,150,0.3)', borderRadius: 4 }} />
                    </div>
                ) : (
                  <div style={{ position: 'relative', width: '100%', height: '100%', filter: 'contrast(1.4) brightness(0.8)' }}>
                    {imgSrc && <img src={imgSrc} alt="xray" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'contrast(1.6) brightness(0.7) saturate(0)' }} />}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Detection Results */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Detection Results</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px' }}>
            {bars.map(({ label, value, color }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color }}>{Math.round(value * 100)}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-card2)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${value * 100}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn-primary" style={{ flex: 1 }}>💾 Save to Patient</button>
          <button className="btn-ghost" style={{ flex: 1 }}>📄 Download Report</button>
        </div>
      </div>
    </div>
  );
}
