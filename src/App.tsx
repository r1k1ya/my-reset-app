import { useState, useEffect } from 'react';
import './App.css';

type Log = {
  id: number;
  title: string;
  date: string;
};

function App() {
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null); // 編集中のID
　const [searchTerm, setSearchTerm] = useState('');

  // 初回読み込み時に localStorage からデータ取得
  /*
  useEffect(() => {
    const savedLogs = localStorage.getItem('logs');
    console.log("読み込んだデータ:", savedLogs);
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);
  */

  // logs が変わるたびに localStorage に保存
  useEffect(() => {
    console.log("保存するデータ:", logs);
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  const handleAdd = () => {
    if (!title || !date) return;

      if (editingId) {
        // 編集モードなら更新
        setLogs(logs.map(log => 
          log.id === editingId ? { ...log, title, date } : log
        ));
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

  const handleDelete = (id: number) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  // 検索フィルター
  const filteredLogs = logs.filter(
    (log) =>
      log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.includes(searchTerm)
  );

  return (
    <main className="p-4 space-y-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-xl font-bold">今日の積み上げ</h1>

      {/* 入力フォーム */}
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

      {/* 検索欄 */}
      <div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="日付やタイトルで検索"
          className="border p-2 rounded w-full"
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
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;

