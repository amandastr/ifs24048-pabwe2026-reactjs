import { useState, useCallback } from "react";

// Mengembalikan [value, onChange, setValue]
const useInput = (defaultValue = "") => {
  const [value, setValue] = useState(defaultValue);

  const onChange = useCallback((event) => {
    setValue(event.target.value);
  }, []);

  return [value, onChange, setValue];
};

export default useInput;