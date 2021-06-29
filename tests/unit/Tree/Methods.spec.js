import { mount } from '@vue/test-utils'
import Tree from '@/components/Tree.vue'

import data from './data.js'

let wrapper;

beforeEach(() => {
  let { customOptions, customStyles, nodes } = data
  let propsData = {
    customOptions,
    customStyles,
    nodes
  }
  wrapper = mount(Tree, {
    propsData: JSON.parse(JSON.stringify(propsData))
  })
  return wrapper
})

describe('findNodePath', () => {
  it('find a node path by id with one depth', () => {
    const tree = wrapper.vm
    const path = tree.findNodePath('1')
    expect(path).toEqual(['1'])
  })

  it('find a node path by id with multiple depth', () => {
    const tree = wrapper.vm
    const path = tree.findNodePath('3')
    expect(path).toEqual(['1', '3'])
  })
})

describe('findNode', () => {
  it('find a node by id with one depth', () => {
    const tree = wrapper.vm
    const node = tree.findNode(tree.nodes[0].id)
    expect(node).toEqual(tree.nodes[0])
  })

  it('find a node by id with multiple depth', () => {
    const tree = wrapper.vm
    const node = tree.findNode(tree.nodes[0].nodes[0].id)
    expect(node).toEqual(tree.nodes[0].nodes[0])
  })
})

describe('onNodeSelected', () => {
  it('store the selected node', () => {
    const tree = wrapper.vm
    // store a node
    tree.nodes[0].state.selected = true
    tree.onNodeSelected(tree.nodes[0])
    expect(tree.selectedNodeData.id).toEqual(tree.nodes[0].id)

    // store the new node
    tree.nodes[1].state.selected = true
    tree.onNodeSelected(tree.nodes[1])
    expect(tree.selectedNodeData.id).toEqual(tree.nodes[1].id)

    // don't store the node
    tree.nodes[1].state.selected = false
    tree.onNodeSelected(tree.nodes[1])
    expect(tree.selectedNodeData.id).toEqual('')
  })
})

describe('onNodeExpanded', () => {
  it('return the expanded nodes', () => {
    const tree = wrapper.vm
    const actualExpandedNodeIds = tree.getExpandedNodes('id')
    tree.nodes[0].state.expanded = true
    tree.onNodeExpanded(tree.nodes[0], true)
    expect(tree.getExpandedNodes('id').length).toBeGreaterThan(actualExpandedNodeIds.length)
  })
})

describe('onNodeChecked', () => {
  it('return the checked nodes', () => {
    const tree = wrapper.vm
    const actualCheckedNodeIds = tree.getCheckedNodes('id')
    tree.nodes[0].state.checked = true
    tree.onNodeChecked(tree.nodes[0], true)
    expect(tree.getCheckedNodes('id').length).toBeGreaterThan(actualCheckedNodeIds.length)
  })
})

describe('checkNode', () => {
  it('check a node', () => {
    const tree = wrapper.vm

    tree.checkNode('1')
    expect(tree.nodes[0].state.checked).toEqual(true)
  })
})

describe('uncheckNode', () => {
  it('uncheck a node', () => {
    const tree = wrapper.vm

    tree.checkNode('1')
    expect(tree.nodes[0].state.checked).toEqual(true)
    tree.uncheckNode('1')
    expect(tree.nodes[0].state.checked).toEqual(false)
  })
})

describe('getSelectedNode', () => {
  it('return selected node', () => {
    const tree = wrapper.vm

    tree.nodes[0].state.selected = true
    tree.onNodeSelected(tree.nodes[0])
    const selectedNode = tree.getSelectedNode()
    expect(selectedNode).toEqual(tree.nodes[0])
  })
})

describe('getCheckedNodes', () => {
  it('return checked node', () => {
    const tree = wrapper.vm

    const checkedNodes = tree.getCheckedNodes('id')
    expect(checkedNodes.length).toEqual(1)
    expect(checkedNodes[0]).toEqual(tree.nodes[0].nodes[0].id)
  })
})

describe('getExpandedNodes', () => {
  it('return expanded node', () => {
    const tree = wrapper.vm

    tree.expandNode(tree.nodes[0].id)
    const expandedNodes = tree.getExpandedNodes('id')
    expect(expandedNodes.length).toEqual(1)
    expect(expandedNodes[0]).toEqual(tree.nodes[0].id)
  })

  it('return expanded node with parents', () => {
    const tree = wrapper.vm

    tree.expandNode(tree.nodes[0].id)
    tree.expandNode(tree.nodes[0].nodes[0].id)

    process.nextTick(() => {
      const expandedNodes = tree.getExpandedNodes('id')
      expect(expandedNodes.length).toEqual(2)
      expect(expandedNodes[0]).toEqual(tree.nodes[0].id)
      expect(expandedNodes[1]).toEqual(tree.nodes[0].nodes[0].id)
    })
  })
})

describe('checkAllNodes', () => {
  it('check all nodes', () => {
    const tree = wrapper.vm

    tree.checkAllNodes()
    expect(tree.nodes[0].state.checked).toEqual(true)
    expect(tree.nodes[1].state.checked).toEqual(true)
  })
})

describe('uncheckAllNodes', () => {
  it('uncheck all nodes', () => {
    const tree = wrapper.vm

    tree.checkNode(tree.nodes[0].id)
    tree.checkNode(tree.nodes[1].id)
    expect(tree.nodes[0].state.checked).toEqual(true)
    tree.uncheckAllNodes()
    expect(tree.nodes[0].state.checked).toEqual(false)
    expect(tree.nodes[1].state.checked).toEqual(false)
  })
})

describe('expandAllNodes', () => {
  it('expand all nodes', () => {
    const tree = wrapper.vm

    tree.expandAllNodes()
    expect(tree.nodes[0].state.expanded).toEqual(true)
    process.nextTick(() =>
      expect(tree.nodes[0].nodes[0].state.expanded).toEqual(true)
    )
  })
})

describe('collapseAllNodes', () => {
  it('collapse all nodes', () => {
    const tree = wrapper.vm

    tree.expandAllNodes()
    expect(tree.nodes[0].state.expanded).toEqual(true)
    tree.collapseAllNodes()
    expect(tree.nodes[0].state.expanded).toEqual(false)
    expect(tree.getExpandedNodes('id').length).toEqual(0)
  })
})

describe('deselectAllNodes', () => {
  it('deselect all nodes', () => {
    const tree = wrapper.vm

    tree.nodes[0].state.selected = true
    tree.onNodeSelected(tree.nodes[0])
    tree.deselectAllNodes()
    expect(tree.selectedNodeData).toBeNull
  })
})

describe('selectNode', () => {
  it('select a node', () => {
    const tree = wrapper.vm

    // select a node with depth 0
    tree.selectNode(tree.nodes[0].id)
    expect(tree.selectedNodeData.id).toEqual(tree.nodes[0].id)

    // select a nested node
    tree.selectNode(tree.nodes[0].nodes[0].id)
    expect(tree.selectedNodeData.id).toEqual(tree.nodes[0].nodes[0].id)

    // select an other node
    tree.selectNode(tree.nodes[1].id)
    expect(tree.nodes[0].state.selected).toEqual(false)
    expect(tree.nodes[0].nodes[0].state.selected).toEqual(false)
    expect(tree.selectedNodeData.id).toEqual(tree.nodes[1].id)
  })
})

describe('getVisibleNodes', () => {
  it('get all visible nodes', () => {
    const tree = wrapper.vm

    tree.collapseAllNodes()
    // return visible node ids
    expect(tree.getVisibleNodes()).toEqual(['1','2'])

    // return visible node ids
    expect(tree.getVisibleNodes(true)[0]).toEqual(tree.nodes[0])

    tree.expandAllNodes()
    expect(tree.getVisibleNodes().length).not.toEqual(['1','2'])
  })
})

describe('getNodesData', () => {
  it('get expanded node ids', () => {
    const tree = wrapper.vm

    tree.expandNode(tree.nodes[0].id)
    tree.expandNode(tree.nodes[0].nodes[0].id)
    // return visible node ids
    process.nextTick(() =>
      expect(tree.getNodesData('id', { expanded: true })).toEqual(['1','3'])
    )
  })

  it('get expanded nodes ids and text', () => {
    const tree = wrapper.vm

    tree.expandNode(tree.nodes[0].id)
    tree.expandNode(tree.nodes[0].nodes[0].id)
    // return visible node ids
    process.nextTick(() => {
      const nodes = tree.getNodesData(['id', 'text'], { expanded: true })
      expect(nodes.length).toEqual(2)
      expect(nodes[0]).toEqual({'id': '1', 'text': 'Root 1'})
    })
  })

  it('get expanded node tree ids', () => {
    const tree = wrapper.vm

    tree.expandNode(tree.nodes[0].id)
    tree.expandNode(tree.nodes[0].nodes[0].id)
    // return visible node ids
    process.nextTick(() =>
      expect(tree.getNodesData('id', { expanded: true }, true)).toEqual({'1': {'3': {}}})
    )
  })
})
