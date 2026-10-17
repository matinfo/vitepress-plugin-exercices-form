---
title: "3.2 - Sauvegarde avec Robocopy"
---

# Exercice 3.2 : sauvegarde de fichiers avec Robocopy

*Faire un backup de fichiers locaux vers un autre dossier avec les commandes de base de Windows.*

<div class="badge-list">
  <span class="badge c2">Individuel</span>
  <span class="badge c3">45 min minimum</span>
  <span class="badge c4">Windows — invite de commande</span>
</div>

## Objectifs

Être capable de :

- ouvrir l'**aide intégrée** aux commandes dans une invite de commande ;
- effectuer une **copie de dossiers et de sous-dossiers** ;
- activer la **journalisation**.

## Prérequis

- Chapitre [3 - Sauvegarde des données](/thematiques/3-sauvegarde-donnees/).
- Répertoires de travail : `C:\231_production` et `C:\231_backup` (à créer, voir ci-dessous).
- Moyen d'aide autorisé : **uniquement l'aide intégrée** aux commandes, accessible avec `/?`.
- À produire : les commandes utilisées et les réponses aux questions.

## Informations générales

Lorsque nous faisons une sauvegarde, il est important d'**automatiser** les tâches. Une sauvegarde qui dépend de la rigueur de l'administrateur système est une mauvaise sauvegarde.

### Rappel des commandes

Cet exercice utilise les commandes de base suivantes de Windows :

| Commande | Rôle |
|---|---|
| `robocopy` | copie des fichiers de façon robuste |
| `mkdir` | crée (*make*) des répertoires (*directories*) |
| `rmdir` | supprime (*remove*) des répertoires |
| `cd` | change de répertoire (*change directory*) |
| `dir` | affiche le contenu du répertoire |
| `%date%` | variable d'environnement contenant la date actuelle |
| `tar -xf` | décompresse un fichier ZIP |
| `del` | supprime un fichier |
| `echo` | affiche un texte ; avec `>` il crée un fichier contenant ce texte |

::: tip Ligne de commande
En utilisant ces commandes plutôt que l'interface graphique, vous serez capable d'**automatiser** votre travail. Utilisez-les autant que possible.
:::

## Mise en place

1. Ouvrez une **invite de commande** (`cmd.exe`).
2. Tapez ces trois commandes :

   ```bat
   c:
   mkdir 231_production
   mkdir 231_backup
   ```

   Elles vous placent à la racine du disque C: puis créent les répertoires `231_production` et `231_backup`.
3. Téléchargez [231_production_donnees_a_sauvegarder.zip](/exercises/robocopy/231_production_donnees_a_sauvegarder.zip) et copiez-le dans `C:\231_production` depuis l'explorateur de fichiers.
4. Déplacez-vous dans le répertoire et décompressez l'archive :

   ```bat
   cd c:\231_production
   tar -xf 231_production_donnees_a_sauvegarder.zip
   ```

::: warning Vérifiez le résultat
Après décompression, des fichiers (`planning.jpg`, `bonjour.txt`, …) et des dossiers (`VMs`, `powerpoint_asset`, `un_dossier_vide`) doivent apparaître **directement** dans `C:\231_production`. Contrôlez avec `dir`.
:::

## La syntaxe

La commande `robocopy /?` affiche une page d'aide. On y apprend que la syntaxe est :

```text
Usage : ROBOCOPY source destination [file [file]...] [options]
```

Il faut donc toujours écrire le nom de la commande, puis la **source** (chemin du répertoire à copier), puis la **destination** (chemin du répertoire qui contiendra la copie).

> **Question.** Que signifient « [ » et « ] » dans cette syntaxe ?

:::answer-box
:::

## Questions

::: danger Important
Entre chaque question, effacez le contenu du dossier de backup :

```bat
rmdir "C:\231_backup" /S
mkdir "C:\231_backup"
```
:::

### 1. Première copie

Lancez votre première commande `robocopy` (sans option) :

```bat
robocopy c:\231_production c:\231_backup
```

- Quelles sont les **options par défaut** de `robocopy` ? Expliquez ce qu'elles font.
- Que signifie « `Files : *.*` » ?

:::answer-box
:::

### 2. Copier uniquement les nouveaux fichiers (exclure les anciens)

Créez un nouveau fichier `bonjour.txt` contenant le mot *bonjour* :

```bat
echo bonjour > bonjour.txt
```

Saisissez la commande `robocopy` que vous avez utilisée pour ne copier que les nouveaux fichiers.

:::answer-box code
:::

### 3. Copier tous les fichiers, les répertoires et les sous-répertoires

Vous avez peut-être constaté que seuls les fichiers avaient été copiés, et que les dossiers et sous-dossiers avaient été ignorés. Quelle commande copie les fichiers, **tous** les répertoires et leurs sous-répertoires ?

:::answer-box code
:::

### 4. Copier tous les fichiers et répertoires, en excluant un répertoire

On souhaite exclure le dossier `C:\231_production\VMs` de la copie. Quelle commande utiliser ?

:::answer-box code
:::

### 5. Journalisation

Une tâche automatique doit produire un **compte rendu** des opérations effectuées, afin que l'administrateur puisse corriger si nécessaire.

Reprenez la commande de la question 4 et activez la journalisation (*log*). Le fichier de log doit s'appeler `bck_dateactuelle.log` et être placé dans le répertoire `c:\231_backup_logs`. Quelles commandes avez-vous utilisées ?

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

### 7. Règle 3-2-1

Selon vous, votre backup respecte-t-il les principes « **3-2-1** » ? Expliquez votre réponse et proposez des améliorations.

:::answer-box
:::

## Pour aller plus loin

Deux exercices supplémentaires, avec les mêmes dossiers :

1. Copier **tous les fichiers sauf** ceux dont l'extension est `*.jpg`. Quelle commande ?

:::answer-box code
:::

2. Copier tous les fichiers et **uniquement les répertoires non vides**. Quelle commande ?

:::answer-box code
:::
