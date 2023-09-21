// Charger les options
function loadOptions() {
  chrome.storage.sync.get(['theme', 'model', 'prefix', 'apiKey'], function(items) {
    document.getElementById('theme').value = items.theme || 'light';
    document.getElementById('model').value = items.model || 'gpt-3.5-turbo-16k';
    document.getElementById('prefix').value = items.prefix || 'Exemple : Vous êtes un expert en informatique, répondez-moi avec seulement la ou les réponses à la question : ';
    document.getElementById('apiKey').value = items.apiKey || '';

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

  chrome.storage.sync.set({
    theme: theme,
    model: model,
    prefix: prefix,
    apiKey: apiKey,
  }, function() {
    // Mettre à jour le statut pour informer l'utilisateur que les options ont été sauvegardées
    const status = document.getElementById('status');
    status.textContent = 'Options sauvegardées.';
    setTimeout(function() {
      status.textContent = '';
    }, 1500);
  });

  // Appliquer le nouveau thème
  applyTheme(theme);
}

function applyTheme(theme) {
  const bodyElement = document.getElementById('mainBody');
  console.log("Applying theme: ", theme);  // Pour le débogage
  if (theme === 'dark') {
    bodyElement.classList.add('dark-theme');
  } else {
    bodyElement.classList.remove('dark-theme');
  }
}


// Lorsque le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', loadOptions);

// Attacher l'événement de sauvegar
document.getElementById('save').addEventListener('click', saveOptions);
