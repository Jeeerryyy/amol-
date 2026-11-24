import fs from 'fs';

const filePath = 'src/admin/AdminMenus.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add MessageCircle, Bell, ShoppingBag, ExternalLink to imports if not already imported
if (!content.includes('MessageCircle,')) {
  content = content.replace(
    /UtensilsCrossed,\r?\n/,
    'UtensilsCrossed,\n  MessageCircle,\n  Bell,\n  ShoppingBag,\n  ExternalLink,\n'
  );
  console.log('✅ Added Lucide icons to imports');
}

// 2. Add isLightHex and renderAdminButtonIcon helper functions above component
const helperCode = `
// Helper: check if hex color is light to ensure high contrast text & icons
const isLightHex = (hex?: string): boolean => {
  if (!hex || typeof hex !== 'string') return false;
  let c = hex.replace('#', '').trim();
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return false;
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return luma > 185;
};

const renderAdminButtonIcon = (type: string, size = 14) => {
  if (type === 'whatsapp') return <MessageCircle size={size} />;
  if (type === 'call_waiter') return <Bell size={size} />;
  if (type === 'zomato') return <UtensilsCrossed size={size} />;
  if (type === 'swiggy') return <ShoppingBag size={size} />;
  return <ExternalLink size={size} />;
};
`;

if (!content.includes('const isLightHex =')) {
  content = content.replace(
    'export const AdminMenus: React.FC = () => {',
    `${helperCode}\nexport const AdminMenus: React.FC = () => {`
  );
  console.log('✅ Added helper functions isLightHex and renderAdminButtonIcon');
}

// 3. Update presets in handleButtonTypeChange
content = content.replace(
  "call_waiter: { label: 'Call Waiter', bg_color: '#2B170B', hover_color: '#C04A0C' }",
  "call_waiter: { label: 'Call Waiter', bg_color: '#FAF4EC', hover_color: '#EADECF' }"
);

// 4. Update the interactive button preview in the button list
const oldPreview = `{/* Interactive button preview */}
                        <div
                          style={{
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            backgroundColor: btn.bg_color || '#1F2937',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 600,
                            overflow: 'hidden',
                            letterSpacing: '-0.02em',
                            cursor: 'pointer',
                            userSelect: 'none',
                          }}
                        >
                          <span style={{ position: 'relative', zIndex: 2 }}>{btn.label}</span>
                        </div>`;

const newPreview = `{/* Interactive button preview */}
                        {(() => {
                          const isLight = isLightHex(btn.bg_color);
                          const previewTextColor = isLight ? '#2B170B' : '#FFFFFF';
                          const previewBorder = isLight ? '1px solid #D5C2AF' : '1px solid transparent';
                          return (
                            <div
                              style={{
                                position: 'relative',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '7px',
                                padding: '8px 20px',
                                borderRadius: '9999px',
                                backgroundColor: btn.bg_color || '#1F2937',
                                color: previewTextColor,
                                border: previewBorder,
                                fontSize: '13px',
                                fontWeight: 700,
                                overflow: 'hidden',
                                letterSpacing: '-0.01em',
                                cursor: 'pointer',
                                userSelect: 'none',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                              }}
                            >
                              {renderAdminButtonIcon(btn.type, 14)}
                              <span style={{ position: 'relative', zIndex: 2 }}>{btn.label}</span>
                            </div>
                          );
                        })()}`;

content = content.replace(/\r\n/g, '\n');
const normalizedOldPreview = oldPreview.replace(/\r\n/g, '\n');
const normalizedNewPreview = newPreview.replace(/\r\n/g, '\n');

if (content.includes(normalizedOldPreview)) {
  content = content.replace(normalizedOldPreview, normalizedNewPreview);
  console.log('✅ Updated interactive button preview with pill style and icon');
} else {
  console.warn('⚠️ Could not find exact oldPreview, attempting regex replacement');
  content = content.replace(
    /\{\/\* Interactive button preview \*\/\}[\s\S]+?<span style=\{\{ position: 'relative', zIndex: 2 \}\}>\{btn\.label\}<\/span>\s*<\/div>/,
    normalizedNewPreview
  );
}

// 5. Add color preset chips in the edit/add modal right below Hover Wave Color
const oldColorGrid = `<div className="admin-form-group">
                <label className="admin-label">Hover Wave Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={buttonForm.hover_color}
                    onChange={(e) => setButtonForm({ ...buttonForm, hover_color: e.target.value })}
                    style={{ width: '38px', height: '38px', border: '1px solid var(--admin-border)', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    className="admin-input"
                    value={buttonForm.hover_color}
                    onChange={(e) => setButtonForm({ ...buttonForm, hover_color: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>`;

const newColorGrid = `<div className="admin-form-group">
                <label className="admin-label">Hover Wave Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={buttonForm.hover_color}
                    onChange={(e) => setButtonForm({ ...buttonForm, hover_color: e.target.value })}
                    style={{ width: '38px', height: '38px', border: '1px solid var(--admin-border)', borderRadius: '6px', cursor: 'pointer', padding: 0 }}
                  />
                  <input
                    type="text"
                    className="admin-input"
                    value={buttonForm.hover_color}
                    onChange={(e) => setButtonForm({ ...buttonForm, hover_color: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Quick Palette Presets */}
            <div style={{ marginBottom: '18px' }}>
              <label className="admin-label" style={{ fontSize: '12px' }}>Quick Brand & Theme Presets</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {[
                  { name: 'WhatsApp Green', bg: '#1E7B46', hover: '#176538' },
                  { name: 'Warm Cream Pill', bg: '#FAF4EC', hover: '#EADECF' },
                  { name: 'Zomato Red', bg: '#E23744', hover: '#B81D29' },
                  { name: 'Swiggy Orange', bg: '#FC8019', hover: '#D8660C' },
                  { name: 'Espresso Brown', bg: '#2B170B', hover: '#C04A0C' },
                  { name: 'Dark Slate', bg: '#1F2937', hover: '#EA580C' },
                ].map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setButtonForm({ ...buttonForm, bg_color: preset.bg, hover_color: preset.hover })}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      backgroundColor: preset.bg,
                      color: isLightHex(preset.bg) ? '#2B170B' : '#FFFFFF',
                      border: isLightHex(preset.bg) ? '1px solid #D5C2AF' : '1px solid transparent',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>`;

const normalizedOldColorGrid = oldColorGrid.replace(/\r\n/g, '\n');
const normalizedNewColorGrid = newColorGrid.replace(/\r\n/g, '\n');

if (content.includes(normalizedOldColorGrid)) {
  content = content.replace(normalizedOldColorGrid, normalizedNewColorGrid);
  console.log('✅ Added quick brand presets to button edit modal');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully updated src/admin/AdminMenus.tsx');
