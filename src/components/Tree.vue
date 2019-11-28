<template>
  <div :id="id">
    <ul
      :style="styles.tree"
      v-if="force">
      <template v-for="node in nodes">
        <tree-row
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
        </tree-row>
      </template>
    </ul>
  </div>
</template>

<script>
import TreeRow from './TreeRow.vue'

export default {
  name: 'tree',
  props: {
    customOptions: {
      default: () => { return {} },
      type: Object
    },
    customStyles: {
      default: () => { return {} },
      type: Object
    },
    id: {
      default: 'tree',
      type: String
    },
    nodes: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      styles: {
        tree: {
          height: 'auto',
          maxHeight: '500px',
          overflowY: 'scroll',
          display: 'inline-block'
        }
      },
      options: {
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
      },
      selectedNode: null,
      force: true
    }
  },
  components: {
    'tree-row': TreeRow
  },
  mounted () {
    this.copyOptions(this.customOptions, this.options)
    this.copyOptions(this.customStyles, this.styles)
  },
  methods: {
    forceRender (nodes) {
      const _this = this
      this.nodes = []
      this.$nextTick(() => {
        _this.nodes = nodes
      })
    },
    copyOptions (src, dst) {
      for (var key in src) {
        if (!dst[key]) {
          dst[key] = src[key]
        } else if (typeof (src[key]) === 'object') {
          this.copyOptions(src[key], dst[key])
        } else {
          dst[key] = src[key]
        }
      }
    },
    recFindNodePath (nodeId, nodes, depth, maxDepth) {
      const _this = this
      let ret = []

      nodes.forEach((node) => {
        let tmp = []
        if (nodeId == node.id && maxDepth >= depth) {
          ret.unshift(node.id)
          return false
        } else if (node.nodes && maxDepth > depth && (tmp = _this.recFindNodePath(nodeId, node.nodes, depth + 1, maxDepth)) != null && tmp.length > 0) {
          tmp.unshift(node.id)
          ret = tmp
          return false
        }
      })

      return ret
    },
    findNodePath (nodeId, maxDepth = 9999) {
      return this.recFindNodePath(nodeId, this.nodes, 1, maxDepth)
    },
    recFindNode (nodeId, nodes, depth, maxDepth) {
      const _this = this
      let ret = null

      nodes.forEach((node) => {
        let tmp = []
        if (nodeId == node.id && maxDepth >= depth) {
          ret = node
          return false
        } else if (node.nodes && maxDepth > depth && (tmp = _this.recFindNode(nodeId, node.nodes, depth + 1, maxDepth)) != null) {
          ret = tmp
          return false
        }
      })

      return ret
    },
    findNode (nodeId, maxDepth = 9999) {
      return this.recFindNode(nodeId, this.nodes, 1, maxDepth)
    },
    onNodeSelected (nodeSelected) { // called when a TreeRow is selected
      const _this = this

      if (this.selectedNode == null && nodeSelected.state.selected === true) {
        this.selectedNode = nodeSelected
      } else if (this.selectedNode != null && nodeSelected.state.selected === false) {
        this.selectedNode = null
      } else if (this.selectedNode != null && nodeSelected.state.selected === true) {
        const arrIds = this.findNodePath(this.selectedNode.id, this.selectedNode.depth)
        this.callSpecificChild(arrIds, 'callNodeSelected', { value: false, arrIds: arrIds })
        this.selectedNode = nodeSelected
        this.$nextTick(() => {
          if (_this.selectedNode) {
            const selectArrIds = _this.findNodePath(_this.selectedNode.id, _this.selectedNode.depth)
            _this.callSpecificChild(selectArrIds, 'callNodeSelected', { value: true, arrIds: selectArrIds })
          }
        })
      }

      let fn = null
      if (this.options.treeEvents.selected && this.options.treeEvents.selected.state === true) {
        fn = this.customOptions.treeEvents.selected.fn
      }
      const state = (this.selectedNode !== null)
      if (fn) {
        fn(nodeSelected.id, state)
      }
    },
    onNodeExpanded (node, state) { // called when a TreeRow is expanded or closed
      let fn = null
      if (state === true && this.options.treeEvents.expanded && this.options.treeEvents.expanded.state === true) {
        fn = this.customOptions.treeEvents.expanded.fn
      } else if (this.options.treeEvents.collapsed && this.options.treeEvents.collapsed.state === true) {
        fn = this.customOptions.treeEvents.collapsed.fn
      }
      if (fn) {
        fn(node.id, state)
      }
    },
    onNodeChecked (node) { // called when a TreeRow is checked
      let fn = null
      if (this.options.treeEvents.checked && this.options.treeEvents.checked.state === true) {
        fn = this.customOptions.treeEvents.checked.fn
      }
      const state = node.state.checked
      if (fn) {
        fn(node.id, state)
      }
    },
    callSpecificChild (arrIds, fname, args) {
      for (let id of arrIds) {
        const childs = this.$refs['tree-row-' + id]
        if (childs) {
          childs[0][fname](args)
        }
      }
    },
    doCheckNode (nodeId, depth, state) {
      const arrIds = this.findNodePath(nodeId, depth)
      if (!arrIds) return
      this.callSpecificChild(arrIds, 'callNodeChecked', {
        value: state,
        arrIds: arrIds
      })
    },
    checkNode (nodeId, depth) {
      this.doCheckNode(nodeId, depth, true)
    },
    uncheckNode (nodeId, depth) {
      this.doCheckNode(nodeId, depth, false)
    },
    getSelectedNode () {
      return this.selectedNode
    },
    getCheckedNodes (argWanted, format = false) {
      return this.getNodesData(argWanted, { checked: true }, format)
    },
    getExpandedNodes (argWanted, format = false) {
      return this.getNodesData(argWanted, { expanded: true }, format)
    },
    checkAllNodes () {
      this.callSpecificChild(this.nodes.map(x => x.id), 'callNodesChecked', true)
    },
    uncheckAllNodes () {
      this.callSpecificChild(this.nodes.map(x => x.id), 'callNodesChecked', false)
    },
    recExpandAllNodes (nodes) {
      let hasChild = false
      for (let node of nodes) {
        if (node.nodes) {
          hasChild = true
          if (this.recExpandAllNodes(node.nodes) === false) {
            this.expandNode(node.id)
          }
        }
      }
      return hasChild
    },
    expandAllNodes () {
      this.recExpandAllNodes(this.nodes)
    },
    recCollapseAllNodes (arrIds) {
      for (let id of arrIds) {
        this.findNode(id).state.expanded = false
      }
    },
    collapseAllNodes () {
      this.recCollapseAllNodes(this.getExpandedNodes('id'))
      for (let node of this.nodes) {
        this.collapseNode(node.id)
      }
    },
    deselectAllNodes () {
      this.selectedNode = null
      this.callSpecificChild(this.nodes.map(x => x.id), 'callNodesDeselect')
    },
    expandNode (nodeId, depth) {
      const arrIds = this.findNodePath(nodeId, depth)
      this.callSpecificChild(arrIds, 'callNodeExpanded', {
        value: true,
        arrIds: arrIds
      })
    },
    selectNode (nodeId, depth) {
      const nodeSelected = this.findNode(nodeId, depth)
      const _this = this

      if (this.selectedNode) {
        let arrIds = this.findNodePath(this.selectedNode.id, this.selectedNode.depth)
        this.callSpecificChild(arrIds, 'callNodeSelected', { value: false, arrIds: arrIds })
      }
      this.selectedNode = nodeSelected

      if (this.selectedNode) {
        this.$nextTick(() => {
          const selectArrIds = _this.findNodePath(_this.selectedNode.id, _this.selectedNode.depth)
          _this.callSpecificChild(selectArrIds, 'callNodeSelected', { value: true, arrIds: selectArrIds })
        })
      }
    },
    collapseNode (nodeId, depth) {
      const arrIds = this.findNodePath(nodeId, depth)
      this.callSpecificChild(arrIds, 'callNodeExpanded', {
        value: false,
        arrIds: arrIds
      })
    },
    recGetVisibleNodes (arr, elem, fullNode) {
      if (elem.node) {
        arr.push((fullNode ? elem.node : elem.node.id))
      }
      for (let child of Object.values(elem.$refs)) {
        if (child && child[0]) {
          this.recGetVisibleNodes(arr, child[0], fullNode)
        }
      }
    },
    getVisibleNodes (fullNode = false) {
      let arr = []
      this.recGetVisibleNodes(arr, this, fullNode)
      return arr
    },
    recGetNodesData (argWanted, conditions, nodes) {
      const _this = this
      let arr = []
      if (nodes === undefined) return arr
      nodes.forEach((node) => {
        if (node.state && Object.keys(node.state).filter(key => conditions[key] === node.state[key]).length === Object.keys(conditions).length) {
          if (Array.isArray(argWanted)) {
            arr.push(Object.keys(node).filter(key => argWanted.includes(key)).reduce((obj, key) => {
              obj[key] = node[key]
              return obj
            }, {}))
          } else {
            arr.push(node[argWanted])
          }
        }
        arr = arr.concat(_this.recGetNodesData(argWanted, conditions, node.nodes))
      })
      return arr
    },
    recGetNodesDataWithFormat (argWanted, conditions, nodes) {
      const _this = this
      let arr = {}
      if (nodes === undefined || nodes.length === 0) return arr
      nodes.forEach((node) => {
        if (node.state && Object.keys(node.state).filter(key => conditions[key] === node.state[key]).length === Object.keys(conditions).length) {
          arr[node.id] = _this.recGetNodesDataWithFormat(argWanted, conditions, node.nodes)
        } else {
          Object.assign(arr, _this.recGetNodesDataWithFormat(argWanted, conditions, node.nodes))
        }
      })
      return arr
    },
    getNodesData (argWanted, conditions = {}, format = false) {
      // argWanted: id -> return id, id1 etc... argWanted: id, name -> return {id: id, name: name}, {id: id1, name: name1}, etc
      // conditions {checked: true} conditions {checked: true, selected: true}
      let arr = null
      if (format === false) {
        arr = this.recGetNodesData(argWanted, conditions, this.nodes)
      } else {
        arr = this.recGetNodesDataWithFormat(argWanted, conditions, this.nodes)
      }
      return arr
    }
  }
}
</script>
