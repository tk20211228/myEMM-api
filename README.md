"# myEMM-api" 

# プロジェクトの概要

このプロジェクトは、FirebaseとGoogleのEMM (Enterprise Mobility Management) APIを使用して、ユーザー管理とデバイス管理を行うためのバックエンドシステムです。

主な機能：

- ユーザーのログイン情報の記録
- デバイスのリスト表示
- ポリシーの作成
- 企業の作成
- メッセージの送信
- アナウンスメントの取得、作成、更新、削除

# プロジェクトの構成

プロジェクト構成：

- controllers: 各種機能を実装したコントローラーが格納されています。例えば、ユーザーのログイン情報を記録する`usersController.js`や、デバイスのリストを表示する`devicesListController.js`などがあります。
- models: データベースのスキーマやモデルを管理します。例えば、ユーザーモデルを定義した`userModel.js`があります。
- routes: ルーティングを管理します。
- middleware: ミドルウェアを管理します。メモリ使用量を表示する`printMemoryUsage.js`などがあります。
- `.firebaserc`: Firebaseプロジェクトの設定が記述されています。


