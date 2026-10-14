"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { db } from "@/lib/firebase";
import { Todo } from "@/types/todo";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const { filter } = useSelector((state: RootState) => state.ui);

  // [과제 4] onSnapshot으로 "todos" 컬렉션을 실시간 구독합니다.
  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Todo[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Todo, "id">),
      }));
      setTodos(data);
    });

    // 컴포넌트가 사라질 때 구독을 해제합니다.
    return () => unsubscribe();
  }, []);

  // [과제 6] 완료/미완료 토글
  const handleToggle = async (todo: Todo) => {
    const todoRef = doc(db, "todos", todo.id);

    await updateDoc(todoRef, {
      isDone: !todo.isDone,
    });
  };

  // [선택 과제] 항목 삭제
  const handleDelete = async (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation(); // li의 토글 클릭 이벤트가 함께 실행되지 않도록 막습니다.

    const todoRef = doc(db, "todos", todo.id);
    await deleteDoc(todoRef);
  };

  // Redux filter 상태로 목록을 필터링합니다.
  const filtered = todos.filter((t) => {
    if (filter === "진행 중") return !t.isDone;
    if (filter === "완료") return t.isDone;
    return true; // 'all'
  });

  return (
    <ul style={{ listStyle: "none", padding: 0 }}>
      {filtered.map((todo) => (
        <li
          key={todo.id}
          onClick={() => handleToggle(todo)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "14px 18px",
            marginBottom: "10px",
            backgroundColor: "white",
            border: "1px solid #eee",
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
            textDecoration: todo.isDone ? "line-through" : "none",
            opacity: todo.isDone ? 0.5 : 1,
          }}
        >
          <span>{todo.isDone ? "✅" : "⬜"}</span>
          <span style={{ flex: 1 }}>{todo.text}</span>
          <button
            type="button"
            onClick={(e) => handleDelete(e, todo)}
            style={{
              background: "none",
              border: "none",
              color: "#e55",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            🗑
          </button>
        </li>
      ))}
      {filtered.length === 0 && (
        <p style={{ textAlign: "center", color: "#aaa" }}>항목이 없습니다.</p>
      )}
    </ul>
  );
}
