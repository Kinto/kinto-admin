import { getClient } from "@src/client";
import { useEffect, useState } from "react";

export function useKintoVersion() {
  const [val, setVal] = useState(null);
  const client = getClient();

  const fetchVersion = async () => {
    try {
      let res: Record<string, string> = await client.execute({
        path: "/__version__",
        headers: undefined,
      });
      setVal(res);
    } catch (ex) {
      console.error(ex); // do actual error handling in real version
    }
  };

  useEffect(() => {
    fetchVersion();
  }, []);

  return val;
}
