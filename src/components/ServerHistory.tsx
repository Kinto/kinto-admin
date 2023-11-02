import React, { useState, useCallback } from "react";

import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { ANONYMOUS_AUTH } from "../constants";

import { debounce } from "../utils";

const anonymousAuthData = server => ({
  authType: ANONYMOUS_AUTH,
  server: server,
});

type ServerHistoryProps = {
  id: string;
  value: string;
  placeholder: string;
  options: any;
  onChange: (s: string) => void;
};

export default function ServerHistory(props: ServerHistoryProps) {
  const [value, setValue] = useState(props.value);

  const select = useCallback(
    server => event => {
      event.preventDefault();
      props.onChange(server);
      debouncedFetchServerInfo(server);
      setValue(server);
    },
    [props]
  );

  const clear = useCallback(
    event => {
      event.preventDefault();
      const { clearServers } = props.options;
      clearServers();
    },
    [props]
  );

  const onServerChange = useCallback(
    event => {
      const server = event.target.value;
      props.onChange(server);
      // Do not try to fetch server info if the field value is invalid.
      if (server && event.target.validity && event.target.validity.valid) {
        debouncedFetchServerInfo(server);
      }
      setValue(server);
    },
    [props]
  );

  const fetchServerInfo = useCallback(
    server => {
      // Server changed, request its capabilities to check what auth methods it supports.
      const { getServerInfo, serverChange } = props.options;
      serverChange();
      getServerInfo(anonymousAuthData(server));
    },
    [props]
  );

  const debouncedFetchServerInfo = useCallback(debounce(fetchServerInfo, 500), [
    fetchServerInfo,
  ]);

  const { id, placeholder, options } = props;
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
      />
      <DropdownButton
        as={InputGroup.Append}
        variant="outline-secondary"
        title="Servers"
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
