import { useState, useEffect } from 'react';
import './App.css';

type Log = {
  id: number;
  title: string;
  date: string;
  deleted?: boolean;
  deletedAt?: number;
};

function App() {
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'main' | 'trash'>('main'); // タブ状態

  // logs が変わるたびに localStorage に保存 & 24時間経過したゴミ箱項目を自動削除
  useEffect(() => {
    const now = Date.now();
    const cleanedLogs = logs.filter((log) => {
      if (log.deleted && log.deletedAt) {
        return now - log.deletedAt < 24 * 60 * 60 * 1000;
      }
      return true;
    });
    if (cleanedLogs.length !== logs.length) {
      setLogs(cleanedLogs);
    }
    localStorage.setItem('logs', JSON.stringify(cleanedLogs));
  }, [logs]);

  const handleAdd = () => {
    if (!title || !date) return;

    if (editingId) {
      // 編集モード
      setLogs(logs.map(log => log.id === editingId ? { ...log, title, date } : log));
      setEditingId(null);
    } else {
      const newLog: Log = {
        id: Date.now(),
        title,
        date,
      };
      setLogs([newLog, ...logs]);
    }

    setTitle('');
    setDate('');
  };

  const handleEdit = (log: Log) => {
    setTitle(log.title);
    setDate(log.date);
    setEditingId(log.id);
  };

  // ゴミ箱に移動
  const handleDelete = (id: number) => {
    setLogs(logs.map(log =>
      log.id === id ? { ...log, deleted: true, deletedAt: Date.now() } : log
    ));
  };

  // ゴミ箱 → 復元
  const handleRestore = (id: number) => {
    setLogs(logs.map(log =>
      log.id === id ? { ...log, deleted: false, deletedAt: undefined } : log
    ));
  };

  // ゴミ箱 → 完全削除
  const handlePermanentDelete = (id: number) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  // 表示するログ（タブによって切替）
  const visibleLogs = tab === 'main'
    ? logs.filter(log => !log.deleted)
    : logs.filter(log => log.deleted);

  // 検索フィルター
  const filteredLogs = visibleLogs.filter(
    (log) =>
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.includes(searchTerm)
  );

  return (
    <main className="p-4 space-y-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-xl font-bold">今日の積み上げ</h1>

      {/* タブ切り替え */}
      <div className="flex space-x-4">
        <button
          onClick={() => setTab('main')}
          className={`px-4 py-2 rounded ${tab === 'main' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          メイン
        </button>
        <button
          onClick={() => setTab('trash')}
          className={`px-4 py-2 rounded ${tab === 'trash' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          ゴミ箱
        </button>
      </div>

      {/* 入力フォーム（メインタブのみ表示） */}
      {tab === 'main' && (
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border p-2 rounded text-black"
          />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="例：英文法の復習"
            className="border p-2 rounded w-full text-black"
          />
          <button
            onClick={handleAdd}
            className={`text-white px-4 py-2 rounded ${editingId ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {editingId ? '保存' : '追加'}
          </button>
        </div>
      )}

      {/* 検索欄 */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="日付やタイトルで検索"
          className="border p-2 rounded w-full text-black"
        />
      </div>

      {/* ログ表示 */}
      <div className="space-y-2">
        {filteredLogs.map((log) => (
          <div key={log.id} className="p-4 bg-gray-800 rounded shadow">
            <div className="flex flex-row items-center space-x-4">
              <span className="text-sm text-gray-400">{log.date}</span>
              <span className="text-gray-500">|</span>
              <span className="text-lg">{log.title}</span>
            </div>
            <div className="flex space-x-2">
              {tab === 'main' ? (
                <>
                  <button
                    onClick={() => handleEdit(log)}
                    className="text-yellow-500 hover:underline"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleRestore(log.id)}
                    className="text-green-500 hover:underline"
                  >
                    復元
                  </button>
                  <button
                    onClick={() => handlePermanentDelete(log.id)}
                    className="text-red-500 hover:underline"
                  >
                    完全削除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filteredLogs.length === 0 && (
          <p className="text-gray-400 text-center">データがありません</p>
        )}
      </div>
    </main>
  );
}

export default App;

