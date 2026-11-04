# Ancorar - Espaço de Pausa e Respiração 🌿

Ferramenta psicoeducativa de microintervenção desenvolvida para o **Projeto de Extensão I - Teorias Comportamentalistas** do **Curso de Psicologia do UNI-RN**, sob orientação da **Profa. Ms. Marianna Lucena**.

---

## 🧠 Fundamentação Psicológica e Fisiológica

1. **Modelo Cognitivo-Comportamental (Beck)**: Intervenção psicoeducativa com foco nos Pensamentos Automáticos intrusivos em momentos avaliativos (*"Não vou lembrar"*, *"Vou falhar"*), conectando pensamentos à resposta fisiológica.
2. **Estimulação Vagal e Respiração Pautada (3:2:6)**:
   - **Inspiração (3s)**: Oxigenação consciente.
   - **Retenção (2s)**: Equilíbrio autonômico.
   - **Expiração Prolongada (6s)**: Ativação efetiva do sistema nervoso parassimpático e desaceleração cardíaca.
3. **Abordagem Compassiva (Inspirada em IFS / Sistemas Familiares Internos)**: Enquadre não patologizante da ansiedade — reconhecendo-a como um sistema corporal protetor e acolhedor, em vez de um inimigo.

---

## 🛠️ Tecnologias Utilizadas

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** (Design Mobile-First com suporte a `100dvh` e Glassmorphism)
- **Framer Motion** (Transições fluidas e ondas orgânicas do motor de respiração)
- **Lucide React** (Ícones semânticos)
- **Supabase Cloud + Fallback Offline Resiliente** (Sincronização com nuvem ou persistência em `localStorage`)
- **Canvas Confetti** (Feedback positivo na reavaliação de tensão)

---

## 🚀 Como Rodar o Projeto Localmente

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Configuração de Variáveis de Ambiente**:
   O arquivo `.env` já vem pré-configurado com as credenciais do Supabase:
   ```env
   VITE_SUPABASE_URL=https://pgwpydahkdtngghyjedd.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_RE7Z6o13iGD3Ghjn2S6rGA_nnwFcGaq
   VITE_SURVEY_URL=https://forms.gle/exemplo-questionario-unirn
   ```

3. **Executar em modo de desenvolvimento**:
   ```bash
   npm run dev
   ```

4. **Gerar Build de Produção**:
   ```bash
   npm run build
   ```

---

## 📊 Banco de Dados & Script SQL

O schema da tabela `sessions` com Row Level Security (RLS) habilitado está disponível no arquivo [`supabase_schema.sql`](file:///Users/noki/Documents/repo/ancorar/supabase_schema.sql).

---

## 📋 Painel de Extensão e Exportação de Dados

Acessível pelo botão de escudo no cabeçalho ou pelo link no rodapé:
- Total de sessões concluídas e usuários únicos
- Nível médio de pré-tensão vs. pós-tensão
- Porcentagem de eficácia na redução de ansiedade
- **Exportação com 1 clique de arquivo CSV** formatado para o Relatório Final de Extensão do UNI-RN.
