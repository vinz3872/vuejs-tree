<template>
  <div :id="id">
    <ul
      :style="styles.tree.style"
      v-if="force">
      <treeRow
        v-for="node in nodes"
        :ref="'tree-row-' + node.id"
        :custom-options="customOptions"
        :custom-styles="customStyles"
        :depth="1"
        :key="node.id"
        :node="node"
        :parent-node="node"
        v-on:emitNodeChecked="onNodeChecked"
        v-on:emitNodeExpanded="onNodeExpanded"
        v-on:emitNodeSelected="onNodeSelected">
      </treeRow>
    </ul>
  </div>
</template>

<script lang="ts">
import { reactive } from 'vue'
import { Options, Vue } from 'vue-class-component'
import { NodeData, NodesProperties, TreeCustomStyles, TreeCustomOptions } from './interface'
import TreeRow from './TreeRow.vue'

@Options({
  components: {
    TreeRow
  },
  props: {
    customOptions: Object,
    customStyles: Object,
    id: String,
    nodes: Array
  }
})

export default class Tree extends Vue {
  customOptions!: TreeCustomOptions
  customStyles!: TreeCustomStyles
  id!: string
  nodes!: NodeData[]

  styles: TreeCustomStyles = reactive({
    tree: {
      style: {
        height: 'auto',
        maxHeight: '500px',
        overflowY: 'scroll',
        display: 'inline-block'
      }
    }
  })

  options: TreeCustomOptions = reactive({
    treeEvents: {
      expanded: {
        state: false,
        fn: null
      },
      collapsed: {
        state: false,
        fn: null
      },
      selected: {
        state: false,
        fn: null
      },
      checked: {
        state: false,
        fn: null
      }
    }
  })

  disabledState = { expanded: 'expandable', checked: 'checkable', selected: 'selectable' }
  selectedNodeData = reactive({ id: '' })
  force = true

  mounted () {
    this.copyOptions(this.customOptions, this.options)
    this.copyOptions(this.customStyles, this.styles)
  }

  // Public functions

  // Reassign the nodes, used to force the re-render of the tree
  forceRender (nodes: NodeData[]) {
    this.nodes = []
    this.$nextTick(() => {
      this.nodes = nodes
    })
  }

  // Find the ancestors ids of a node
  findNodePath (nodeId: string, maxDepth = 9999): string[] {
    return this.recFindNodePath(nodeId, this.nodes, 1, maxDepth)
  }

  // Find a node by id
  findNode (nodeId: string, maxDepth = 9999): NodeData|null {
    if (nodeId === '') {
      return null
    }
    return this.recFindNode(nodeId, this.nodes, 1, maxDepth)
  }

  // Return selected node
  getSelectedNode (): NodeData|null {
    return this.findNode(this.selectedNodeData.id)
  }

  // Return checked nodes
  getCheckedNodes (argWanted: string|string[], format = false): NodesProperties[] | NodesProperties {
    return this.getNodesData(argWanted, { checked: true }, format)
  }

  // Return expanded nodes
  getExpandedNodes (argWanted: string|string[], format = false): NodesProperties[] | NodesProperties {
    return this.getNodesData(argWanted, { expanded: true }, format)
  }

  // Check a node
  checkNode (nodeId: string, depth = 9999) {
    this.doCheckNode(nodeId, depth, true)
  }

  // Uncheck a node
  uncheckNode (nodeId: string, depth: number) {
    this.doCheckNode(nodeId, depth, false)
  }

  // Check all nodes
  checkAllNodes () {
    this.recCallNodes(true, 'checked', this.nodes)
  }

  // Uncheck all nodes
  uncheckAllNodes () {
    this.recCallNodes(false, 'checked', this.nodes)
  }

  // Deselect all nodes (the one selected)
  deselectAllNodes () {
    const node = this.findNode(this.selectedNodeData.id)
    if (node) {
      node.state.selected = false
    }
    this.selectedNodeData.id = ''
  }

  // Expand all nodes
  expandAllNodes () {
    this.recCallNodes(true, 'expanded', this.nodes)
  }

  // Collapse all nodes
  collapseAllNodes () {
    this.recCallNodes(false, 'expanded', this.nodes)
  }

  // Expand a node
  expandNode (nodeId: string, depth = 9999) {
    const arrIds = this.findNodePath(nodeId, depth)
    this.recCallNodes(true, 'expanded', this.nodes, arrIds)
  }

  // Collapse a node
  collapseNode (nodeId: string, depth = 9999) {
    const arrIds = this.findNodePath(nodeId, depth)
    this.recCallNodes(false, 'expanded', this.nodes, arrIds)
  }

  // Select a node
  selectNode (nodeId: string, depth = 9999) {
    const currentNodeSelected = this.findNode(this.selectedNodeData.id)
    const nodeSelected = this.findNode(nodeId, depth)

    if (currentNodeSelected) {
      currentNodeSelected.state.selected = false
    }
    if (nodeSelected) {
      this.selectedNodeData.id = nodeId
      nodeSelected.state.selected = true
    } else {
      this.selectedNodeData.id = ''
    }
  }

  // Return all visible nodes (expanded nodes + direct children)
  getVisibleNodes (fullNode = false): Array<NodeData|string> {
    const arr: Array<NodeData|string> = []
    this.nodes.forEach((node) => {
      this.recGetVisibleNodes(arr, node, fullNode)
    })

    return arr
  }

  // Filter nodes with conditions and return argWanted
  getNodesData (argWanted: string|string[], conditions: NodesProperties = {}, format = false): NodesProperties[]|NodesProperties {
    // argWanted: id -> return id, id1 etc... argWanted: id, name -> return {id: id, name: name}, {id: id1, name: name1}, etc
    // conditions {checked: true} conditions {checked: true, selected: true}
    if (format === false) {
      return this.recGetNodesData(argWanted, conditions, this.nodes)
    } else {
      return this.recGetNodesDataWithFormat(argWanted, conditions, this.nodes)
    }
  }

  // Private functions

  // Used to merge the tree options/styles with customOptions/customStyles
  copyOptions (src: any, dst: any) {
    for (var key in src) {
      if (!dst[key]) {
        dst[key] = src[key]
      } else if (typeof (src[key]) === 'object') {
        this.copyOptions(src[key], dst[key])
      } else {
        dst[key] = src[key]
      }
    }
  }

  // Recursive function of findNodePath
  recFindNodePath (nodeId: string, nodes: NodeData[], depth: number, maxDepth: number): string[] {
    let ret: string[] = []

    nodes.forEach((node) => {
      let tmp: string[] = []
      if (nodeId === node.id && maxDepth >= depth) {
        ret.unshift(node.id)
        return false
      } else if (node.nodes && maxDepth > depth && (tmp = this.recFindNodePath(nodeId, node.nodes, depth + 1, maxDepth)) != null && tmp.length > 0) {
        tmp.unshift(node.id)
        ret = tmp
        return false
      }
    })

    return ret
  }

  // Recursive function of findNode
  recFindNode (nodeId: string, nodes: NodeData[], depth: number, maxDepth: number): NodeData|null {
    let ret: NodeData|null = null

    nodes.forEach((node) => {
      let tmp: NodeData|null
      if (nodeId === node.id && maxDepth >= depth) {
        ret = node
        return false
      } else if (node.nodes && maxDepth > depth && (tmp = this.recFindNode(nodeId, node.nodes, depth + 1, maxDepth)) != null) {
        ret = tmp
        return false
      }
    })

    return ret
  }

  // Called when a TreeRow is selected
  onNodeSelected (nodeSelected: NodeData) {
    const currentNodeSelected = this.findNode(this.selectedNodeData.id)
    if (currentNodeSelected == null && nodeSelected.state.selected === true) {
      this.selectedNodeData.id = nodeSelected.id
    } else if (currentNodeSelected != null && nodeSelected.state.selected === false) {
      this.selectedNodeData.id = ''
    } else if (currentNodeSelected != null && nodeSelected.state.selected === true) {
      currentNodeSelected.state.selected = false
      this.selectedNodeData.id = nodeSelected.id
      nodeSelected.state.selected = true
    }

    let fn = null
    const treeEvents = this.options.treeEvents
    if (treeEvents.selected && treeEvents.selected.state === true) {
      fn = this.customOptions.treeEvents.selected.fn
    }
    const state = (this.selectedNodeData.id !== '')
    if (fn) {
      fn(nodeSelected.id, state)
    }
  }

  // Called when a TreeRow is expanded or closed
  onNodeExpanded (node: NodeData, state: boolean) {
    let fn = null
    const treeEvents = this.options.treeEvents
    if (state === true && treeEvents.expanded && treeEvents.expanded.state === true) {
      fn = this.customOptions.treeEvents.expanded.fn
    } else if (treeEvents.collapsed && treeEvents.collapsed.state === true) {
      fn = this.customOptions.treeEvents.collapsed.fn
    }
    if (fn) {
      fn(node.id, state)
    }
  }

  // Called when a TreeRow is checked
  onNodeChecked (node: NodeData) {
    let fn = null
    const treeEvents = this.options.treeEvents
    if (treeEvents.checked && treeEvents.checked.state === true) {
      fn = this.customOptions.treeEvents.checked.fn
    }
    if (fn) {
      fn(node.id, node.state.checked)
    }
  }

  // Recursive function to change node's state
  recCallNodes (state: boolean, event: string, nodes: NodeData[], pathIds: string[] = []) {
    const targetId = pathIds.shift()
    nodes.forEach((node) => {
      if (targetId !== undefined && targetId !== node.id) {
        return
      }
      // Stop the recursion if the node's event is disabled
      const disabledStateKey = (this.disabledState as any)[event]
      if (disabledStateKey && node[disabledStateKey] === false) {
        return
      }
      node.state[event] = state
      if (targetId === node.id && pathIds.length === 0) {
        return
      }
      if (node.nodes) {
        this.recCallNodes(state, event, node.nodes, pathIds)
      }
    })
  }

  // Used by checkNode and uncheckNode
  doCheckNode (nodeId: string, depth: number, state: boolean) {
    const node = this.findNode(nodeId, depth)
    if (node) {
      node.state.checked = state
      if (node.nodes) {
        this.recCallNodes(state, 'checked', node.nodes)
      }
    }
  }

  // Recursive function of getVisibleNodes
  recGetVisibleNodes (arr: Array<NodeData|string>, node: NodeData, fullNode: boolean) {
    arr.push((fullNode ? node : node.id))
    if (node.state.expanded === true && node.nodes) {
      node.nodes.forEach((nodeChild) => {
        this.recGetVisibleNodes(arr, nodeChild, fullNode)
      })
    }
  }

  // Recursive function of recGetNodesData (return node[])
  recGetNodesData (argWanted: string|string[], conditions: NodesProperties, nodes: NodeData[]|undefined): NodesProperties[] {
    let arr: NodesProperties[] = []
    if (nodes === undefined) return arr
    nodes.forEach((node) => {
      if (node.state && Object.keys(node.state).filter(key => conditions[key] === node.state[key]).length === Object.keys(conditions).length) {
        if (Array.isArray(argWanted)) {
          arr.push(Object.keys(node).filter(key => argWanted.includes(key)).reduce((obj, key) => {
            obj[key] = node[key]
            return obj
          }, {} as NodesProperties))
        } else {
          arr.push(node[argWanted])
        }
      }
      arr = arr.concat(this.recGetNodesData(argWanted, conditions, node.nodes))
    })
    return arr
  }

  // Recursive function of recGetNodesData (return nodes with tree format)
  recGetNodesDataWithFormat (argWanted: string|string[], conditions: NodesProperties, nodes: NodeData[]|undefined): NodesProperties {
    const arr: NodesProperties = {}
    if (nodes === undefined || nodes.length === 0) return arr
    nodes.forEach((node) => {
      if (node.state && Object.keys(node.state).filter(key => conditions[key] === node.state[key]).length === Object.keys(conditions).length) {
        arr[node.id] = this.recGetNodesDataWithFormat(argWanted, conditions, node.nodes)
      } else {
        Object.assign(arr, this.recGetNodesDataWithFormat(argWanted, conditions, node.nodes))
      }
    })
    return arr
  }
}

</script>
