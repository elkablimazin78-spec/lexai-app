/* LexAI assistant connecté au backend Python FastAPI avec effet d'écriture IA */
'use strict';
(()=>{
const el=id=>document.getElementById(id);

if (!window.labels) window.labels = {};

// Ajouter le bouton dans le menu de navigation de gauche
const nav=document.querySelector('nav');
if (nav && !document.querySelector('[data-view="assistant"]')) {
    const navButton=document.createElement('button');
    navButton.dataset.view='assistant';
    navButton.innerHTML='<span class="navicon">✧</span>Assistant IA';
    nav.insertBefore(navButton,nav.children[1]);
    navButton.onclick=()=>view('assistant');
    window.labels.assistant='Assistant IA';
}

// Créer la section de l'Assistant IA
const section=document.createElement('section');
section.id='assistant';
section.className='view hidden';
section.innerHTML=`
<div class="heading">
  <div>
    <div class="eyebrow">Cabinet d'Avocat IA-Ready (Backend Python & Gemini)</div>
    <h1>Votre assistant LexAI.</h1>
    <p class="lead">Posez une question juridique ou fiscale, l'assistant analyse votre dossier via le backend sécurisé.</p>
  </div>
  <span class="badge" id="ai-badge">Connecté au Backend Python</span>
</div>
<div class="workspace ai-workspace">
  <div class="panel">
    <h2>Vos références</h2>
    <p class="small">L’assistant peut utiliser les documents et les faits de l’espace d’analyse.</p>
    <label class="ai-check"><input type="checkbox" id="ai-use-source" checked> Utiliser le dossier actuel</label>
    <div id="ai-source-info" class="callout">Dossier de démonstration KPMG actif.</div>
    <div class="actions"><button id="ai-open-dossier" class="secondary">Ouvrir le dossier</button></div>
    <p class="notice">Analyse juridique structurée (Doctrine KPMG & BOFIP).</p>
  </div>
  <div class="panel">
    <div class="resulthead"><h2>Conversation</h2><button id="ai-clear" type="button" class="linkbutton">Effacer</button></div>
    <div id="ai-messages" class="ai-messages" aria-live="polite">
      <div class="ai-welcome">Bonjour, je suis LexAI, votre avocat-conseil. Posez votre question ci-dessous.</div>
    </div>
    <form id="ai-chat-form">
      <label class="formlabel" for="ai-message">Votre message</label>
      <textarea id="ai-message" rows="3" maxlength="2000" placeholder="Posez une question sur votre document ou un cas juridique…" required></textarea>
      <div class="actions">
        <button type="submit" id="ai-send" class="primary">Envoyer →</button>
      </div>
    </form>
  </div>
</div>`;

const contentArea = document.querySelector('.content') || document.body;
contentArea.insertBefore(section, document.querySelector('.footer'));

// Styles CSS intégrés
const style=document.createElement('style');
style.textContent='.ai-workspace{grid-template-columns:minmax(250px,.65fr) minmax(320px,1.35fr)}.ai-check{display:flex;gap:8px;align-items:center;margin:14px 0;font-size:12px}.ai-check input{width:auto}.ai-messages{height:380px;overflow:auto;margin-bottom:18px;padding:4px}.ai-message{padding:14px;margin:0 0 14px;border:1px solid var(--line);white-space:pre-wrap;overflow-wrap:anywhere}.ai-message.user{background:var(--soft);margin-left:25px}.ai-message.assistant{background:#fff}.ai-message strong{display:block;font-size:11px;color:var(--gold);margin-bottom:6px}.ai-welcome{padding:35px 15px;text-align:center;color:var(--muted)}';
document.head.appendChild(style);

function addMessage(role,text){
    const welcome=el('ai-messages').querySelector('.ai-welcome');
    if(welcome)welcome.remove();
    const box=document.createElement('article');
    box.className='ai-message '+role;
    const title=document.createElement('strong');
    title.textContent=role==='user'?'Vous':'LexAI · Avocat-Conseil (Doctrine KPMG)';
    const content=document.createElement('div');
    content.textContent=text;
    box.append(title,content);
    el('ai-messages').appendChild(box);
    el('ai-messages').scrollTop=el('ai-messages').scrollHeight;
    return {box,content};
}

el('ai-clear').onclick=()=>{
    el('ai-messages').innerHTML='<div class="ai-welcome">Nouvelle conversation. Posez votre question juridique.</div>';
};

// Fonction de communication sécurisée récupérant le document et les champs de l'espace d'analyse
async function sendQueryToBackend(userQuestion) {
    const useSource = el('ai-use-source') ? el('ai-use-source').checked : true;
    let documentText = "";
    
    if (useSource) {
        // Récupère dynamiquement le texte affiché dans la zone des références documentaires de l'espace d'analyse
        const docPreview = document.querySelector('#workspace, .workspace, pre, .callout, textarea');
        // Récupère aussi ce qui a pu être saisi dans les champs de texte de l'espace d'analyse s'ils existent
        const textareas = document.querySelectorAll('textarea');
        let extraContext = "";
        textareas.forEach(ta => {
            if (ta.id !== 'ai-message' && ta.value.trim() !== '') {
                extraContext += "\n" + ta.value;
            }
        });

        const sourceInfoElement = document.getElementById('ai-source-info') || docPreview;
        documentText = (sourceInfoElement ? sourceInfoElement.innerText : "") + "\n" + extraContext;
        if (!documentText.trim()) {
            documentText = "Fiche d'analyse de cas juridique chargée.";
        }
    }

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                question: userMessage,
                document_text: currentDocumentText 
            })
        });
        if (!response.ok) throw new Error('Erreur de réponse du serveur Python');
        return await response.json(); 
    } catch (error) {
        console.error('Erreur Backend:', error);
        return {
            answer: "Impossible de contacter le serveur Python FastAPI. Vérifiez qu'il est bien démarré dans le terminal.",
            sources: []
        };
    }
}

// Effet d'écriture fluide (Typewriter)
async function typeWriter(element, text, speed = 5) {
    element.textContent = "";
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i);
        const container = el('ai-messages');
        if (container) container.scrollTop = container.scrollHeight;
        if (i % 3 === 0) {
            await new Promise(resolve => setTimeout(resolve, speed));
        }
    }
}

// Gestionnaire d'envoi du formulaire de chat
const form = el('ai-chat-form');
if (form) {
    form.onsubmit = async event => {
        event.preventDefault();
        const textarea = el('ai-message');
        const question = textarea.value.trim();
        if(!question) return;

        addMessage('user', question);
        textarea.value = '';
        
        const message = addMessage('assistant', '🧠 Analyse croisée du document et de la doctrine KPMG en cours...');
        
        // Appel au backend Python avec transmission complète du dossier et du contexte
        const data = await sendQueryToBackend(question);
        
        let finalOutput = data.answer;
        if(data.sources && data.sources.length > 0) {
            finalOutput += "\n\n**Références & Sources Juridiques :**\n" + data.sources.map(s => `• ${s}`).join('\n');
        }
        
        await typeWriter(message.content, finalOutput, 4);
    };
}

const openDossierBtn = el('ai-open-dossier');
if (openDossierBtn && typeof view === 'function') {
    openDossierBtn.onclick = () => view('workspace');
}

})();