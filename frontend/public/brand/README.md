# Logo do frontend

`hg-industrial.svg` é uma exportação vetorial da logo **Grupo HG Industrial**
presente na segunda página de `docs/imagens/logos_hg/GRUPO HG BM SB EVANORTE.pdf`.
A exportação utiliza a área da marca, sem a margem da página ou o texto externo
de apresentação. As cores, proporções e o desenho da logo foram preservados.

`public/icons/hg.svg`, `hg-192.png` e `hg-512.png` utilizam o símbolo HG do mesmo
arquivo para favicon e instalação da PWA. Os PDFs originais não foram alterados.

A marca aparece na aplicação pelo componente `Brand`, em
`src/components/Layout.tsx`. Para trocar o arquivo, mantenha o mesmo nome ou
ajuste o caminho nesse componente. A imagem é incluída no cache da PWA.
