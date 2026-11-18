export const MIN_ARRAY_SIZE = 5;
export const MAX_ARRAY_SIZE = 40;
export const MIN_VALUE = 5;
export const MAX_VALUE = 100;

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function assertSearchable(values, startIndex) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError('values must be a non-empty array.');
  }
  if (!values.every(Number.isFinite)) {
    throw new TypeError('values must contain only numbers.');
  }
  if (!Number.isInteger(startIndex) || startIndex < 0 || startIndex >= values.length) {
    throw new RangeError('startIndex is out of range.');
  }
}

function swap(values, indexA, indexB) {
  [values[indexA], values[indexB]] = [values[indexB], values[indexA]];
}

export function generateRandomArray(size) {
  const isValidSize = Number.isInteger(size) && size >= MIN_ARRAY_SIZE && size <= MAX_ARRAY_SIZE;
  if (!isValidSize) {
    throw new RangeError(`size must be an integer between ${MIN_ARRAY_SIZE} and ${MAX_ARRAY_SIZE}.`);
  }
  return Array.from({ length: size }, () => randomInteger(MIN_VALUE, MAX_VALUE));
}

export function findMinIndex(values, startIndex = 0) {
  assertSearchable(values, startIndex);
  let minIndex = startIndex;
  for (let index = startIndex + 1; index < values.length; index++) {
    if (values[index] < values[minIndex]) minIndex = index;
  }
  return minIndex;
}

export function findMaxIndex(values) {
  assertSearchable(values, 0);
  let maxIndex = 0;
  for (let index = 1; index < values.length; index++) {
    if (values[index] > values[maxIndex]) maxIndex = index;
  }
  return maxIndex;
}

export function selectionSortSteps(values) {
  assertSearchable(values, 0);
  const working = [...values];
  const steps = [];
  const recordStep = (scanIndex, minIndex, sortedCount) => {
    steps.push({ values: [...working], scanIndex, minIndex, sortedCount });
  };

  for (let sortedCount = 0; sortedCount < working.length - 1; sortedCount++) {
    let minIndex = sortedCount;
    for (let scanIndex = sortedCount + 1; scanIndex < working.length; scanIndex++) {
      recordStep(scanIndex, minIndex, sortedCount);
      if (working[scanIndex] < working[minIndex]) minIndex = scanIndex;
    }
    swap(working, sortedCount, minIndex);
    recordStep(null, sortedCount, sortedCount + 1);
  }
  recordStep(null, null, working.length);
  return steps;
}
