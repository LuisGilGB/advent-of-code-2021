const minPriorityQueueFactory = () => {
  let array = [];
  const internalMap = new Map();

  const getItemValue = (itemKey) => internalMap.get(itemKey).value;
  const getItemIndex = (itemKey) => internalMap.get(itemKey).index;
  const getItemStart1Index = (itemKey) => getItemIndex(itemKey) + 1;
  const getItemParent = (itemKey) => {
    const start1Index = getItemStart1Index(itemKey);
    if (start1Index === 1) {
      return undefined;
    }
    return array[Math.floor(start1Index / 2) - 1];
  };
  const getLeftChild = (itemKey) => {
    const start1Index = getItemStart1Index(itemKey);
    return array[2 * start1Index - 1];
  };
  const getRightChild = (itemKey) => {
    const start1Index = getItemStart1Index(itemKey);
    return array[2 * start1Index];
  };
  const swap = (itemKey1, itemKey2) => {
    const index1 = getItemIndex(itemKey1);
    const index2 = getItemIndex(itemKey2);
    const arrayDraft = [...array];
    arrayDraft[index1] = array[index2];
    arrayDraft[index2] = array[index1];
    updateIndexInMap(itemKey1, index2);
    updateIndexInMap(itemKey2, index1);
    array = arrayDraft;
  };
  const updateIndexInMap = (itemKey, newIndex) => {
    internalMap.set(itemKey, {
      ...internalMap.get(itemKey),
      index: newIndex,
    });
  };
  const minHeapify = (itemKey) => {
    const value = getItemValue(itemKey);
    const leftChild = getLeftChild(itemKey);
    const rightChild = getRightChild(itemKey);
    let smallest =
      leftChild && getItemValue(leftChild) < value ? leftChild : itemKey;
    if (rightChild && getItemValue(rightChild) < getItemValue(smallest)) {
      smallest = rightChild;
    }
    if (smallest !== itemKey) {
      swap(itemKey, smallest);
      minHeapify(itemKey);
    }
  };
  const moveUpInHeap = (itemKey) => {
    const parentKey = getItemParent(itemKey);
    if (!parentKey) {
      return;
    }
    const itemValue = getItemValue(itemKey);
    const parentValue = getItemValue(parentKey);
    if (itemValue < parentValue) {
      swap(itemKey, parentKey);
      moveUpInHeap(itemKey);
    }
  };
  return {
    has: (itemKey) => internalMap.has(itemKey),
    insert: (itemKey, value = Infinity) => {
      array.push(itemKey);
      internalMap.set(itemKey, {
        value,
        index: array.length - 1,
      });
      moveUpInHeap(itemKey);
    },
    getMinimum: () => array[0],
    extractMin: () => {
      if (array.length < 1) {
        throw new Error("The queue is empty");
      }
      const min = array[0];
      const lastIndex = array.length - 1;
      const last = array[lastIndex];
      array = [last, ...array.slice(1, lastIndex)];
      internalMap.delete(min);
      updateIndexInMap(last, 0);
      minHeapify(array[0]);
      return min;
    },
    decreaseForKey: (itemKey, value) => {
      const oldValue = getItemValue(itemKey);
      if (value > oldValue) {
        return;
      }
      internalMap.set(itemKey, {
        ...internalMap.get(itemKey),
        value,
      });
      moveUpInHeap(itemKey);
    },
  };
};

export default minPriorityQueueFactory;
