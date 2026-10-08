# Plataforma de Compliance (CCIB)

Painel do programa de compliance da Câmara de Comércio Índia Brasil (CCIB): políticas, treinamentos, due diligence, conflitos de interesse, brindes, agentes públicos, Pacto Global, eventos e canais de dúvidas e denúncias.

Segue o mesmo modelo da Plataforma Regional Sul (pasta raiz deste repositório), mas é um site separado, com dados e senha próprios.

## Como rodar

```bash
cd compliance
npm install
npm run dev     # ambiente local
npm run build   # gera a pasta compliance/dist/
```

## Onde os dados ficam

- **Dentro do Claude (Artifact):** usa `window.storage`, compartilhado entre os usuários.
- **Fora do Claude (`npm run dev` ou Vercel):** usa o `localStorage` do navegador. Os dados ficam só naquela máquina.
- Todas as chaves começam com `ccib-compliance-`, então não se misturam com as da Regional Sul.

Os formulários (conflitos, brindes, agentes públicos e dúvidas) gravam o registro na plataforma e enviam um aviso por e-mail via Web3Forms. Denúncias **não** passam pela plataforma: o botão leva direto ao canal independente da SG Compliance.

## Publicação na Vercel

1. Na Vercel, crie um **novo projeto** importando este mesmo repositório.
2. Em **Root Directory**, informe `compliance`.
3. Em **Environment Variables**, cadastre `PLATAFORMA_SENHA` (senha de acesso, diferente da Regional Sul se quiser).
4. Em **Settings > Git > Deploy Hooks**, crie um hook para a branch `main` e cadastre a URL no GitHub em **Settings > Secrets and variables > Actions** com o nome `VERCEL_DEPLOY_HOOK_COMPLIANCE`.

A partir daí, todo push na `main` que mexa em `compliance/` publica a plataforma (`.github/workflows/deploy-vercel-compliance.yml`).

## Estrutura

```
compliance/
  middleware.js          senha de acesso na Vercel (PLATAFORMA_SENHA)
  public/documentos/     PDFs das políticas e modelo de ata de treinamento
  src/
    App.jsx              carregamento/salvamento e layout (menu lateral)
    tabs/                uma aba por arquivo
    components/          SheetTable (planilha editável) e RegistroForm (formulário com e-mail)
    constants.js         chaves de armazenamento, listas de status e cores das etiquetas
    data/seeds.js        dados iniciais, textos do Pacto Global e perguntas frequentes
    lib/                 armazenamento, Web3Forms e utilitários
    styles.css           identidade visual (azul-marinho, dourado e creme)
```

## Onde editar

| Quero... | Arquivo |
|---|---|
| Trocar um PDF de política | `public/documentos/` (mesmo nome) ou o lápis na aba Políticas |
| Mudar status, categorias ou tipos | `src/constants.js` |
| Mudar textos do Pacto Global ou as perguntas frequentes | `src/data/seeds.js` (`PACTO_GLOBAL`, `FAQ`) |
| Mudar o layout de uma aba | `src/tabs/<Aba>Tab.jsx` |
| Trocar o e-mail que recebe os formulários | conta do Web3Forms (`WEB3FORMS_KEY` em `src/constants.js`) |

Os dados iniciais (`src/data/seeds.js`) só entram na primeira vez que a plataforma abre. Depois, valem as edições feitas na própria plataforma.
