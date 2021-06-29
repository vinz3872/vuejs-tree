export default {
  nodes: [
  {
    text: 'Root 1',
    id: '1',
    state: { checked: false, selected: false, expanded: false },
    nodes: [
    {
      text: 'Child 1',
      id: '3',
      state: { checked: false, selected: false, expanded: false },
      state: {
        checked: true,
      },
      nodes: [
      {
        text: 'Grandchild 1',
        id: '5',
        state: { checked: false, selected: false, expanded: false }
      },
      {
        text: 'Grandchild 2',
        id: '6',
        state: { checked: false, selected: false, expanded: false }
      }
      ]
    },
    {
      text: 'Child 2',
      id: '4',
      state: { checked: false, selected: false, expanded: false }
    }
    ]
  },
  {
    text: 'Root 2',
    id: '2',
    state: { checked: false, selected: false, expanded: false }
  }
  ],
  customStyles: {
    tree: {
      style: {
        height: '300px',
        maxHeight: '300px',
        overflowY: 'visible',
        display: 'block'
      }
    }
  },
  newNodes: [
    {
      text: 'Root 1',
      id: 1,
      state: { checked: false, selected: false, expanded: false }
    }
  ]
}