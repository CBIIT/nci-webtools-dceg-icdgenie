function flattenTree(tree) {
  const records = [];

  for (const node of tree) {
    records.push(node);
    if (node.children) {
      records.push(...flattenTree(node.children));
      delete node.children;
    }
  }

  return records;
}

function asTree(records) {
  const rootNodes = [];
  const recordMap = records.reduce(
    (map, record) => ({
      ...map,
      [record.id]: record,
    }),
    {},
  );

  for (const record of records) {
    const parent = recordMap[record.parentId];

    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(record);
    } else {
      rootNodes.push(record);
    }
  }

  return rootNodes;
}

function sortTree(tree, sortFn) {
  for (const node of tree) {
    if (node.children) {
      sortTree(node.children, sortFn);
    }
  }

  return tree.sort(sortFn);
}

function asFlatTree(records) {
  return flattenTree(asTree(records));
}

module.exports = {
  asTree,
  asFlatTree,
  flattenTree,
  sortTree,
};
