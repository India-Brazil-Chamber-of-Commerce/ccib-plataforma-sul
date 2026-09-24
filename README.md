# Plataforma Regional Sul (CCIB)

Painel da Regional Sul da Câmara de Comércio Índia Brasil (CCIB): empresas, serviços, contatos, reuniões, eventos e rotina.

## Como rodar

```bash
npm install
npm run dev     # ambiente local
npm run build   # gera a pasta dist/
```

## Onde os dados ficam

- **Dentro do Claude (Artifact):** usa `window.storage`, compartilhado entre Bianca e Gustavo.
- **Fora do Claude (`npm run dev`):** usa o `localStorage` do navegador. Os dados ficam só naquela máquina.

Os botões de HubSpot e Teams chamam a API do Claude e só funcionam dentro do Claude.

## Estrutura

```
src/
  App.jsx               estado, carregamento/salvamento e layout (cabeçalho e menu)
  tabs/                 uma aba por arquivo
    VisaoGeralTab.jsx
    EmpresasTab.jsx
    ServicosTab.jsx
    ContatosTab.jsx
    ReunioesTab.jsx
    EventosTab.jsx
    RotinaTab.jsx
  components/           peças reutilizáveis (cartões, kanban, campos)
  constants.js          status, responsáveis, tipos e chaves de armazenamento
  data/seeds.js         empresas, eventos, contatos e serviços iniciais
  data/seedMeetings.js  reuniões iniciais (importadas do Teams)
  lib/storage.js        window.storage com alternativa em localStorage
  lib/claude.js         chamadas ao Claude com HubSpot e Microsoft 365 (modelo definido aqui)
  lib/format.js         datas e links de imagem
  lib/factories.js      modelos de registro em branco
  styles.js, styles.css estilos compartilhados
  assets/               logo e fotos dos eventos
```

## Onde editar

| Quero... | Arquivo |
|---|---|
| Adicionar ou corrigir uma empresa inicial | `src/data/seeds.js` (`NOMES_MAPA_ASSOCIADOS`, `ENSURE_MEMBERS`) |
| Adicionar uma reunião fixa | `src/data/seedMeetings.js` |
| Trocar a foto de um evento | `src/assets/eventos/` e `FORCE_EVENT_UPDATES` em `src/data/seeds.js` |
| Mudar status, responsáveis ou tipos de serviço | `src/constants.js` |
| Mudar o layout de uma aba | `src/tabs/<Aba>Tab.jsx` |
| Trocar o modelo do Claude | `CLAUDE_MODEL` em `src/lib/claude.js` |
