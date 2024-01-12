// models: データベースのスキーマやモデルを管理します。
// 各モデルは特定のリソース（ユーザーやメッセージなど）のデータ構造を定義します。
// しかし、Firebase Firestore のような NoSQL データベースを使用している場合、固定のスキーマやモデルを定義する必要はありません。
// そのため、userModel.js の作成は不要かもしれません。
// ただし、一貫性を保つためや、特定のフィールドが必ず存在することを保証するために、モデルを使用することは依然として有用です。

exports.User = ({
  id,
  pass = null,
  uid,
  fcmToken,
  fcmError,
  firstName = null,
  lastName = null,
  icon = null,
  isDisabled = false,
  isDeleted = false,
  createdAt,
  updatedAt,
  lastLoginAt,
}) => {
  return {
    id,
    pass,
    uid,
    lastFcmToken: fcmToken,
    fcmError,
    firstName,
    lastName,
    icon,
    isDisabled, // アカウントを無効化フィールド
    isDeleted, // アカウントを削除フィールド
    createdAt,
    updatedAt,
    lastLoginAt,
  };
};
