#!/bin/bash
# Script de sincronización: WSL → Windows
# Flujo oficial: Desarrollo en Linux, sincronización a Windows
rsync -av --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='*.db' \
  --exclude='prisma/dev.db-journal' \
  --exclude='.env.local' \
  --exclude='uploads/citas/*' \
  "/home/yeison_r/innovar-security/" \
  "/mnt/c/innovar security/"
echo "Sincronización completada: WSL → Windows"
