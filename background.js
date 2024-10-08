function copyTextToClipboard(tabId, text) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: (text) => {
      navigator.clipboard.writeText(text).then(() => {
        console.log('Texte copié avec succès dans le presse-papier');
      }).catch(error => {
        console.error('Erreur lors de la copie dans le presse-papier:', error);
        alert('Erreur lors de la copie dans le presse-papier.');
      });
    },
    args: [text]
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

// Gestion de la commande (raccourci clavier)
chrome.commands.onCommand.addListener((command, tab) => {
  if (command === "send_to_chatgpt") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    }, (selection) => {
      const selectedText = selection[0].result.trim();
      if (selectedText) {
        // Effectue la même action que le menu contextuel
        handleSelectedText(selectedText, tab);
      } else {
        alert("Veuillez sélectionner un texte avant d'utiliser le raccourci.");
      }
    });
  }
});

// Écouteur pour le menu contextuel
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  handleSelectedText(info.selectionText, tab);
});

// Fonction pour traiter le texte sélectionné (exécutée par le menu ou le raccourci)
function handleSelectedText(selectedText, tab) {
  chrome.storage.sync.get(['model', 'prefix', 'apiKey', 'notifications', 'modeStri'], function (items) {
    const model = items.model || 'gpt-4-turbo';
    const prefix = items.prefix || 'Votre préfixe par défaut';
    const apiKey = items.apiKey || '';
    const notificationsEnabled = items.notifications || false;
    const modeStriEnabled = items.modeStri || false;

    if (!apiKey.trim()) {
      console.log("Clé API manquante !");
      if (notificationsEnabled) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Erreur',
          message: 'Clé API manquante. Veuillez ajouter une clé API dans les options.'
        });
      }
      return;
    }

    const modifiedSelectedText = prefix + " " + selectedText;

    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: modifiedSelectedText }]
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data && data.choices && data.choices[0] && data.choices[0].message) {
        const assistantMessage = data.choices[0].message.content;

        if (notificationsEnabled) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png',
            title: 'Réponse de l\'assistant',
            message: assistantMessage
          });
        }

        copyTextToClipboard(tab.id, assistantMessage);

        // Si le mode STRI est activé, cocher la réponse automatiquement
        if (modeStriEnabled) {
          const firstLetterMatch = assistantMessage.trim().match(/^([A-E])\./);
          if (firstLetterMatch) {
            const answerLetter = firstLetterMatch[1];
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: (letter) => {
                const options = document.querySelectorAll('input[type="radio"]');
                options.forEach(option => {
                  const label = document.getElementById(option.getAttribute('aria-labelledby'));
                  if (label && label.innerText.trim().startsWith(letter)) {
                    option.checked = true;
                    console.log("Option cochée automatiquement:", label.innerText);
                  }
                });
              },
              args: [answerLetter]
            });
          }
        }
      }
    })
    .catch(error => {
      if (notificationsEnabled) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Erreur API',
          message: error.message || 'Erreur lors de l\'appel à l\'API.'
        });
      }
    });
  });
}
