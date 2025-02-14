import { WidgetProps } from "@rjsf/utils";
import { Dash, Download } from "react-bootstrap-icons";

export default function Base64File({
  disabled,
  onChange,
  readonly,
  required,
  value,
}: WidgetProps) {
  return (
    <div>
      <CurrentValDisplay val={value} />
      <input
        type="file"
        data-testid="b64-file"
        required={required && !value}
        disabled={disabled}
        readOnly={readonly}
        onChange={async evt => {
          await getBase64Str(evt, onChange);
        }}
      />
      {value && !readonly && !disabled && (
        <button
          type="button"
          className="btn btn-danger btn-sm"
          title="Remove existing value"
          onClick={() => onChange("")}
        >
          <Dash className="icon" />
        </button>
      )}
    </div>
  );
}

function CurrentValDisplay({ val }) {
  if (!val) {
    return <></>;
  }

  // images render a thumbnail, everything else shows a download icon
  return (
    <a href={val} download={true} target="_blank" data-testid="b64-download">
      {val.match(/^data:image\//) ? (
        <img
          src={val}
          className="b64-thumb"
          title="Image preview, click to download"
        />
      ) : (
        <Download className="iconLarge" title="Click to download" />
      )}
    </a>
  );
}

async function getBase64Str(evt, changeCallback) {
  const files = evt.target.files;
  console.log("#### alex foo getBase64Str 1");
  if (!files || !files.length) {
    changeCallback(null);
    return;
  }

  console.log("#### alex foo getBase64Str 2");

  const readPromise = new Promise<string>((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(files[0]);
  });

  try {
    let str = await readPromise;
    changeCallback(
      str,
      str.length > 1024 * 1024
        ? {
            __errors: ["The base64 string cannot exceed 1MB in size."],
          }
        : undefined
    );
  } catch (ex) {
    changeCallback("", {
      __errors: [ex.toString()],
    });
  }
}
