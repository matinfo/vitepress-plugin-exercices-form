# Exercice complexe — Robocopy et sauvegarde

## Contexte

Vous devez mettre en place une **sauvegarde** avec `robocopy`, en _suivant_ les étapes ci-dessous. Consultez la [documentation Microsoft](https://learn.microsoft.com/windows-server/administration/windows-commands/robocopy) si besoin.

## Préparation

1. Ouvrez une **invite de commande** (`cmd.exe`).
2. Tapez ces trois commandes :

   ```bat
   c:
   mkdir 231_production
   mkdir 231_backup
   ```

   Elles vous placent à la racine du disque C: puis créent les répertoires `231_production` et `231_backup`.
3. Téléchargez [231_production_donnees_a_sauvegarder.zip](/exercises/robocopy/231_production_donnees_a_sauvegarder.zip) et copiez-le dans `C:\231_production`.
4. Décompressez l'archive, puis vérifiez :
   - le nombre de fichiers
   - la présence du dossier `docs`
     - sous-dossier `images`
     - sous-dossier `annexes`

## Questions

Créez un nouveau fichier `bonjour.txt` contenant le mot _bonjour_ :

:::answer-box
:::

Voici la syntaxe de la commande :

```text
Usage : ROBOCOPY source destination [file [file]...] [options]
```

Quelle option copie **tous** les sous-dossiers, même vides ?

:::answer-box
:::

Écrivez la commande complète qui copie `C:\231_production` vers `C:\231_backup` :

:::answer-box code
:::

Quelles options sont valides pour `robocopy` ?

:::answer-box checklist
[] /E
[] /MIR
[] --recursive
[] /Z
:::

Quel code de sortie indique « aucun fichier copié » ?

:::answer-box radio
[] 0
[] 1
[] 8
:::

Complétez le tableau :

| Option | Description |
| ------ | ----------- |
| `/E`   | ?           |
| `/MIR` | ?           |

:::answer-box table Option | Effet | Danger
rows=3
:::

## Script final

Complétez ce script PowerShell :

```powershell
$src = "C:\231_production"
$dst = "C:\231_backup"
robocopy $src $dst /MIR /LOG:backup.log
```

:::answer-box code
:::


::: info La date dans le nom du fichier
`%date%` dépend de la langue et du format régional de Windows. Affichez-la avec `echo %date%` avant de l'utiliser dans un nom de fichier : certains formats contiennent des caractères interdits dans un nom de fichier (comme `/`).
:::

### 6. Miroir

Parfois, les fichiers qui n'existent plus dans la source mais existent encore dans la destination doivent être **effacés de la destination**.

Préparez vos dossiers :

1. Videz le dossier de backup.
2. Exécutez : `robocopy C:\231_production C:\231_backup`
3. Exécutez (ce qui supprime le fichier `planning.jpg` de la source) : `del C:\231_production\planning.jpg`

À partir de ce point, on souhaite que le backup soit **identique à la source**. Quelle commande avez-vous exécutée ?

:::answer-box code
:::

## Étapes numérotées avec réponse

1. Exécutez : `robocopy C:\231_production C:\231_backup`

   :::answer-box
   :::

2. Exécutez (ce qui supprime le fichier `planning.jpg` de la source) : `del C:\231_production\planning.jpg`

   :::answer-box code
   :::
