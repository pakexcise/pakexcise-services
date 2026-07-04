type SelectOption = {
  id: string;
};

export function mergeSelectOption<T extends SelectOption>(
  options: T[],
  current: T | null | undefined,
): T[] {
  if (!current?.id) {
    return options;
  }

  if (options.some((option) => option.id === current.id)) {
    return options;
  }

  return [current, ...options];
}
