function printMemoryUsage(req, res, next) {
  const usage = process.memoryUsage();
  console.log(`[Before] Heap Total: ${usage.heapTotal / 1024 / 1024} MB`);
  console.log(`[Before] Heap Used: ${usage.heapUsed / 1024 / 1024} MB`);
  console.log(`[Before] RSS: ${usage.rss / 1024 / 1024} MB`);

  // next()を呼び出してリクエストを次のミドルウェアに渡す
  next();

  res.on("finish", () => {
    // レスポンスが送信された後のメモリ使用量を記録
    const usageAfter = process.memoryUsage();

    // JavaScriptのヒープの合計サイズをメガバイト(MB)で表示します。
    // ヒープは動的に確保されたメモリのプールで、オブジェクト、文字列、閉じ込め（クロージャ）、その他の複合的なタイプが格納されます。
    // この値は、ヒープの全体的な大きさを示しますが、全てがアクティブに使用されているわけではありません。
    // console.log(`[After] Heap Total: ${usageAfter.heapTotal / 1024 / 1024} MB`);

    // ヒープのうち、実際に使用されているメモリの量をメガバイト(MB)で表示します。
    // これは、アプリケーションが現在保持しているオブジェクト、文字列、その他の値によって消費されるメモリ量を示します。
    // console.log(`[After] Heap Used: ${usageAfter.heapUsed / 1024 / 1024} MB`);

    // Resident Set Size（RSS）は、プロセスが物理メモリで占めている合計の空間をメガバイト(MB)で表示します。
    // これには、コード自体、その依存関係、スタック、ヒープなどが含まれます。
    // console.log(`[After] RSS: ${usageAfter.rss / 1024 / 1024} MB`);
  });
}

module.exports = printMemoryUsage;
