import { useState, useEffect } from "react";

type Props = {
  timeout: number;
};

const useAlertTimeout = (props: Props) => {
  const [invalidCode, setInvalidCode] = useState(false);
  useEffect(() => {
    if (invalidCode) {
      setTimeout(() => {
        setInvalidCode(false);
      }, props.timeout);
    }
  }, [invalidCode, props.timeout]);

  return { invalidCode, setInvalidCode };
};

export default useAlertTimeout;
