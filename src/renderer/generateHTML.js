function generateHTML(schema) {
  const primaryColor = schema.theme?.primary_color || '#6366F1';
  const icon = schema.theme?.icon || '⚡';
  const appName = schema.app_name || 'My App';

  // Generate form fields HTML
  function renderField(field) {
    const label = `<label style="display:block;font-size:13px;color:#6B7280;margin-bottom:4px">${field.label}${field.required ? ' *' : ''}</label>`;
    
    switch(field.type) {
      case 'boolean':
        return `
          <div style="margin-bottom:16px">
            ${label}
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" name="${field.name}" 
                style="width:18px;height:18px;accent-color:${primaryColor}">
              <span style="font-size:15px">${field.label}</span>
            </label>
          </div>`;

      case 'select':
        const options = (field.options || [])
          .map(o => `<option value="${o}">${o}</option>`)
          .join('');
        return `
          <div style="margin-bottom:16px">
            ${label}
            <select name="${field.name}" 
              style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:15px;background:white">
              <option value="">Select ${field.label}</option>
              ${options}
            </select>
          </div>`;

      case 'number':
        return `
          <div style="margin-bottom:16px">
            ${label}
            <input type="number" name="${field.name}" 
              placeholder="Enter ${field.label}"
              style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:15px;box-sizing:border-box">
          </div>`;

      case 'date':
        return `
          <div style="margin-bottom:16px">
            ${label}
            <input type="date" name="${field.name}"
              style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:15px;box-sizing:border-box">
          </div>`;

      case 'phone':
        return `
          <div style="margin-bottom:16px">
            ${label}
            <input type="tel" name="${field.name}"
              placeholder="Enter phone number"
              style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:15px;box-sizing:border-box">
          </div>`;

      default:
        return `
          <div style="margin-bottom:16px">
            ${label}
            <input type="text" name="${field.name}"
              placeholder="Enter ${field.label}"
              style="width:100%;padding:10px 12px;border:1px solid #E5E7EB;border-radius:8px;font-size:15px;box-sizing:border-box">
          </div>`;
    }
  }

  // Generate screen tabs
  const screens = schema.screens || [];
  const tabsHTML = screens.map((screen, i) => `
    <button onclick="showScreen('${screen.name}')" id="tab_${screen.name}"
      style="flex:1;padding:10px;border:none;background:${i === 0 ? primaryColor : '#F3F4F6'};
             color:${i === 0 ? 'white' : '#6B7280'};font-size:14px;font-weight:600;cursor:pointer;
             border-radius:8px;margin:0 4px;transition:all 0.2s">
      ${screen.title}
    </button>
  `).join('');

  // Generate screen content
  const screensHTML = screens.map((screen, i) => {
    const componentsHTML = (screen.components || []).map(component => {
      const fieldsHTML = (component.fields || []).map(renderField).join('');

      if (component.type === 'search') {
        return `
          <div style="margin-bottom:20px">
            <input type="text" placeholder="🔍 ${component.title}"
              oninput="handleSearch(this.value)"
              style="width:100%;padding:12px 16px;border:1px solid #E5E7EB;
                     border-radius:12px;font-size:15px;box-sizing:border-box">
          </div>`;
      }

      if (component.type === 'summary') {
        return `
          <div style="background:${primaryColor}15;border-radius:12px;padding:16px;margin-bottom:20px">
            <h3 style="margin:0 0 8px 0;color:${primaryColor};font-size:16px">${component.title}</h3>
            <div id="summary_content" style="font-size:14px;color:#374151">
              No data yet. Add your first entry below.
            </div>
          </div>`;
      }

      return `
        <div style="background:white;border-radius:12px;padding:16px;margin-bottom:16px;
                    box-shadow:0 1px 3px rgba(0,0,0,0.1)">
          <h3 style="margin:0 0 16px 0;color:#111827;font-size:16px;font-weight:600">
            ${component.title}
          </h3>
          <form onsubmit="handleSubmit(event, '${screen.name}')">
            ${fieldsHTML}
            <button type="submit"
              style="width:100%;padding:12px;background:${primaryColor};color:white;
                     border:none;border-radius:8px;font-size:16px;font-weight:600;
                     cursor:pointer;margin-top:8px">
              Save Entry
            </button>
          </form>
          <div id="entries_${screen.name}" style="margin-top:20px"></div>
        </div>`;
    }).join('');

    return `
      <div id="screen_${screen.name}" 
        style="display:${i === 0 ? 'block' : 'none'};padding:16px">
        ${componentsHTML}
      </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <title>${appName}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; font-family:-apple-system,sans-serif; }
    body { background:#F9FAFB; min-height:100vh; }
    .header { background:${primaryColor}; color:white; padding:16px; 
              display:flex; align-items:center; gap:12px; 
              position:sticky; top:0; z-index:100; }
    .tabs { display:flex; padding:12px; background:white; 
            border-bottom:1px solid #E5E7EB; position:sticky; top:56px; z-index:99; }
    .entry-card { background:white; border-radius:8px; padding:12px; 
                  margin-bottom:8px; border-left:3px solid ${primaryColor};
                  box-shadow:0 1px 2px rgba(0,0,0,0.05); }
    .entry-field { font-size:13px; color:#6B7280; margin-bottom:2px; }
    .entry-value { font-size:15px; color:#111827; font-weight:500; }
    .delete-btn { float:right; background:none; border:none; 
                  color:#EF4444; cursor:pointer; font-size:18px; }
    .empty-state { text-align:center; padding:40px 20px; color:#9CA3AF; }
  </style>
</head>
<body>

<div class="header">
  <span style="font-size:28px">${icon}</span>
  <div>
    <div style="font-size:18px;font-weight:700">${appName}</div>
    <div style="font-size:12px;opacity:0.8">${schema.description || ''}</div>
  </div>
</div>

<div class="tabs">${tabsHTML}</div>

${screensHTML}

<script>
  // Storage
  const STORAGE_KEY = '${schema.app_type}_data';
  let appData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
  }

  // Screen navigation
  function showScreen(screenName) {
    document.querySelectorAll('[id^="screen_"]').forEach(s => s.style.display = 'none');
    document.getElementById('screen_' + screenName).style.display = 'block';
    
    document.querySelectorAll('[id^="tab_"]').forEach(t => {
      t.style.background = '#F3F4F6';
      t.style.color = '#6B7280';
    });
    const activeTab = document.getElementById('tab_' + screenName);
    if (activeTab) {
      activeTab.style.background = '${primaryColor}';
      activeTab.style.color = 'white';
    }
  }

  // Form submission
  function handleSubmit(event, screenName) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const entry = {};
    
    formData.forEach((value, key) => { entry[key] = value; });
    entry._id = Date.now();
    entry._timestamp = new Date().toLocaleString();

    if (!appData[screenName]) appData[screenName] = [];
    appData[screenName].push(entry);
    saveData();
    
    renderEntries(screenName);
    form.reset();
    
    // Show success
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = '✓ Saved!';
    btn.style.background = '#10B981';
    setTimeout(() => {
      btn.textContent = 'Save Entry';
      btn.style.background = '${primaryColor}';
    }, 1500);
  }

  // Render saved entries
  function renderEntries(screenName) {
    const container = document.getElementById('entries_' + screenName);
    if (!container) return;
    
    const entries = appData[screenName] || [];
    
    if (entries.length === 0) {
      container.innerHTML = '<div class="empty-state">📭 No entries yet.<br>Add your first one above.</div>';
      return;
    }

    container.innerHTML = entries.map((entry, i) => {
      const fields = Object.entries(entry)
        .filter(([k]) => !k.startsWith('_'))
        .map(([k, v]) => {
          const label = k.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
          return '<div class="entry-field">' + label + '</div><div class="entry-value">' + v + '</div>';
        }).join('');
      
      return '<div class="entry-card">' +
        '<button class="delete-btn" onclick="deleteEntry(' + "'" + screenName + "'" + ',' + i + ')">×</button>' +
        fields +
        '<div style="font-size:11px;color:#9CA3AF;margin-top:8px">' + entry._timestamp + '</div>' +
        '</div>';
    }).join('');
  }

  // Delete entry
  function deleteEntry(screenName, index) {
    appData[screenName].splice(index, 1);
    saveData();
    renderEntries(screenName);
  }

  // Search handler
  function handleSearch(query) {
    const cards = document.querySelectorAll('.entry-card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
    });
  }

  // Load existing data on start
  Object.keys(appData).forEach(screenName => renderEntries(screenName));
</script>

</body>
</html>`;
}

module.exports = { generateHTML };
