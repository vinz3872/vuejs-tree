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
    const disabledStateKey = (disabledState as any)[event]
    if (targetId === node.id && pathIds.length === 0) {
      node.state[event] = state
      return
    } else if (disabledStateKey && node[disabledStateKey] !== false) {
      node.state[event] = state
    }
    recCallNodes(state, event, node.nodes, pathIds)
  })
}
