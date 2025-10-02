import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  get,
  DataSnapshot,
} from "firebase/database";
import { database } from "../lib/firebase";
import type { User } from "../lib/api";

export function useFirebaseRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize usersRef so the effect doesn't re-run on every render
  const usersRef = useMemo(() => ref(database, "users"), []);

  const handleUserAdded = useCallback((snapshot: DataSnapshot) => {
    const userData = { id: snapshot.key, ...snapshot.val() } as User;
    console.log("User created via Firebase:", userData);
    setUsers((prev) => [userData, ...prev]);
  }, []);

  const handleUserChanged = useCallback((snapshot: DataSnapshot) => {
    const userData = { id: snapshot.key, ...snapshot.val() } as User;
    console.log("User updated via Firebase:", userData);
    setUsers((prev) =>
      prev.map((user) => (user.id === userData.id ? userData : user))
    );
  }, []);

  const handleUserRemoved = useCallback((snapshot: DataSnapshot) => {
    const userData = { id: snapshot.key, ...snapshot.val() } as User;
    console.log("User deleted via Firebase:", userData);
    setUsers((prev) => prev.filter((user) => user.id !== userData.id));
  }, []);

  const handleInitialData = useCallback((snapshot: DataSnapshot) => {
    console.log("handleInitialData");
    const data = snapshot.val();
    if (data) {
      const usersList = Object.entries(data).map(([id, payload]) => ({
        id,
        ...(payload as object),
      })) as User[];
      setUsers(usersList);
    } else {
      setUsers([]);
    }
    setLoading(false);
    setIsConnected(true);
  }, []);

  const handleConnectionState = useCallback((snapshot: DataSnapshot) => {
    setIsConnected(snapshot.exists());
  }, []);

  useEffect(() => {
    console.log("useEffect - setting up Firebase listeners");

    (async () => {
      try {
        const snap = await get(usersRef);
        handleInitialData(snap);
      } catch (error) {
        console.error("Failed to load initial users from Firebase:", error);
        setUsers([]);
        setLoading(false);
      }
    })();

    const unsubscribeChildAdded = onChildAdded(
      usersRef,
      handleUserAdded,
      (err) => {
        console.error("onChildAdded error:", err);
      }
    );

    const unsubscribeChildChanged = onChildChanged(
      usersRef,
      handleUserChanged,
      (err) => {
        console.error("onChildChanged error:", err);
      }
    );

    const unsubscribeChildRemoved = onChildRemoved(
      usersRef,
      handleUserRemoved,
      (err) => {
        console.error("onChildRemoved error:", err);
      }
    );

    const unsubscribeConnection = onValue(
      ref(database, ".info/connected"),
      handleConnectionState,
      (err) => {
        console.error(".info/connected error:", err);
      }
    );

    return () => {
      console.log("useEffect - cleaning up Firebase listeners");
      unsubscribeChildAdded();
      unsubscribeChildChanged();
      unsubscribeChildRemoved();
      unsubscribeConnection();
    };
  }, [
    usersRef,
    handleInitialData,
    handleUserAdded,
    handleUserChanged,
    handleUserRemoved,
    handleConnectionState,
  ]);

  return {
    users,
    isConnected,
    loading,
  };
}
