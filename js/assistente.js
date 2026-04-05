/* ========================================
   CLÍNICA KARINA - ASSISTENTE VIRTUAL
   Foco: Conversão profissional para WhatsApp
   ======================================== */

class AmiltonAssistant {
    constructor() {
        this.isOpen    = false;
        this.isTyping  = false;
        this.currentStep = 'initial'; // 'initial', 'other_text', 'name', 'finish'
        this.history = []; // Para armazenar o estado anterior e permitir voltar

        this.selectedOptions = {
            tipoServico:     null,
            textoOutros:     null,
            nome:            null
        };

        this.whatsappNumber = '5547991597258';
        this.init();
    }

    init() {
        this.initElements();
        this.upgradeFabIcon();
        this.attachEventListeners();
    }

    initElements() {
        const widget = document.createElement('aside');
        widget.className = 'assistant-widget';
        widget.setAttribute('aria-label', 'Assistente Virtual');

        widget.innerHTML = `
            <section id="botChatContainer" class="bot-chat-container" aria-hidden="true">
                <header class="bot-chat-header">
                    <div class="bot-header-info">
                        <img src="images/assistente-humano.jpg" alt="Foto da consultora Karina Vilela" class="header-avatar">
                        <div>
                            <strong class="header-name">Karina Vilela</strong>
                            <span class="header-status">Online agora</span>
                        </div>
                    </div>
                    <div class="bot-header-actions">
                        <button id="botBackButton" class="bot-back-btn" aria-label="Voltar" style="display: none;">
                            <i class="bi bi-arrow-left"></i>
                        </button>
                        <button id="botCloseButton" class="bot-close-btn" aria-label="Fechar chat">&times;</button>
                    </div>
                </header>
                
                <div id="botMessagesList" class="bot-messages-list" role="log" aria-live="polite"></div>

                <div id="typingIndicator" class="typing-indicator" style="display: none;" aria-label="Digitando...">
                    <span></span><span></span><span></span>
                </div>

                <footer class="name-input-container" id="botInputArea" style="display: none;">
                    <input type="text" id="botMainInput" placeholder="Digite aqui..." aria-label="Entrada de texto">
                    <button id="botSubmitBtn" aria-label="Enviar">
                        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"/>
                        </svg>
                    </button>
                </footer>
            </section>

            <button id="botFloatingButton" class="bot-floating-btn" aria-label="Abrir chat com assistente" aria-haspopup="true" aria-expanded="false">
            </button>
        `;

        document.body.appendChild(widget);

        this.floatingBtn    = document.getElementById('botFloatingButton');
        this.chatContainer  = document.getElementById('botChatContainer');
        this.closeBtn       = document.getElementById('botCloseButton');
        this.backBtn        = document.getElementById('botBackButton');
        this.messagesList   = document.getElementById('botMessagesList');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.inputArea      = document.getElementById('botInputArea');
        this.mainInput      = document.getElementById('botMainInput');
        this.submitBtn      = document.getElementById('botSubmitBtn');
    }

    upgradeFabIcon() {
        if (!this.floatingBtn) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'floating-btn-wrapper';

        const bubble = document.createElement('div');
        bubble.className = 'fab-bubble';
        bubble.innerHTML = `
            <span class="fab-bubble-name">Karina Vilela</span>
            <span class="fab-bubble-text">Olá! Posso te ajudar? 😊</span>
            <button class="fab-bubble-close" aria-label="Fechar mensagem">✕</button>
        `;

        this.floatingBtn.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'fab-avatar';
        img.src       = 'images/assistente-humano.jpg';
        img.alt       = 'Consultora Karina Vilela';
        this.floatingBtn.appendChild(img);

        const dot = document.createElement('span');
        dot.className = 'bot-online-dot';
        this.floatingBtn.appendChild(dot);

        this.floatingBtn.parentNode.insertBefore(wrapper, this.floatingBtn);
        wrapper.appendChild(bubble);
        wrapper.appendChild(this.floatingBtn);

        const closeBubbleBtn = bubble.querySelector('.fab-bubble-close');
        closeBubbleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            bubble.style.opacity = '0';
            bubble.style.transform = 'translateX(-12px) scale(0.9)';
            setTimeout(() => bubble.remove(), 260);
        });

        this.floatingBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (bubble.parentNode) bubble.remove();
        });
    }

    attachEventListeners() {
        this.floatingBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleChat(); });
        this.closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.closeChat(); });
        this.backBtn.addEventListener('click', (e) => { e.stopPropagation(); this.goBack(); });
        this.submitBtn.addEventListener('click', (e) => { e.stopPropagation(); this.handleInputSubmit(); });
        this.mainInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.stopPropagation(); this.handleInputSubmit(); } });
        this.chatContainer.addEventListener('click', (e) => e.stopPropagation());
        document.addEventListener('click', () => { if (this.isOpen) this.closeChat(); });
    }

    toggleChat() { this.isOpen ? this.closeChat() : this.openChat(); }

    openChat() {
        this.isOpen = true;
        this.chatContainer.classList.add('active');
        this.chatContainer.setAttribute('aria-hidden', 'false');
        this.floatingBtn.setAttribute('aria-expanded', 'true');
        if (this.messagesList.children.length === 0) this.showInitialMessage();
    }

    closeChat() {
        this.isOpen = false;
        this.chatContainer.classList.remove('active');
        this.chatContainer.setAttribute('aria-hidden', 'true');
        this.floatingBtn.setAttribute('aria-expanded', 'false');
    }

    showInitialMessage() {
        this.currentStep = 'initial';
        this.backBtn.style.display = 'none';
        this.inputArea.style.display = 'none';
        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            this.addBotMessage('👋 Olá! Seja bem-vindo.\n\nSou a Karina Vilela e estou aqui para te ajudar! 😊\n\n📋 Qual tratamento você tem interesse?');
            this.showQuickReplies([
                { text: '🦷 Implantes Dentários',   value: 'Implantes Dentários' },
                { text: '✨ Clareamento Dental',    value: 'Clareamento Dental' },
                { text: '📏 Ortodontia / Aparelho', value: 'Ortodontia' },
                { text: '💎 Lentes de Contato',     value: 'Lentes de Contato' },
                { text: '❓ Outros Assuntos',       value: 'Outros' }
            ]);
        }, 800);
    }

    showQuickReplies(replies) {
        const container = document.createElement('div');
        container.className = 'action-buttons';
        replies.forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = r.text;
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleOptionSelect(r.text, r.value);
                container.remove();
            });
            container.appendChild(btn);
        });
        this.messagesList.appendChild(container);
        this.scrollToBottom();
    }

    handleOptionSelect(text, value) {
        this.addUserMessage(text);
        this.history.push({ step: this.currentStep, options: { ...this.selectedOptions } });
        this.selectedOptions.tipoServico = value;
        this.backBtn.style.display = 'flex';

        this.showTypingIndicator();
        setTimeout(() => {
            this.hideTypingIndicator();
            if (value === 'Outros') {
                this.currentStep = 'other_text';
                this.addBotMessage('Entendido! Por favor, descreva brevemente como podemos te ajudar:');
                this.showInputArea('Descreva seu assunto...');
            } else {
                this.goToNameStep();
            }
        }, 600);
    }

    goToNameStep() {
        this.currentStep = 'name';
        this.addBotMessage('Excelente! Para iniciarmos seu atendimento, por favor, digite seu **nome**:');
        this.showInputArea('Digite seu nome...');
    }

    handleInputSubmit() {
        const val = this.mainInput.value.trim();
        if (!val) return;

        this.addUserMessage(val);
        this.mainInput.value = '';
        this.history.push({ step: this.currentStep, options: { ...this.selectedOptions } });

        if (this.currentStep === 'other_text') {
            this.selectedOptions.textoOutros = val;
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.goToNameStep();
            }, 600);
        } else if (this.currentStep === 'name') {
            this.selectedOptions.nome = val;
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.showFinishStep();
            }, 600);
        }
    }

    showFinishStep() {
        this.currentStep = 'finish';
        this.inputArea.style.display = 'none';
        this.addBotMessage(`Prazer em te conhecer, **${this.selectedOptions.nome}**! 🙌\n\nClique no botão abaixo para iniciar seu atendimento pelo WhatsApp.`);
        
        const container = document.createElement('div');
        container.className = 'action-buttons';
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.style.cssText = 'background:#25d366; color:#fff; border-color:#25d366; text-align:center; font-weight:bold;';
        btn.innerHTML = '<i class="bi bi-whatsapp"></i> Iniciar Conversa no WhatsApp';
        btn.addEventListener('click', (e) => { e.stopPropagation(); this.sendToWhatsApp(); });
        container.appendChild(btn);
        this.messagesList.appendChild(container);
        this.scrollToBottom();
    }

    goBack() {
        if (this.history.length === 0) return;
        const lastState = this.history.pop();
        this.currentStep = lastState.step;
        this.selectedOptions = lastState.options;

        // Remover as últimas mensagens (usuário e bot)
        const msgs = this.messagesList.querySelectorAll('.message, .action-buttons');
        if (msgs.length >= 2) {
            msgs[msgs.length - 1].remove();
            msgs[msgs.length - 2].remove();
        }

        if (this.currentStep === 'initial') {
            this.showInitialMessage();
            // Limpa a lista para não duplicar
            this.messagesList.innerHTML = '';
            this.showInitialMessage();
        } else if (this.currentStep === 'other_text') {
            this.addBotMessage('Por favor, descreva brevemente como podemos te ajudar:');
            this.showInputArea('Descreva seu assunto...');
        } else if (this.currentStep === 'name') {
            this.addBotMessage('Por favor, digite seu **nome**:');
            this.showInputArea('Digite seu nome...');
        }
        
        if (this.history.length === 0) this.backBtn.style.display = 'none';
    }

    showInputArea(placeholder) {
        this.inputArea.style.display = 'flex';
        this.mainInput.placeholder = placeholder;
        setTimeout(() => this.mainInput.focus(), 300);
        this.scrollToBottom();
    }

    addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        this.messagesList.appendChild(div);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'message user';
        div.textContent = text;
        this.messagesList.appendChild(div);
        this.scrollToBottom();
    }

    scrollToBottom() {
        setTimeout(() => { this.messagesList.scrollTo({ top: this.messagesList.scrollHeight, behavior: 'smooth' }); }, 100);
    }

    showTypingIndicator() { this.typingIndicator.style.display = 'flex'; this.scrollToBottom(); }
    hideTypingIndicator() { this.typingIndicator.style.display = 'none'; }

    sendToWhatsApp() {
        const { nome, tipoServico, textoOutros } = this.selectedOptions;
        let msg = `Olá! Meu nome é ${nome}. `;
        if (tipoServico === 'Outros') {
            msg += `Gostaria de falar sobre: ${textoOutros}. `;
        } else {
            msg += `Gostaria de agendar uma avaliação para ${tipoServico}. `;
        }
        msg += `Vim pelo site da Clínica Karina.`;
        window.open(`https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
    }
}

document.addEventListener('DOMContentLoaded', () => { new AmiltonAssistant(); });
