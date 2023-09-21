// Fonction pour copier du texte dans le presse-papier
function copyTextToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text successfully copied');
    }).catch(error => {  // <-- Ici, utilisez "error" au lieu de "err"
      let errorMessage = error.message === 'Invalid Copy' ? 'Impossible de mettre la réponse dans le presse papier' : 'Une erreur s\'est produite lors de la mise dans le presse papier';
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Erreur de presse papier',
        message: errorMessage
      });
    });
}

  
  // Initialisation du menu contextuel
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "chatGPT",
      title: "Répondre",
      contexts: ["selection"]
    });
  });
  
  // Écouteur pour le menu contextuel
  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    chrome.storage.sync.get(['model', 'prefix', 'apiKey'], function (items) {
      const model = items.model || '';
      const prefix = items.prefix || 'Votre préfixe par défaut';
      const apiKey = items.apiKey || 'Votre clé API par défaut';
  
      const selectedText = info.selectionText;
      const modifiedSelectedText = prefix + " " + selectedText;
  
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: "user",
            content: modifiedSelectedText
          }]
        })
      })
      .then(response => {
        if (response.status !== 200) {
          throw new Error('Invalid API Key');
        }
        return response.json();
      })
      .then(data => {
        if (apiKey === 'Votre clé API par défaut') {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Erreur',
            message: 'Clé API manquante. Veuillez ajouter une clé API.'
          });
        } else if (data && data.choices && data.choices[0] && data.choices[0].message) {
          const assistantMessage = data.choices[0].message.content;
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Réponse de l\'assistant',
            message: assistantMessage
          });
  
          chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: copyTextToClipboard,
            args: [assistantMessage]
          });
        }
      })
      .catch(error => {
        //console.error('Erreur lors de l\'appel à GPT:', error);
        let errorMessage = error.message === 'Invalid API Key' ? 'Clé API fausse' : 'Une erreur s\'est produite lors de l\'appel à l\'API.';
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Erreur API',
          message: errorMessage
        });
      });
    });
  });
  