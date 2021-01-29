export function isEmptyString(value) {
    if (value == "undefined" || !value || !/[^\s]/.test(value)) {
      return true;
    } else {
      return false;
    }
  }