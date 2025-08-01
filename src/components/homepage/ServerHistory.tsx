import { ANONYMOUS_AUTH } from "@src/constants";
import { clearServersHistory } from "@src/hooks/servers";
import { debounce } from "@src/utils";
import React, { useCallback, useMemo, useState } from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";

const anonymousAuthData = server => ({
  authType: ANONYMOUS_AUTH,
  server: server,
});

interface ServerHistoryProps {
  disabled?: boolean;
  id: string;
  value: string;
  placeholder: string;
  options: any;
  onChange: (s: string) => void;
}

const debounceMillis = 400;

export default function ServerHistory(props: ServerHistoryProps) {
  const [value, setValue] = useState(props.value);

  const fetchServerInfo = useCallback(
    server => {
      // Server changed, request its capabilities to check what auth methods it supports.
      const { getServerInfo, serverChange } = props.options;
      props.onChange(server);
      serverChange();
      getServerInfo(anonymousAuthData(server));
    },
    [props]
  );
  const debouncedFetchServerInfo = useMemo(
    () => debounce(fetchServerInfo, debounceMillis),
    [fetchServerInfo]
  );

  const select = useCallback(
    server => event => {
      event.preventDefault();
      props.onChange(server);
      debouncedFetchServerInfo(server);
      setValue(server);
    },
    [props, debouncedFetchServerInfo]
  );

  const clear = useCallback(event => {
    event.preventDefault();
    clearServersHistory();
  }, []);

  const onServerChange = useCallback(
    event => {
      const server = event.target.value;
      setValue(server);

      // Do not try to fetch server info if the field value is invalid.
      if (server && event.target.validity?.valid) {
        debouncedFetchServerInfo(server);
      }
    },
    [debouncedFetchServerInfo]
  );

  const { id, placeholder, options, disabled = false } = props;
  const { servers, pattern } = options;

  return (
    <InputGroup>
      <FormControl
        type="text"
        id={id}
        placeholder={placeholder}
        pattern={pattern}
        value={value}
        onChange={onServerChange}
        disabled={disabled}
      />
      <DropdownButton
        as={InputGroup.Append}
        variant="outline-secondary"
        title="Servers"
        disabled={disabled}
      >
        {servers.length === 0 ? (
          <Dropdown.Item>
            <em>No server history</em>
          </Dropdown.Item>
        ) : (
          servers.map(({ server }, key) => (
            <Dropdown.Item key={key} onClick={select(server)}>
              {server}
            </Dropdown.Item>
          ))
        )}
        <Dropdown.Divider />
        <Dropdown.Item href="#" onClick={clear}>
          Clear
        </Dropdown.Item>
      </DropdownButton>
    </InputGroup>
  );
}
