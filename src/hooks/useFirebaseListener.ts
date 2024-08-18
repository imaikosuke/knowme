import { useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/lib/firebase";

export function useFirebaseListener(path: string, callback: (data: any) => void) {
  useEffect(() => {
    const dbRef = ref(database, path);
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      callback(data);
    });

    return () => {
      off(dbRef);
    };
  }, [path, callback]);
}
