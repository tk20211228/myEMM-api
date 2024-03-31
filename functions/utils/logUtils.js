function generateDetailLog({ collectionName, docId, actionName, nextData, prevData, error, ...extraData}) {
  return {
    actionName: actionName ? actionName : null,
    collectionName: collectionName ? collectionName : null,
    docId: docId ? docId : null,
    error: error ? JSON.stringify(error) : null,
    nextData: nextData ? nextData : null,
    prevData: prevData ? prevData : null,
    ...extraData, // 追加データをオブジェクトに展開
  };
}

module.exports = { generateDetailLog };