//import { useEffect, useState } from "react";
//import { api } from "../api/axios";
//
//export default function Dashboard() {
//
//  const [msg, setMsg] = useState("");
//
//  useEffect(() => {
//    api.get("/test") // backend endpoint
//      .then(res => setMsg(res.data))
//      .catch(() => setMsg("Brak dostępu ❌"));
//  }, []);
//
//  return (
//    <div style={{ padding: 50 }}>
//      <h1>Dashboard</h1>
//      <p>{msg}</p>
//    </div>
//  );
//}