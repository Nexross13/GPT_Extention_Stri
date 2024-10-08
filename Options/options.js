// Charger les options
function loadOptions() {
  chrome.storage.sync.get(['theme', 'model', 'prefix', 'apiKey', 'notifications', 'modeStri'], function(items) {
    document.getElementById('theme').value = items.theme || 'light';
    document.getElementById('model').value = items.model || 'gpt-4o';
    document.getElementById('prefix').value = items.prefix || 'Exemple : Vous êtes un expert en informatique, spécialisé dans les systèmes et réseaux, avec une expertise approfondie en ITIL et une solide maîtrise des environnements IT.  Répondez-moi avec seulement la ou les réponses à la question : ';
    document.getElementById('apiKey').value = items.apiKey || '';
    document.getElementById('notifications').checked = items.notifications || false;
    document.getElementById('mode-stri').checked = items.modeStri || false;

    // Ajoute les nouveaux modèles dans le menu déroulant
    document.getElementById('model').innerHTML = `
      <option value="gpt-4o">GPT-4o</option>
      <option value="gpt-4-turbo">GPT-4 Turbo</option>
      <option value="gpt-4">GPT-4</option>
    `;

    // Appliquer le thème initial
    applyTheme(items.theme || 'light');
  });
}

// Sauvegarder les options
function saveOptions() {
  const theme = document.getElementById('theme').value;
  const model = document.getElementById('model').value;
  const prefix = document.getElementById('prefix').value;
  const apiKey = document.getElementById('apiKey').value;
  const notifications = document.getElementById('notifications').checked;
  const modeStri = document.getElementById('mode-stri').checked;

  chrome.storage.sync.set({
    theme: theme,
    model: model,
    prefix: prefix,
    apiKey: apiKey,
    notifications: notifications,
    modeStri: modeStri
  }, function() {
    const status = document.getElementById('status');
    status.textContent = 'Options sauvegardées.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });

  applyTheme(theme);
}

function applyTheme(theme) {
  const bodyElement = document.getElementById('mainBody');
  if (theme === 'dark') {
    bodyElement.classList.add('dark-theme');
  } else {
    bodyElement.classList.remove('dark-theme');
  }
}

document.addEventListener('DOMContentLoaded', loadOptions);
document.getElementById('save').addEventListener('click', saveOptions);
