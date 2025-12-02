# EcoTrack - Projeto

Este projeto é uma versão de teste do EcoTrack com:

- Servidor Express em TypeScript
- Banco de dados SQLite para dispositivos
- APIs para calcular consumo da casa e de uma fazenda de mineração de Bitcoin
- Frontend simples em HTML/CSS que consome as APIs

Como usar:
1. `npm install`
2. `npm run dev` (desenvolvimento com ts-node) ou `npm run build && npm start`
3. Abra `http://localhost:3001`

Observações:
- O arquivo do banco fica em `data/ecotrack.db`.
- As páginas estão em `src/pages` e o CSS em `src/public/css`.
