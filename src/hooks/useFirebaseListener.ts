import { useEffect, useRef } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";

export function useFirebaseListener(path: string, callback: (data: any) => void) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const dbRef = ref(database, path);
    const handler = onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      callbackRef.current(data);
    });

    return () => {
      off(dbRef, "value", handler);
    };
  }, [path]);
}
