# AGENTS.md — Diretrizes de Coesão Técnica e Ética para Assistentes de IA

Este documento é a fonte de verdade para qualquer Agente de Inteligência Artificial (Google Antigravity, Claude Code, Cursor, Copilot, ChatGPT, etc.) ou desenvolvedor humano que interagir com o repositório **"Ancorar - Espaço de Pausa e Respiração"**.

---

## 1. Identidade e Propósito do Projeto

- **Nome**: Ancorar — Espaço de Pausa e Respiração
- **Natureza**: Ferramenta de microintervenção psicoeducativa e respiratória (*mobile-first PWA*).
- **Contexto Institucional Obrigatório**:
  - Projeto de Extensão I — Teorias Comportamentalistas
  - Curso de Psicologia — Centro Universitário do RN (UNI-RN)
  - Docente Responsável: **Profa. Ms. Marianna Lucena**
- **Princípio Ético**: O aplicativo é estritamente preventivo, acadêmico e psicoeducativo. Jamais deve ser posicionado como substituto de psicoterapia clínica ou atendimento emergencial de saúde mental.

---

## 2. Pilares Psicológicos e Metodológicos (Imutáveis)

Qualquer alteração em fluxos de texto ou tela deve preservar rigorosamente estes três pilares:

1. **Modelo Cognitivo-Comportamental (Beck)**:
   - Foco na psicoeducação dos **Pensamentos Automáticos** comuns em momentos de prova/avaliação (*"Não vou lembrar"*, *"Vou falhar"*).
   - Relação clara entre pensamentos automáticos e hiperativação fisiológica no corpo (taquicardia, dispneia, aperto no peito).
2. **Estimulação Vagal e Respiração Pautada (Proporção 3 : 2 : 6)**:
   - **Inspiração**: 3 segundos (oxigenação consciente).
   - **Retenção**: 2 segundos (estabilidade autonômica).
   - **Expiração Longa**: 6 segundos (estímulo do nervo vago e ativação do sistema nervoso parassimpático).
   - *Nunca altere a proporção matemática 3:2:6 sem solicitação explícita fundamentada academicamente.*
3. **Abordagem Compassiva (Inspirada em IFS / Sistemas Familiares Internos)**:
   - Enquadre não patologizante da ansiedade.
   - A ansiedade deve ser compreendida como um mecanismo protetor do corpo que perdeu a calibração momentaneamente, e não como um "inimigo" a ser eliminado agressivamente.

---

## 3. Stack Tecnológica e Arquitetura

- **Frontend**: React 18, Vite, TypeScript (Strict Mode).
- **Estilização**: Tailwind CSS (Dark theme nativo `#090d16`, cores pastéis de transição vagal: `cyan`, `amber`, `emerald`, mobile-first com `100dvh`).
- **Animações**: Framer Motion (círculo respiratório orgânico e transições de tela com `AnimatePresence`).
- **Ícones**: Lucide React.
- **Backend / Armazenamento**: Supabase Cloud (`@supabase/supabase-js`) + Fallback offline resiliente em `localStorage`.
- **Hospedagem & CI/CD**: Netlify (com suporte a deploy via GitHub e Netlify CLI).

---

## 4. Estrutura de Arquivos e Responsabilidades

```
ancorar/
├── .env.example              # Template de variáveis públicas do Supabase
├── netlify.toml              # Regras de build e redirects SPA (/* -> /index.html)
├── supabase_schema.sql       # Script DDL com RLS para a tabela 'sessions'
├── AGENTS.md                 # ESTE GUIA DE COESÃO PARA IA
├── src/
│   ├── types/index.ts        # Tipagem TypeScript (SessionRecord, Step, BreathPhase)
│   ├── lib/supabase.ts       # Cliente Supabase, anon user ID, cache local e sync
│   ├── components/
│   │   ├── Header.tsx        # Credencial UNI-RN e badge de status (Cloud/Offline)
│   │   ├── Footer.tsx        # Rodapé institucional e link do Painel de Extensão
│   │   ├── StepOnboarding.tsx    # Passo 0: Psicoeducação TCC (Beck)
│   │   ├── StepPreCheckin.tsx     # Passo 1: Autoavaliação de tensão pré (escala 1 a 5)
│   │   ├── StepCompassion.tsx     # Passo 2: Acolhimento compassivo (IFS)
│   │   ├── BreathingEngine.tsx    # Passo 3: Motor do timer respiratório 3:2:6 com Web Audio
│   │   ├── StepPostCheckout.tsx   # Passo 4: Reavaliação pós (escala 1 a 5)
│   │   ├── StepSummary.tsx        # Passo 5: Delta de tensão e CTA da pesquisa
│   │   └── AdminDrawer.tsx        # Passo 6: Painel analítico e exportador CSV
│   ├── App.tsx               # Orquestrador do fluxo da microintervenção
│   └── main.tsx              # Ponto de entrada React
```

---

## 5. Regras de Código e Boas Práticas para IAs

1. **TypeScript Rigoroso**:
   - Nunca use `any` descuidado.
   - Elimine variáveis, parâmetros e imports não utilizados (o `tsc -b` falhará o build se houver declarações sem uso).
   - Tipos de ambiente do Vite devem ser preservados em `src/vite-env.d.ts`.
2. **Resiliência a Falhas de Conexão (Offline-First)**:
   - Qualquer operação de gravação de dados DEVE garantir que a sessão seja salva em `localStorage` antes ou paralelamente ao envio para o Supabase.
   - O aplicativo nunca deve quebrar ou impedir o aluno de respirar caso o Supabase caia ou a internet falhe no campus.
3. **Privacidade e LGPD / Ética em Pesquisa**:
   - Apenas coletar identificadores anônimos (`ancorar_anon_user_id` em UUID/hash aleatório).
   - NUNCA coletar nomes, e-mails pessoais, matrículas ou dados identificáveis no banco de dados da aplicação sem autorização prévia do Comitê de Ética.
4. **Segurança de Segredos**:
   - O arquivo `.env` nunca deve ser commitado no Git. Use `.env.example` para referências.
   - Chaves de ambiente do frontend são apenas anon/public keys.

---

## 6. Procedimento Padrão para Deploy e Alterações

Sempre que realizar alterações relevantes no projeto:

1. **Testar Compilação**:
   ```bash
   npm run build
   ```
2. **Garantir Atualização do Git**:
   ```bash
   git add .
   git commit -m "feat/fix: descrição clara"
   git push origin main
   ```
3. **Deploy Automatizado no Netlify**:
   - Caso solicitado pelo usuário, utilize a Netlify CLI diretamente:
   ```bash
   export PATH="/opt/homebrew/bin:$PATH"
   netlify env:set VITE_SUPABASE_URL "<url>"
   netlify env:set VITE_SUPABASE_ANON_KEY "<key>"
   npm run build
   netlify deploy --prod --dir=dist
   ```

---

> **Aviso aos Agentes de IA**: Antes de propor refatorações drásticas, consulte este arquivo. Preserve o tom compassivo dos textos em português brasileiro e o layout mobile-first focado no bem-estar do aluno universitário.
