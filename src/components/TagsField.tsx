import React, { useEffect, useState } from "react";

const DEFAULT_SEPARATOR = ",";

function toTagList(
  tagsString: string,
  separator: string = DEFAULT_SEPARATOR,
  unique = false
): string[] {
  const list = tagsString
    .split(separator)
    .map(tag => tag.trim())
    .filter(tag => tag !== "");
  return unique ? Array.from(new Set(list)) : list;
}

function toTagsString(tags: string[], separator = ","): string {
  return tags.join((separator += separator !== " " ? " " : ""));
}

interface Props {
  schema: any;
  uiSchema: any;
  name: string;
  formData: string[];
  onChange: (tags: string[]) => void;
  required?: boolean;
  readonly?: boolean;
}

export default function TagsField({
  schema,
  uiSchema = {},
  name,
  formData = [],
  onChange,
  required = false,
  readonly = false,
}: Props) {
  const separator = uiSchema["ui:options"]?.separator ?? DEFAULT_SEPARATOR;

  const [tagsString, setTagsString] = useState(
    toTagsString(formData, separator)
  );

  useEffect(() => {
    setTagsString(toTagsString(formData, separator));
  }, [formData, separator]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsStr = e.target.value;
    const uniqueItems = schema.uniqueItems ?? false;
    const tags = toTagList(tagsStr, separator, uniqueItems);
    setTagsString(tagsStr);
    onChange(tags);
  };

  return (
    <div className="form-group field field-string">
      <label className="control-label" htmlFor="txtTags">
        {schema.title ?? name}
        {required ? "*" : ""}
      </label>
      <input
        type="text"
        className="form-control"
        value={tagsString}
        placeholder={
          uiSchema["ui:placeholder"] ??
          toTagsString(["tag1", "tag2", "tag3"], separator)
        }
        onChange={handleOnChange}
        required={required}
        readOnly={readonly}
        id="txtTags"
      />
      <div className="help-block">
        {uiSchema["ui:help"] ?? (
          <span>
            Entries must be separated with{" "}
            {separator === " " ? "spaces" : <code>{separator}</code>}.
          </span>
        )}
      </div>
    </div>
  );
}
