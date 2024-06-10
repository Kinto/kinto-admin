type VersionState = Record<string, string> | null;

export default function version(
  state: VersionState = null,
  action: any
): VersionState {
  switch (action.type) {
    case "VERSION_RESPONSE": {
      return action.response;
    }
    default: {
      return state;
    }
  }
}
