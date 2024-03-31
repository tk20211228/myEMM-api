#!/bin/bash

# 現在のタイムスタンプを取得
DEPLOY_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# DEPLOY_TIME環境変数をFirebaseに設定
firebase functions:config:set deploy.time="$DEPLOY_TIME"
# firebase functions:config:get > .runtimeconfig.json
# firebase functions:config:get

# Firebaseにデプロイ
firebase deploy

# オプション: デプロイ後に環境変数をローカルにダウンロード
firebase functions:config:get > .runtimeconfig.json