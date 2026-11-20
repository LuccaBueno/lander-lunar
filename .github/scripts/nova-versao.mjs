// Publica uma versão nova do jogo.
// Uso: npm run versao 1.0.1 "Novo modo de jogo e correções no rover."
// Atualiza o número da versão, faz o commit, cria a tag v1.0.1 com as novidades e envia ao GitHub.
// O GitHub Actions gera o instalador e publica a Release; os jogos instalados passam a ver a atualização,
// e as novidades aparecem para o jogador na tela de atualização.
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const v = (process.argv[2] || '').replace(/^v/, '');
const novidades = (process.argv.slice(3).join(' ') || 'Melhorias e correções.').trim();
if (!/^\d+\.\d+\.\d+$/.test(v)) {
  console.error('Informe a versão no formato 1.2.3. Exemplo: npm run versao 1.0.1 "Novidades desta versão."');
  process.exit(1);
}

const git = (...args) => execFileSync('git', args, { stdio: 'inherit' });
const status = execFileSync('git', ['status', '--porcelain']).toString().trim();
if (status) {
  console.error('Há alterações sem commit. Faça o commit delas antes de publicar uma versão:\n' + status);
  process.exit(1);
}

const confPath = 'src-tauri/tauri.conf.json';
const conf = JSON.parse(readFileSync(confPath, 'utf8'));
const atual = conf.version;
const maior = (a, b) => { const x = a.split('.').map(Number), y = b.split('.').map(Number); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i]; return false; };
if (!maior(v, atual)) {
  console.error(`A versão nova (${v}) precisa ser maior que a atual (${atual}); senão os jogos instalados não enxergam a atualização.`);
  process.exit(1);
}

conf.version = v;
writeFileSync(confPath, JSON.stringify(conf, null, 2) + '\n');

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.version = v;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
lock.version = v;
if (lock.packages && lock.packages['']) lock.packages[''].version = v;
writeFileSync('package-lock.json', JSON.stringify(lock, null, 2) + '\n');

const cargoPath = 'src-tauri/Cargo.toml';
writeFileSync(cargoPath, readFileSync(cargoPath, 'utf8').replace(/^version = ".*"$/m, `version = "${v}"`));

git('add', confPath, 'package.json', 'package-lock.json', cargoPath);
git('commit', '-m', `Versão ${v}`);
git('tag', '-a', `v${v}`, '-m', novidades);
git('push');
git('push', 'origin', `v${v}`);
console.log(`\nVersão ${v} enviada. O instalador fica pronto em cerca de 10 minutos:`);
console.log('https://github.com/LuccaBueno/lander-lunar/actions');
