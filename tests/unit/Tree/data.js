export default {
  nodes: [
  {
    text: 'Root 1',
    id: 1,
    nodes: [
    {
      text: 'Child 1',
      id: 3,
      nodes: [
      {
        text: 'Grandchild 1',
        id: 5
      },
      {
        text: 'Grandchild 2',
        id: 6
      }
      ]
    },
    {
      text: 'Child 2',
      id: 4
    }
    ]
  },
  {
    text: 'Root 2',
    id: 2
  }
  ],
  customStyles: {
    tree: {
      height: '300px',
      maxHeight: '300px',
      overflowY: 'visible',
      display: 'block'
    }
  },
  newNodes: [
    {
      text: 'Root 1',
      id: 1
    }
  ]
}