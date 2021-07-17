import { NodeData } from './interface'

// Used to merge the tree options/styles with customOptions/customStyles
export const copyOptions = (src: any, dst: any) => {
  for (const key in src) {
    if (!dst[key]) {
      dst[key] = src[key]
    } else if (typeof (src[key]) === 'object') {
      copyOptions(src[key], dst[key])
    } else {
      dst[key] = src[key]
    }
  }
}

const disabledState = { expanded: 'expandable', checked: 'checkable', selected: 'selectable' }

// Recursive function to change node's state
export const recCallNodes = (state: boolean, event: string, nodes: NodeData[]|undefined, pathIds: string[] = []) => {
  if (nodes === undefined) { return }

  const targetId = pathIds.shift()
  nodes.forEach((node) => {
    if (targetId !== undefined && targetId !== node.id) {
      return
    }
    // Stop the recursion if the node's event is disabled
    const disabledStateKey = (disabledState as any)[event]
    if (disabledStateKey && node[disabledStateKey] === false) {
      return
    }
    node.state[event] = state
    if (targetId === node.id && pathIds.length === 0) {
      return
    }
    recCallNodes(state, event, node.nodes, pathIds)
  })
}
