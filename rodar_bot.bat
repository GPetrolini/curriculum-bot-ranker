@echo off
cd /d %~dp0
echo Verificando dependencias...
if not exist node_modules (
  echo Instalando dependencias...
  npm install
)
echo Iniciando aplicacao Electron...
npm start
pause
