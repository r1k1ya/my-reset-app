import { useState, useEffect } from 'react';
import './App.css';

type Log = {
  id: number;
  title: string;
  date: string;
  deleted?: boolean;
  deletedAt?: number;
};

type Task = {
  id: number;
  name: string;
  deleted?: boolean;
  deletedAt?: number;
};

function App() {
  const [logs, setLogs] = useState<Log[]>(() => {
    const saved = localStorage.getItem('logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const [taskName, setTaskName] = useState('');
  const [taskEditingId, setTaskEditingId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<'tasks' | 'logs' | 'trash'>('tasks');

  // logs の保存とゴミ箱自動削除
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

  // tasks の保存とゴミ箱自動削除
  useEffect(() => {
    const now = Date.now();
    const cleanedTasks = tasks.filter((task) => {
      if (task.deleted && task.deletedAt) {
        return now - task.deletedAt < 24 * 60 * 60 * 1000;
      }
      return true;
    });
    if (cleanedTasks.length !== tasks.length) {
      setTasks(cleanedTasks);
    }
    localStorage.setItem('tasks', JSON.stringify(cleanedTasks));
  }, [tasks]);

  // ===== ログ追加・編集 =====
  const handleAddLog = () => {
    if (!title || !date) return;

    if (editingId) {
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

  const handleEditLog = (log: Log) => {
    setTitle(log.title);
    setDate(log.date);
    setEditingId(log.id);
  };

  const handleDeleteLog = (id: number) => {
    setLogs(logs.map(log =>
      log.id === id ? { ...log, deleted: true, deletedAt: Date.now() } : log
    ));
  };

  const handleRestoreLog = (id: number) => {
    setLogs(logs.map(log =>
      log.id === id ? { ...log, deleted: false, deletedAt: undefined } : log
    ));
  };

  const handlePermanentDeleteLog = (id: number) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  // ===== タスク追加・編集 =====
  const handleAddTask = () => {
    if (!taskName) return;

    if (taskEditingId) {
      setTasks(tasks.map(task => task.id === taskEditingId ? { ...task, name: taskName } : task));
      setTaskEditingId(null);
    } else {
      const newTask: Task = {
        id: Date.now(),
        name: taskName
      };
      setTasks([newTask, ...tasks]);
    }

    setTaskName('');
  };

  const handleEditTask = (task: Task) => {
    setTaskName(task.name);
    setTaskEditingId(task.id);
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, deleted: true, deletedAt: Date.now() } : task
    ));
  };

  const handleRestoreTask = (id: number) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, deleted: false, deletedAt: undefined } : task
    ));
  };

  const handlePermanentDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  // ===== フィルタリング =====
  let filteredLogs: Log[] = [];
  let filteredTasks: Task[] = [];

  if (tab === 'logs') {
    const visibleLogs = logs.filter(log => !log.deleted);
    filteredLogs = visibleLogs.filter(
      (log) =>
        log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.date.includes(searchTerm)
    );
  }

  if (tab === 'tasks') {
    const visibleTasks = tasks.filter(task => !task.deleted);
    filteredTasks = visibleTasks.filter(
      (task) => task.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const trashLogs = logs.filter(log => log.deleted);
  const trashTasks = tasks.filter(task => task.deleted);

  return (
    <main className="p-4 space-y-4 bg-gray-900 text-white min-h-screen">
      {/* タブ切り替え */}
      <div className="flex space-x-4">
        <button
          onClick={() => setTab('tasks')}
          className={`px-4 py-2 rounded ${tab === 'tasks' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          タスク管理
        </button>
        <button
          onClick={() => setTab('logs')}
          className={`px-4 py-2 rounded ${tab === 'logs' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          積み上げ記録
        </button>
        <button
          onClick={() => setTab('trash')}
          className={`px-4 py-2 rounded ${tab === 'trash' ? 'bg-blue-500' : 'bg-gray-700'}`}
        >
          ゴミ箱
        </button>
      </div>

      {/* ===== タスク管理 ===== */}
      {tab === 'tasks' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">タスク管理</h1>
          <div className="flex gap-2">
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="例：英文法30分"
              className="border p-2 rounded text-black w-full"
            />
            <button
              onClick={handleAddTask}
              className={`text-white px-4 py-2 rounded ${taskEditingId ? 'bg-green-500' : 'bg-blue-500'}`}
            >
              {taskEditingId ? '保存' : '追加'}
            </button>
          </div>

          {/* 検索欄 */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="タスクを検索"
            className="border p-2 rounded w-full text-black"
          />

          {/* タスク一覧 */}
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div key={task.id} className="p-3 bg-gray-800 rounded flex justify-between">
                <span>{task.name}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTask(task)}
                    className="text-yellow-500 hover:underline"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <p className="text-gray-400 text-center">タスクがありません</p>
            )}
          </div>
        </div>
      )}

      {/* ===== 積み上げ記録 ===== */}
      {tab === 'logs' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">今日の積み上げ</h1>
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
              onClick={handleAddLog}
              className={`text-white px-4 py-2 rounded ${editingId ? 'bg-green-500' : 'bg-blue-500'}`}
            >
              {editingId ? '保存' : '追加'}
            </button>
          </div>

          {/* 検索欄 */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="日付やタイトルで検索"
            className="border p-2 rounded w-full text-black"
          />

          {/* ログ一覧 */}
          <div className="space-y-2">
            {filteredLogs.map(log => (
              <div key={log.id} className="p-3 bg-gray-800 rounded flex justify-between">
                <span>{log.date} | {log.title}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditLog(log)}
                    className="text-yellow-500 hover:underline"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteLog(log.id)}
                    className="text-red-500 hover:underline"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <p className="text-gray-400 text-center">記録がありません</p>
            )}
          </div>
        </div>
      )}

      {/* ===== ゴミ箱 ===== */}
      {tab === 'trash' && (
        <div className="space-y-4">
          <h1 className="text-xl font-bold">ゴミ箱</h1>

          <h2 className="text-lg font-semibold">削除されたタスク</h2>
          {trashTasks.map(task => (
            <div key={task.id} className="p-3 bg-gray-800 rounded flex justify-between">
              <span>{task.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestoreTask(task.id)}
                  className="text-green-500 hover:underline"
                >
                  復元
                </button>
                <button
                  onClick={() => handlePermanentDeleteTask(task.id)}
                  className="text-red-500 hover:underline"
                >
                  完全削除
                </button>
              </div>
            </div>
          ))}
          {trashTasks.length === 0 && <p className="text-gray-400">削除されたタスクはありません</p>}

          <h2 className="text-lg font-semibold">削除された記録</h2>
          {trashLogs.map(log => (
            <div key={log.id} className="p-3 bg-gray-800 rounded flex justify-between">
              <span>{log.date} | {log.title}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRestoreLog(log.id)}
                  className="text-green-500 hover:underline"
                >
                  復元
                </button>
                <button
                  onClick={() => handlePermanentDeleteLog(log.id)}
                  className="text-red-500 hover:underline"
                >
                  完全削除
                </button>
              </div>
            </div>
          ))}
          {trashLogs.length === 0 && <p className="text-gray-400">削除された記録はありません</p>}
        </div>
      )}
    </main>
  );
}

export default App;


