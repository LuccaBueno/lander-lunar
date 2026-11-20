// Usado pelo GitHub Actions depois do build.
// Copia o instalador com um nome fixo e gera o latest.json que o botão "Verificar atualização" consulta.
// Resultado em release/:
//   Lander-Lunar-Instalador.exe   o instalador (nome fixo, para o link de download nunca mudar)
//   latest.json                   versão, novidades, assinatura e link do instalador
//   notas.md                      texto da página da Release
import { readFileSync, writeFileSync, readdirSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = 'LuccaBueno/lander-lunar';
const NOME = 'Lander-Lunar-Instalador.exe';

const tag = process.env.TAG || '';
const conf = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
const versao = conf.version;
if (tag !== 'v' + versao) {
  console.error(`A tag (${tag}) não bate com a versão em src-tauri/tauri.conf.json (${versao}). Use "npm run versao X.Y.Z" para publicar.`);
  process.exit(1);
}

const pasta = 'src-tauri/target/release/bundle/nsis';
const exe = readdirSync(pasta).find(f => f.endsWith('-setup.exe'));
if (!exe) { console.error('Instalador não encontrado em ' + pasta); process.exit(1); }
const assinatura = readFileSync(join(pasta, exe + '.sig'), 'utf8').trim();

let novidades = (process.env.NOVIDADES || '').trim();
if (!novidades || novidades === tag) novidades = 'Melhorias e correções.';

mkdirSync('release', { recursive: true });
copyFileSync(join(pasta, exe), join('release', NOME));

const url = `https://github.com/${REPO}/releases/download/${tag}/${NOME}`;
const plataforma = { signature: assinatura, url };
writeFileSync('release/latest.json', JSON.stringify({
  version: versao,
  notes: novidades,
  pub_date: new Date().toISOString(),
  platforms: { 'windows-x86_64-nsis': plataforma, 'windows-x86_64': plataforma },
}, null, 2));

writeFileSync('release/notas.md', `## Novidades

${novidades}

## Como instalar

1. Clique em **${NOME}**, logo abaixo, para baixar.
2. Abra o arquivo baixado e siga o instalador.
3. Se aparecer "O Windows protegeu o computador", clique em **Mais informações** e depois em **Executar assim mesmo**.

Já tem o jogo? Atualize por dentro dele: **Configurações > Verificar atualização**.

<sub>Os arquivos "Source code" são o código-fonte, criados automaticamente pelo GitHub; para jogar você não precisa deles.</sub>
`);

console.log(`Release ${tag} pronta: release/${NOME} e release/latest.json`);
