import React from "react";
import { ChevronDown } from "react-bootstrap-icons";

interface InputWithDropdownProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: string[][];
  dropDownTitle?: string;
  icon?: React.ReactNode;
  onValuePicked?: (value: string) => void;
}

export default function InputWithDropdown({
  options,
  dropDownTitle,
  icon = <ChevronDown />,
  onValuePicked,
  ...rest
}: InputWithDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Simple keyboard support
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => {
        const first = listRef.current?.querySelector(
          '[role="menuitem"]'
        ) as HTMLElement | null;
        first?.focus();
      }, 0);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const selectItem = (opt: string) => {
    onValuePicked?.(opt);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="position-relative" style={{ maxWidth: 420 }}>
      <input
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="input-dropdown-menu"
        {...rest}
        value={rest.value ?? ""}
        className={`${rest.className ?? ""} form-control px-2`}
        onChange={e => selectItem(e.target.value)}
      />

      {/* Icon button inside the input */}
      <button
        ref={buttonRef}
        type="button"
        aria-label="Open suggestions"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => {
          if (!rest.disabled) {
            setOpen(o => !o);
          }
        }}
        className="btn p-0 border-0 position-absolute"
        style={{
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          lineHeight: 0,
          background: "transparent",
        }}
        disabled={rest.disabled}
        data-testid="input-dropdown-button"
      >
        {icon}
      </button>

      <div
        id="input-dropdown-menu"
        ref={listRef}
        className={`dropdown-menu dropdown-menu-right ${open ? "show" : ""}`}
        style={{
          display: open ? "block" : "none", // ensures visibility without Bootstrap JS
          top: "100%",
          // Bootstrap normally anchors to a .dropdown parent; we control positioning here.
        }}
        role="listbox"
      >
        {dropDownTitle ? (
          <span className="text-muted ml-3">{dropDownTitle}</span>
        ) : null}
        {options === undefined ? (
          <div className="dropdown-item text-muted" tabIndex={-1}>
            ⏳ Loading...
          </div>
        ) : options.length === 0 ? (
          <div className="dropdown-item text-muted" tabIndex={-1}>
            No options
          </div>
        ) : (
          options.map(([label, val], idx) => (
            <button
              key={val + idx}
              className="dropdown-item text-left"
              type="button"
              role="menuitem"
              onClick={() => selectItem(val)}
              onKeyDown={e => {
                if (e.key === "Enter") selectItem(val);
              }}
              data-testid={`input-dropdown-item-${val}`}
            >
              {label}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
