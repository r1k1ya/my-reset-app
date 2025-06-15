import { useState } from 'react';
import './App.css';

type Log = {
  id: number;
  title: string;
  date: string;
};

function App() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const handleAdd = () => {
    if (!title || !date) return;

    const newLog: Log = {
      id: Date.now(),
      title,
      date,
    };

    setLogs([newLog, ...logs]);
    setTitle('');
    setDate('');
  };

  return (
    <main className="p-4 space-y-4 bg-gray-50 min-h-screen">
      <h1 className="text-xl font-bold">今日の積み上げ</h1>

      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例：英文法の復習"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          追加
        </button>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="p-4 bg-white rounded shadow">
            <p className="text-sm text-gray-500">{log.date}</p>
            <p className="text-lg">{log.title}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

export default App;
