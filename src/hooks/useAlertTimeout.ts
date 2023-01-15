import { useState, useEffect, Dispatch, SetStateAction } from "react";

type Props = {
  timeout: number;
  setErrorMessage: Dispatch<SetStateAction<string>>;
};

const useAlertTimeout = (props: Props) => {
  const [invalidCode, setInvalidCode] = useState(false);
  useEffect(() => {
    if (invalidCode) {
      setTimeout(() => {
        setInvalidCode(false);
        props.setErrorMessage("");
      }, props.timeout);
    }
  }, [invalidCode, props.timeout, props.setErrorMessage, props]);

  return { invalidCode, setInvalidCode };
};

export default useAlertTimeout;
