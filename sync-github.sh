#!/bin/bash
cd /vercel/share/v0-project
git fetch origin main
git reset --hard origin/main
echo "Sincronizado com GitHub com sucesso!"
